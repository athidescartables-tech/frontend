"use client"

import { useState, useEffect } from "react"
import { useCategoryStore } from "../stores/categoryStore"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import CategoryForm from "../components/categories/CategoryForm"
import CategoriesList from "../components/categories/CategoriesList"
import CategoryDetailModal from "../components/categories/CategoryDetailModal"
import { PlusIcon, MagnifyingGlassIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline"

const Categories = () => {
  const { fetchCategories, error } = useCategoryStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactive, setShowInactive] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        if (isMounted) {
          await fetchCategories({ active: showInactive ? "all" : "true" })
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, []) // Sin dependencias para evitar re-renders

  // Recargar cuando cambie el filtro de activas/inactivas
  useEffect(() => {
    fetchCategories({ active: showInactive ? "all" : "true" }, true)
  }, [showInactive, fetchCategories])

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setShowForm(true)
  }

  const handleView = (category) => {
    setSelectedCategory(category)
    setShowDetailModal(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedCategory(null)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedCategory(null)
  }

  const handleNewCategory = () => {
    setSelectedCategory(null)
    setShowForm(true)
  }

  const handleFormSave = () => {
    // Recargar categorías después de guardar
    fetchCategories({ active: showInactive ? "all" : "true" }, true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">Organiza tus productos en categorías para una mejor gestión</p>
        </div>
        <Button onClick={handleNewCategory}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Toggle para mostrar inactivas */}
            <Button
              variant="outline"
              onClick={() => setShowInactive(!showInactive)}
              className={showInactive ? "bg-gray-100" : ""}
            >
              {showInactive ? (
                <>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Ver Activas
                </>
              ) : (
                <>
                  <EyeSlashIcon className="h-4 w-4 mr-2" />
                  Ver Inactivas
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error global */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-red-600 text-sm">Error: {error}</div>
        </Card>
      )}

      {/* Lista de categorías */}
      <CategoriesList onEdit={handleEdit} onView={handleView} searchQuery={searchQuery} showInactive={showInactive} />

      {/* Modal de formulario */}
      {showForm && (
        <CategoryForm 
          category={selectedCategory} 
          onClose={handleCloseForm} 
          onSave={handleFormSave} 
        />
      )}

      {/* Modal de detalles */}
      {showDetailModal && <CategoryDetailModal category={selectedCategory} onClose={handleCloseDetailModal} />}
    </div>
  )
}

export default Categories
