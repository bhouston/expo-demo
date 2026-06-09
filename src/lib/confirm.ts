import { Alert, Platform } from "react-native";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
};

/**
 * Alert.alert is a no-op in react-native-web, so confirmations must fall back
 * to window.confirm on web.
 */
export function confirmAction({
  title,
  message,
  confirmLabel,
  destructive = false,
  onConfirm,
}: ConfirmOptions) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
