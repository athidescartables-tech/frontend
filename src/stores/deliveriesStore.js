import { create } from "zustand"
import { deliveriesService } from "../services/deliveriesService"
import { useProductStore } from "./productStore"
import { useAuthStore } from "./authStore"
import { PAYMENT_METHODS } from "@/lib/constants"
import { validateQuantity } from "@/lib/formatters"

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

  cart: [],
  cartTotal: 0,
  customer: null,
  driver: null,
  paymentMethod: PAYMENT_METHODS.EFECTIVO,
  notes: "",

  // Estado de UI
  showPaymentModal: false,
  showQuantityModal: false,
  selectedProduct: null,

  setShowQuantityModal: (show) => set({ showQuantityModal: show }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setShowPaymentModal: (show) => set({ showPaymentModal: show }),
  setCustomer: (customer) => set({ customer }),
  setDriver: (driver) => {
    set({ driver })
  },
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNotes: (notes) => set({ notes }),

  openQuantityModal: (product) => {
    set({
      selectedProduct: product,
      showQuantityModal: true,
    })
  },

  addToCart: (product, quantity, itemTotalPrice, priceLevel = 1) => {
    set((state) => {
      if (quantity > product.stock) {
        console.warn(`Stock insuficiente para ${product.name}`)
        return state
      }

      if (!validateQuantity(quantity, product.unit_type)) {
        console.warn(`Cantidad inválida para producto ${product.name}: ${quantity}`)
        return state
      }

      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === product.id && item.price_level === priceLevel,
      )

      let newCart
      const itemToAddOrUpdate = {
        ...product,
        quantity: quantity,
        totalPrice: itemTotalPrice,
        unit_type: product.unit_type || "unidades",
        price_level: priceLevel,
        unit_price:
          priceLevel === 1 ? product.price_level_1 : priceLevel === 2 ? product.price_level_2 : product.price_level_3,
      }

      if (existingItemIndex !== -1) {
        newCart = state.cart.map((item, index) => (index === existingItemIndex ? itemToAddOrUpdate : item))
      } else {
        newCart = [...state.cart, itemToAddOrUpdate]
      }

      const cartTotal = newCart.reduce((sum, item) => sum + item.totalPrice, 0)

      return {
        cart: newCart,
        cartTotal,
      }
    })
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.id !== productId)
      const cartTotal = newCart.reduce((sum, item) => sum + item.totalPrice, 0)

      return {
        cart: newCart,
        cartTotal,
      }
    })
  },

  updateCartItemQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }

    set((state) => {
      const item = state.cart.find((item) => item.id === productId)
      if (!item) return state

      let validatedQuantity = quantity
      if (item.unit_type === "kg") {
        validatedQuantity = Math.round(quantity * 100) / 100
      }

      if (!validateQuantity(validatedQuantity, item.unit_type)) {
        console.warn(`Cantidad inválida para producto ${item.name}: ${validatedQuantity}`)
        return state
      }

      if (validatedQuantity > item.stock) {
        console.warn(`Stock insuficiente para ${item.name}`)
        return state
      }

      const newCart = state.cart.map((cartItem) =>
        cartItem.id === productId
          ? {
              ...cartItem,
              quantity: validatedQuantity,
              totalPrice: validatedQuantity * cartItem.unit_price,
            }
          : cartItem,
      )
      const cartTotal = newCart.reduce((sum, item) => sum + item.totalPrice, 0)

      return {
        cart: newCart,
        cartTotal,
      }
    })
  },

  clearCart: () => {
    set({
      cart: [],
      cartTotal: 0,
      customer: null,
      driver: null,
      paymentMethod: PAYMENT_METHODS.EFECTIVO,
      notes: "",
    })
  },

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

  createDelivery: async (paymentData) => {
    const state = get()

    if (state.cart.length === 0) {
      throw new Error("El carrito está vacío")
    }

    if (!state.customer) {
      throw new Error("Debe seleccionar un cliente")
    }

    const authState = useAuthStore.getState()
    const authenticatedDriver = authState.user

    if (!authenticatedDriver || !authenticatedDriver.id) {
      throw new Error("Error: No hay usuario autenticado")
    }

    set({ loading: true, error: null })
    try {
      const deliveryData = {
        customer_id: state.customer.id,
        driver_id: authenticatedDriver.id,
        items: state.cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.totalPrice,
          unit_type: item.unit_type,
          price_level: item.price_level,
        })),
        total: state.cartTotal,
        payment_method: state.paymentMethod,
        payment_data: paymentData,
        notes: state.notes || null,
      }

      const response = await deliveriesService.createDelivery(deliveryData)

      if (response.data.success) {
        const newDelivery = response.data.data

        // Actualizar stock local de productos
        const productStore = useProductStore.getState()
        state.cart.forEach((item) => {
          const product = productStore.getProductById(item.id)
          if (product) {
            productStore.updateStock(item.id, product.stock - item.quantity)
          }
        })

        set((state) => ({
          deliveries: [newDelivery, ...state.deliveries],
          currentDelivery: newDelivery,
          loading: false,
        }))

        get().clearCart()

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

  getCartStats: () => {
    const state = get()
    return {
      itemsCount: state.cart.length,
      totalItems: state.cart.reduce((sum, item) => sum + item.quantity, 0),
      total: state.cartTotal,
    }
  },
}))
