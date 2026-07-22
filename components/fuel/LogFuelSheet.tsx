import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { GlassSheetBackground } from "@/components/ui/GlassSheetBackground";
import { useRegisterLogFuelSheetRef } from "@/hooks/useLogFuelSheet";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function LogFuelSheet() {
  const ref = useRegisterLogFuelSheetRef();
  const { colors, typography } = useTheme();
  const snapPoints = useMemo(() => ["60%"], []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundComponent={GlassSheetBackground}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.content}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Log Fuel</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
          Fuel logging form coming in Milestone 3.
        </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
});
