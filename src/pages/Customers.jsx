"use client"

import { useState, useEffect, useCallback } from "react"
import { useCustomerStore } from "../stores/customerStore"
import { useToast } from "../hooks/useToast"
import { formatCurrency, formatDateTime } from "../lib/formatters"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import Pagination from "../components/common/Pagination"
import CustomerForm from "../components/customers/CustomerForm"
import CustomerDetailModal from "../components/customers/CustomerDetailModal"
import AccountTransactionForm from "../components/customers/AccountTransactionForm"
import CustomerSearchAdvanced from "../components/customers/CustomerSearchAdvanced"
import {
PlusIcon,
UserIcon,
ExclamationTriangleIcon,
EyeIcon,
PencilIcon,
TrashIcon,
BanknotesIcon,
PhoneIcon,
EnvelopeIcon,
IdentificationIcon,
} from "@heroicons/react/24/outline"

const Customers = () => {
const {
  customers,
  fetchCustomers,
  deleteCustomer,
  loading: customersLoading,
  pagination: customersPagination,
} = useCustomerStore()

const { showToast } = useToast()

const [showForm, setShowForm] = useState(false)
const [showDetailModal, setShowDetailModal] = useState(false)
const [showTransactionForm, setShowTransactionForm] = useState(false)
const [selectedCustomer, setSelectedCustomer] = useState(null)
const [searchQuery, setSearchQuery] = useState("")
const [filters, setFilters] = useState({
  debtorsOnly: false,
  sortBy: "",
  sortOrder: "desc",
  active: "all",
  page: 1,
  limit: 25,
})

// Cargar datos iniciales
useEffect(() => {
  loadCustomers()
}, [])

// Efecto para cargar clientes cuando cambien los filtros
useEffect(() => {
  const timeoutId = setTimeout(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
      active_only: filters.active === "true" ? "true" : filters.active === "false" ? "false" : "all",
    }

    // Aplicar filtros de búsqueda
    if (searchQuery.trim()) {
      params.search = searchQuery.trim()
    }

    // Filtro solo deudores
    if (filters.debtorsOnly) {
      params.debtors_only = "true"
    }

    // Ordenamiento
    if (filters.sortBy) {
      params.sort_by = filters.sortBy
      params.sort_order = filters.sortOrder
    }

    console.log("🔍 Enviando parámetros al backend:", params)
    fetchCustomers(params)
  }, 300) // Debounce de 300ms

  return () => clearTimeout(timeoutId)
}, [searchQuery, filters, fetchCustomers])

const loadCustomers = useCallback(async () => {
  try {
    const params = {
      page: 1,
      limit: 25,
      active_only: "all", // Mostrar todos por defecto
    }
    await fetchCustomers(params)
  } catch (error) {
    console.error("Error loading customers:", error)
  }
}, [fetchCustomers])

// Función para manejar cambio de página
const handlePageChange = useCallback((newPage) => {
  setFilters((prev) => ({ ...prev, page: newPage }))
}, [])

// Función para manejar cambio de elementos por página
const handleItemsPerPageChange = useCallback((newLimit, newPage = 1) => {
  setFilters((prev) => ({
    ...prev,
    limit: newLimit,
    page: newPage,
  }))
}, [])

// Función para manejar cambios en filtros
const handleFiltersChange = useCallback((newFilters) => {
  console.log("🎛️ Cambiando filtros:", newFilters)
  setFilters((prev) => ({
    ...prev,
    ...newFilters,
    page: 1, // Resetear a la primera página cuando cambien los filtros
  }))
}, [])

// Función para manejar búsqueda
const handleSearchChange = useCallback((query) => {
  console.log("🔍 Cambiando búsqueda:", query)
  setSearchQuery(query)
  setFilters((prev) => ({ ...prev, page: 1 })) // Resetear página en búsqueda
}, [])

const handleEdit = (customer) => {
  setSelectedCustomer(customer)
  setShowForm(true)
}

const handleView = (customer) => {
  setSelectedCustomer(customer)
  setShowDetailModal(true)
}

const handleAddTransaction = (customer) => {
  setSelectedCustomer(customer)
  setShowTransactionForm(true)
}

const handleDelete = async (customer) => {
  if (customer.current_balance > 0) {
    showToast("No se puede eliminar un cliente con saldo pendiente", "error")
    return
  }

  if (window.confirm(`¿Estás seguro de eliminar el cliente "${customer.name}"?`)) {
    try {
      await deleteCustomer(customer.id)
      showToast("Cliente eliminado correctamente", "success")
      // Recargar la página actual después de eliminar
      const params = {
        page: filters.page,
        limit: filters.limit,
        active_only: filters.active === "true" ? "true" : filters.active === "false" ? "false" : "all",
      }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (filters.debtorsOnly) params.debtors_only = "true"
      if (filters.sortBy) {
        params.sort_by = filters.sortBy
        params.sort_order = filters.sortOrder
      }
      fetchCustomers(params, true)
    } catch (error) {
      console.error("Error eliminando cliente:", error)
    }
  }
}

