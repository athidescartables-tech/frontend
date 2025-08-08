"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline"

const CustomerSearchAdvanced = ({ onSearch, onFiltersChange, searchQuery, filters }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

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
      debtorsOnly: false,
      sortBy: "",
      sortOrder: "desc",
      active: "all",
    })
    onSearch("")
  }

  const hasActiveFilters =
    filters.debtorsOnly ||
    filters.sortBy ||
    filters.active !== "all"

  const sortOptions = [
    { value: "", label: "Sin ordenar" },
    { value: "debt", label: "Por deuda" },
    { value: "name", label: "Por nombre" },
    { value: "created_at", label: "Por fecha de registro" },
    { value: "last_transaction", label: "Por última transacción" },
  ]

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
              placeholder="Buscar por nombre, email, documento o teléfono..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro solo deudores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cliente</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.debtorsOnly}
                      onChange={(e) => handleFilterChange("debtorsOnly", e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Solo deudores</span>
                  </label>
                </div>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange("active", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="true">Solo activos</option>
                  <option value="false">Solo inactivos</option>
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  disabled={!filters.sortBy}
                >
                  <option value="desc">Mayor a menor</option>
                  <option value="asc">Menor a mayor</option>
                </select>
              </div>
            </div>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.debtorsOnly && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Solo deudores
                    <button
                      onClick={() => handleFilterChange("debtorsOnly", false)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.active !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Estado: {filters.active === "true" ? "Activos" : "Inactivos"}
                    <button
                      onClick={() => handleFilterChange("active", "all")}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.sortBy && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Orden: {sortOptions.find(opt => opt.value === filters.sortBy)?.label} ({filters.sortOrder === "desc" ? "↓" : "↑"})
                    <button
                      onClick={() => handleFilterChange("sortBy", "")}
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

export default CustomerSearchAdvanced
