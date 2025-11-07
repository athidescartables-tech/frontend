"use client"

import { useState, useEffect, useRef } from "react"
import { useDeliveriesStore } from "../stores/deliveriesStore"
import DeliveriesList from "../components/deliveries/DeliveriesList"
import DeliveryForm from "../components/deliveries/DeliveryForm"
import DeliveryDetailModal from "../components/deliveries/DeliveryDetailModal"
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

const Deliveries = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filterStatus, setFilterStatus] = useState("pending")
  const [viewMode, setViewMode] = useState("list")

  const { fetchDeliveries, fetchStats, deliveries, loading, error } = useDeliveriesStore()

  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return

    let isMounted = true
    isInitialized.current = true

    const loadInitialData = async () => {
      try {
        if (isMounted) {
          await Promise.all([fetchDeliveries({ status: filterStatus }), fetchStats("today")])
        }
      } catch (error) {
        console.error("Error loading deliveries:", error)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleRefresh = async () => {
    try {
      await fetchDeliveries({ status: filterStatus }, true)
      await fetchStats("today", true)
    } catch (error) {
      console.error("Error refreshing:", error)
    }
  }

  const handleSelectDelivery = (delivery) => {
    setSelectedDelivery(delivery)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedDelivery(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    handleRefresh()
  }

  const filteredDeliveries = deliveries.filter((d) => (filterStatus === "all" ? true : d.status === filterStatus))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repartos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los repartos de productos a clientes</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Actualizar repartos"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo Reparto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { label: "Todos", value: "all" },
          { label: "Pendientes", value: "pending" },
          { label: "En Progreso", value: "in_progress" },
          { label: "Completados", value: "completed" },
          { label: "Cancelados", value: "cancelled" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === filter.value ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Lista de repartos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading && filteredDeliveries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mr-3" />
            <span className="text-gray-500">Cargando repartos...</span>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-gray-500">No hay repartos para mostrar</span>
          </div>
        ) : (
          <DeliveriesList deliveries={filteredDeliveries} onSelectDelivery={handleSelectDelivery} />
        )}
      </div>

      {/* Modales */}
      <DeliveryForm show={showForm} onClose={handleFormClose} />

      <DeliveryDetailModal
        show={showDetail}
        delivery={selectedDelivery}
        onClose={handleCloseDetail}
        onUpdate={handleRefresh}
      />
    </div>
  )
}

export default Deliveries
