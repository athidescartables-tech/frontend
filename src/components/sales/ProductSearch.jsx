"use client"

import { useState, useRef } from "react"
import { useProductStore } from "../../stores/productStore"
import { useSalesStore } from "../../stores/salesStore"
import { MagnifyingGlassIcon, QrCodeIcon } from "@heroicons/react/24/outline"

const ProductSearch = ({ onSearchChange, searchTerm }) => {
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false)
  const inputRef = useRef(null)

  const { getProductByBarcode } = useProductStore()
  const { addToCart } = useSalesStore()

  const handleBarcodeSearch = () => {
    if (isSearchingBarcode) {
      // Si ya está en modo código de barras, buscar el producto
      if (searchTerm.trim()) {
        const product = getProductByBarcode(searchTerm.trim())
        if (product && product.active && product.stock > 0) {
          addToCart(product, 1)
          onSearchChange("")
          setIsSearchingBarcode(false)
          inputRef.current?.focus()
        } else {
          alert("Producto no encontrado o sin stock")
        }
      }
    } else {
      // Activar modo código de barras
      setIsSearchingBarcode(true)
      onSearchChange("")
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && isSearchingBarcode) {
      handleBarcodeSearch()
    } else if (e.key === "Escape") {
      setIsSearchingBarcode(false)
      onSearchChange("")
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    onSearchChange(value)
  }

  const cancelBarcodeMode = () => {
    setIsSearchingBarcode(false)
    onSearchChange("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Campo de búsqueda */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isSearchingBarcode
                ? "Escanea o ingresa el código de barras..."
                : "Buscar productos por nombre o descripción..."
            }
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
              isSearchingBarcode ? "border-blue-300 bg-blue-50" : "border-gray-300"
            }`}
          />
          {isSearchingBarcode && (
            <div className="absolute inset-y-0 right-10 flex items-center">
              <button
                onClick={cancelBarcodeMode}
                className="text-gray-400 hover:text-gray-600 text-sm"
                title="Cancelar búsqueda por código"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Botón de código de barras */}
        <button
          onClick={handleBarcodeSearch}
          className={`px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors ${
            isSearchingBarcode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-primary-600 text-white hover:bg-primary-700"
          }`}
          title={isSearchingBarcode ? "Buscar código de barras" : "Activar búsqueda por código de barras"}
        >
          <QrCodeIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Indicador de modo código de barras */}
      {isSearchingBarcode && (
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
          📱 Modo código de barras activo - Presiona Enter o el botón para buscar
        </div>
      )}
    </div>
  )
}

export default ProductSearch
