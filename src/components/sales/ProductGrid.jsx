"use client"

import { useMemo, useEffect } from "react"
import { useProductStore } from "../../stores/productStore"
import { useCategoryStore } from "../../stores/categoryStore"
import { useSalesStore } from "../../stores/salesStore"
import { formatCurrency, formatStock } from "../../lib/formatters"
import Button from "../common/Button"
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon, StarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"

const ProductGrid = ({ searchTerm }) => {
  const { topSellingProducts, fetchTopSellingProducts, searchProducts } = useProductStore()
  const { categories } = useCategoryStore()
  const { setSelectedProduct, setShowQuantityModal, cart } = useSalesStore()

  // CORREGIDO: useEffect sin dependencias problemáticas
  useEffect(() => {
    let isMounted = true

    const loadTopSellingProducts = async () => {
      try {
        if (isMounted && topSellingProducts.length === 0) {
          await fetchTopSellingProducts(10)
        }
      } catch (error) {
        console.error("Error loading top selling products:", error)
      }
    }

    loadTopSellingProducts()

    return () => {
      isMounted = false
    }
  }, []) // CORREGIDO: Dependencias vacías para evitar bucles

  // Filtrar y buscar productos
  const filteredProducts = useMemo(() => {
    let result = topSellingProducts.filter((product) => product.active)

    // Aplicar búsqueda por texto si hay término de búsqueda
    if (searchTerm && searchTerm.trim()) {
      result = searchProducts(searchTerm.trim()).filter((product) => product.active)
    }

    // Ordenar por cantidad vendida (más vendidos primero)
    result.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))

    return result
  }, [topSellingProducts, searchTerm, searchProducts])

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      setSelectedProduct(product)
      setShowQuantityModal(true)
    }
  }

  const getCartQuantity = (productId) => {
    const cartItem = cart.find((item) => item.id === productId)
    return cartItem ? cartItem.quantity : 0
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

      {/* Grid de productos compacto - exactamente 3 columnas */}
      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map((product, index) => {
          const category = categories.find((cat) => cat.id === product.category_id)
          const cartQuantity = getCartQuantity(product.id)
          const isTopSeller = index < 3

          return (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 relative group h-full flex flex-col ${
                isTopSeller ? "border-gray-200 ring-1 ring-gray-100" : "border-gray-200"
              }`}
            >
              {/* Badge de cantidad en carrito */}
              {cartQuantity > 0 && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 font-bold z-10 shadow-sm flex items-center">
                  <ShoppingCartIcon className="h-3 w-3 mr-1" />
                  {formatStock(cartQuantity, product.unit_type, false)}
                </div>
              )}

              {/* Badge de stock */}
              {product.stock === 0 ? (
                <div className="absolute top-8 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10 shadow-sm">
                  Sin Stock
                </div>
              ) : product.stock <= product.min_stock && (
                <div className="absolute top-8 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10 shadow-sm">
                  Stock Bajo
                </div>
              )}

              {/* Imagen del producto - más compacta */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
                      product.stock === 0 ? "opacity-50" : ""
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className={`absolute inset-0 transition-all duration-200 ${
                  isTopSeller 
                    ? "bg-gradient-to-t from-orange-900/20 to-transparent group-hover:from-orange-900/30"
                    : "bg-black bg-opacity-0 group-hover:bg-opacity-10"
                }`} />
              </div>

              {/* Contenido de la tarjeta - más compacto */}
              <div className="p-3 flex-1 flex flex-col">
                {/* Nombre del producto */}
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1 min-h-[2.5rem]"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                </div>

                {/* Categoría y estadísticas de venta en una línea */}
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800 truncate max-w-[60%]">
                    {category?.name || "Sin categoría"}
                  </span>
                </div>

                {/* Descripción compacta */}
                {product.description && (
                  <p 
                    className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[2rem] cursor-help" 
                    title={product.description}
                  >
                    {product.description}
                  </p>
                )}

                {/* Precio y stock en una línea */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(product.price)}
                      {product.unit_type === "kg" && <span className="text-xs text-blue-600 font-normal"> /kg</span>}
                    </span>
                    {product.cost && (
                      <span className="text-xs text-gray-400">
                        Costo: {formatCurrency(product.cost)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock <= product.min_stock
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {formatStock(product.stock, product.unit_type)}
                    </div>
                    {product.min_stock && (
                      <div className="text-xs text-gray-400">
                        Mín: {formatStock(product.min_stock, product.unit_type)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón agregar - más compacto */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  size="sm"
                  className={`w-full text-sm font-medium transition-all mt-auto ${
                    isTopSeller 
                      ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                      : ""
                  }`}
                  disabled={product.stock === 0}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {product.stock === 0 ? "Sin Stock" : `Agregar ${product.unit_type === "kg" ? "cantidad" : "1u"}`}
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
              </p>
            </div>
          ) : (
            <div>
              <StarIcon className="h-16 w-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-2">No hay productos más vendidos disponibles</p>
              <p className="text-gray-400">No hay productos más vendidos en el sistema</p>
            </div>
          )}
        </div>
      )}

      {/* Resumen */}
      {filteredProducts.length > 0 && (
        <div className="text-sm text-gray-500 text-center py-4 border-t border-gray-100">
          Mostrando {filteredProducts.length} de los productos más vendidos (ordenados por popularidad)
          {searchTerm && searchTerm.trim() && ` para "${searchTerm}"`}
        </div>
      )}
    </div>
  )
}

export default ProductGrid
