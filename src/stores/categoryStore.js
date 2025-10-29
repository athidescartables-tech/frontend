import { create } from "zustand"
import { categoriesService } from "../services/categoriesService"

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  lastFetch: null,
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    top_categories: [],
  },
  lastFetchStats: null,

  // Acciones
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Obtener categorías con caching
  fetchCategories: async (params = {}, forceRefresh = false) => {
    const state = get()

    // Evitar llamadas duplicadas si ya se está cargando
    if (state.loading && !forceRefresh) {
      return state.categories
    }

    // Cache por 60 segundos para categorías (cambian menos frecuentemente)
    const now = Date.now()
    const cacheTime = 60 * 1000 // 60 segundos
    if (!forceRefresh && state.lastFetch && now - state.lastFetch < cacheTime && state.categories.length > 0) {
      return state.categories
    }

    set({ loading: true, error: null })
    try {
      const response = await categoriesService.getCategories(params)
      set({
        categories: response.data.data,
        loading: false,
        lastFetch: now,
      })
      return response.data.data
    } catch (error) {
      set({
        error: error.message || "Error al cargar categorías",
        loading: false,
      })
      throw error
    }
  },

  // Obtener estadísticas con caching
  fetchStats: async (forceRefresh = false) => {
    const state = get()

    // Cache por 60 segundos para estadísticas
    const now = Date.now()
    const cacheTime = 60 * 1000
    if (!forceRefresh && state.lastFetchStats && now - state.lastFetchStats < cacheTime && state.stats.total > 0) {
      return state.stats
    }

    try {
      const response = await categoriesService.getCategoryStats()
      const statsData = response.data.data

      set({
        stats: {
          total: statsData.general?.total_categories || 0,
          active: statsData.general?.active_categories || 0,
          inactive: statsData.general?.inactive_categories || 0,
          top_categories: statsData.top_categories || [],
        },
        lastFetchStats: now,
      })
      return get().stats
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      set({
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          top_categories: [],
        },
      })
    }
  },

  // Crear categoría
  createCategory: async (categoryData) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesService.createCategory(categoryData)

      // Agregar la nueva categoría al estado local
      set((state) => ({
        categories: [response.data.data, ...state.categories],
        loading: false,
      }))

      return response.data.data
    } catch (error) {
      set({
        error: error.message || "Error al crear categoría",
        loading: false,
      })
      throw error
    }
  },

  // Actualizar categoría
  updateCategory: async (id, categoryData) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesService.updateCategory(id, categoryData)

      // Actualizar la categoría en el estado local
      set((state) => ({
        categories: state.categories.map((category) => (category.id === id ? response.data.data : category)),
        loading: false,
      }))

      return response.data.data
    } catch (error) {
      set({
        error: error.message || "Error al actualizar categoría",
        loading: false,
      })
      throw error
    }
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesService.deleteCategory(id)

      const wasDeleted = response.data.deleted

      if (wasDeleted) {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          loading: false,
        }))
      } else {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, active: false } : category,
          ),
          loading: false,
        }))
      }

      return response.data
    } catch (error) {
      set({
        error: error.message || "Error al eliminar categoría",
        loading: false,
      })
      throw error
    }
  },

  // Restaurar categoría
  restoreCategory: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesService.restoreCategory(id)

      // Actualizar la categoría en el estado local
      set((state) => ({
        categories: state.categories.map((category) => (category.id === id ? response.data.data : category)),
        loading: false,
      }))

      return response.data.data
    } catch (error) {
      set({
        error: error.message || "Error al restaurar categoría",
        loading: false,
      })
      throw error
    }
  },

  // Métodos de utilidad
  getActiveCategories: () => get().categories.filter((c) => c.active),

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  // Limpiar errores
  clearError: () => set({ error: null }),
}))
