import api from "@/config/api"

export const userService = {
  // Obtener todos los usuarios (solo admin)
  getUsers: async () => {
    try {
      const response = await api.get("/auth/users")

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        return {
          success: false,
          error: response.data.message || "Error obteniendo usuarios",
        }
      }
    } catch (error) {
      console.error("Error obteniendo usuarios:", error)

      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message,
        }
      }

      return {
        success: false,
        error: "Error de conexión. Verifica tu conexión a internet.",
      }
    }
  },

  // Crear nuevo usuario (solo admin)
  createUser: async (userData) => {
    try {
      const response = await api.post("/auth/users", userData)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      } else {
        return {
          success: false,
          error: response.data.message || "Error creando usuario",
        }
      }
    } catch (error) {
      console.error("Error creando usuario:", error)

      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message,
        }
      }

      return {
        success: false,
        error: "Error de conexión. Verifica tu conexión a internet.",
      }
    }
  },

  // Actualizar usuario (solo admin)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData)

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        }
      } else {
        return {
          success: false,
          error: response.data.message || "Error actualizando usuario",
        }
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error)

      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message,
        }
      }

      return {
        success: false,
        error: "Error de conexión. Verifica tu conexión a internet.",
      }
    }
  },

  // Eliminar usuario (solo admin) - Nota: Este endpoint no existe aún en el backend
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/auth/users/${userId}`)

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        }
      } else {
        return {
          success: false,
          error: response.data.message || "Error eliminando usuario",
        }
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error)

      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message,
        }
      }

      return {
        success: false,
        error: "Error de conexión. Verifica tu conexión a internet.",
      }
    }
  },

  // Cambiar estado de usuario (activar/desactivar)
  toggleUserStatus: async (userId, active) => {
    try {
      // Primero obtenemos los datos del usuario
      const usersResponse = await api.get("/auth/users")
      if (!usersResponse.data.success) {
        throw new Error("No se pudo obtener información del usuario")
      }

      const user = usersResponse.data.data.find((u) => u.id === userId)
      if (!user) {
        throw new Error("Usuario no encontrado")
      }

      // Actualizamos solo el estado activo
      const response = await api.put(`/auth/users/${userId}`, {
        name: user.name,
        email: user.email,
        role: user.role,
        active: active,
      })

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        }
      } else {
        return {
          success: false,
          error: response.data.message || "Error cambiando estado del usuario",
        }
      }
    } catch (error) {
      console.error("Error cambiando estado del usuario:", error)

      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message,
        }
      }

      return {
        success: false,
        error: "Error de conexión. Verifica tu conexión a internet.",
      }
    }
  },
}

export default userService
