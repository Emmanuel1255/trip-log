import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { TextField } from "@/components/ui/TextField";

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
  const [name, setName] = useState(initialValues?.name ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initialValues?.licenseNumber ?? "");
  const [licenseExpiry, setLicenseExpiry] = useState<Date | null>(initialValues?.licenseExpiry ?? null);

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
      <DateTimeField
        label="License Expiry (Optional)"
        mode="date"
        value={licenseExpiry}
        onChange={setLicenseExpiry}
      />

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
