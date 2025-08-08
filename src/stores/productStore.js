import { create } from "zustand"
import { productsService } from "../services/productsService"

export const useProductStore = create((set, get) => ({
  products: [],
  topSellingProducts: [], // NUEVO: Productos más vendidos
  loading: false,
  error: null,
  lastFetch: null,
  lastFetchTopSelling: null, // NUEVO: Cache para productos más vendidos
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  },

  // Acciones
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // NUEVO: Obtener productos más vendidos con cache optimizado
  fetchTopSellingProducts: async (limit = 10, forceRefresh = false) => {
    const state = get()

    if (state.loading && !forceRefresh) {
      return state.topSellingProducts
    }

    // Cache más agresivo para productos top (solo 10 segundos para actualizarse rápido)
    const now = Date.now()
    const cacheTime = 10 * 1000 // 10 segundos

    if (
      !forceRefresh &&
      state.lastFetchTopSelling &&
      now - state.lastFetchTopSelling < cacheTime &&
      state.topSellingProducts.length > 0
    ) {
      return state.topSellingProducts
    }

    set({ loading: true, error: null })
    try {
      const response = await productsService.getTopSellingProducts(limit)
      const topProducts = response.data.data.products || []

      set({
        topSellingProducts: topProducts,
        loading: false,
        lastFetchTopSelling: now,
      })
      return topProducts
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar productos más vendidos",
        loading: false,
      })
      throw error
    }
  },

  // Obtener productos con paginación (mantener funcionalidad original)
  fetchProducts: async (params = {}, forceRefresh = false) => {
    const state = get()

    if (state.loading && !forceRefresh) {
      return state.products
    }

    // Cache inteligente: solo usar cache si los parámetros son iguales
    const now = Date.now()
    const cacheTime = 30 * 1000 // 30 segundos
    const paramsKey = JSON.stringify(params)

    if (
      !forceRefresh &&
      state.lastFetch &&
      now - state.lastFetch < cacheTime &&
      state.lastParamsKey === paramsKey &&
      state.products.length > 0
    ) {
      return state.products
    }

    set({ loading: true, error: null })
    try {
      const response = await productsService.getProducts(params)
      set({
        products: response.data.data.products,
        pagination: response.data.data.pagination,
        loading: false,
        lastFetch: now,
        lastParamsKey: paramsKey,
      })
      return response.data.data.products
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar productos",
        loading: false,
      })
      throw error
    }
  },

  // Obtener producto por ID
  fetchProductById: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await productsService.getProductById(id)
      set({ loading: false })
      return response.data.data
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al cargar producto",
        loading: false,
      })
      throw error
    }
  },

  // Crear producto
  createProduct: async (productData) => {
    set({ loading: true, error: null })
    try {
      const response = await productsService.createProduct(productData)
      set({ loading: false })
      // Limpiar cache de productos top al crear un producto
      set({ lastFetchTopSelling: null })
      return response.data.data
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al crear producto",
        loading: false,
      })
      throw error
    }
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    set({ loading: true, error: null })
    try {
      const response = await productsService.updateProduct(id, productData)

      // Actualizar producto en ambas listas si está presente
      set((state) => ({
        products: state.products.map((product) => (product.id === id ? response.data.data : product)),
        topSellingProducts: state.topSellingProducts.map((product) => (product.id === id ? response.data.data : product)),
        loading: false,
        // Limpiar cache para refrescar
        lastFetchTopSelling: null,
      }))

      return response.data.data
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al actualizar producto",
        loading: false,
      })
      throw error
    }
  },

  // Actualizar stock local (ACTUALIZADO para manejar ambas listas)
  updateStock: (productId, newStock) => {
    set((state) => ({
      products: state.products.map((product) => (product.id === productId ? { ...product, stock: newStock } : product)),
      topSellingProducts: state.topSellingProducts.map((product) => 
        product.id === productId ? { ...product, stock: newStock } : product
      ),
    }))
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await productsService.deleteProduct(id)

      set((state) => ({
        products: state.products.map((product) => (product.id === id ? { ...product, active: false } : product)),
        topSellingProducts: state.topSellingProducts.filter((product) => product.id !== id),
        loading: false,
        lastFetchTopSelling: null,
      }))
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || "Error al eliminar producto",
        loading: false,
      })
      throw error
    }
  },

  // ACTUALIZADO: Métodos de utilidad para usar productos top selling en ventas
  getTopSellingProducts: () => get().topSellingProducts,
  getProducts: () => get().products.filter((p) => p.active),
  getAllProducts: () => get().products,
  getProductById: (id) => {
    // Buscar primero en productos top, luego en todos los productos
    const topProduct = get().topSellingProducts.find((p) => p.id === id)
    if (topProduct) return topProduct
    return get().products.find((p) => p.id === id)
  },
  getProductByBarcode: (barcode) => {
    // Buscar primero en productos top, luego en todos los productos
    const topProduct = get().topSellingProducts.find((p) => p.barcode === barcode)
    if (topProduct) return topProduct
    return get().products.find((p) => p.barcode === barcode)
  },

  getProductsByCategory: (categoryId) => {
    // Para ventas, usar productos top selling filtrados por categoría
    const topProducts = get().topSellingProducts.filter((product) => product.category_id === categoryId && product.active)
    if (topProducts.length > 0) return topProducts
    
    // Fallback a todos los productos
    return get().products.filter((product) => product.category_id === categoryId && product.active)
  },

  // ACTUALIZADO: Búsqueda que priorice productos top selling
  searchProducts: (query) => {
    if (!query) return get().topSellingProducts.length > 0 ? get().topSellingProducts : get().products

    const topProducts = get().topSellingProducts
    const allProducts = get().products
    
    // Buscar en productos top selling primero
    if (topProducts.length > 0) {
      const topResults = topProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()) ||
          product.barcode?.includes(query),
      )
      if (topResults.length > 0) return topResults
    }

    // Si no hay resultados en top selling, buscar en todos
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode?.includes(query),
    )
  },

  // Limpiar errores
  clearError: () => set({ error: null }),

  // ACTUALIZADO: Resetear estado incluyendo productos top
  reset: () =>
    set({
      products: [],
      topSellingProducts: [],
      loading: false,
      error: null,
      lastFetch: null,
      lastFetchTopSelling: null,
      lastParamsKey: null,
      pagination: {
        page: 1,
        limit: 25,
        total: 0,
        pages: 0,
      },
    }),
}))
