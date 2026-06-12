import { useEffect, useRef, useState } from "react";
import { initWhisper, initWhisperVad, WhisperContext } from "whisper.rn";
import {
  RealtimeTranscriber,
  RingBufferVad,
} from "whisper.rn/src/realtime-transcription";
import { AudioPcmStreamAdapter } from "whisper.rn/src/realtime-transcription/adapters/AudioPcmStreamAdapter";

import {
  areModelsDownloaded,
  ensureModelsDownloaded,
  getModelPaths,
  type DownloadProgress,
} from "@/lib/whisper-models";

export type DictationStatus =
  | "checking" // looking for cached models on disk
  | "needs-download"
  | "downloading"
  | "loading-model"
  | "ready"
  | "listening"
  | "error";

export type Dictation = {
  status: DictationStatus;
  error: string | null;
  downloadProgress: DownloadProgress | null;
  /** Stabilized transcription accumulated across finished speech segments. */
  finalText: string;
  /** Live transcription of the speech segment currently being spoken. */
  liveText: string;
  downloadModels: () => void;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
};

function appendText(existing: string, addition: string): string {
  const trimmed = addition.trim();
  if (!trimmed) return existing;
  return existing ? `${existing} ${trimmed}` : trimmed;
}

export function useDictation(): Dictation {
  const [status, setStatus] = useState<DictationStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [finalText, setFinalText] = useState("");
  const [liveText, setLiveText] = useState("");

  const whisperRef = useRef<WhisperContext | null>(null);
  const transcriberRef = useRef<RealtimeTranscriber | null>(null);
  // Guards state updates after unmount and tracks in-flight async work.
  const aliveRef = useRef(true);
  // Mirrors liveText so async stop logic can read it without stale closures.
  const liveTextRef = useRef("");

  const updateLiveText = (text: string) => {
    liveTextRef.current = text;
    setLiveText(text);
  };

  useEffect(() => {
    aliveRef.current = true;
    areModelsDownloaded()
      .then((downloaded) => {
        if (!aliveRef.current) return;
        setStatus(downloaded ? "ready" : "needs-download");
      })
      .catch((e: unknown) => {
        if (!aliveRef.current) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      });

    return () => {
      aliveRef.current = false;
      transcriberRef.current?.release().catch(() => {});
      transcriberRef.current = null;
      whisperRef.current?.release().catch(() => {});
      whisperRef.current = null;
    };
  }, []);

  const fail = (e: unknown) => {
    if (!aliveRef.current) return;
    setError(e instanceof Error ? e.message : String(e));
    setStatus("error");
  };

  const downloadModels = () => {
    setStatus("downloading");
    setError(null);
    ensureModelsDownloaded((progress) => {
      if (aliveRef.current) setDownloadProgress(progress);
    })
      .then(() => {
        if (aliveRef.current) setStatus("ready");
      })
      .catch(fail);
  };

  const startListening = () => {
    setStatus("loading-model");
    setError(null);

    const start = async () => {
      const { whisperModelPath, vadModelPath } = getModelPaths();

      if (!whisperRef.current) {
        whisperRef.current = await initWhisper({
          filePath: whisperModelPath,
          useGpu: true,
        });
      }

      if (!transcriberRef.current) {
        const vadContext = await initWhisperVad({
          filePath: vadModelPath,
          useGpu: true,
        });

        transcriberRef.current = new RealtimeTranscriber(
          {
            whisperContext: whisperRef.current,
            // Long-form dictation preset: tolerates longer pauses before
            // closing a speech segment.
            vadContext: new RingBufferVad(vadContext, {
              vadPreset: "continuous",
            }),
            audioStream: new AudioPcmStreamAdapter(),
          },
          {
            audioSliceSec: 30,
            promptPreviousSlices: true,
            transcribeOptions: { language: "en" },
            logger: __DEV__
              ? (message) => console.log("[dictation]", message)
              : undefined,
          },
          {
            onTranscribe: (event) => {
              if (!aliveRef.current) return;
              const text = event.data?.result?.trim();
              if (text) updateLiveText(text);
            },
            onSliceTranscriptionStabilized: (text) => {
              if (!aliveRef.current) return;
              setFinalText((prev) => appendText(prev, text));
              updateLiveText("");
            },
            onVad: (event) => {
              if (
                __DEV__ &&
                (event.type === "speech_start" || event.type === "speech_end")
              ) {
                console.log(
                  `[dictation] VAD ${event.type} (confidence ${event.confidence.toFixed(2)})`,
                );
              }
            },
            onError: (message) => {
              // Transient transcription errors are surfaced without killing
              // the session.
              console.warn("Dictation error:", message);
              if (aliveRef.current) setError(message);
            },
          },
        );
      }

      await transcriberRef.current.start();
      if (aliveRef.current) setStatus("listening");
    };

    start().catch(fail);
  };

  const stopListening = () => {
    const transcriber = transcriberRef.current;
    if (!transcriber) {
      setStatus("ready");
      return;
    }

    const stop = async () => {
      // Finalize the in-progress slice so its text arrives via
      // onSliceTranscriptionStabilized before the session ends.
      await transcriber.nextSlice();
      await transcriber.stop();
      if (!aliveRef.current) return;
      // If the last slice never stabilized (e.g. stopped mid-word), keep the
      // live preview rather than dropping it.
      const pending = liveTextRef.current;
      if (pending) {
        setFinalText((prev) => appendText(prev, pending));
        updateLiveText("");
      }
      setStatus("ready");
    };

    stop().catch(fail);
  };

  const clearTranscript = () => {
    setFinalText("");
    updateLiveText("");
  };

  return {
    status,
    error,
    downloadProgress,
    finalText,
    liveText,
    downloadModels,
    startListening,
    stopListening,
    clearTranscript,
  };
}
