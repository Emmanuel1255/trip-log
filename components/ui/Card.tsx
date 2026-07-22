import { StyleSheet, View, type ViewProps } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function Card({ style, ...rest }: ViewProps) {
  const { colors, radii, elevation } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surfaceSolid,
          borderRadius: radii.card,
          ...elevation.level1,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
  },
});
