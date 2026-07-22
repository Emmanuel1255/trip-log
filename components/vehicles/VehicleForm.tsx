import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextField } from "@/components/ui/TextField";
import type { FuelType } from "@/lib/db/types";

export interface VehicleFormValues {
  plateNumber: string;
  make: string;
  fuelType: FuelType;
  startingOdometer: string;
}

interface VehicleFormProps {
  initialValues?: Partial<VehicleFormValues>;
  submitLabel: string;
  saving?: boolean;
  onSubmit: (values: VehicleFormValues) => void;
}

export function VehicleForm({ initialValues, submitLabel, saving, onSubmit }: VehicleFormProps) {
  const [plateNumber, setPlateNumber] = useState(initialValues?.plateNumber ?? "");
  const [make, setMake] = useState(initialValues?.make ?? "");
  const [fuelType, setFuelType] = useState<FuelType>(initialValues?.fuelType ?? "petrol");
  const [startingOdometer, setStartingOdometer] = useState(initialValues?.startingOdometer ?? "");

  const canSave = plateNumber.trim().length > 0 && make.trim().length > 0;

  return (
    <View>
      <TextField
        label="License Plate"
        placeholder="ABC 123"
        value={plateNumber}
        onChangeText={setPlateNumber}
        autoCapitalize="characters"
      />
      <TextField label="Make" placeholder="Toyota Hilux" value={make} onChangeText={setMake} />

      <View style={styles.segmentField}>
        <SegmentedControl
          options={[
            { label: "Petrol", value: "petrol" },
            { label: "Diesel", value: "diesel" },
          ]}
          value={fuelType}
          onChange={setFuelType}
        />
      </View>

      <TextField
        label="Current Odometer (km)"
        placeholder="0"
        keyboardType="numeric"
        value={startingOdometer}
        onChangeText={setStartingOdometer}
      />

      <Button
        label={submitLabel}
        loading={saving}
        disabled={!canSave}
        onPress={() =>
          onSubmit({ plateNumber: plateNumber.trim(), make: make.trim(), fuelType, startingOdometer })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segmentField: {
    marginBottom: 16,
  },
});
