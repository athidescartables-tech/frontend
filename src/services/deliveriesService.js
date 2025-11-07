import api from "@/config/api"
export const deliveriesService = {
  // Obtener todos los repartos
  getDeliveries: async (params = {}) => {
    return await api.get("/api/deliveries", { params })
  },

  // Obtener reparto por ID
  getDeliveryById: async (id) => {
    return await api.get(`/api/deliveries/${id}`)
  },

  // Crear nuevo reparto
  createDelivery: async (deliveryData) => {
    return await api.post("/api/deliveries", deliveryData)
  },

  // Actualizar estado del reparto
  updateDeliveryStatus: async (id, statusData) => {
    return await api.patch(`/api/deliveries/${id}/status`, statusData)
  },

  // Obtener repartos de un repartidor
  getDriverDeliveries: async (driverId, status = "pending") => {
    return await api.get(`/api/deliveries/driver/${driverId}`, { params: { status } })
  },

  // Obtener estadísticas de repartos
  getDeliveriesStats: async (period = "today") => {
    return await api.get("/api/deliveries/stats", { params: { period } })
  },
}
