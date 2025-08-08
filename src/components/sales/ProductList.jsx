"use client"

import { useState, useMemo, useEffect } from "react"
import { useProductStore } from "../../stores/productStore"
import { useCategoryStore } from "../../stores/categoryStore"
import { useSalesStore } from "../../stores/salesStore"
import { formatCurrency, formatStock } from "../../lib/formatters"
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PhotoIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline"

const ProductList = ({ searchTerm }) => {
  const [sortField, setSortField] = useState("total_sold")
  const [sortDirection, setSortDirection] = useState("desc")

  const { topSellingProducts, fetchTopSellingProducts, searchProducts } = useProductStore()
  const { categories } = useCategoryStore()
  const { setSelectedProduct, setShowQuantityModal, cart } = useSalesStore()

  // CORREGIDO: useEffect sin dependencias problemáticas
  useEffect(() => {
    let isMounted = true

    const loadTopSellingProducts = async () => {
      try {
        if (isMounted) {
          await fetchTopSellingProducts(10)
        }
      } catch (error) {
        console.error("Error loading top selling products:", error)
      }
    }

    // Solo cargar si no hay productos
    if (topSellingProducts.length === 0) {
      loadTopSellingProducts()
    }

    return () => {
      isMounted = false
    }
  }, []) // CORREGIDO: Dependencias vacías para evitar bucles

  // Filtrar, buscar y ordenar productos
  const filteredProducts = useMemo(() => {
    let result = topSellingProducts.filter((product) => product.active)

    // Aplicar búsqueda por texto si hay término de búsqueda
    if (searchTerm && searchTerm.trim()) {
      result = searchProducts(searchTerm.trim()).filter((product) => product.active)
    }

    // Ordenar resultados
    result.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "stock":
          aValue = a.stock
          bValue = b.stock
          break
        case "total_sold":
          aValue = a.total_sold || 0
          bValue = b.total_sold || 0
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return result
  }, [topSellingProducts, searchTerm, searchProducts, sortField, sortDirection])

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

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection(field === "total_sold" ? "desc" : "asc")
    }
  }

  // Componente para el header de ordenamiento
  const SortHeader = ({ field, children, className = "" }) => (
    <th
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field &&
          (sortDirection === "asc" ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />)}
      </div>
    </th>
  )

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

      {/* Tabla de productos optimizada */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortHeader field="name" className="min-w-0">Producto</SortHeader>
                <SortHeader field="category" className="w-32">Categoría</SortHeader>
                <SortHeader field="price" className="w-28">Precio</SortHeader>
                <SortHeader field="stock" className="w-24">Stock</SortHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product, index) => {
                const category = categories.find((cat) => cat.id === product.category_id)
                const cartQuantity = getCartQuantity(product.id)
                const isTopSeller = index < 3

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors relative ${
                      product.stock === 0
                        ? "bg-gray-50 opacity-60 cursor-not-allowed"
                        : isTopSeller
                          ? "hover:bg-orange-50 cursor-pointer bg-orange-25"
                          : "hover:bg-blue-50 cursor-pointer"
                    }`}
                    onClick={() => handleAddToCart(product)}
                    title={
                      product.stock === 0
                        ? "Sin stock disponible"
                        : `Clic para agregar ${product.unit_type === "kg" ? "cantidad personalizada" : "1 unidad"} al carrito`
                    }
                  >
                    {/* Producto con imagen, nombre, descripción y carrito */}
                    <td className="px-3 py-4 min-w-0">
                      <div className="flex items-center space-x-3">
                        {/* Imagen */}
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className={`h-full w-full object-cover ${product.stock === 0 ? "opacity-50" : ""}`}
                            />
                          ) : (
                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="text-sm font-medium text-gray-900 truncate flex-1">
                              {product.name}
                            </div>
                            {/* Badge de carrito minimalista */}
                            {cartQuantity > 0 && (
                              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                                <ShoppingCartIcon className="h-3 w-3 mr-1" />
                                {formatStock(cartQuantity, product.unit_type, false)}
                              </div>
                            )}
                          </div>
                          
                          {/* Descripción con tooltip */}
                          {product.description && (
                            <div 
                              className="text-sm text-gray-500 truncate cursor-help"
                              title={product.description}
                            >
                              {product.description}
                            </div>
                          )}
                          
                          {/* Código de barras */}
                          {product.barcode && (
                            <div className="text-xs text-gray-400 font-mono truncate" title={`Código: ${product.barcode}`}>
                              {product.barcode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-full">
                        {category?.name || "Sin categoría"}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                        {product.unit_type === "kg" && <div className="text-xs text-blue-600 font-medium">por kg</div>}
                      </div>
                      {product.cost && (
                        <div className="text-xs text-gray-500 truncate">
                          Costo: {formatCurrency(product.cost)}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock <= product.min_stock
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {formatStock(product.stock, product.unit_type)}
                        </span>
                        {product.min_stock && (
                          <span className="text-xs text-gray-400">
                            Mín: {formatStock(product.min_stock, product.unit_type)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
              <p className="text-gray-500 text-xl mb-2">No hay productos más vendidos disponibles</p>
              <p className="text-gray-400">No hay productos más vendidos en el sistema</p>
            </div>
          )}
        </div>
      )}

      {/* Resumen */}
      {filteredProducts.length > 0 && (
        <div className="text-sm text-gray-500 text-center py-4 border-t border-gray-100">
          Mostrando {filteredProducts.length} de los productos más vendidos
          {searchTerm && searchTerm.trim() && ` para "${searchTerm}"`}
          {sortField && (
            <span className="ml-2">
              - Ordenado por {sortField === "total_sold" ? "más vendidos" : sortField} (
              {sortDirection === "asc" ? "ascendente" : "descendente"})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductList
