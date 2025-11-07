"use client"

import { MapPinIcon, UserIcon, PhoneIcon, TruckIcon, ClockIcon } from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/lib/formatters"

const DeliveriesList = ({ deliveries, onSelectDelivery }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <div className="divide-y divide-gray-200">
      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          onClick={() => onSelectDelivery(delivery)}
          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">#{delivery.id}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(delivery.status)}`}>
                  {getStatusLabel(delivery.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{delivery.customer_name}</span>
                </div>

                {delivery.customer_phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${delivery.customer_phone}`} className="text-blue-600 hover:underline">
                      {delivery.customer_phone}
                    </a>
                  </div>
                )}

                {delivery.customer_address && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{delivery.customer_address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{formatCurrency(delivery.total)}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                <ClockIcon className="h-3 w-3" />
                {formatDate(delivery.created_at)}
              </div>
            </div>
          </div>

          {delivery.items_count > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <TruckIcon className="h-4 w-4" />
                <span>{delivery.items_count} productos</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default DeliveriesList
