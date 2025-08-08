"use client"

import { useState } from "react"
import { useSupplierStore } from "@/stores/supplierStore"
import { formatCurrency, formatDate } from "@/lib/formatters"
import Button from "@/components/common/Button"
import SupplierAccountMovementForm from "./SupplierAccountMovementForm"
import {
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"

const SupplierDetail = ({ supplier, onClose, onEdit }) => {
  const { getSupplierMovements } = useSupplierStore()
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  const movements = getSupplierMovements(supplier.id)

  const getMovementIcon = (type) => {
    switch (type) {
      case "payment":
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />
      case "purchase":
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />
      case "credit_note":
        return <DocumentTextIcon className="h-4 w-4 text-green-600" />
      case "debit_note":
        return <DocumentTextIcon className="h-4 w-4 text-red-600" />
      default:
        return <CreditCardIcon className="h-4 w-4 text-blue-600" />
    }
  }

  const getMovementLabel = (type) => {
    switch (type) {
      case "payment":
        return "Pago"
      case "purchase":
        return "Compra"
      case "credit_note":
        return "Nota de Crédito"
      case "debit_note":
        return "Nota de Débito"
      case "adjustment":
        return "Ajuste"
      default:
        return type
    }
  }

  const getTaxConditionLabel = (condition) => {
    switch (condition) {
      case "responsable_inscripto":
        return "Responsable Inscripto"
      case "monotributo":
        return "Monotributo"
      case "exento":
        return "Exento"
      case "consumidor_final":
        return "Consumidor Final"
      default:
        return condition
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case "distribuidor":
        return "Distribuidor"
      case "fabricante":
        return "Fabricante"
      case "importador":
        return "Importador"
      case "servicios":
        return "Servicios"
      case "mayorista":
        return "Mayorista"
      default:
        return category
    }
  }

  const tabs = [
    { id: "info", name: "Información" },
    { id: "account", name: "Cuenta Corriente" },
    { id: "history", name: "Historial" },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
            <p className="text-sm text-gray-500">{supplier.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowMovementForm(true)} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Movimiento
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm">
            Editar
          </Button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${supplier.currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(supplier.currentBalance)}
            </div>
            <div className="text-sm text-gray-500">{supplier.currentBalance >= 0 ? "Nos deben" : "Les debemos"}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(supplier.creditLimit)}</div>
            <div className="text-sm text-gray-500">Límite de crédito</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(supplier.totalPurchases)}</div>
            <div className="text-sm text-gray-500">Total compras</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Información Básica</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-sm text-gray-500">CUIT: {supplier.cuit}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{supplier.email}</div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{supplier.phone}</div>
                    <div className="text-sm text-gray-500">Teléfono</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{formatDate(supplier.registrationDate)}</div>
                    <div className="text-sm text-gray-500">Fecha de registro</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Dirección</h4>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{supplier.address?.street}</div>
                  <div className="text-sm text-gray-500">
                    {supplier.address?.city}, {supplier.address?.province} ({supplier.address?.postalCode})
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Persona de Contacto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Nombre</div>
                  <div className="text-sm text-gray-500">{supplier.contactPerson}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Teléfono directo</div>
                  <div className="text-sm text-gray-500">{supplier.contactPhone}</div>
                </div>
              </div>
            </div>

            {/* Información fiscal y comercial */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Información Fiscal y Comercial</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Condición fiscal</div>
                  <div className="text-sm text-gray-500">{getTaxConditionLabel(supplier.taxCondition)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Categoría</div>
                  <div className="text-sm text-gray-500">{getCategoryLabel(supplier.category)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Términos de pago</div>
                  <div className="text-sm text-gray-500">{supplier.paymentTerms} días</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Descuento</div>
                  <div className="text-sm text-gray-500">{supplier.discount}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Última compra</div>
                  <div className="text-sm text-gray-500">
                    {supplier.lastPurchase ? formatDate(supplier.lastPurchase) : "Nunca"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Estado</div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {supplier.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notas */}
            {supplier.notes && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Notas</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{supplier.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Crédito disponible</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(supplier.creditLimit + Math.min(0, supplier.currentBalance))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">
                    {supplier.currentBalance >= 0 ? "Nos deben" : "Les debemos"}
                  </div>
                  <div
                    className={`text-lg font-bold ${supplier.currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(Math.abs(supplier.currentBalance))}
                  </div>
                </div>
              </div>
            </div>

            {/* Últimos movimientos */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Últimos Movimientos</h4>
              {movements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No hay movimientos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getMovementIcon(movement.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{movement.description}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(movement.date)} - {getMovementLabel(movement.type)}
                            {movement.reference && ` - ${movement.reference}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold ${movement.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {movement.amount >= 0 ? "+" : ""}
                          {formatCurrency(movement.amount)}
                        </div>
                        <div className="text-xs text-gray-500">Saldo: {formatCurrency(movement.balance)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Historial Completo</h4>
            {movements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No hay historial disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
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
                        Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(movement.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getMovementLabel(movement.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{movement.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={movement.amount >= 0 ? "text-green-600" : "text-red-600"}>
                            {movement.amount >= 0 ? "+" : ""}
                            {formatCurrency(movement.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(movement.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de movimiento */}
      {showMovementForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <SupplierAccountMovementForm supplier={supplier} onClose={() => setShowMovementForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierDetail
