import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, type ElementRef } from "react";
import { create } from "zustand";

type BottomSheetModalRef = ElementRef<typeof BottomSheetModal>;

interface LogTripSheetPresentOptions {
  vehicleId?: string;
  driverId?: string;
}

interface LogTripSheetStore {
  ref: React.RefObject<BottomSheetModalRef | null> | null;
  presentOptions: LogTripSheetPresentOptions | null;
  setRef: (ref: React.RefObject<BottomSheetModalRef | null>) => void;
  present: (options?: LogTripSheetPresentOptions) => void;
  dismiss: () => void;
}

export const useLogTripSheetStore = create<LogTripSheetStore>((set, get) => ({
  ref: null,
  presentOptions: null,
  setRef: (ref) => set({ ref }),
  present: (options) => {
    set({ presentOptions: options ?? null });
    get().ref?.current?.present();
  },
  dismiss: () => get().ref?.current?.dismiss(),
}));

export function useLogTripSheet() {
  const present = useLogTripSheetStore((s) => s.present);
  const dismiss = useLogTripSheetStore((s) => s.dismiss);
  return { present, dismiss };
}

export function useRegisterLogTripSheetRef() {
  const ref = useRef<BottomSheetModalRef>(null);
  const setRef = useLogTripSheetStore((s) => s.setRef);
  useEffect(() => {
    setRef(ref);
  }, [setRef]);
  return ref;
}
