import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, type ElementRef } from "react";
import { create } from "zustand";

type BottomSheetModalRef = ElementRef<typeof BottomSheetModal>;

interface LogFuelSheetPresentOptions {
  tripId?: string;
  vehicleId?: string;
}

interface LogFuelSheetStore {
  ref: React.RefObject<BottomSheetModalRef | null> | null;
  presentOptions: LogFuelSheetPresentOptions | null;
  setRef: (ref: React.RefObject<BottomSheetModalRef | null>) => void;
  present: (options?: LogFuelSheetPresentOptions) => void;
  dismiss: () => void;
}

export const useLogFuelSheetStore = create<LogFuelSheetStore>((set, get) => ({
  ref: null,
  presentOptions: null,
  setRef: (ref) => set({ ref }),
  present: (options) => {
    set({ presentOptions: options ?? null });
    get().ref?.current?.present();
  },
  dismiss: () => get().ref?.current?.dismiss(),
}));

export function useLogFuelSheet() {
  const present = useLogFuelSheetStore((s) => s.present);
  const dismiss = useLogFuelSheetStore((s) => s.dismiss);
  return { present, dismiss };
}

export function useRegisterLogFuelSheetRef() {
  const ref = useRef<BottomSheetModalRef>(null);
  const setRef = useLogFuelSheetStore((s) => s.setRef);
  useEffect(() => {
    setRef(ref);
  }, [setRef]);
  return ref;
}
