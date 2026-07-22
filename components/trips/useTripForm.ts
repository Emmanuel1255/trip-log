import { useEffect, useState } from "react";
import { getLatestTripForVehicle } from "@/lib/db/queries/trips";
import { getVehicle } from "@/lib/db/queries/vehicles";
import { calculateDistanceKm } from "@/lib/utils/distance";

export interface TripFormValues {
  tripDate: Date;
  vehicleId: string | null;
  driverId: string | null;
  departureLocation: string;
  timeOut: Date | null;
  arrivalLocation: string;
  timeIn: Date | null;
  passengers: string;
  openingOdometer: string;
  closingOdometer: string;
  notes: string;
}

interface UseTripFormOptions {
  initialValues?: Partial<TripFormValues>;
  /** Pre-fill opening odometer from the vehicle's last trip (or its starting odometer). Only for new trips. */
  autoFillOpeningOdometer?: boolean;
}

export function useTripForm({ initialValues, autoFillOpeningOdometer }: UseTripFormOptions = {}) {
  const [tripDate, setTripDate] = useState(initialValues?.tripDate ?? new Date());
  const [vehicleId, setVehicleId] = useState<string | null>(initialValues?.vehicleId ?? null);
  const [driverId, setDriverId] = useState<string | null>(initialValues?.driverId ?? null);
  const [departureLocation, setDepartureLocation] = useState(initialValues?.departureLocation ?? "");
  const [timeOut, setTimeOut] = useState<Date | null>(initialValues?.timeOut ?? null);
  const [arrivalLocation, setArrivalLocation] = useState(initialValues?.arrivalLocation ?? "");
  const [timeIn, setTimeIn] = useState<Date | null>(initialValues?.timeIn ?? null);
  const [passengers, setPassengers] = useState(initialValues?.passengers ?? "");
  const [openingOdometer, setOpeningOdometer] = useState(initialValues?.openingOdometer ?? "");
  const [closingOdometer, setClosingOdometer] = useState(initialValues?.closingOdometer ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");

  useEffect(() => {
    if (!autoFillOpeningOdometer || !vehicleId || openingOdometer) return;
    (async () => {
      const latestTrip = await getLatestTripForVehicle(vehicleId);
      if (latestTrip) {
        setOpeningOdometer(String(latestTrip.closing_odometer));
        return;
      }
      const vehicle = await getVehicle(vehicleId);
      if (vehicle?.starting_odometer != null) {
        setOpeningOdometer(String(vehicle.starting_odometer));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, autoFillOpeningOdometer]);

  const openingValue = parseFloat(openingOdometer);
  const closingValue = parseFloat(closingOdometer);
  const hasValidOdometerPair =
    Number.isFinite(openingValue) && Number.isFinite(closingValue) && closingValue >= openingValue;

  const distanceKm = hasValidOdometerPair ? calculateDistanceKm(openingValue, closingValue) : null;

  const odometerError =
    openingOdometer && closingOdometer && Number.isFinite(openingValue) && Number.isFinite(closingValue) && closingValue < openingValue
      ? "Closing odometer must be greater than or equal to opening odometer."
      : undefined;

  const isValid = Boolean(
    vehicleId &&
      driverId &&
      departureLocation.trim() &&
      timeOut &&
      arrivalLocation.trim() &&
      timeIn &&
      openingOdometer &&
      closingOdometer &&
      hasValidOdometerPair
  );

  return {
    values: {
      tripDate,
      vehicleId,
      driverId,
      departureLocation,
      timeOut,
      arrivalLocation,
      timeIn,
      passengers,
      openingOdometer,
      closingOdometer,
      notes,
    },
    setters: {
      setTripDate,
      setVehicleId,
      setDriverId,
      setDepartureLocation,
      setTimeOut,
      setArrivalLocation,
      setTimeIn,
      setPassengers,
      setOpeningOdometer,
      setClosingOdometer,
      setNotes,
    },
    distanceKm,
    odometerError,
    isValid,
  };
}
