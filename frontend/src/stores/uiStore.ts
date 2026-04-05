import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  currentLanguage: 'en' | 'id'
  toggleSidebar: () => void
  setLanguage: (lang: 'en' | 'id') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  currentLanguage: 'id', // Default to Indonesian
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  })),
  setLanguage: (lang) => set({ currentLanguage: lang }),
}))
