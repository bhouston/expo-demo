import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useThemeColors } from "@/constants/theme";
import { type Todo } from "@/lib/schema";

/** Fraction of the row width that must be swiped before release deletes. */
const DELETE_THRESHOLD_RATIO = 0.3;
/** Icon scale at rest; grows to 1 as the swipe approaches the threshold. */
const ICON_MIN_SCALE = 0.4;
const ICON_SIZE = 22;

type TodoItemProps = {
  todo: Todo;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onDelete }: TodoItemProps) {
  const colors = useThemeColors();
  const translateX = useSharedValue(0);
  const rowWidth = useSharedValue(0);

  // FlashList recycles item instances, so reset any in-flight swipe state
  // when this component is reused for a different todo.
  useEffect(() => {
    translateX.value = 0;
  }, [todo.id, translateX]);

  const deleteTodo = () => {
    onDelete(todo.id);
  };

  const pan = Gesture.Pan()
    .activeOffsetX(-10)
    .failOffsetX(10)
    .failOffsetY([-10, 10])
    .onChange((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      const threshold = rowWidth.value * DELETE_THRESHOLD_RATIO;
      if (threshold > 0 && -translateX.value >= threshold) {
        translateX.value = withTiming(
          -rowWidth.value,
          { duration: 150 },
          (finished) => {
            if (finished) {
              runOnJS(deleteTodo)();
            }
          },
        );
      } else {
        translateX.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => {
    const threshold = rowWidth.value * DELETE_THRESHOLD_RATIO;
    const scale =
      threshold > 0
        ? interpolate(
            -translateX.value,
            [0, threshold],
            [ICON_MIN_SCALE, 1],
            Extrapolation.CLAMP,
          )
        : ICON_MIN_SCALE;
    return { transform: [{ scale }] };
  });

  return (
    <View
      style={{ backgroundColor: colors.destructive }}
      onLayout={(event) => {
        rowWidth.value = event.nativeEvent.layout.width;
      }}
    >
      <View style={styles.deleteUnderlay} pointerEvents="none">
        <Animated.View style={iconStyle}>
          <Ionicons name="trash-outline" size={ICON_SIZE} color="#FFFFFF" />
        </Animated.View>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.row, { backgroundColor: colors.card }, rowStyle]}
          accessible
          accessibilityActions={[{ name: "delete", label: "Delete" }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "delete") {
              deleteTodo();
            }
          }}
        >
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
        </Animated.View>
      </GestureDetector>
    </View>
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
  deleteUnderlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 24,
  },
});
