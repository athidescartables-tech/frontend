"use client"

import { useState } from "react"
import ProductSearchPurchase from "../components/purchases/ProductSearchPurchase"
import ProductGridPurchase from "../components/purchases/ProductGridPurchase"
import ProductListPurchase from "../components/purchases/ProductListPurchase"
import PurchaseCart from "../components/purchases/PurchaseCart"
import PurchaseConfirmationModal from "../components/purchases/PurchaseConfirmationModal"
import { Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline"

const Purchases = () => {
  const [viewMode, setViewMode] = useState("list") // Vista lista por defecto
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchChange = (term) => {
    setSearchTerm(term)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Compras</h1>
          <p className="mt-1 text-sm text-gray-500">Administra las compras a proveedores de forma eficiente</p>
        </div>
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

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Productos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buscador */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <ProductSearchPurchase onSearchChange={handleSearchChange} searchTerm={searchTerm} />
          </div>

          {/* Grid/Lista de productos */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {viewMode === "grid" ? (
              <ProductGridPurchase searchTerm={searchTerm} />
            ) : (
              <ProductListPurchase searchTerm={searchTerm} />
            )}
          </div>
        </div>

        {/* Columna derecha - Carrito */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <PurchaseCart />
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <PurchaseConfirmationModal />
    </div>
  )
}

export default Purchases
