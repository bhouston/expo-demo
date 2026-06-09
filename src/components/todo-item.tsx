import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { useThemeColors } from "@/constants/theme";
import { type Todo } from "@/lib/schema";

type TodoItemProps = {
  todo: Todo;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onDelete }: TodoItemProps) {
  const colors = useThemeColors();

  const renderRightActions = () => (
    <Pressable
      onPress={() => onDelete(todo.id)}
      style={[styles.deleteAction, { backgroundColor: colors.destructive }]}
      accessibilityRole="button"
      accessibilityLabel={`Delete ${todo.title}`}
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
        {todo.description ? (
          <Text
            style={[styles.description, { color: colors.secondaryText }]}
            numberOfLines={2}
          >
            {todo.description}
          </Text>
        ) : null}
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
  },
  deleteAction: {
    width: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
