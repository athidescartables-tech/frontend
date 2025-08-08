"use client"

import { useState, useMemo } from "react"
import { useProductStore } from "../../stores/productStore"
import { useCategoryStore } from "../../stores/categoryStore"
import { usePurchaseStore } from "../../stores/purchaseStore"
import { formatCurrency } from "../../lib/formatters"
import Button from "../common/Button"
import { PlusIcon, MagnifyingGlassIcon, MinusIcon } from "@heroicons/react/24/outline"

const ProductGridPurchase = ({ searchTerm }) => {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const { products, searchProducts } = useProductStore()
  const { categories } = useCategoryStore()
  const { addToPurchaseCart, purchaseCart, updatePurchaseCartItem } = usePurchaseStore()

  // Filtrar solo categorías activas
  const activeCategories = categories.filter((category) => category.active)

  // Filtrar y buscar productos
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => product.active)

    // Aplicar búsqueda por texto si hay término de búsqueda
    if (searchTerm && searchTerm.trim()) {
      result = searchProducts(searchTerm.trim()).filter((product) => product.active)
    }

    // Aplicar filtro por categoría
    if (selectedCategory !== "Todos") {
      result = result.filter((product) => {
        const category = categories.find((cat) => cat.id === product.categoryId)
        return category && category.name === selectedCategory
      })
    }

    return result
  }, [products, searchTerm, selectedCategory, categories, searchProducts])

  const handleAddToPurchaseCart = (product, quantity = 1, unitCost = null) => {
    const cost = unitCost !== null ? unitCost : product.cost || 0
    addToPurchaseCart(product, quantity, cost)
  }

  const getCartItem = (productId) => {
    return purchaseCart.find((item) => item.id === productId)
  }

  const handleQuantityChange = (product, newQuantity) => {
    if (newQuantity <= 0) return
    const cartItem = getCartItem(product.id)
    if (cartItem) {
      updatePurchaseCartItem(product.id, newQuantity, cartItem.unitCost)
    } else {
      handleAddToPurchaseCart(product, newQuantity)
    }
  }

  const handleCostChange = (product, newCost) => {
    if (newCost < 0) return
    const cartItem = getCartItem(product.id)
    if (cartItem) {
      updatePurchaseCartItem(product.id, cartItem.quantity, newCost)
    } else {
      handleAddToPurchaseCart(product, 1, newCost)
    }
  }

  // Contar productos por categoría (considerando la búsqueda)
  const getCategoryCount = (categoryName) => {
    let baseProducts = products.filter((product) => product.active)

    // Si hay búsqueda, usar los resultados de búsqueda
    if (searchTerm && searchTerm.trim()) {
      baseProducts = searchProducts(searchTerm.trim()).filter((product) => product.active)
    }

    if (categoryName === "Todos") {
      return baseProducts.length
    }

    return baseProducts.filter((product) => {
      const category = categories.find((cat) => cat.id === product.categoryId)
      return category && category.name === categoryName
    }).length
  }

  return (
    <div className="space-y-4">
      {/* Indicador de búsqueda activa */}
      {searchTerm && searchTerm.trim() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700">
                Buscando: "<strong>{searchTerm}</strong>" - {filteredProducts.length} resultado(s)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("Todos")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "Todos"
              ? "bg-primary-100 text-primary-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Todos ({getCategoryCount("Todos")})
        </button>
        {activeCategories.map((category) => {
          const categoryProductCount = getCategoryCount(category.name)

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? "bg-primary-100 text-primary-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${categoryProductCount === 0 ? "opacity-50" : ""}`}
              disabled={categoryProductCount === 0}
            >
              {category.name} ({categoryProductCount})
            </button>
          )
        })}
      </div>

      {/* Grid de productos - 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const category = categories.find((cat) => cat.id === product.categoryId)
          const cartItem = getCartItem(product.id)

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 relative group"
            >
              {/* Badge de cantidad en carrito */}
              {cartItem && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold z-10 shadow-lg">
                  {cartItem.quantity}
                </div>
              )}

              {/* Badge de stock bajo */}
              {product.stock <= product.minStock && product.stock > 0 && (
                <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10 shadow-sm">
                  Stock Bajo
                </div>
              )}

              {/* Badge sin stock */}
              {product.stock === 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10 shadow-sm">
                  Sin Stock
                </div>
              )}

              {/* Imagen del producto */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg?height=300&width=400"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4">
                {/* Nombre del producto */}
                <h3
                  className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]"
                  title={product.name}
                >
                  {product.name}
                </h3>

                {/* Categoría */}
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {category?.name || "Sin categoría"}
                  </span>
                </div>

                {/* Descripción */}
                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]" title={product.description}>
                    {product.description}
                  </p>
                )}

                {/* Código de barras */}
                {product.barcode && (
                  <div
                    className="text-xs text-gray-500 mb-3 font-mono bg-gray-50 px-2 py-1 rounded truncate"
                    title={`Código: ${product.barcode}`}
                  >
                    {product.barcode}
                  </div>
                )}

                {/* Costo y stock */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary-600">
                      {product.cost ? formatCurrency(product.cost) : "No definido"}
                    </span>
                    {product.price && (
                      <span className="text-xs text-gray-400">Precio venta: {formatCurrency(product.price)}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock <= product.minStock
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      Stock: {product.stock}
                    </div>
                    {product.minStock && <div className="text-xs text-gray-400">Mín: {product.minStock}</div>}
                  </div>
                </div>

                {/* Controles de cantidad y costo si está en carrito */}
                {cartItem ? (
                  <div className="space-y-3 mb-4">
                    {/* Control de cantidad */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(product, cartItem.quantity - 1)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
                          disabled={cartItem.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(product, cartItem.quantity + 1)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Control de costo unitario */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Costo unitario:</span>
                      <input
                        type="number"
                        value={cartItem.unitCost}
                        onChange={(e) => handleCostChange(product, Number.parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(cartItem.quantity * cartItem.unitCost)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4" />
                )}

                {/* Botón agregar */}
                <Button
                  onClick={() => handleAddToPurchaseCart(product)}
                  size="lg"
                  className="w-full h-12 text-base font-medium"
                  variant={cartItem ? "outline" : "default"}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {cartItem ? "Agregar Más" : "Agregar a Compra"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mensaje cuando no hay productos */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          {searchTerm && searchTerm.trim() ? (
            <div>
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-2">No se encontraron productos</p>
              <p className="text-gray-400">
                No hay productos que coincidan con "<strong>{searchTerm}</strong>"
                {selectedCategory !== "Todos" && ` en la categoría "${selectedCategory}"`}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-xl mb-2">No hay productos disponibles</p>
              <p className="text-gray-400">
                {selectedCategory !== "Todos"
                  ? `No hay productos en la categoría "${selectedCategory}"`
                  : "No hay productos activos en el sistema"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resumen */}
      {filteredProducts.length > 0 && (
        <div className="text-sm text-gray-500 text-center py-4 border-t border-gray-100">
          Mostrando {filteredProducts.length} producto(s)
          {searchTerm && searchTerm.trim() && ` para "${searchTerm}"`}
          {selectedCategory !== "Todos" && ` en "${selectedCategory}"`}
        </div>
      )}
    </div>
  )
}

export default ProductGridPurchase
