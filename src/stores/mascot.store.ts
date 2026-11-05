// TODO: Implement mascot store

import { create } from 'zustand';

interface MascotState {
  mascot: unknown | null;
  isLoading: boolean;
  setMascot: (mascot: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  updateExperience: (xp: number) => void;
}

export const useMascotStore = create<MascotState>((set) => ({
  mascot: null,
  isLoading: false,
  setMascot: (mascot) => set({ mascot }),
  setLoading: (isLoading) => set({ isLoading }),
  updateExperience: (xp) =>
    set((state) => ({
      mascot: state.mascot
        ? { ...state.mascot, experience: (state.mascot as any).experience + xp }
        : null,
    })),
}));
