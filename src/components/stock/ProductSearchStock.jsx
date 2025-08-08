"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline"
import { useCategoryStore } from "@/stores/categoryStore"

const ProductSearchStock = ({ onSearch, onFiltersChange, searchQuery, filters }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const { categories } = useCategoryStore()

  const handleSearchChange = (e) => {
    const query = e.target.value
    onSearch(query)
  }

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      stockRange: { min: "", max: "" },
      priceRange: { min: "", max: "" },
    })
    onSearch("")
  }

  const hasActiveFilters =
    filters.category ||
    filters.stockRange?.min ||
    filters.stockRange?.max ||
    filters.priceRange?.min ||
    filters.priceRange?.max

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        {/* Búsqueda principal */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre, descripción o código de barras..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Botón de filtros avanzados */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? "border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                •
              </span>
            )}
          </button>

          {/* Botón limpiar filtros */}
          {(searchQuery || hasActiveFilters) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros avanzados */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ACTUALIZADO: Filtro por rango de stock personalizable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rango de stock</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.stockRange?.min || ""}
                    onChange={(e) => handleFilterChange("stockRange", { ...filters.stockRange, min: e.target.value })}
                    className="block w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.001"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.stockRange?.max || ""}
                    onChange={(e) => handleFilterChange("stockRange", { ...filters.stockRange, max: e.target.value })}
                    className="block w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.001"
                  />
                </div>
              </div>

              {/* Filtro por rango de precios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rango de precios</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ""}
                    onChange={(e) => handleFilterChange("priceRange", { ...filters.priceRange, min: e.target.value })}
                    className="block w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.max || ""}
                    onChange={(e) => handleFilterChange("priceRange", { ...filters.priceRange, max: e.target.value })}
                    className="block w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Categoría: {categories.find((c) => c.id === Number.parseInt(filters.category))?.name}
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.stockRange?.min || filters.stockRange?.max) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Stock: {filters.stockRange.min || "0"} - {filters.stockRange.max || "∞"}
                    <button
                      onClick={() => handleFilterChange("stockRange", { min: "", max: "" })}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.priceRange?.min || filters.priceRange?.max) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Precio: ${filters.priceRange.min || "0"} - ${filters.priceRange.max || "∞"}
                    <button
                      onClick={() => handleFilterChange("priceRange", { min: "", max: "" })}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSearchStock
