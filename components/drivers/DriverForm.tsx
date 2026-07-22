import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatDisplayDate } from "@/lib/utils/date";

export interface DriverFormValues {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date | null;
}

interface DriverFormProps {
  initialValues?: Partial<DriverFormValues>;
  submitLabel: string;
  saving?: boolean;
  onSubmit: (values: DriverFormValues) => void;
}

export function DriverForm({ initialValues, submitLabel, saving, onSubmit }: DriverFormProps) {
  const { colors, typography, radii } = useTheme();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initialValues?.licenseNumber ?? "");
  const [licenseExpiry, setLicenseExpiry] = useState<Date | null>(initialValues?.licenseExpiry ?? null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canSave = name.trim().length > 0;

  return (
    <View>
      <TextField label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
      <TextField
        label="Phone Number"
        placeholder="76 123456"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextField
        label="License Number (Optional)"
        placeholder="SL 1234567"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />

      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
        License Expiry (Optional)
      </Text>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          styles.dateInput,
          { borderColor: colors.hairline, borderRadius: radii.card, backgroundColor: colors.surfaceSolid },
        ]}
      >
        <Text style={{ color: licenseExpiry ? colors.textPrimary : colors.textSecondary }}>
          {licenseExpiry ? formatDisplayDate(licenseExpiry.toISOString().slice(0, 10)) : "Select date"}
        </Text>
        <Feather name="calendar" size={18} color={colors.textSecondary} />
      </Pressable>
      {showDatePicker ? (
        <DateTimePicker
          value={licenseExpiry ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event, date) => {
            setShowDatePicker(Platform.OS === "ios");
            if (date) setLicenseExpiry(date);
          }}
        />
      ) : null}

      <View style={{ marginTop: 16 }}>
        <Button
          label={submitLabel}
          loading={saving}
          disabled={!canSave}
          onPress={() => onSubmit({ name: name.trim(), phone, licenseNumber, licenseExpiry })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
});
