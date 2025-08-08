"use client"

import { useState, useMemo } from "react"
import { useProductStore } from "../../stores/productStore"
import { useCategoryStore } from "../../stores/categoryStore"
import { usePurchaseStore } from "../../stores/purchaseStore"
import { formatCurrency } from "../../lib/formatters"
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

const ProductListPurchase = ({ searchTerm }) => {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  const { products, searchProducts } = useProductStore()
  const { categories } = useCategoryStore()
  const { addToPurchaseCart, purchaseCart } = usePurchaseStore()

  // Filtrar solo categorías activas
  const activeCategories = categories.filter((category) => category.active)

  // Filtrar, buscar y ordenar productos
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

    // Ordenar resultados
    result.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "category":
          const aCat = categories.find((cat) => cat.id === a.categoryId)
          const bCat = categories.find((cat) => cat.id === b.categoryId)
          aValue = aCat?.name.toLowerCase() || ""
          bValue = bCat?.name.toLowerCase() || ""
          break
        case "cost":
          aValue = a.cost || 0
          bValue = b.cost || 0
          break
        case "stock":
          aValue = a.stock
          bValue = b.stock
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
  }, [products, searchTerm, selectedCategory, categories, searchProducts, sortField, sortDirection])

  const handleAddToPurchaseCart = (product) => {
    addToPurchaseCart(product, 1, product.cost || 0)
  }

  const getCartQuantity = (productId) => {
    const cartItem = purchaseCart.find((item) => item.id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
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

  // Componente para el header de ordenamiento
  const SortHeader = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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

      {/* Instrucción para el usuario */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Haz doble clic en cualquier fila para agregar el producto al carrito de compras
        </p>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <SortHeader field="name">Producto</SortHeader>
                <SortHeader field="category">Categoría</SortHeader>
                <SortHeader field="cost">Costo</SortHeader>
                <SortHeader field="stock">Stock</SortHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  En Carrito
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const category = categories.find((cat) => cat.id === product.categoryId)
                const cartQuantity = getCartQuantity(product.id)

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onDoubleClick={() => handleAddToPurchaseCart(product)}
                    title="Doble clic para agregar al carrito de compras"
                  >
                    {/* Imagen */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={product.image || "/placeholder.svg?height=64&width=64"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Producto */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 mb-1">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                        )}
                        {product.barcode && (
                          <div className="text-xs text-gray-400 font-mono mt-1">{product.barcode}</div>
                        )}
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category?.name || "Sin categoría"}
                      </span>
                    </td>

                    {/* Costo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.cost ? formatCurrency(product.cost) : "No definido"}
                      </div>
                      {product.price && (
                        <div className="text-xs text-gray-500">Precio venta: {formatCurrency(product.price)}</div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock <= product.minStock
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                        {product.minStock && <span className="text-xs text-gray-400">Mín: {product.minStock}</span>}
                      </div>
                    </td>

                    {/* En Carrito */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cartQuantity > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cartQuantity}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
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
          {sortField && (
            <span className="ml-2">
              - Ordenado por {sortField} ({sortDirection === "asc" ? "ascendente" : "descendente"})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductListPurchase
