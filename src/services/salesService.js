import api from "@/config/api"

export const salesService = {
  // ACTUALIZADO: Obtener todas las ventas con paginación
  getSales: async (params = {}) => {
    return api.get("/sales", { params })
  },

  // Obtener venta por ID
  getSaleById: async (id) => {
    return await api.get(`/sales/${id}`)
  },

  // ACTUALIZADO: Crear nueva venta con soporte para múltiples pagos
  createSale: async (saleData) => {
    try {
      console.log("📤 Enviando datos de venta:", saleData)
      const response = await api.post("/sales", saleData)
      console.log("✅ Respuesta del servidor:", response.data)
      return response
    } catch (error) {
      console.error("❌ Error en salesService.createSale:", error)

      // Mejorar el manejo de errores
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response?.status === 400) {
        throw new Error("Datos de venta inválidos")
      } else if (error.response?.status === 500) {
        throw new Error("Error interno del servidor")
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("Error desconocido al procesar la venta")
      }
    }
  },

  // Cancelar venta
  cancelSale: async (id, reason) => {
    try {
      const response = await api.patch(`/sales/${id}/cancel`, { reason })
      return response
    } catch (error) {
      // Mejorar el manejo de errores
      const errorMessage = error.response?.data?.message || error.message || "Error al cancelar la venta"
      throw new Error(errorMessage)
    }
  },

  // Obtener estadísticas de ventas
  getSalesStats: async (period = "today") => {
    return await api.get(`/sales/stats?period=${period}`)
  },

  // Obtener reporte diario
  getDailySalesReport: async (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const queryString = params.toString()
    const url = queryString ? `/sales/report/daily?${queryString}` : "/sales/report/daily"

    return await api.get(url)
  },
}
