import { create } from "zustand";

interface FuelVersionStore {
  version: number;
  bump: () => void;
}

/** Bumped after any fuel entry insert/update/delete so screens showing fuel data know to refetch. */
export const useFuelVersionStore = create<FuelVersionStore>((set) => ({
  version: 0,
  bump: () => set((state) => ({ version: state.version + 1 })),
}));
