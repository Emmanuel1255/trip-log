import { ScrollView, StyleSheet, View } from "react-native";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import type { Driver, Vehicle } from "@/lib/db/types";
import { DATE_PRESET_OPTIONS, type DatePreset } from "@/lib/utils/date";

interface TripFilterBarProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  vehicleId: string | null;
  driverId: string | null;
  datePreset: DatePreset;
  onChangeVehicle: (id: string | null) => void;
  onChangeDriver: (id: string | null) => void;
  onChangeDatePreset: (preset: DatePreset) => void;
}

export function TripFilterBar({
  vehicles,
  drivers,
  vehicleId,
  driverId,
  datePreset,
  onChangeVehicle,
  onChangeDriver,
  onChangeDatePreset,
}: TripFilterBarProps) {
  const vehicleOptions: SelectOption[] = [
    { label: "All Vehicles", value: "all" },
    ...vehicles.map((v) => ({ label: `${v.plate_number} · ${v.make}`, value: v.id })),
  ];
  const driverOptions: SelectOption[] = [
    { label: "All Drivers", value: "all" },
    ...drivers.map((d) => ({ label: d.name, value: d.id })),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <View style={styles.field}>
        <SelectField
          placeholder="All Vehicles"
          value={vehicleId ?? "all"}
          options={vehicleOptions}
          onChange={(value) => onChangeVehicle(value === "all" ? null : value)}
        />
      </View>
      <View style={styles.field}>
        <SelectField
          placeholder="All Drivers"
          value={driverId ?? "all"}
          options={driverOptions}
          onChange={(value) => onChangeDriver(value === "all" ? null : value)}
        />
      </View>
      <View style={styles.field}>
        <SelectField
          placeholder="All Time"
          value={datePreset}
          options={DATE_PRESET_OPTIONS}
          onChange={(value) => onChangeDatePreset(value as DatePreset)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingBottom: 4,
  },
  field: {
    width: 150,
  },
});
