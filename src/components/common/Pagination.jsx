"use client"

import { useMemo } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline"

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  showItemsPerPage = true,
  showPageInfo = true,
  showJumpButtons = true,
  className = "",
}) => {
  const pageNumbers = useMemo(() => {
    const delta = 2 // Número de páginas a mostrar a cada lado de la página actual
    const range = []
    const rangeWithDots = []

    // Calcular el rango de páginas a mostrar
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    // Agregar primera página y puntos suspensivos si es necesario
    if (start > 1) {
      rangeWithDots.push(1)
      if (start > 2) {
        rangeWithDots.push("...")
      }
    }

    // Agregar rango principal
    rangeWithDots.push(...range)

    // Agregar puntos suspensivos y última página si es necesario
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push("...")
      }
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }, [currentPage, totalPages])

  const itemsPerPageOptions = [10, 25, 50, 100]

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || loading) return
    onPageChange(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (onItemsPerPageChange && newItemsPerPage !== itemsPerPage) {
      // Calcular la nueva página para mantener aproximadamente la misma posición
      const currentFirstItem = (currentPage - 1) * itemsPerPage + 1
      const newPage = Math.max(1, Math.ceil(currentFirstItem / newItemsPerPage))
      onItemsPerPageChange(newItemsPerPage, newPage)
    }
  }

  if (totalPages <= 1) return null

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-200 ${className}`}
    >
      {/* Información de elementos */}
      {showPageInfo && (
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Mostrando <span className="font-medium">{startItem.toLocaleString()}</span> a{" "}
            <span className="font-medium">{endItem.toLocaleString()}</span> de{" "}
            <span className="font-medium">{totalItems.toLocaleString()}</span> resultados
          </span>
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Selector de elementos por página */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center text-sm text-gray-700">
            <label htmlFor="itemsPerPage" className="mr-2 whitespace-nowrap">
              Mostrar:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number.parseInt(e.target.value))}
              disabled={loading}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navegación de páginas */}
        <div className="flex items-center space-x-1">
          {/* Botón primera página */}
          {showJumpButtons && (
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Primera página"
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </button>
          )}

          {/* Botón página anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página anterior"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {/* Números de página */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <span key={`dots-${index}`} className="px-3 py-2 text-sm text-gray-500">
                    ...
                  </span>
                )
              }

              const isActive = pageNumber === currentPage

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed ${
                    isActive
                      ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>

          {/* Botón página siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página siguiente"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>

          {/* Botón última página */}
          {showJumpButtons && (
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pagination
