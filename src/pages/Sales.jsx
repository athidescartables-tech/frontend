"use client"

import { useState, useEffect, useRef } from "react"
import { useProductStore } from "../stores/productStore"
import { useCategoryStore } from "../stores/categoryStore"
import { useCustomerStore } from "../stores/customerStore"
import { useSalesStore } from "../stores/salesStore"
import ProductSearch from "../components/sales/ProductSearch"
import ProductGrid from "../components/sales/ProductGrid"
import ProductList from "../components/sales/ProductList"
import Cart from "../components/sales/Cart"
import PaymentModal from "../components/sales/PaymentModal"
import QuantityModal from "../components/sales/QuantityModal"
import PrintTicketModal from "../components/sales/PrintTicketModal"
import TicketPreviewModal from "../components/sales/TicketPreviewModal"
import { Squares2X2Icon, ListBulletIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

const Sales = () => {
  const [viewMode, setViewMode] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [saleType, setSaleType] = useState("venta") // Add sale type state
  const { fetchTopSellingProducts, topSellingProducts, loading } = useProductStore()
  const { fetchCategories } = useCategoryStore()
  const { initializeStore: initializeCustomerStore } = useCustomerStore()
  const {
    setCustomer,
    customer,
    showPrintTicketModal,
    setShowPrintTicketModal,
    showTicketPreviewModal,
    setShowTicketPreviewModal,
    lastCompletedSale,
  } = useSalesStore()

  // NUEVO: Ref para controlar inicialización
  const isInitialized = useRef(false)

  // CORREGIDO: Cargar datos iniciales una sola vez
  useEffect(() => {
    if (isInitialized.current) return

    let isMounted = true
    isInitialized.current = true

    const loadInitialData = async () => {
      try {
        console.log("🚀 Inicializando datos de ventas...")

        // Cargar datos en paralelo para mejor performance
        const promises = []

        // Solo cargar productos si no hay datos
        if (topSellingProducts.length === 0) {
          promises.push(fetchTopSellingProducts(10))
        }

        // Cargar categorías
        promises.push(fetchCategories({ active: "true" }))

        // Inicializar store de clientes
        promises.push(initializeCustomerStore())

        // Ejecutar todas las promesas en paralelo
        await Promise.allSettled(promises)

        console.log("✅ Datos iniciales cargados")
      } catch (error) {
        console.error("❌ Error loading initial data:", error)
      }
    }

    if (isMounted) {
      loadInitialData()
    }

    return () => {
      isMounted = false
    }
  }, []) // Solo ejecutar una vez

  const handleSearchChange = (term) => {
    setSearchTerm(term)
  }

  const handleRefreshTopProducts = async () => {
    try {
      await fetchTopSellingProducts(10, true)
    } catch (error) {
      console.error("Error refreshing top products:", error)
    }
  }

  const handlePrintTicket = () => {
    setShowPrintTicketModal(false)
    setShowTicketPreviewModal(true)
  }

  const handleSkipTicket = () => {
    setShowPrintTicketModal(false)
  }

  const handleCloseTicketPreview = () => {
    setShowTicketPreviewModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header ACTUALIZADO con botón de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus ventas con los {topSellingProducts.length} productos más vendidos
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* NUEVO: Botón de refresh */}
          <button
            onClick={handleRefreshTopProducts}
            disabled={loading}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Actualizar productos más vendidos"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 mr-2">Vista:</span>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary-100 text-primary-600"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
              title="Vista en tarjetas"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary-100 text-primary-600"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
              title="Vista en tabla"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Operación</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="saleType"
              value="venta"
              checked={saleType === "venta"}
              onChange={(e) => setSaleType(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Venta (Local)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="saleType"
              value="reparto"
              checked={saleType === "reparto"}
              onChange={(e) => setSaleType(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Reparto (Repartidor)</span>
          </label>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Productos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buscador */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <ProductSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
          </div>

          {/* Grid/Lista de productos OPTIMIZADA */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {loading && topSellingProducts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mr-3" />
                <span className="text-gray-500">Cargando productos más vendidos...</span>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <ProductGrid searchTerm={searchTerm} />
                ) : (
                  <ProductList searchTerm={searchTerm} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Columna derecha - Carrito */}
        <div className="lg:col-span-1">
          <div className="sticky top-12">
            <Cart />
          </div>
        </div>
      </div>

      {/* Modales */}
      <PaymentModal />
      <QuantityModal />

      <PrintTicketModal
        show={showPrintTicketModal}
        onClose={handleSkipTicket}
        onPrintTicket={handlePrintTicket}
        onSkip={handleSkipTicket}
      />

      <TicketPreviewModal
        show={showTicketPreviewModal}
        onClose={handleCloseTicketPreview}
        saleData={lastCompletedSale}
      />
    </div>
  )
}

export default Sales
