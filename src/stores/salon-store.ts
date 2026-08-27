/**
 * Selected salon of the signed-in owner (owners can manage several salons).
 * Persisted in localStorage so the choice survives reloads. Every salon-scoped
 * query hook reads `salonId` from here through `useCurrentSalon()`.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SalonState {
  /** Selected salon id, or null until the salon list has loaded. */
  salonId: number | null;
  setSalonId: (salonId: number | null) => void;
}

export const useSalonStore = create<SalonState>()(
  persist((set) => ({ salonId: null, setSalonId: (salonId) => set({ salonId }) }), {
    name: "slotify-admin.salon",
  })
);
