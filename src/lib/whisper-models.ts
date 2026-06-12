// Downloads and caches the GGML model files whisper.rn needs. The new
// expo-file-system API (SDK 54) has no download progress callback yet, so the
// (still supported) legacy API is used for the large model download.
import * as FileSystem from "expo-file-system/legacy";

const MODELS_DIR = `${FileSystem.documentDirectory}whisper/`;

export type WhisperModelFile = {
  /** Filename inside the models directory. */
  filename: string;
  url: string;
  /** Approximate download size, used for UI before headers arrive. */
  approximateBytes: number;
};

export const WHISPER_MODEL: WhisperModelFile = {
  filename: "ggml-base.en.bin",
  url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin",
  approximateBytes: 148_000_000,
};

export const VAD_MODEL: WhisperModelFile = {
  filename: "ggml-silero-v5.1.2.bin",
  url: "https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v5.1.2.bin",
  approximateBytes: 885_000,
};

const ALL_MODELS = [WHISPER_MODEL, VAD_MODEL];

export function getModelPaths() {
  return {
    whisperModelPath: `${MODELS_DIR}${WHISPER_MODEL.filename}`,
    vadModelPath: `${MODELS_DIR}${VAD_MODEL.filename}`,
  };
}

async function isDownloaded(model: WhisperModelFile): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(`${MODELS_DIR}${model.filename}`);
  // Guard against truncated files from interrupted downloads.
  return info.exists && info.size > model.approximateBytes * 0.9;
}

export async function areModelsDownloaded(): Promise<boolean> {
  const results = await Promise.all(ALL_MODELS.map(isDownloaded));
  return results.every(Boolean);
}

export type DownloadProgress = {
  /** 0..1 across all model files. */
  progress: number;
  totalBytesWritten: number;
  totalBytesExpected: number;
};

export async function ensureModelsDownloaded(
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });

  const pending: WhisperModelFile[] = [];
  for (const model of ALL_MODELS) {
    if (!(await isDownloaded(model))) pending.push(model);
  }
  if (pending.length === 0) return;

  const totalExpected = pending.reduce(
    (sum, model) => sum + model.approximateBytes,
    0,
  );
  let completedBytes = 0;

  for (const model of pending) {
    const target = `${MODELS_DIR}${model.filename}`;
    const partial = `${target}.part`;

    const download = FileSystem.createDownloadResumable(
      model.url,
      partial,
      {},
      ({ totalBytesWritten }) => {
        const written = completedBytes + totalBytesWritten;
        onProgress({
          progress: Math.min(written / totalExpected, 1),
          totalBytesWritten: written,
          totalBytesExpected: totalExpected,
        });
      },
    );

    const result = await download.downloadAsync();
    if (!result || result.status !== 200) {
      await FileSystem.deleteAsync(partial, { idempotent: true });
      throw new Error(
        `Failed to download ${model.filename} (HTTP ${result?.status ?? "unknown"})`,
      );
    }
    await FileSystem.moveAsync({ from: partial, to: target });
    completedBytes += model.approximateBytes;
  }

  onProgress({
    progress: 1,
    totalBytesWritten: totalExpected,
    totalBytesExpected: totalExpected,
  });
}

export async function deleteDownloadedModels(): Promise<void> {
  await FileSystem.deleteAsync(MODELS_DIR, { idempotent: true });
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${Math.round(bytes / 1_000_000)} MB`;
  return `${Math.round(bytes / 1_000)} KB`;
}
