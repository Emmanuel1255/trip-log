import type { ComponentType } from "react";
import { StyleSheet, Text, View, type TextInputProps } from "react-native";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import type { TripFormValues } from "./useTripForm";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface TripFormFieldsProps {
  values: TripFormValues;
  setters: {
    setTripDate: (date: Date) => void;
    setVehicleId: (id: string) => void;
    setDriverId: (id: string) => void;
    setDepartureLocation: (value: string) => void;
    setTimeOut: (date: Date) => void;
    setArrivalLocation: (value: string) => void;
    setTimeIn: (date: Date) => void;
    setPassengers: (value: string) => void;
    setOpeningOdometer: (value: string) => void;
    setClosingOdometer: (value: string) => void;
    setNotes: (value: string) => void;
  };
  vehicleOptions: SelectOption[];
  driverOptions: SelectOption[];
  distanceKm: number | null;
  odometerError?: string;
  /** Pass BottomSheetTextInput when rendered inside a BottomSheetModal. */
  textInputComponent?: ComponentType<TextInputProps>;
}

export function TripFormFields({
  values,
  setters,
  vehicleOptions,
  driverOptions,
  distanceKm,
  odometerError,
  textInputComponent,
}: TripFormFieldsProps) {
  const { colors, typography, tabularNumsStyle } = useTheme();

  return (
    <View>
      <DateTimeField label="Date" mode="date" value={values.tripDate} onChange={setters.setTripDate} />

      <SelectField
        label="Vehicle"
        placeholder="Select vehicle"
        value={values.vehicleId}
        options={vehicleOptions}
        onChange={setters.setVehicleId}
        emptyMessage="Add a vehicle first from the Vehicles & Drivers tab."
      />
      <SelectField
        label="Driver"
        placeholder="Select driver"
        value={values.driverId}
        options={driverOptions}
        onChange={setters.setDriverId}
        emptyMessage="Add a driver first from the Vehicles & Drivers tab."
      />

      <TextField
        as={textInputComponent}
        label="Departure Location"
        placeholder="34 Wilkinson Road, Freetown"
        value={values.departureLocation}
        onChangeText={setters.setDepartureLocation}
      />
      <DateTimeField label="Time Out" mode="time" value={values.timeOut} onChange={setters.setTimeOut} />

      <TextField
        as={textInputComponent}
        label="Arrival Location"
        placeholder="Hastings Junction, Freetown"
        value={values.arrivalLocation}
        onChangeText={setters.setArrivalLocation}
      />
      <DateTimeField
        label="Time In (Optional — fill in when you end the trip)"
        mode="time"
        value={values.timeIn}
        onChange={setters.setTimeIn}
      />

      <TextField
        as={textInputComponent}
        label="Passengers (Optional)"
        placeholder="Mr. Kallon, Ms. Kamara"
        value={values.passengers}
        onChangeText={setters.setPassengers}
      />

      <View style={styles.odometerRow}>
        <View style={styles.odometerField}>
          <TextField
            as={textInputComponent}
            label="Opening Odometer (km)"
            placeholder="0"
            keyboardType="numeric"
            value={values.openingOdometer}
            onChangeText={setters.setOpeningOdometer}
          />
        </View>
        <View style={styles.odometerField}>
          <TextField
            as={textInputComponent}
            label="Closing Odometer (km) (Optional)"
            placeholder="Fill in when you end the trip"
            keyboardType="numeric"
            value={values.closingOdometer}
            onChangeText={setters.setClosingOdometer}
            error={odometerError}
          />
        </View>
      </View>

      <View style={styles.distanceCard}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Distance</Text>
        <Text style={[typography.display, tabularNumsStyle, { color: colors.primary, fontSize: 24 }]}>
          {distanceKm != null ? `${distanceKm} km` : "In progress"}
        </Text>
      </View>

      <TextField
        as={textInputComponent}
        label="Notes (Optional)"
        placeholder="Delivered construction materials."
        value={values.notes}
        onChangeText={setters.setNotes}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  odometerRow: {
    flexDirection: "row",
    gap: 12,
  },
  odometerField: {
    flex: 1,
  },
  distanceCard: {
    marginBottom: 16,
  },
});
