import { BlurView } from "expo-blur";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function GlassCard({ style, children, ...rest }: ViewProps) {
  const { mode, colors, radii } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        { borderRadius: radii.glass, borderColor: colors.hairline },
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={40}
        tint={mode}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: 1,
  },
  content: {
    padding: 16,
  },
});
