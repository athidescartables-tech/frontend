"use client"

import { useState, useEffect, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useCustomerStore } from "../../stores/customerStore"
import { formatCurrency } from "../../lib/formatters"
import { MagnifyingGlassIcon, UserIcon, XMarkIcon, BoltIcon } from "@heroicons/react/24/outline"
import Button from "../common/Button"

const CustomerSelectModal = ({ show, onClose, onSelectCustomer }) => {
  const { customers, fetchCustomers, searchCustomers } = useCustomerStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  // CORREGIDO: Cargar clientes al abrir el modal
  useEffect(() => {
    let isMounted = true

    if (show) {
      const loadCustomers = async () => {
        if (isMounted) {
          setLoading(true)
          try {
            // CORREGIDO: Cargar TODOS los clientes activos, no solo si la lista está vacía
            await fetchCustomers({ active: "true" }, true) // Force refresh
          } catch (error) {
            console.error("Error loading customers:", error)
          } finally {
            if (isMounted) {
              setLoading(false)
            }
          }
        }
      }
      
      loadCustomers()
      setSearchTerm("") // Limpiar búsqueda al abrir
    }

    return () => {
      isMounted = false
    }
  }, [show, fetchCustomers])

  // CORREGIDO: Filtrado con debounce mejorado
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        // CORREGIDO: Buscar en todos los clientes activos
        const results = searchCustomers(searchTerm.trim()).filter((c) => c.active)
        setFilteredCustomers(results.slice(0, 20)) // Mostrar más resultados
      } else {
        // CORREGIDO: Mostrar todos los clientes activos cuando no hay búsqueda
        const allActiveCustomers = customers.filter((c) => c.active)
        setFilteredCustomers(allActiveCustomers.slice(0, 20))
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, customers, searchCustomers])

  const handleSelect = (customer) => {
    onSelectCustomer(customer)
    onClose()
  }

  // Encontrar el cliente por defecto (Consumidor Final)
  const defaultCustomer = customers.find(
    (c) => c.document_number === "00000000" && c.name === "Consumidor Final"
  )

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold text-gray-900">
                        Seleccionar Cliente
                      </Dialog.Title>
                      <p className="text-xs text-gray-500">
                        {customers.length} clientes disponibles
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="p-4 space-y-4">
                  {/* Búsqueda de clientes */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, documento, email o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>

                  {/* Opción de Venta Rápida (Consumidor Final) */}
                  {defaultCustomer && !searchTerm && (
                    <button
                      onClick={() => handleSelect(defaultCustomer)}
                      className="w-full text-left px-3 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <BoltIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-800">Venta Rápida (Consumidor Final)</div>
                        <div className="text-xs text-green-600">Documento: {defaultCustomer.document_number}</div>
                      </div>
                    </button>
                  )}

                  {/* Lista de clientes */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {loading ? (
                        <div className="px-3 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <span className="text-sm text-gray-500">Cargando clientes...</span>
                        </div>
                      ) : filteredCustomers.length > 0 ? (
                        filteredCustomers.map((cust) => (
                          <button
                            key={cust.id}
                            onClick={() => handleSelect(cust)}
                            className="w-full text-left px-3 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{cust.name}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {cust.document_number}
                                {cust.email && ` • ${cust.email}`}
                                {!(cust.document_number === "00000000" && cust.name === "Consumidor Final") &&
                                  ` • Límite: ${formatCurrency(cust.credit_limit)}`}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-8 text-center">
                          <UserIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {searchTerm ? "No se encontraron clientes" : "No hay clientes disponibles"}
                          </p>
                          {searchTerm && (
                            <p className="text-xs text-gray-400 mt-1">
                              Intenta con otros términos de búsqueda
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  {filteredCustomers.length > 0 && (
                    <div className="text-xs text-gray-500 text-center">
                      Mostrando {filteredCustomers.length} de {customers.filter(c => c.active).length} clientes activos
                    </div>
                  )}
                </div>

                {/* Footer del modal */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <Button variant="outline" onClick={onClose} className="text-sm py-2 px-4">
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

export default CustomerSelectModal
