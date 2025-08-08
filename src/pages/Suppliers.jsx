"use client"

import { useState } from "react"
import { useSupplierStore } from "@/stores/supplierStore"
import { formatCurrency, formatDate } from "@/lib/formatters"
import Card from "@/components/common/Card"
import Button from "@/components/common/Button"
import SupplierForm from "@/components/suppliers/SupplierForm"
import SupplierDetail from "@/components/suppliers/SupplierDetail"
import {
  PlusIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

const Suppliers = () => {
  const {
    getFilteredSuppliers,
    getSupplierStats,
    searchQuery,
    setSearchQuery,
    deleteSupplier,
    setSelectedSupplier,
    selectedSupplier,
  } = useSupplierStore()

  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [showSupplierDetail, setShowSupplierDetail] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [filter, setFilter] = useState("all")

  const suppliers = getFilteredSuppliers()
  const stats = getSupplierStats()

  const filteredSuppliers = suppliers.filter((supplier) => {
    switch (filter) {
      case "active":
        return supplier.status === "active"
      case "debt":
        return supplier.currentBalance < 0 // Les debemos
      case "credit":
        return supplier.currentBalance > 0 // Nos deben
      case "distribuidor":
        return supplier.category === "distribuidor"
      case "fabricante":
        return supplier.category === "fabricante"
      default:
        return true
    }
  })

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    setShowSupplierDetail(true)
  }

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setShowSupplierForm(true)
  }

  const handleDeleteSupplier = async (supplier) => {
    if (window.confirm(`¿Estás seguro de eliminar al proveedor ${supplier.name}?`)) {
      try {
        await deleteSupplier(supplier.id)
      } catch (error) {
        console.error("Error al eliminar proveedor:", error)
      }
    }
  }

  const StatCard = ({ title, value, icon: Icon, color = "text-gray-600", format = "number" }) => (
    <Card>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-5">
          <dl>
            <dt className="text-sm font-medium text-gray-500">{title}</dt>
            <dd className="text-2xl font-semibold text-gray-900">
              {format === "currency" ? formatCurrency(value) : value}
            </dd>
          </dl>
        </div>
      </div>
    </Card>
  )

  const getBalanceColor = (balance) => {
    if (balance > 0) return "text-green-600" // Nos deben
    if (balance < 0) return "text-red-600" // Les debemos
    return "text-gray-600"
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "distribuidor":
        return "bg-blue-100 text-blue-800"
      case "fabricante":
        return "bg-green-100 text-green-800"
      case "importador":
        return "bg-purple-100 text-purple-800"
      case "servicios":
        return "bg-yellow-100 text-yellow-800"
      case "mayorista":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h1>
          <p className="mt-1 text-sm text-gray-500">Administra tus proveedores y sus cuentas corrientes</p>
        </div>
        <Button onClick={() => setShowSupplierForm(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Proveedores"
          value={stats.totalSuppliers}
          icon={BuildingStorefrontIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Les Debemos"
          value={stats.totalDebt}
          icon={ExclamationTriangleIcon}
          color="text-red-600"
          format="currency"
        />
        <StatCard
          title="Nos Deben"
          value={stats.totalCredit}
          icon={CheckCircleIcon}
          color="text-green-600"
          format="currency"
        />
        <StatCard
          title="Total Compras"
          value={stats.totalPurchases}
          icon={CreditCardIcon}
          color="text-purple-600"
          format="currency"
        />
      </div>

      {/* Búsqueda y filtros */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, email, teléfono, CUIT o contacto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "all" ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({suppliers.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "active" ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Activos ({stats.activeSuppliers})
            </button>
            <button
              onClick={() => setFilter("debt")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "debt" ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Les Debemos ({stats.suppliersWithDebt})
            </button>
            <button
              onClick={() => setFilter("credit")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "credit" ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Nos Deben ({stats.suppliersWithCredit})
            </button>
            <button
              onClick={() => setFilter("distribuidor")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "distribuidor"
                  ? "bg-primary-100 text-primary-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Distribuidores
            </button>
            <button
              onClick={() => setFilter("fabricante")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "fabricante"
                  ? "bg-primary-100 text-primary-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Fabricantes
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de proveedores */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Términos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Compra
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
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">CUIT: {supplier.cuit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.email}</div>
                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        supplier.category,
                      )}`}
                    >
                      {getCategoryLabel(supplier.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getBalanceColor(supplier.currentBalance)}`}>
                      {formatCurrency(supplier.currentBalance)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {supplier.currentBalance >= 0 ? "Nos deben" : "Les debemos"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{supplier.paymentTerms} días</div>
                    <div className="text-xs">{supplier.discount}% desc.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.lastPurchase ? formatDate(supplier.lastPurchase) : "Nunca"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {supplier.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditSupplier(supplier)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No se encontraron proveedores</p>
            <p className="text-sm">Ajusta los filtros o agrega un nuevo proveedor</p>
          </div>
        )}
      </Card>

      {/* Modales */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <SupplierForm
              supplier={editingSupplier}
              onClose={() => {
                setShowSupplierForm(false)
                setEditingSupplier(null)
              }}
            />
          </div>
        </div>
      )}

      {showSupplierDetail && selectedSupplier && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 shadow-lg rounded-md bg-white">
            <SupplierDetail
              supplier={selectedSupplier}
              onClose={() => {
                setShowSupplierDetail(false)
                setSelectedSupplier(null)
              }}
              onEdit={() => {
                setEditingSupplier(selectedSupplier)
                setShowSupplierDetail(false)
                setShowSupplierForm(true)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Suppliers
