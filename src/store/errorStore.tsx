import { create } from 'zustand'

interface ErrorState {
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void
}

const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}))

export default useErrorStore
