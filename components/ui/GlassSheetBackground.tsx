import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function GlassSheetBackground() {
  const { mode, colors, radii } = useTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.wrapper,
        { borderRadius: radii.glass, borderColor: colors.hairline },
      ]}
    >
      <BlurView intensity={50} tint={mode} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: 1,
    borderBottomWidth: 0,
  },
});
