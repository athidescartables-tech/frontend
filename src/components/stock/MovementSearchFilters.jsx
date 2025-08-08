"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline"
import { STOCK_MOVEMENTS, STOCK_MOVEMENT_LABELS } from "../../lib/constants"

const MovementSearchFilters = ({ onSearch, onFiltersChange, searchQuery, filters, products }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearchChange = (e) => {
    const query = e.target.value
    onSearch(query)
  }

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value, page: 1 }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({
      type: "",
      dateRange: { start: "", end: "" },
      page: 1,
    })
    onSearch("")
  }

  const hasActiveFilters = filters.type || filters.dateRange?.start || filters.dateRange?.end

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
              placeholder="Buscar por nombre de producto o descripción..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por tipo de movimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value={STOCK_MOVEMENTS.ENTRADA}>{STOCK_MOVEMENT_LABELS[STOCK_MOVEMENTS.ENTRADA]}</option>
                  <option value={STOCK_MOVEMENTS.SALIDA}>{STOCK_MOVEMENT_LABELS[STOCK_MOVEMENTS.SALIDA]}</option>
                  <option value={STOCK_MOVEMENTS.AJUSTE}>{STOCK_MOVEMENT_LABELS[STOCK_MOVEMENTS.AJUSTE]}</option>
                </select>
              </div>

              {/* Filtro por rango de fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rango de fechas</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.dateRange?.start || ""}
                    onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, start: e.target.value })}
                    className="block w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange?.end || ""}
                    onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, end: e.target.value })}
                    className="block w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Tipo: {STOCK_MOVEMENT_LABELS[filters.type]}
                    <button
                      onClick={() => handleFilterChange("type", "")}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.dateRange?.start || filters.dateRange?.end) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Fechas: {filters.dateRange.start || "..."} - {filters.dateRange.end || "..."}
                    <button
                      onClick={() => handleFilterChange("dateRange", { start: "", end: "" })}
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

export default MovementSearchFilters
