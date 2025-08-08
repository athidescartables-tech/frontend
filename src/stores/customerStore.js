import { create } from "zustand"
import { devtools } from "zustand/middleware"
import customersService from "../services/customersService"

const useCustomerStore = create(
devtools(
  (set, get) => ({
    // Estado
    customers: [],
    currentCustomer: null,
    customerTransactions: [],
    customerBalances: {}, // Cache de saldos de clientes
    stats: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
    
    // NUEVO: Control de requests
    lastFetch: null,
    lastFetchParams: null,
    isInitialized: false,

    // Acciones
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // CORREGIDO: Obtener clientes con cache y debounce
    fetchCustomers: async (params = {}, forceRefresh = false) => {
      const state = get()
      
      // Evitar múltiples llamadas simultáneas
      if (state.loading && !forceRefresh) {
        console.log("⏳ fetchCustomers ya en progreso, omitiendo...")
        return { data: state.customers }
      }

      // Cache simple basado en tiempo
      const now = Date.now()
      const cacheTime = 30000 // 30 segundos para permitir búsquedas
      const paramsKey = JSON.stringify(params)
      
      if (
        !forceRefresh &&
        state.lastFetch &&
        now - state.lastFetch < cacheTime &&
        state.lastFetchParams === paramsKey &&
        state.customers.length > 0
      ) {
        console.log("📦 Usando cache de customers")
        return { data: state.customers }
      }

      set({ loading: true, error: null })
      try {
        console.log("🚀 Fetching customers con parámetros:", params)
        const response = await customersService.getCustomers(params)
        
        console.log("✅ Customers obtenidos:", {
          count: response.data.length,
          total: response.pagination?.total
        })

        set({
          customers: response.data,
          pagination: response.pagination,
          loading: false,
          lastFetch: now,
          lastFetchParams: paramsKey,
          isInitialized: true,
        })
        return response
      } catch (error) {
        console.error("❌ Error en fetchCustomers:", error)
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // NUEVO: Inicializar store solo una vez
    initializeStore: async () => {
      const state = get()
      if (state.isInitialized && state.customers.length > 0) {
        return
      }
      
      try {
        await get().fetchCustomers({ active: "true" }, true) // Force refresh
      } catch (error) {
        console.error("Error inicializando customer store:", error)
      }
    },

    // CORREGIDO: Buscar clientes (función sincrónica para filtrado local)
    searchCustomers: (searchTerm) => {
      const { customers } = get()
      if (!searchTerm.trim()) {
        return customers.filter(c => c.active) // Solo clientes activos
      }

      const term = searchTerm.toLowerCase()
      return customers.filter(
        (customer) =>
          customer.active && ( // Solo buscar en clientes activos
            customer.name.toLowerCase().includes(term) ||
            (customer.email && customer.email.toLowerCase().includes(term)) ||
            (customer.document_number && customer.document_number.includes(term)) ||
            (customer.phone && customer.phone.includes(term))
          )
      )
    },

    // CORREGIDO: Obtener cliente por ID con cache
    fetchCustomerById: async (id, forceRefresh = false) => {
      const state = get()
      
      // Verificar si ya tenemos el cliente en la lista
      if (!forceRefresh) {
        const existingCustomer = state.customers.find(c => c.id === parseInt(id))
        if (existingCustomer) {
          set({ currentCustomer: existingCustomer })
          return { data: existingCustomer }
        }
      }

      set({ loading: true, error: null })
      try {
        const response = await customersService.getCustomerById(id)
        set({
          currentCustomer: response.data,
          loading: false,
        })
        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // CORREGIDO: Obtener saldo de un cliente con cache mejorado
    fetchCustomerBalance: async (id, forceRefresh = false) => {
      const state = get()
      
      // Cache de saldos con tiempo de vida
      const cacheKey = `balance_${id}`
      const cached = state.customerBalances[cacheKey]
      const now = Date.now()
      const cacheTime = 30000 // 30 segundos para saldos
      
      if (!forceRefresh && cached && now - cached.timestamp < cacheTime) {
        console.log(`📦 Usando cache de saldo para cliente ${id}`)
        return cached.data
      }

      try {
        const response = await customersService.getCustomerBalance(id)

        // Actualizar cache de saldos con timestamp
        set((state) => ({
          customerBalances: {
            ...state.customerBalances,
            [cacheKey]: {
              data: response.data,
              timestamp: now
            },
          },
        }))

        return response.data
      } catch (error) {
        console.error("Error obteniendo saldo del cliente:", error)
        throw error
      }
    },

    // CORREGIDO: Obtener saldo desde cache o hacer fetch
    getCustomerBalance: async (id, forceRefresh = false) => {
      const { customerBalances, fetchCustomerBalance } = get()
      const cacheKey = `balance_${id}`
      const cached = customerBalances[cacheKey]
      const now = Date.now()
      const cacheTime = 30000 // 30 segundos

      // Si ya tenemos el saldo en cache y no está expirado, devolverlo
      if (!forceRefresh && cached && now - cached.timestamp < cacheTime) {
        return cached.data
      }

      // Si no, hacer fetch
      return await fetchCustomerBalance(id, forceRefresh)
    },

    // Crear cliente
    createCustomer: async (customerData) => {
      set({ loading: true, error: null })
      try {
        const response = await customersService.createCustomer(customerData)

        // Agregar el nuevo cliente a la lista
        set((state) => ({
          customers: [response.data, ...state.customers],
          loading: false,
        }))

        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // Actualizar cliente
    updateCustomer: async (id, customerData) => {
      set({ loading: true, error: null })
      try {
        const response = await customersService.updateCustomer(id, customerData)

        // Actualizar cliente en la lista
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === Number.parseInt(id) ? { ...customer, ...customerData } : customer,
          ),
          currentCustomer:
            state.currentCustomer?.id === Number.parseInt(id)
              ? { ...state.currentCustomer, ...customerData }
              : state.currentCustomer,
          loading: false,
        }))

        // Limpiar cache de saldo para este cliente
        set((state) => {
          const newBalances = { ...state.customerBalances }
          delete newBalances[`balance_${id}`]
          return { customerBalances: newBalances }
        })

        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // Eliminar cliente
    deleteCustomer: async (id) => {
      set({ loading: true, error: null })
      try {
        const response = await customersService.deleteCustomer(id)

        // Remover cliente de la lista
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== Number.parseInt(id)),
          currentCustomer: state.currentCustomer?.id === Number.parseInt(id) ? null : state.currentCustomer,
          loading: false,
        }))

        // Limpiar cache de saldo para este cliente
        set((state) => {
          const newBalances = { ...state.customerBalances }
          delete newBalances[`balance_${id}`]
          return { customerBalances: newBalances }
        })

        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // Obtener transacciones de un cliente
    fetchCustomerTransactions: async (customerId, params = {}) => {
      set({ loading: true, error: null })
      try {
        const response = await customersService.getCustomerTransactions(customerId, params)
        set({
          customerTransactions: response.data.transactions,
          currentCustomer: response.data.customer,
          loading: false,
        })
        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // ACTUALIZADO: Crear transacción de cuenta corriente con método de pago específico
    createAccountTransaction: async (transactionData) => {
      set({ loading: true, error: null })
      try {
        const response = await customersService.createAccountTransaction(transactionData)

        // Actualizar transacciones si estamos viendo las de este cliente
        const { currentCustomer } = get()
        if (currentCustomer && currentCustomer.id === transactionData.customer_id) {
          // Recargar transacciones del cliente actual
          await get().fetchCustomerTransactions(transactionData.customer_id)
        }

        // Actualizar saldo del cliente en la lista
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === transactionData.customer_id
              ? { ...customer, current_balance: response.data.new_balance }
              : customer,
          ),
          loading: false,
        }))

        // Limpiar cache de saldo para este cliente para forzar actualización
        set((state) => {
          const newBalances = { ...state.customerBalances }
          delete newBalances[`balance_${transactionData.customer_id}`]
          return { customerBalances: newBalances }
        })

        // ACTUALIZADO: Si es un pago y se registró en caja, actualizar estado de caja
        if (transactionData.type === "pago" && response.data.registered_in_cash) {
          // Importar dinámicamente para evitar dependencias circulares
          const { useCashStore } = await import("./cashStore")
          const cashStore = useCashStore.getState()
          await cashStore.fetchCurrentStatus()
          console.log(`✅ Estado de caja actualizado después del pago (${response.data.payment_method})`)
        }

        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // Obtener estadísticas
    fetchStats: async () => {
      set({ loading: true, error: null })
      try {
        const response = await customersService.getStats()
        set({
          stats: response.data,
          loading: false,
        })
        return response
      } catch (error) {
        set({ error: error.response?.data?.message || error.message, loading: false })
        throw error
      }
    },

    // Limpiar datos
    clearCurrentCustomer: () => set({ currentCustomer: null }),
    clearCustomerTransactions: () => set({ customerTransactions: [] }),
    clearStats: () => set({ stats: null }),
    clearCustomerBalances: () => set({ customerBalances: {} }),

    // NUEVO: Limpiar cache específico
    clearCustomerCache: (customerId) => {
      set((state) => {
        const newBalances = { ...state.customerBalances }
        delete newBalances[`balance_${customerId}`]
        return { customerBalances: newBalances }
      })
    },

    // Resetear store
    reset: () =>
      set({
        customers: [],
        currentCustomer: null,
        customerTransactions: [],
        customerBalances: {},
        stats: null,
        loading: false,
        error: null,
        pagination: {
          total: 0,
          limit: 50,
          offset: 0,
          hasMore: false,
        },
        lastFetch: null,
        lastFetchParams: null,
        isInitialized: false,
      }),
  }),
  {
    name: "customer-store",
  },
),
)

export { useCustomerStore }