const handleFormSuccess = () => {
  setShowForm(false)
  setSelectedCustomer(null)
  // Recargar clientes después de guardar
  const params = {
    page: filters.page,
    limit: filters.limit,
    active_only: filters.active === "true" ? "true" : filters.active === "false" ? "false" : "all",
  }
  if (searchQuery.trim()) params.search = searchQuery.trim()
  if (filters.debtorsOnly) params.debtors_only = "true"
  if (filters.sortBy) {
    params.sort_by = filters.sortBy
    params.sort_order = filters.sortOrder
  }
  fetchCustomers(params, true)
}

const handleTransactionSuccess = () => {
  setShowTransactionForm(false)
  setSelectedCustomer(null)
  // Recargar clientes después de transacción
  const params = {
    page: filters.page,
    limit: filters.limit,
    active_only: filters.active === "true" ? "true" : filters.active === "false" ? "false" : "all",
  }
  if (searchQuery.trim()) params.search = searchQuery.trim()
  if (filters.debtorsOnly) params.debtors_only = "true"
  if (filters.sortBy) {
    params.sort_by = filters.sortBy
    params.sort_order = filters.sortOrder
  }
  fetchCustomers(params, true)
}

const handleOpenForm = useCallback((customer = null) => {
  setSelectedCustomer(customer)
  setShowForm(true)
}, [])

const handleCloseForm = useCallback(() => {
  setShowForm(false)
  setSelectedCustomer(null)
}, [])

// Verificar si es el cliente "Consumidor Final"
const isDefaultCustomer = (customer) => {
  return customer.name === "Consumidor Final" && customer.document_number === "00000000"
}

const getBalanceColor = (balance) => {
  if (balance > 0) return "text-red-600"
  if (balance < 0) return "text-green-600"
  return "text-gray-600"
}

const getBalanceIcon = (balance) => {
  if (balance > 0) return <ExclamationTriangleIcon className="h-4 w-4" />
  return null
}

const hasActiveFilters =
  searchQuery ||
  filters.debtorsOnly ||
  filters.sortBy ||
  filters.active !== "all"

return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">Administra tus clientes y cuentas corrientes</p>
      </div>
      <div className="flex space-x-3">
        <Button onClick={() => handleOpenForm()}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>
    </div>

    {/* Búsqueda avanzada */}
    <CustomerSearchAdvanced
      onSearch={handleSearchChange}
      onFiltersChange={handleFiltersChange}
      searchQuery={searchQuery}
      filters={filters}
    />

    {/* Tabla de clientes */}
    <Card>
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Clientes
            {customersPagination.total > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({customersPagination.total.toLocaleString()} total)
              </span>
            )}
          </h3>
          {hasActiveFilters && <span className="text-sm text-gray-500">Mostrando resultados filtrados</span>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Límite
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
            {customersLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                  <p className="mt-2">Cargando clientes...</p>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No se encontraron clientes</p>
                  <p className="text-sm">
                    {hasActiveFilters
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "Comienza agregando tu primer cliente"}
                  </p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const isDefault = isDefaultCustomer(customer)
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {customer.name}
                              {isDefault && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Por defecto
                                </span>
                              )}
                            </div>
                          </div>
                          {customer.document_number && (
                            <div className="text-sm text-gray-500 mt-1">
                              <div className="flex items-center">
                                <IdentificationIcon className="h-4 w-4 mr-1" />
                                {customer.document_number}
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {customer.total_transactions || 0} transacciones
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {customer.email ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">Sin email</div>
                        )}
                        {customer.phone ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">Sin teléfono</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.current_balance > 0
                            ? "bg-red-100 text-red-800"
                            : customer.current_balance < 0
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getBalanceIcon(customer.current_balance)}
                        {formatCurrency(customer.current_balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {formatCurrency(customer.credit_limit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(customer)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {!isDefault && (
                          <>
                            <button
                              onClick={() => handleAddTransaction(customer)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Agregar transacción"
                            >
                              <BanknotesIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="text-primary-600 hover:text-primary-900 transition-colors"
                              title="Editar cliente"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar cliente"
                              disabled={customer.current_balance > 0}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {isDefault && (
                          <span className="text-xs text-gray-400 italic">
                            Cliente por defecto
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {customersPagination.pages > 1 && (
        <Pagination
          currentPage={customersPagination.page}
          totalPages={customersPagination.pages}
          totalItems={customersPagination.total}
          itemsPerPage={customersPagination.limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={customersLoading}
        />
      )}
    </Card>

    {/* Modales - CORREGIDO: Renderizado condicional sin prop isOpen */}
    {showForm && (
      <CustomerForm
        customer={selectedCustomer}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    )}

    {showDetailModal && selectedCustomer && (
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedCustomer(null)
        }}
      />
    )}

    {showTransactionForm && selectedCustomer && (
      <AccountTransactionForm
        customer={selectedCustomer}
        onClose={() => {
          setShowTransactionForm(false)
          setSelectedCustomer(null)
        }}
        onSuccess={handleTransactionSuccess}
      />
    )}
  </div>
)
}

export default Customers
