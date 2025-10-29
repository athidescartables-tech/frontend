"use client"

import { useState } from "react"
import { useCategoryStore } from "../../stores/categoryStore"
import { useToast } from "../../hooks/useToast"
import Card from "../common/Card"
import { PencilIcon, TrashIcon, EyeIcon, ArrowPathIcon, TagIcon } from "@heroicons/react/24/outline"

const CategoriesList = ({ onEdit, onView, searchQuery, showInactive = false }) => {
  const { categories, deleteCategory, restoreCategory, loading } = useCategoryStore()
  const { showToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [restoringId, setRestoringId] = useState(null)

  // Filtrar categorías
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      !searchQuery ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = showInactive ? !category.active : category.active

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (category) => {
    const confirmMessage = `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?\n\nNota: Si tiene productos asociados, solo se marcará como inactiva. Si no tiene productos, se eliminará permanentemente.`

    if (window.confirm(confirmMessage)) {
      setDeletingId(category.id)

      try {
        const result = await deleteCategory(category.id)

        if (result.deleted) {
          showToast("Categoría eliminada permanentemente", "success")
        } else {
          showToast(result.message || "Categoría marcada como inactiva", "success")
        }
      } catch (error) {
        console.error("Error deleting category:", error)
        showToast(error.message || "Error al eliminar la categoría", "error")
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleRestore = async (category) => {
    setRestoringId(category.id)

    try {
      await restoreCategory(category.id)
      showToast("Categoría restaurada correctamente", "success")
    } catch (error) {
      console.error("Error restoring category:", error)
      showToast(error.message || "Error al restaurar la categoría", "error")
    } finally {
      setRestoringId(null)
    }
  }

  if (loading && categories.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="flex space-x-1">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredCategories.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-500">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {showInactive ? "No hay categorías inactivas" : "No hay categorías"}
          </h3>
          <p>
            {searchQuery
              ? "No se encontraron categorías que coincidan con tu búsqueda."
              : showInactive
                ? "Todas las categorías están activas."
                : "Comienza creando tu primera categoría."}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredCategories.map((category) => {
        const isDeleting = deletingId === category.id
        const isRestoring = restoringId === category.id

        return (
          <div
            key={category.id}
            className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="p-4">
              {/* Contenido principal */}
              <div className="flex flex-col items-center text-center space-y-3">
                {/* Icono con color */}
                <div className="relative">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full text-xl shadow-sm transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: category.color + "20",
                      color: category.color,
                    }}
                  >
                    {category.icon}
                  </div>
                  {!category.active && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Información */}
                <div className="space-y-1 min-h-[3rem] flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1" title={category.name}>
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 line-clamp-2" title={category.description}>
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Estado */}
                {!category.active && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactiva
                  </span>
                )}
              </div>

              {/* Acciones - Solo visibles en hover */}
              <div className="mt-4 flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onView && onView(category)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>

                {category.active ? (
                  <>
                    <button
                      onClick={() => onEdit && onEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar categoría"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={isDeleting}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar categoría"
                    >
                      {isDeleting ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(category)}
                    disabled={isRestoring}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Restaurar categoría"
                  >
                    {isRestoring ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CategoriesList
