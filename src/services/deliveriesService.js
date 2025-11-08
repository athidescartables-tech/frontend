import api from "@/config/api"

export const deliveriesService = {
  getDeliveries: async (params = {}) => {
    return await api.get("/deliveries", { params })
  },

  getDeliveryById: async (id) => {
    return await api.get(`/deliveries/${id}`)
  },

  createDelivery: async (deliveryData) => {
    return await api.post("/deliveries", deliveryData)
  },

  updateDeliveryStatus: async (id, statusData) => {
    return await api.patch(`/deliveries/${id}/status`, statusData)
  },

  getDriverDeliveries: async (driverId, status = "pending") => {
    return await api.get(`/deliveries/driver/${driverId}`, { params: { status } })
  },

  getDeliveriesStats: async (period = "today") => {
    return await api.get("/deliveries/stats", { params: { period } })
  },
}
