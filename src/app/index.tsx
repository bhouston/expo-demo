import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { router, Stack } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TodoItem } from "@/components/todo-item";
import { useThemeColors } from "@/constants/theme";
import { useDeleteTodo, useTodos } from "@/hooks/use-todos";

export default function TodoListScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { data: todos = [], isPending } = useTodos();
  const deleteTodo = useDeleteTodo();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/settings")}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              style={styles.settingsButton}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={colors.tint}
              />
            </Pressable>
          ),
        }}
      />

      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlashList
          data={todos}
          keyExtractor={(todo) => todo.id}
          renderItem={({ item }) => (
            <TodoItem todo={item} onDelete={(id) => deleteTodo.mutate(id)} />
          )}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: colors.separator }]}
            />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={48}
                color={colors.secondaryText}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No to-dos yet
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.secondaryText }]}
              >
                Tap + to add your first to-do.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push("/add")}
        accessibilityRole="button"
        accessibilityLabel="Add a to-do"
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.tint,
            bottom: insets.bottom + 24,
            right: insets.right + 24,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={32} color={colors.fabText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  // Explicit square frame works around off-center header buttons inside the
  // iOS 26 glass capsule (react-native-screens #2990, fixed natively in 4.21+).
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingTop: 96,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
});
