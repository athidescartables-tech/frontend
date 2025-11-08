"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { useProductStore } from "../../stores/productStore"
import { useCustomerStore } from "../../stores/customerStore"
import { useConfigStore } from "../../stores/configStore"
import { useToast } from "../../contexts/ToastContext"
import { formatCurrency, formatStock } from "../../lib/formatters"
import Button from "../common/Button"
import ProductSearch from "../sales/ProductSearch"
import CustomerSelectModal from "../sales/CustomerSelect"
import QuantityModal from "./DeliveryQuantityModal"
import DeliveryCart from "./DeliveryCart"
import DeliveryPaymentModal from "./DeliveryPaymentModal"
import {
  XMarkIcon,
  UserIcon,
  TruckIcon,
  ShoppingCartIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

const DeliveryForm = ({ show, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCustomerSelector, setShowCustomerSelector] = useState(false)
  const [showDriverSelector, setShowDriverSelector] = useState(false)
  const [displayProducts, setDisplayProducts] = useState([])

  const { cart, customer, driver, setCustomer, setDriver, setSelectedProduct, setShowQuantityModal, clearCart } =
    useDeliveriesStore()

  const { topSellingProducts, fetchTopSellingProducts, searchProductsForSales, loading } = useProductStore()
  const { fetchCustomers } = useCustomerStore()
  const { users } = useConfigStore()
  const { showToast } = useToast()

  const isInitialized = useRef(false)

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialized.current) return

    let isMounted = true
    isInitialized.current = true

    const loadInitialData = async () => {
      try {
        if (isMounted) {
          await Promise.all([fetchTopSellingProducts(10), fetchCustomers({ active: "true" }, true)])
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    if (show) {
      loadInitialData()
    }

    return () => {
      isMounted = false
    }
  }, [show])

  // Buscar productos
  useEffect(() => {
    let isMounted = true

    const handleSearch = async () => {
      try {
        if (isMounted) {
          const results = await searchProductsForSales(searchTerm)
          if (isMounted) {
            setDisplayProducts(results.filter((product) => product.active && product.stock > 0))
          }
        }
      } catch (error) {
        console.error("Error searching products:", error)
        if (isMounted) {
          setDisplayProducts(topSellingProducts.filter((product) => product.active && product.stock > 0))
        }
      }
    }

    handleSearch()

    return () => {
      isMounted = false
    }
  }, [searchTerm, searchProductsForSales, topSellingProducts])

  const handleSearchChange = (term) => {
    setSearchTerm(term)
  }

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      setSelectedProduct(product)
      setShowQuantityModal(true)
    }
  }

  const handleSelectCustomer = (selectedCustomer) => {
    setCustomer(selectedCustomer)
    setShowCustomerSelector(false)
  }

  const handleSelectDriver = (selectedDriver) => {
    setDriver(selectedDriver)
    setShowDriverSelector(false)
  }

  const handleClose = () => {
    clearCart()
    setSearchTerm("")
    onClose()
  }

  const getCartQuantity = (productId) => {
    const cartItem = cart.find((item) => item.id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  // Repartidores activos
  const activeDrivers = users?.filter((u) => u.active) || []

  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
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

          <div className="fixed inset-0 overflow-hidden">
            <div className="flex min-h-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-full transform overflow-hidden bg-white shadow-xl transition-all flex flex-col">
                  {/* Header fijo */}
                  <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <TruckIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900">
                            Nuevo Reparto
                          </Dialog.Title>
                          <p className="text-xs text-gray-500">Agrega productos y completa la información</p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Selección de cliente y repartidor compacta */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {/* Cliente */}
                      <button
                        onClick={() => setShowCustomerSelector(true)}
                        className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Cliente</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {customer ? customer.name : "Seleccionar"}
                          </p>
                        </div>
                      </button>

                      {/* Repartidor */}
                      <button
                        onClick={() => setShowDriverSelector(true)}
                        className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <TruckIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Repartidor</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {driver ? driver.name : "Seleccionar"}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Contenido con scroll */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                      {/* Columna izquierda - Productos (2/3) */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Buscador */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <ProductSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
                        </div>

                        {/* Lista de productos compacta */}
                        <div className="bg-white rounded-lg border border-gray-200">
                          {loading && displayProducts.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm text-gray-500">Cargando productos...</span>
                            </div>
                          ) : displayProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mb-2" />
                              <p className="text-sm text-gray-500">No se encontraron productos</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                              {displayProducts.map((product) => {
                                const cartQuantity = getCartQuantity(product.id)
                                return (
                                  <button
                                    key={product.id}
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full p-3 hover:bg-blue-50 transition-colors flex items-center space-x-3 text-left"
                                  >
                                    {/* Imagen */}
                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                      {product.image ? (
                                        <img
                                          src={product.image || "/placeholder.svg"}
                                          alt={product.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                                      )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                                        {cartQuantity > 0 && (
                                          <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                                            <ShoppingCartIcon className="h-3 w-3 mr-1" />
                                            {formatStock(cartQuantity, product.unit_type, false)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                          {formatCurrency(product.price)}
                                          {product.unit_type === "kg" && " /kg"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Stock: {formatStock(product.stock, product.unit_type)}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Columna derecha - Carrito (1/3) */}
                      <div className="lg:col-span-1">
                        <div className="sticky top-0">
                          <DeliveryCart />
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modales auxiliares */}
      <CustomerSelectModal
        show={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Modal de selección de repartidor */}
      <Transition appear show={showDriverSelector} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDriverSelector(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
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
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TruckIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <Dialog.Title as="h3" className="text-base font-semibold text-gray-900">
                        Seleccionar Repartidor
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={() => setShowDriverSelector(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {activeDrivers.length > 0 ? (
                        activeDrivers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleSelectDriver(user)}
                            className="w-full text-left px-3 py-3 hover:bg-green-50 border border-gray-200 rounded-lg transition-colors flex items-center space-x-3"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <TruckIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No hay repartidores disponibles</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <Button
                      variant="outline"
                      onClick={() => setShowDriverSelector(false)}
                      className="w-full text-sm py-2"
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

      <QuantityModal />
      <DeliveryPaymentModal onClose={handleClose} />
    </>
  )
}

export default DeliveryForm
