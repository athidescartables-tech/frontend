import { create } from "zustand"
import { deliveriesService } from "../services/deliveriesService"

export const useDeliveriesStore = create((set, get) => ({
  // Estado del reparto actual
  currentDelivery: null,
  deliveries: [],
  driverDeliveries: [],

  // Estado de UI
  loading: false,
  error: null,

  // Paginación
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  },

  // Estadísticas
  stats: {
    total_deliveries: 0,
    completed_deliveries: 0,
    in_progress_deliveries: 0,
    pending_deliveries: 0,
    cancelled_deliveries: 0,
    total_revenue: 0,
    average_delivery: 0,
    total_items_delivered: 0,
  },

  // Caching
  lastFetch: null,
  lastFetchStats: null,
  lastParamsKey: null,

  // Acciones básicas
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Obtener todos los repartos con paginación
  fetchDeliveries: async (params = {}, forceRefresh = false) => {
    const state = get()

    if (state.loading && !forceRefresh) {
      return state.deliveries
    }

    const now = Date.now()
    const cacheTime = 15 * 1000
    const paramsKey = JSON.stringify(params)

    if (
      !forceRefresh &&
      state.lastFetch &&
      now - state.lastFetch < cacheTime &&
      state.lastParamsKey === paramsKey &&
      state.deliveries.length > 0
    ) {
      return state.deliveries
    }

    set({ loading: true, error: null })
    try {
      const response = await deliveriesService.getDeliveries(params)

      if (response.data.success) {
        set({
          deliveries: response.data.data.deliveries,
          pagination: response.data.data.pagination,
          loading: false,
          lastFetch: now,
          lastParamsKey: paramsKey,
        })
        return response.data.data.deliveries
      } else {
        throw new Error(response.data.message || "Error al cargar repartos")
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar repartos",
        loading: false,
      })
      throw error
    }
  },

  // Obtener repartos del repartidor (optimizado para móvil)
  fetchDriverDeliveries: async (driverId, status = "pending") => {
    set({ loading: true, error: null })
    try {
      const response = await deliveriesService.getDriverDeliveries(driverId, status)

      if (response.data.success) {
        set({
          driverDeliveries: response.data.data.deliveries,
          loading: false,
        })
        return response.data.data.deliveries
      } else {
        throw new Error(response.data.message || "Error al cargar repartos")
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar repartos",
        loading: false,
      })
      throw error
    }
  },

  // Obtener reparto por ID
  fetchDeliveryById: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await deliveriesService.getDeliveryById(id)

      if (response.data.success) {
        set({
          currentDelivery: response.data.data,
          loading: false,
        })
        return response.data.data
      } else {
        throw new Error(response.data.message || "Error al cargar reparto")
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar reparto",
        loading: false,
      })
      throw error
    }
  },

  // Crear nuevo reparto
  createDelivery: async (deliveryData) => {
    set({ loading: true, error: null })
    try {
      const response = await deliveriesService.createDelivery(deliveryData)

      if (response.data.success) {
        const newDelivery = response.data.data
        set((state) => ({
          deliveries: [newDelivery, ...state.deliveries],
          currentDelivery: newDelivery,
          loading: false,
        }))
        return { success: true, delivery: newDelivery }
      } else {
        throw new Error(response.data.message || "Error al crear reparto")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error al crear reparto"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  // Actualizar estado del reparto (para móvil)
  updateDeliveryStatus: async (id, statusData) => {
    set({ loading: true, error: null })
    try {
      const response = await deliveriesService.updateDeliveryStatus(id, statusData)

      if (response.data.success) {
        const updatedDelivery = response.data.data

        // Actualizar en la lista de todos los repartos
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === id ? updatedDelivery : d)),
          driverDeliveries: state.driverDeliveries.map((d) => (d.id === id ? updatedDelivery : d)),
          currentDelivery: state.currentDelivery?.id === id ? updatedDelivery : state.currentDelivery,
          loading: false,
        }))

        return { success: true, delivery: updatedDelivery }
      } else {
        throw new Error(response.data.message || "Error al actualizar reparto")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error al actualizar reparto"
      set({
        error: errorMessage,
        loading: false,
      })
      throw new Error(errorMessage)
    }
  },

  // Obtener estadísticas
  fetchStats: async (period = "today", forceRefresh = false) => {
    const state = get()

    const now = Date.now()
    const cacheTime = 60 * 1000
    if (
      !forceRefresh &&
      state.lastFetchStats &&
      now - state.lastFetchStats < cacheTime &&
      state.stats.total_deliveries > 0
    ) {
      return state.stats
    }

    try {
      const response = await deliveriesService.getDeliveriesStats(period)

      if (response.data.success) {
        set({
          stats: response.data.data,
          lastFetchStats: now,
        })
        return response.data.data
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
    }
  },

  // Métodos de utilidad
  getDeliveryById: (id) => get().deliveries.find((d) => d.id === id),

  getDeliveriesByStatus: (status) => {
    return get().deliveries.filter((d) => d.status === status)
  },

  getDeliveriesByDriver: (driverId) => {
    return get().deliveries.filter((d) => d.driver_id === driverId)
  },
}))
