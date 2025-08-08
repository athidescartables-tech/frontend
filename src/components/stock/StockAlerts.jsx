"use client"

import { useState, useEffect } from "react"
import { useStockStore } from "@/stores/stockStore"
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { formatStock } from "@/lib/formatters" // IMPORTADO: formatStock

const StockAlerts = () => {
  const { stockAlerts, fetchStockAlerts, loading } = useStockStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Cargar alertas al montar el componente
  useEffect(() => {
    fetchStockAlerts()
  }, [fetchStockAlerts])

  // Filtrar alertas solo por búsqueda
  const filteredAlerts = stockAlerts.filter((alert) => {
    // Filtro por búsqueda
    if (searchQuery && !alert.productName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filtro de búsqueda */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de producto..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando alertas...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {stockAlerts.length === 0 ? "No hay alertas de stock" : "No se encontraron alertas"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {stockAlerts.length === 0
              ? "Todos los productos tienen stock suficiente según su configuración"
              : "Intenta ajustar la búsqueda"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{alert.productName}</h4>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Stock actual:</span>{" "}
                        {formatStock(alert.currentStock, alert.unitType)} {/* ACTUALIZADO */}
                      </p>
                      <p>
                        <span className="font-medium">Stock mínimo configurado:</span>{" "}
                        {formatStock(alert.threshold, alert.unitType)} {/* ACTUALIZADO */}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Este producto necesita reposición según la configuración establecida
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Stock Bajo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {stockAlerts.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información sobre las alertas</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Las alertas se generan cuando el stock actual está por debajo del stock mínimo configurado</li>
                  <li>Puedes configurar el stock mínimo individual al crear o editar cada producto</li>
                  <li>Cada producto puede tener su propio umbral de alerta personalizado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockAlerts
