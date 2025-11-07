"use client"

import { useState } from "react"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { XMarkIcon, CheckCircleIcon, ClockIcon, XCircleIcon, MapPinIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "@/lib/formatters"

const DeliveryDetailModal = ({ show, delivery, onClose, onUpdate }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [gpsData, setGpsData] = useState(null)

  const { updateDeliveryStatus, loading } = useDeliveriesStore()

  if (!show || !delivery) return null

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true)

      const statusData = { status: newStatus }

      // Intentar obtener GPS si está disponible
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          statusData.latitude = position.coords.latitude
          statusData.longitude = position.coords.longitude
          statusData.notes = notes || undefined
        })
      }

      await updateDeliveryStatus(delivery.id, statusData)
      setSelectedStatus("")
      setNotes("")
      onUpdate()
    } catch (error) {
      console.error("Error updating delivery:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusOptions = () => {
    switch (delivery.status) {
      case "pending":
        return ["in_progress", "cancelled"]
      case "in_progress":
        return ["completed", "cancelled"]
      default:
        return []
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      in_progress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case "in_progress":
        return <ClockIcon className="h-5 w-5 text-blue-600" />
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:max-w-2xl rounded-t-lg md:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold">Detalle del Reparto #{delivery.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Estado actual */}
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            {getStatusIcon(delivery.status)}
            <div>
              <span className="text-sm text-gray-600">Estado Actual:</span>
              <span className="text-lg font-bold text-gray-900">{getStatusLabel(delivery.status)}</span>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Cliente</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium text-gray-900">{delivery.customer_name}</p>
              {delivery.customer_phone && (
                <p className="text-sm text-blue-600 hover:underline cursor-pointer">{delivery.customer_phone}</p>
              )}
              {delivery.customer_address && (
                <div className="flex gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{delivery.customer_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          {delivery.items && delivery.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Productos</h3>
              <div className="space-y-2">
                {delivery.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <span className="text-sm text-gray-600">Total del Reparto:</span>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(delivery.total)}</div>
          </div>

          {/* Cambiar estado (solo si no está completado o cancelado) */}
          {getStatusOptions().length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Actualizar Estado</h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de actualización (opcional)..."
                rows="2"
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid grid-cols-2 gap-2">
                {getStatusOptions().map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updatingStatus || loading}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                      status === "completed"
                        ? "bg-green-600 hover:bg-green-700"
                        : status === "in_progress"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50`}
                  >
                    {updatingStatus ? "..." : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón cerrar */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetailModal
