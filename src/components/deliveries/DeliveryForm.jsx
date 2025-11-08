"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { useProductStore } from "../../stores/productStore"
import { useCustomerStore } from "../../stores/customerStore"
import { useAuthStore } from "../../stores/authStore"
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
  const [displayProducts, setDisplayProducts] = useState([])

  const { cart, customer, setCustomer, setSelectedProduct, setShowQuantityModal, clearCart } = useDeliveriesStore()

  const { topSellingProducts, fetchTopSellingProducts, searchProductsForSales, loading } = useProductStore()
  const { fetchCustomers } = useCustomerStore()
  const { user: authenticatedUser } = useAuthStore()
  const { showToast } = useToast()

  const isInitialized = useRef(false)

  useEffect(() => {
    if (!show) return

    if (!isInitialized.current) {
      isInitialized.current = true

      let isMounted = true

      const loadInitialData = async () => {
        try {
          if (isMounted) {
            // Load data
            await Promise.all([fetchTopSellingProducts(10), fetchCustomers({ active: "true" }, true)])
          }
        } catch (error) {
          console.error("Error loading initial data:", error)
        }
      }

      loadInitialData()

      return () => {
        isMounted = false
      }
    }
  }, [show, fetchTopSellingProducts, fetchCustomers])

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

  const handleClose = () => {
    clearCart()
    setSearchTerm("")
    onClose()
  }

  const getCartQuantity = (productId) => {
    const cartItem = cart.find((item) => item.id === productId)
    return cartItem ? cartItem.quantity : 0
  }

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
                <Dialog.Panel className="w-full transform overflow-hidden bg-white shadow-xl transition-all flex flex-col h-screen">
                  {/* Header fijo - Mobile optimized */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 sticky top-0 z-10 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-lg font-bold text-white">Nuevo Reparto</h2>
                          <p className="text-xs text-blue-100">Agrega productos y completa</p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="text-white hover:bg-blue-800 transition-colors p-2 rounded-full"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Cliente y Repartidor - Horizontal scroll friendly */}
                    <div className="grid grid-cols-1 gap-2">
                      {/* Cliente */}
                      <button
                        onClick={() => setShowCustomerSelector(true)}
                        className="flex items-center space-x-3 p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all transform active:scale-95 shadow-sm"
                      >
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {customer ? customer.name : "Seleccionar cliente"}
                          </p>
                        </div>
                        <div className="text-gray-400 flex-shrink-0">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      {/* Repartidor - Mostrar solo el usuario autenticado */}
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-90 rounded-lg shadow-sm">
                        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <TruckIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repartidor</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {authenticatedUser?.name || authenticatedUser?.email || "Usuario"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buscador - Integrado en header */}
                    <div className="mt-3">
                      <ProductSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
                    </div>
                  </div>

                  {/* Contenido con scroll - Área de productos */}
                  <div className="flex-1 overflow-y-auto pb-24">
                    {/* Lista de productos */}
                    <div className="divide-y divide-gray-200">
                      {loading && displayProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                          <span className="text-sm text-gray-500">Cargando productos...</span>
                        </div>
                      ) : displayProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mb-3" />
                          <p className="text-sm text-gray-500 text-center px-4">
                            {searchTerm ? "No se encontraron productos" : "Busca productos para comenzar"}
                          </p>
                        </div>
                      ) : (
                        displayProducts.map((product) => {
                          const cartQuantity = getCartQuantity(product.id)
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleAddToCart(product)}
                              className="w-full p-4 hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center space-x-3 text-left"
                            >
                              {/* Imagen grande para móvil */}
                              <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                {product.image ? (
                                  <img
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="text-sm font-bold text-gray-900 flex-1">{product.name}</h4>
                                  {cartQuantity > 0 && (
                                    <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold ml-2 flex-shrink-0">
                                      <ShoppingCartIcon className="h-3 w-3 mr-1" />
                                      {formatStock(cartQuantity, product.unit_type, false)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-lg font-bold text-blue-600">
                                    {formatCurrency(product.price)}
                                    {product.unit_type === "kg" && <span className="text-sm text-gray-600">/kg</span>}
                                  </span>
                                  <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                    Stock: {formatStock(product.stock, product.unit_type)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Footer fijo - Carrito y botón de procesar */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl">
                    {/* Mini carrito info */}
                    {cart.length > 0 && (
                      <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Carrito: {cart.length} artículo(s)</p>
                              <p className="text-sm font-bold text-blue-600">
                                Total: {formatCurrency(cart.reduce((sum, item) => sum + item.totalPrice, 0))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-2 p-4">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 text-sm py-3 font-medium rounded-lg bg-transparent"
                      >
                        Cancelar
                      </Button>
                      <DeliveryCart buttonMode={true} onClose={handleClose} />
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

      <QuantityModal />
      <DeliveryPaymentModal onClose={handleClose} />
    </>
  )
}

export default DeliveryForm
