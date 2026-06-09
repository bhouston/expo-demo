import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors, type ThemeColors } from "@/constants/theme";
import { useAddTodo } from "@/hooks/use-todos";
import { todoFormSchema } from "@/lib/schema";

function FieldError({
  errors,
  colors,
}: {
  errors: ({ message?: string } | undefined)[];
  colors: ThemeColors;
}) {
  const message = errors.find((error) => error?.message)?.message;
  if (!message) {
    return null;
  }
  return (
    <Text style={[styles.errorText, { color: colors.destructive }]}>
      {message}
    </Text>
  );
}

export default function AddTodoScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const addTodo = useAddTodo();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onChange: todoFormSchema,
    },
    onSubmit: async ({ value }) => {
      await addTodo.mutateAsync(value);
      router.back();
    },
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <form.Field name="title">
          {(field) => (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>
                Title
              </Text>
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="What needs doing?"
                placeholderTextColor={colors.secondaryText}
                autoFocus
                returnKeyType="next"
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
              />
              {field.state.meta.isTouched ? (
                <FieldError errors={field.state.meta.errors} colors={colors} />
              ) : null}
            </View>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>
                Description (optional)
              </Text>
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Add more details…"
                placeholderTextColor={colors.secondaryText}
                multiline
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.multilineInput,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
              />
              {field.state.meta.isTouched ? (
                <FieldError errors={field.state.meta.errors} colors={colors} />
              ) : null}
            </View>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <Pressable
              onPress={() => form.handleSubmit()}
              disabled={!canSubmit || isSubmitting}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: colors.tint,
                  opacity: !canSubmit || isSubmitting ? 0.4 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? "Adding…" : "Add To Do"}
              </Text>
            </Pressable>
          )}
        </form.Subscribe>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
  },
  multilineInput: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 13,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
