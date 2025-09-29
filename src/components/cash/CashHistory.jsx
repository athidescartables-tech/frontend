"use client"

import { useState, useEffect, useCallback } from "react"
import { useCashStore } from "@/stores/cashStore"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import Button from "@/components/common/Button"
import CashSessionDetails from "./CashSessionDetails"
import {
  ClockIcon,
  EyeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const CashHistory = () => {
  const { cashHistory, historyPagination, fetchHistory, loading, error } = useCashStore()
  const [selectedSession, setSelectedSession] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  })

  // CORREGIDO: Usar useCallback para evitar recreación de función
  const loadInitialHistory = useCallback(async () => {
    if (!hasInitialized && !loading) {
      console.log("🚀 Cargando historial inicial...")
      setHasInitialized(true)
      try {
        await fetchHistory()
      } catch (error) {
        console.error("❌ Error loading initial history:", error)
      }
    }
  }, [hasInitialized, loading, fetchHistory])

  // CORREGIDO: useEffect más simple y controlado
  useEffect(() => {
    loadInitialHistory()
  }, [loadInitialHistory])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = async () => {
    if (!loading) {
      console.log("🔍 Buscando con filtros:", filters)
      try {
        await fetchHistory(filters)
      } catch (error) {
        console.error("❌ Error en búsqueda:", error)
      }
    }
  }

  const handleClearFilters = async () => {
    if (!loading) {
      console.log("🧹 Limpiando filtros")
      setFilters({ start_date: "", end_date: "" })
      try {
        await fetchHistory()
      } catch (error) {
        console.error("❌ Error al limpiar filtros:", error)
      }
    }
  }

  const handlePageChange = async (page) => {
    if (!loading && page !== historyPagination.page) {
      console.log("📄 Cambiando a página:", page)
      try {
        await fetchHistory({ ...filters, page, limit: historyPagination.limit })
      } catch (error) {
        console.error("❌ Error al cambiar página:", error)
      }
    }
  }

  const handleViewDetails = (session) => {
    console.log("👁️ Viendo detalles de sesión:", session.id)
    setSelectedSession(session)
    setShowDetails(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "closed":
        return "bg-green-100 text-green-800"
      case "open":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifferenceColor = (difference) => {
    if (difference === 0) return "text-green-600"
    if (difference > 0) return "text-blue-600"
    return "text-red-600"
  }

  // Mostrar error si existe
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
              Historial de Caja
            </h2>
            <p className="text-sm text-gray-600 mt-1">Registro de todos los cierres de caja anteriores</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error al cargar el historial</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <Button onClick={() => fetchHistory()} className="mt-3 bg-red-600 hover:bg-red-700" disabled={loading}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
            Historial de Caja
          </h2>
          <p className="text-sm text-gray-600 mt-1">Registro de todos los cierres de caja anteriores</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSearch} disabled={loading}>
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de historial */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
            <span className="text-gray-600">Cargando historial...</span>
          </div>
        ) : cashHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg font-medium">No hay cierres de caja registrados</p>
            <p className="text-sm">Los cierres aparecerán aquí cuando se realicen</p>
            {hasInitialized && (
              <Button onClick={() => fetchHistory()} variant="outline" className="mt-4" disabled={loading}>
                Actualizar
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apertura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cierre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diferencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashHistory.map((session) => {
                    const openingDate = new Date(session.opening_date)
                    const closingDate = new Date(session.closing_date)
                    const durationInHours = (closingDate - openingDate) / (1000 * 60 * 60)
                    const duration = Math.round(durationInHours * 100) / 100 // Round to 2 decimal places

                    return (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(session.opening_date)}
                            </div>
                            <div className="text-sm text-gray-500">a {formatDateTime(session.closing_date)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {duration >= 1 ? `${duration.toFixed(1)}h` : `${Math.round(durationInHours * 60)}min`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(session.opening_amount)}
                          </div>
                          <div className="text-sm text-gray-500">{session.opened_by_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(session.closing_amount || 0)}
                          </div>
                          <div className="text-sm text-gray-500">{session.closed_by_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getDifferenceColor(session.difference || 0)}`}>
                            {session.difference === 0 ? "Sin diferencia" : formatCurrency(session.difference || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}
                          >
                            {session.status === "closed" ? "Cerrada" : "Abierta"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(session)}>
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {historyPagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(Math.max(1, historyPagination.page - 1))}
                    disabled={historyPagination.page <= 1 || loading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(Math.min(historyPagination.pages, historyPagination.page + 1))}
                    disabled={historyPagination.page >= historyPagination.pages || loading}
                  >
                    Siguiente
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{" "}
                      <span className="font-medium">{(historyPagination.page - 1) * historyPagination.limit + 1}</span>{" "}
                      a{" "}
                      <span className="font-medium">
                        {Math.min(historyPagination.page * historyPagination.limit, historyPagination.total)}
                      </span>{" "}
                      de <span className="font-medium">{historyPagination.total}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.max(1, historyPagination.page - 1))}
                        disabled={historyPagination.page <= 1 || loading}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {historyPagination.page} de {historyPagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.min(historyPagination.pages, historyPagination.page + 1))}
                        disabled={historyPagination.page >= historyPagination.pages || loading}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles - CORREGIDO */}
      <CashSessionDetails isOpen={showDetails} session={selectedSession} onClose={() => setShowDetails(false)} />
    </div>
  )
}

export default CashHistory
