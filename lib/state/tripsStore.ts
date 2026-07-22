import { create } from "zustand";

interface TripsVersionStore {
  version: number;
  bump: () => void;
}

/** Bumped after any trip insert/update/delete so screens showing trip data know to refetch. */
export const useTripsVersionStore = create<TripsVersionStore>((set) => ({
  version: 0,
  bump: () => set((state) => ({ version: state.version + 1 })),
}));
