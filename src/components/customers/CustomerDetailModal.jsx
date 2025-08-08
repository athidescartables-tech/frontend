"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useCustomerStore } from "../../stores/customerStore"
import { formatCurrency, formatDateTime } from "../../lib/formatters"
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from "../../lib/constants"
import Button from "../common/Button"
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"

const CustomerDetailModal = ({ customer, onClose }) => {
  const { fetchCustomerTransactions, customerTransactions, loading } = useCustomerStore()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (customer && activeTab === "transactions") {
      fetchCustomerTransactions(customer.id)
    }
  }, [customer, activeTab, fetchCustomerTransactions])

  if (!customer) return null

  const tabs = [
    { id: "overview", name: "Resumen", icon: ChartBarIcon },
    { id: "info", name: "Información", icon: UserIcon },
    { id: "transactions", name: "Transacciones", icon: BanknotesIcon },
  ]

  const getTransactionIcon = (type) => {
    switch (type) {
      case "venta":
        return "↗"
      case "pago":
        return "↙"
      case "ajuste_debito":
        return "↑"
      case "ajuste_credito":
        return "↓"
      default:
        return "•"
    }
  }

  const getPaymentMethodIcon = (paymentMethod) => {
    switch (paymentMethod) {
      case "efectivo":
        return <BanknotesIcon className="h-4 w-4" />
      case "transferencia":
        return <ArrowsRightLeftIcon className="h-4 w-4" />
      case "tarjeta_credito":
        return <CreditCardIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (paymentMethod) => {
    switch (paymentMethod) {
      case "efectivo":
        return "Efectivo"
      case "transferencia":
        return "Transferencia"
      case "tarjeta_credito":
        return "Tarjeta de Crédito"
      default:
        return null
    }
  }

  const creditUtilization = customer.credit_limit > 0 
    ? (customer.current_balance / customer.credit_limit) * 100 
    : 0

  const availableCredit = Math.max(0, customer.credit_limit - customer.current_balance)

  return (
    <Transition appear show={true} as={Fragment}>
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
                {/* Header Moderno */}
                <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <UserIcon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <Dialog.Title as="h1" className="text-3xl font-bold text-white mb-2">
                        {customer.name}
                      </Dialog.Title>
                      <div className="flex items-center space-x-4 text-white/90">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-sm">
                            Cliente desde {formatDateTime(customer.created_at, "DD/MM/YYYY")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              customer.active 
                                ? "bg-green-500/20 text-green-100 border border-green-400/30" 
                                : "bg-red-500/20 text-red-100 border border-red-400/30"
                            }`}
                          >
                            {customer.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs Modernos */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
                          activeTab === tab.id
                            ? "border-primary-500 text-primary-600 bg-white rounded-t-lg -mb-px"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Tab Resumen */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Métricas Principales */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-red-600 mb-1">Saldo Actual</p>
                              <p className="text-2xl font-bold text-red-700">
                                {formatCurrency(customer.current_balance)}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                              <CreditCardIcon className="h-6 w-6 text-red-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600 mb-1">Límite de Crédito</p>
                              <p className="text-2xl font-bold text-blue-700">
                                {formatCurrency(customer.credit_limit)}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                              <BanknotesIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-600 mb-1">Crédito Disponible</p>
                              <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(availableCredit)}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                              <DocumentTextIcon className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-600 mb-1">Transacciones</p>
                              <p className="text-2xl font-bold text-purple-700">
                                {customer.total_transactions || 0}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                              <ChartBarIcon className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Utilización de Crédito */}
                      {customer.credit_limit > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilización de Crédito</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Utilizado</span>
                              <span className="font-medium">{creditUtilization.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-300 ${
                                  creditUtilization > 80
                                    ? "bg-gradient-to-r from-red-500 to-red-600"
                                    : creditUtilization > 60
                                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                      : "bg-gradient-to-r from-green-500 to-green-600"
                                }`}
                                style={{ width: `${Math.min(creditUtilization, 100)}%` }}
                              ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Utilizado: </span>
                                <span className="font-semibold text-red-600">
                                  {formatCurrency(customer.current_balance)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Disponible: </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(availableCredit)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Información Rápida */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                          <div className="space-y-4">
                            {customer.email && (
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                                  <p className="text-xs text-gray-500">Correo electrónico</p>
                                </div>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <PhoneIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                                  <p className="text-xs text-gray-500">Teléfono</p>
                                </div>
                              </div>
                            )}
                            {!customer.email && !customer.phone && (
                              <div className="text-center py-4">
                                <InformationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Sin información de contacto</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                          <div className="space-y-4">
                            {customer.last_transaction_date ? (
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <ClockIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatDateTime(customer.last_transaction_date)}
                                  </p>
                                  <p className="text-xs text-gray-500">Última transacción</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Sin transacciones registradas</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab Información */}
                  {activeTab === "info" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Información Personal */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
                          Información Personal
                        </h3>

                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-1">{customer.name}</p>
                              <p className="text-xs text-gray-500">Nombre completo</p>
                            </div>
                          </div>

                          {customer.document_number && (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <IdentificationIcon className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">{customer.document_number}</p>
                                <p className="text-xs text-gray-500">Documento de identidad</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <CalendarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {formatDateTime(customer.created_at, "DD/MM/YYYY")}
                              </p>
                              <p className="text-xs text-gray-500">Fecha de registro</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de Contacto */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <EnvelopeIcon className="h-5 w-5 mr-2 text-green-600" />
                          Contacto y Ubicación
                        </h3>

                        <div className="space-y-6">
                          {customer.email ? (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">{customer.email}</p>
                                <p className="text-xs text-gray-500">Correo electrónico</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-400 mb-1">Sin email registrado</p>
                                <p className="text-xs text-gray-400">Correo electrónico</p>
                              </div>
                            </div>
                          )}

                          {customer.phone ? (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <PhoneIcon className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">{customer.phone}</p>
                                <p className="text-xs text-gray-500">Número de teléfono</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <PhoneIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-400 mb-1">Sin teléfono registrado</p>
                                <p className="text-xs text-gray-400">Número de teléfono</p>
                              </div>
                            </div>
                          )}

                          {(customer.address || customer.city) ? (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPinIcon className="h-6 w-6 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {[customer.address, customer.city].filter(Boolean).join(", ")}
                                </p>
                                <p className="text-xs text-gray-500">Dirección</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPinIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-400 mb-1">Sin dirección registrada</p>
                                <p className="text-xs text-gray-400">Dirección</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notas */}
                      {customer.notes && (
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-600" />
                            Notas Adicionales
                          </h3>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{customer.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Transacciones */}
                  {activeTab === "transactions" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Historial de Transacciones</h3>
                        <div className="text-sm text-gray-500">
                          {customerTransactions.length > 0 && (
                            <span>Últimas {customerTransactions.length} transacciones</span>
                          )}
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                          <p className="ml-3 text-gray-500">Cargando transacciones...</p>
                        </div>
                      ) : customerTransactions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BanknotesIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin transacciones</h3>
                          <p className="text-gray-500">Este cliente no tiene transacciones registradas</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
                                      TRANSACTION_TYPE_COLORS[transaction.type]
                                    }`}
                                  >
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {TRANSACTION_TYPE_LABELS[transaction.type]}
                                      </p>
                                      {transaction.type === "pago" && transaction.payment_method && (
                                        <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full border">
                                          {getPaymentMethodIcon(transaction.payment_method)}
                                          <span className="text-xs font-medium text-gray-600">
                                            {getPaymentMethodLabel(transaction.payment_method)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{transaction.description}</p>
                                    {transaction.reference && (
                                      <p className="text-xs text-gray-400">Referencia: {transaction.reference}</p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <span>{formatDateTime(transaction.created_at)}</span>
                                      {transaction.user_name && <span>por {transaction.user_name}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-lg font-bold mb-1 ${
                                      transaction.type === "venta" || transaction.type === "ajuste_debito"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {transaction.type === "venta" || transaction.type === "ajuste_debito" ? "+" : "-"}
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Moderno */}
                <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="py-3 px-6 text-sm font-medium rounded-xl bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
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

export default CustomerDetailModal
