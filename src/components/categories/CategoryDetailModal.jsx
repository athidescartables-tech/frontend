"use client"

import { useEffect, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useProductStore } from "../../stores/productStore"
import { formatCurrency, formatNumber } from "../../lib/formatters"
import Button from "../common/Button"
import {
  XMarkIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  SwatchIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"

const CategoryDetailModal = ({ category, onClose }) => {
  const { products } = useProductStore()
  const [categoryProducts, setCategoryProducts] = useState([])

  useEffect(() => {
    if (category && products.length > 0) {
      const filtered = products.filter((p) => p.category_id === category.id && p.active)
      setCategoryProducts(filtered)
    }
  }, [category, products])

  if (!category) return null

  // Calcular estadísticas
  const stats = {
    totalProducts: categoryProducts.length,
    totalStock: categoryProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
    totalValue: categoryProducts.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0),
    averagePrice:
      categoryProducts.length > 0
        ? categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) / categoryProducts.length
        : 0,
    lowStockProducts: categoryProducts.filter((p) => p.stock <= p.min_stock).length,
  }

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                        style={{
                          backgroundColor: category.color + "20",
                          color: category.color,
                        }}
                      >
                        {category.icon}
                      </div>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                        {category.name}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        {category.description || "Sin descripción"}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.active ? "Activa" : "Inactiva"}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {category.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.totalProducts)}</p>
                          <p className="text-sm text-blue-600 font-medium">Productos</p>
                        </div>
                        <TagIcon className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-green-700">{formatNumber(stats.totalStock)}</p>
                          <p className="text-sm text-green-600 font-medium">Stock Total</p>
                        </div>
                        <CubeIcon className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.totalValue)}</p>
                          <p className="text-sm text-purple-600 font-medium">Valor Total</p>
                        </div>
                        <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats.averagePrice)}</p>
                          <p className="text-sm text-orange-600 font-medium">Precio Promedio</p>
                        </div>
                        <ChartBarIcon className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-red-700">{formatNumber(stats.lowStockProducts)}</p>
                          <p className="text-sm text-red-600 font-medium">Stock Bajo</p>
                        </div>
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* Información de la categoría */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <InformationCircleIcon className="h-6 w-6 text-gray-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Información de la Categoría</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <SwatchIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Color</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                          <span className="text-sm text-gray-900 font-mono">{category.color}</span>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <TagIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Icono</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-lg mr-2">{category.icon}</span>
                          <span className="text-sm text-gray-900">Emoji</span>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Creada</span>
                        </div>
                        <p className="text-sm text-gray-900 mt-2">
                          {new Date(category.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Actualizada</span>
                        </div>
                        <p className="text-sm text-gray-900 mt-2">
                          {new Date(category.updated_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Productos en esta categoría ({categoryProducts.length})
                      </h3>
                    </div>

                    {categoryProducts.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <TagIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No hay productos en esta categoría</h4>
                        <p className="text-sm text-gray-500">Los productos asignados a esta categoría aparecerán aquí</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {categoryProducts.map((product) => (
                              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <img
                                      src={product.image || "/placeholder.svg?height=40&width=40&query=product"}
                                      alt={product.name}
                                      className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                                    />
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                      <div className="text-sm text-gray-500">{product.barcode}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(product.price)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                      product.stock <= product.min_stock
                                        ? "bg-red-100 text-red-800"
                                        : product.stock <= product.min_stock * 2
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {product.stock} unidades
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(product.stock * product.price)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl"
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
  )
}

export default CategoryDetailModal
