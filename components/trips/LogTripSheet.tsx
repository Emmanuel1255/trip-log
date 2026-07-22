import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { GlassSheetBackground } from "@/components/ui/GlassSheetBackground";
import { useRegisterLogTripSheetRef } from "@/hooks/useLogTripSheet";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function LogTripSheet() {
  const ref = useRegisterLogTripSheetRef();
  const { colors, typography } = useTheme();
  const snapPoints = useMemo(() => ["75%"], []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundComponent={GlassSheetBackground}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.content}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Log Trip</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
          Trip logging form coming in Milestone 2.
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
