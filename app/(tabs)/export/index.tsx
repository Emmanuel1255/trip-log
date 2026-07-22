import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField } from "@/components/ui/SelectField";
import { useDrivers } from "@/hooks/useDrivers";
import { useFuelEntries } from "@/hooks/useFuelEntries";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { exportTripsAsCsv } from "@/lib/export/csv";
import { exportTripsAsPdf } from "@/lib/export/pdf";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { DATE_PRESET_OPTIONS, type DatePreset, getDatePresetRange } from "@/lib/utils/date";

type ExportFormat = "pdf" | "csv";

export default function ExportScreen() {
  const { colors, typography, radii } = useTheme();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("month");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dateFrom, dateTo } = useMemo(() => getDatePresetRange(datePreset), [datePreset]);
  const { trips } = useTrips({ vehicleId: vehicleId ?? undefined, dateFrom, dateTo });
  const { fuelEntries } = useFuelEntries({ vehicleId: vehicleId ?? undefined, dateFrom, dateTo });

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);
  const fuelByTripId = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of fuelEntries) {
      if (!entry.trip_id) continue;
      map.set(entry.trip_id, (map.get(entry.trip_id) ?? 0) + entry.litres);
    }
    return map;
  }, [fuelEntries]);
  const totalFuelLitres = useMemo(() => fuelEntries.reduce((sum, f) => sum + f.litres, 0), [fuelEntries]);

  const vehicleOptions = [
    { label: "All Vehicles", value: "all" },
    ...vehicles.map((v) => ({ label: `${v.plate_number} · ${v.make}`, value: v.id })),
  ];

  const selectedVehicleLabel = vehicleId ? vehicleById.get(vehicleId)?.plate_number ?? "vehicle" : "all-vehicles";
  const datePresetLabel = DATE_PRESET_OPTIONS.find((option) => option.value === datePreset)?.label ?? "";

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const meta = {
        title: "TripLog — Trip Report",
        subtitle: `${vehicleId ? vehicleById.get(vehicleId)?.plate_number ?? "Vehicle" : "All Vehicles"} · ${datePresetLabel}`,
        totalFuelLitres,
      };
      const filenameSuffix = `${selectedVehicleLabel}-${datePreset}-${Date.now()}`;

      if (format === "pdf") {
        await exportTripsAsPdf(trips, vehicleById, driverById, fuelByTripId, meta);
      } else {
        await exportTripsAsCsv(trips, vehicleById, driverById, fuelByTripId, filenameSuffix);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate export.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Export</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 20 }]}>
        Generate a report for a vehicle and date range
      </Text>

      <Card>
        <SelectField
          label="Vehicle"
          value={vehicleId ?? "all"}
          options={vehicleOptions}
          onChange={(value) => setVehicleId(value === "all" ? null : value)}
        />

        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>Date Range</Text>
        <View style={{ marginBottom: 16 }}>
          <SegmentedControl options={DATE_PRESET_OPTIONS} value={datePreset} onChange={setDatePreset} />
        </View>

        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>Format</Text>
        <View style={{ marginBottom: 4 }}>
          <SegmentedControl
            options={[
              { label: "PDF", value: "pdf" },
              { label: "CSV", value: "csv" },
            ]}
            value={format}
            onChange={setFormat}
          />
        </View>
      </Card>

      <View style={styles.summary}>
        <Feather name="clipboard" size={16} color={colors.textSecondary} />
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {trips.length} trip{trips.length === 1 ? "" : "s"} · {Math.round(totalFuelLitres)} L fuel in range
        </Text>
      </View>

      {trips.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surfaceSolid, borderRadius: radii.card }]}>
          <Feather name="inbox" size={28} color={colors.textSecondary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8, textAlign: "center" }]}>
            No trips match this vehicle and date range yet.
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginBottom: 12 }]}>{error}</Text>
      ) : null}

      <Button
        label={`Generate ${format.toUpperCase()}`}
        onPress={handleGenerate}
        loading={generating}
        disabled={trips.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
});
