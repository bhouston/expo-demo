import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/constants/theme";
import { useDeleteAllTodos, useGenerateTodos } from "@/hooks/use-todos";
import { confirmAction } from "@/lib/confirm";

const GENERATED_COUNT = 1000;

export default function SettingsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const deleteAll = useDeleteAllTodos();
  const generate = useGenerateTodos();

  const confirmGenerate = () => {
    confirmAction({
      title: "Generate Data",
      message: `Add ${GENERATED_COUNT} fake to-dos for performance testing?`,
      confirmLabel: "Generate",
      onConfirm: () => generate.mutate(GENERATED_COUNT),
    });
  };

  const confirmDeleteAll = () => {
    confirmAction({
      title: "Delete All",
      message: "This will permanently delete every to-do. Are you sure?",
      confirmLabel: "Delete All",
      destructive: true,
      onConfirm: () => deleteAll.mutate(undefined),
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>
        Data
      </Text>
      <View style={[styles.group, { backgroundColor: colors.card }]}>
        <Pressable
          onPress={confirmGenerate}
          disabled={generate.isPending}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <Ionicons name="flask-outline" size={22} color={colors.tint} />
          <Text style={[styles.rowText, { color: colors.text }]}>
            Generate Data
          </Text>
          {generate.isPending ? <ActivityIndicator /> : null}
        </Pressable>

        <View
          style={[styles.separator, { backgroundColor: colors.separator }]}
        />

        <Pressable
          onPress={confirmDeleteAll}
          disabled={deleteAll.isPending}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={colors.destructive}
          />
          <Text style={[styles.rowText, { color: colors.destructive }]}>
            Delete All
          </Text>
          {deleteAll.isPending ? <ActivityIndicator /> : null}
        </Pressable>
      </View>
      <Text style={[styles.footnote, { color: colors.secondaryText }]}>
        Generate Data inserts {GENERATED_COUNT} fake to-dos to test list
        performance.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 12,
  },
  group: {
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    fontSize: 17,
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  footnote: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 12,
  },
});
