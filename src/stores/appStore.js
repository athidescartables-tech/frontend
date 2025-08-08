import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Estado de la aplicación
      sidebarOpen: false,
      theme: "light",
      language: "es",

      // Notificaciones
      notifications: [],

      // Configuración de la empresa
      company: {
        name: "Mi Empresa",
        address: "",
        phone: "",
        email: "",
        logo: null,
      },

      // Configuración del sistema
      settings: {
        currency: "ARS",
        taxRate: 21,
        lowStockThreshold: 10,
        autoBackup: true,
        notifications: true,
      },

      // Acciones
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),

      // Notificaciones
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              id: Date.now() + Math.random(),
              ...notification,
              timestamp: new Date(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      updateCompany: (company) =>
        set((state) => ({
          company: { ...state.company, ...company },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        company: state.company,
        settings: state.settings,
      }),
    },
  ),
)
