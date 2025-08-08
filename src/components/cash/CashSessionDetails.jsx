"use client"

import { Fragment, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useCashStore } from "@/stores/cashStore"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import Button from "@/components/common/Button"
import {
  XMarkIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  ListBulletIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"

const CashSessionDetails = ({ isOpen, session, onClose }) => {
  const { fetchSessionDetails, loading } = useCashStore()
  const [sessionDetails, setSessionDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDetails = async () => {
      if (!session?.id || !isOpen) {
        return
      }

      try {
        console.log("🔄 Cargando detalles de sesión:", session.id)
        setError(null)
        const details = await fetchSessionDetails(session.id)
        setSessionDetails(details)
        console.log("✅ Detalles cargados:", details)
      } catch (error) {
        console.error("❌ Error loading session details:", error)
        setError(error.message || "Error al cargar los detalles de la sesión")
      }
    }

    loadDetails()
  }, [session?.id, fetchSessionDetails, isOpen])

  const getMovementIcon = (type) => {
    switch (type) {
      case "opening":
        return "🔓"
      case "closing":
        return "🔒"
      case "sale":
        return "🛒"
      case "deposit":
        return "⬆️"
      case "withdrawal":
        return "⬇️"
      case "expense":
        return "💰"
      default:
        return "📝"
    }
  }

  const getMovementLabel = (type) => {
    const labels = {
      opening: "Apertura",
      closing: "Cierre",
      sale: "Venta",
      deposit: "Ingreso",
      withdrawal: "Retiro",
      expense: "Gasto",
    }
    return labels[type] || type
  }

  const getMovementColor = (amount) => {
    if (amount > 0) return "text-green-600"
    if (amount < 0) return "text-red-600"
    return "text-gray-600"
  }

  const tabs = [
    { id: "summary", name: "Resumen", icon: ChartBarIcon },
    { id: "movements", name: "Movimientos", icon: ListBulletIcon },
    { id: "earnings", name: "Ganancias", icon: BanknotesIcon },
  ]

  if (loading) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  <div className="p-6">
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                      <span className="text-gray-600">Cargando detalles...</span>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  if (error) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">Error</h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                        <div>
                          <h4 className="text-red-800 font-medium">Error al cargar detalles</h4>
                          <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={onClose}>Cerrar</Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  if (!sessionDetails) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <p>No se pudieron cargar los detalles de la sesión</p>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  const earnings = sessionDetails.earnings_details || {}
  const movements = sessionDetails.movements || []

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh]">
                {/* Header Fijo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ClockIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        Detalles de Sesión #{session.id}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateTime(session.opening_date)} - {formatDateTime(session.closing_date)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-white">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <tab.icon className="h-5 w-5 mr-2" />
                        {tab.name}
                        {activeTab === tab.id && <CheckCircleIcon className="h-4 w-4 ml-2 text-blue-600" />}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Contenido con Scroll */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Tab: Resumen */}
                  {activeTab === "summary" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                          <div className="flex items-center">
                            <BanknotesIcon className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                              <p className="text-sm text-green-600">Monto Apertura</p>
                              <p className="text-xl font-bold text-green-700">
                                {formatCurrency(session.opening_amount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center">
                            <BanknotesIcon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                              <p className="text-sm text-blue-600">Monto Cierre</p>
                              <p className="text-xl font-bold text-blue-700">
                                {formatCurrency(session.closing_amount || 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center">
                            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                            <div>
                              <p className="text-sm text-purple-600">Diferencia</p>
                              <p
                                className={`text-xl font-bold ${
                                  (session.difference || 0) === 0
                                    ? "text-green-700"
                                    : (session.difference || 0) > 0
                                      ? "text-blue-700"
                                      : "text-red-700"
                                }`}
                              >
                                {(session.difference || 0) === 0
                                  ? "Sin diferencia"
                                  : formatCurrency(session.difference || 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center">
                            <ClockIcon className="h-8 w-8 text-gray-600 mr-3" />
                            <div>
                              <p className="text-sm text-gray-600">Duración</p>
                              <p className="text-xl font-bold text-gray-700">
                                {Math.round(
                                  (new Date(session.closing_date) - new Date(session.opening_date)) /
                                    (1000 * 60 * 60 * 10),
                                ) / 10}
                                h
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Información de Usuarios
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">Abierta por:</span>
                              <span className="font-medium">{session.opened_by_name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-600">Cerrada por:</span>
                              <span className="font-medium">{session.closed_by_name || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Observaciones
                          </h4>
                          <div className="space-y-3 text-sm">
                            {session.opening_notes && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-green-700 font-medium">Apertura:</span>
                                <p className="mt-1 text-green-800">{session.opening_notes}</p>
                              </div>
                            )}
                            {session.closing_notes && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-medium">Cierre:</span>
                                <p className="mt-1 text-blue-800">{session.closing_notes}</p>
                              </div>
                            )}
                            {!session.opening_notes && !session.closing_notes && (
                              <p className="text-gray-500 italic text-center py-4">Sin observaciones</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Movimientos */}
                  {activeTab === "movements" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">Movimientos de la sesión ({movements.length})</h4>
                      </div>

                      {movements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <ListBulletIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-lg font-medium">No hay movimientos registrados</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Monto
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha/Hora
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {movements.map((movement) => (
                                  <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <span className="text-lg mr-2">{getMovementIcon(movement.type)}</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {getMovementLabel(movement.type)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm text-gray-900">{movement.description}</div>
                                      {movement.reference && (
                                        <div className="text-sm text-gray-500">Ref: {movement.reference}</div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className={`text-sm font-semibold ${getMovementColor(movement.amount)}`}>
                                        {Number(movement.amount) > 0 ? "+" : ""}
                                        {formatCurrency(movement.amount || 0)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{formatDateTime(movement.created_at)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{movement.user_name || "N/A"}</div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Ganancias */}
                  {activeTab === "earnings" && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                          <BanknotesIcon className="h-6 w-6 mr-2" />
                          Resumen de Ganancias
                        </h4>

                        {earnings.totalEarnings !== undefined ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-gray-600">Ventas en Efectivo</p>
                                <p className="text-xl font-bold text-green-700">
                                  {formatCurrency(earnings.sales?.cash || 0)}
                                </p>
                                <p className="text-xs text-gray-500">{earnings.sales?.count || 0} transacciones</p>
                              </div>

                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-gray-600">Ventas con Tarjeta</p>
                                <p className="text-xl font-bold text-blue-700">
                                  {formatCurrency(earnings.sales?.card || 0)}
                                </p>
                              </div>

                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-gray-600">Ingresos Adicionales</p>
                                <p className="text-xl font-bold text-purple-700">
                                  {formatCurrency(earnings.deposits?.amount || 0)}
                                </p>
                              </div>

                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-gray-600">Pagos Cta. Cte.</p>
                                <p className="text-xl font-bold text-orange-700">
                                  {formatCurrency(earnings.accountPayments?.amount || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-gray-600">Gastos</p>
                                <p className="text-xl font-bold text-red-700">
                                  -{formatCurrency(earnings.expenses?.amount || 0)}
                                </p>
                              </div>

                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <p className="text-sm text-gray-600">Retiros</p>
                                <p className="text-xl font-bold text-orange-700">
                                  -{formatCurrency(earnings.withdrawals?.amount || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border border-green-300 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-green-900">Total de Ganancias Netas:</span>
                                <span className="text-2xl font-bold text-green-900">
                                  {formatCurrency(earnings.totalEarnings)}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-lg font-medium">No hay información detallada de ganancias</p>
                            <p className="text-sm">
                              Esta funcionalidad está disponible para sesiones cerradas recientemente
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Fijo */}
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    onClick={onClose}
                    className="flex-1 py-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg"
                  >
                    Cerrar
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default CashSessionDetails
