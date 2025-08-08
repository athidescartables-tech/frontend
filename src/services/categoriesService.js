import api from "@/config/api"

export const categoriesService = {
  // Obtener todas las categorías
  async getCategories(params = {}) {
    return api.get("/categories", { params })
  },

  // Obtener categoría por ID
  async getCategoryById(id) {
    return api.get(`/categories/${id}`)
  },

  // Crear categoría
  async createCategory(categoryData) {
    return api.post("/categories", categoryData)
  },

  // Actualizar categoría
  async updateCategory(id, categoryData) {
    return api.put(`/categories/${id}`, categoryData)
  },

  // Eliminar categoría
  async deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  },

  // Restaurar categoría
  async restoreCategory(id) {
    return api.patch(`/categories/${id}/restore`)
  },

  // Obtener estadísticas de categorías
  async getCategoryStats() {
    return api.get("/categories/stats")
  },
}
