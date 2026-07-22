import * as Haptics from "expo-haptics";
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

export function usePinShake() {
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { shakeStyle, triggerShake };
}
