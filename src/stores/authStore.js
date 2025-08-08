import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authService } from "@/services/authService"

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Inicializar estado desde localStorage
      initialize: () => {
        const isAuth = authService.isAuthenticated()
        const user = authService.getCurrentUser()

        set({
          isAuthenticated: isAuth,
          user: user,
        })
      },

      // Login
      login: async (credentials) => {
        set({ loading: true, error: null })

        try {
          const result = await authService.login(credentials)

          if (result.success) {
            set({
              user: result.data.user,
              isAuthenticated: true,
              loading: false,
              error: null,
            })
            return { success: true }
          } else {
            set({
              loading: false,
              error: result.error,
            })
            return { success: false, error: result.error }
          }
        } catch (error) {
          const errorMessage = error.message || "Error de conexión"
          set({
            loading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Registro
      register: async (userData) => {
        set({ loading: true, error: null })

        try {
          const result = await authService.register(userData)

          if (result.success) {
            set({
              user: result.data.user,
              isAuthenticated: true,
              loading: false,
              error: null,
            })
            return { success: true }
          } else {
            set({
              loading: false,
              error: result.error,
            })
            return { success: false, error: result.error }
          }
        } catch (error) {
          const errorMessage = error.message || "Error de conexión"
          set({
            loading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Logout
      logout: async () => {
        set({ loading: true })

        try {
          await authService.logout()
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({ loading: false })
        }
      },

      // Actualizar perfil
      updateProfile: async () => {
        try {
          const result = await authService.getProfile()
          if (result.success) {
            set({ user: result.data })
          }
        } catch (error) {
          console.error("Error updating profile:", error)
        }
      },

      // Cambiar contraseña
      changePassword: async (passwords) => {
        set({ loading: true, error: null })

        try {
          const result = await authService.changePassword(passwords)
          set({ loading: false })
          return result
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Error al cambiar contraseña",
          })
          return { success: false, error: error.message }
        }
      },

      // Limpiar errores
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
