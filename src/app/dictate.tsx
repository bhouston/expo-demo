import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/constants/theme";
import { useDictation } from "@/hooks/use-dictation";
import { formatBytes, WHISPER_MODEL } from "@/lib/whisper-models";

// Keeps line lengths readable on iPad while filling iPhone screens.
const CONTENT_MAX_WIDTH = 700;

export default function DictateScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {
    status,
    error,
    downloadProgress,
    finalText,
    liveText,
    downloadModels,
    startListening,
    stopListening,
    clearTranscript,
  } = useDictation();

  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const transcript = liveText
    ? finalText
      ? `${finalText} ${liveText}`
      : liveText
    : finalText;
  const hasTranscript = transcript.length > 0;
  const isListening = status === "listening";

  useEffect(() => {
    if (isListening) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [isListening, finalText, liveText]);

  const copyTranscript = async () => {
    await Clipboard.setStringAsync(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {status === "checking" ? (
          <View style={styles.centered}>
            <ActivityIndicator />
          </View>
        ) : status === "needs-download" || status === "downloading" ? (
          <View style={styles.centered}>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Ionicons
                name="cloud-download-outline"
                size={40}
                color={colors.tint}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Speech model required
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: colors.secondaryText }]}
              >
                Dictation runs entirely on this device. A one-time download of
                the Whisper model (
                {formatBytes(WHISPER_MODEL.approximateBytes)}) is needed.
              </Text>

              {status === "downloading" ? (
                <View style={styles.progressArea}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: colors.separator },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.tint,
                          width: `${Math.round((downloadProgress?.progress ?? 0) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressLabel,
                      { color: colors.secondaryText },
                    ]}
                  >
                    {formatBytes(downloadProgress?.totalBytesWritten ?? 0)} of{" "}
                    {formatBytes(
                      downloadProgress?.totalBytesExpected ??
                        WHISPER_MODEL.approximateBytes,
                    )}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={downloadModels}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: colors.tint,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.primaryButtonText, { color: colors.fabText }]}
                  >
                    Download Model
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.transcriptScroll}
              contentContainerStyle={styles.transcriptContent}
            >
              {hasTranscript ? (
                <Text style={[styles.transcriptText, { color: colors.text }]}>
                  {finalText}
                  {liveText ? (
                    <Text
                      style={[
                        styles.liveText,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {finalText ? " " : ""}
                      {liveText}
                    </Text>
                  ) : null}
                </Text>
              ) : (
                <View style={styles.emptyTranscript}>
                  <Ionicons
                    name="mic-outline"
                    size={48}
                    color={colors.secondaryText}
                  />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {isListening ? "Listening…" : "Ready to dictate"}
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      { color: colors.secondaryText },
                    ]}
                  >
                    {isListening
                      ? "Start speaking and your words will appear here."
                      : "Tap the microphone and start speaking. Everything is transcribed on-device."}
                  </Text>
                </View>
              )}
            </ScrollView>

            {error ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            ) : null}

            <View
              style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}
            >
              <Pressable
                onPress={clearTranscript}
                disabled={!hasTranscript || isListening}
                accessibilityRole="button"
                accessibilityLabel="Clear transcript"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    opacity:
                      !hasTranscript || isListening ? 0.3 : pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={colors.destructive}
                />
              </Pressable>

              <Pressable
                onPress={isListening ? stopListening : startListening}
                disabled={status === "loading-model"}
                accessibilityRole="button"
                accessibilityLabel={
                  isListening ? "Stop dictation" : "Start dictation"
                }
                style={({ pressed }) => [
                  styles.micButton,
                  {
                    backgroundColor: isListening
                      ? colors.destructive
                      : colors.tint,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {status === "loading-model" ? (
                  <ActivityIndicator color={colors.fabText} />
                ) : (
                  <Ionicons
                    name={isListening ? "stop" : "mic"}
                    size={36}
                    color={colors.fabText}
                  />
                )}
              </Pressable>

              <Pressable
                onPress={copyTranscript}
                disabled={!hasTranscript}
                accessibilityRole="button"
                accessibilityLabel="Copy transcript"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { opacity: !hasTranscript ? 0.3 : pressed ? 0.6 : 1 },
                ]}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={24}
                  color={colors.tint}
                />
              </Pressable>
            </View>

            {isListening ? (
              <View style={styles.recordingBadge}>
                <View
                  style={[
                    styles.recordingDot,
                    { backgroundColor: colors.destructive },
                  ]}
                />
                <Text
                  style={[styles.recordingText, { color: colors.secondaryText }]}
                >
                  Listening — transcribing on-device
                </Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 24,
    width: "100%",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
  },
  progressArea: {
    width: "100%",
    gap: 8,
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptContent: {
    padding: 20,
    flexGrow: 1,
  },
  transcriptText: {
    fontSize: 19,
    lineHeight: 28,
  },
  liveText: {
    fontStyle: "italic",
  },
  emptyTranscript: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    paddingTop: 12,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  secondaryButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingBadge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recordingText: {
    fontSize: 13,
  },
});
