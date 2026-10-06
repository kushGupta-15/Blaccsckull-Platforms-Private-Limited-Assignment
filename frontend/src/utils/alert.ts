import { Alert as RNAlert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Cross-platform alert utility.
 * React Native Web has Alert.alert as a no-op dummy function.
 * This helper uses window.alert/window.confirm on web, and RNAlert on mobile.
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void => {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;

    if (buttons && buttons.length > 1) {
      const confirmed = typeof window !== 'undefined' && window.confirm(fullMessage);
      if (confirmed) {
        const confirmBtn =
          buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];
        confirmBtn?.onPress?.();
      } else {
        const cancelBtn = buttons.find((b) => b.style === 'cancel');
        cancelBtn?.onPress?.();
      }
    } else {
      if (typeof window !== 'undefined') {
        window.alert(fullMessage);
      }
      if (buttons && buttons.length === 1 && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    RNAlert.alert(title, message, buttons as any);
  }
};
