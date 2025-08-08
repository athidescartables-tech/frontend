"use client"

import { useState } from "react"
import { TrashIcon, MinusIcon, PlusIcon, ShoppingCartIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline"
import { usePurchaseStore } from "@/stores/purchaseStore"
import { useSupplierStore } from "@/stores/supplierStore"
import { formatCurrency } from "@/lib/formatters"
import Button from "@/components/common/Button"

const PurchaseCart = () => {
  const {
    purchaseCart,
    selectedSupplier,
    removeFromPurchaseCart,
    updatePurchaseCartItem,
    clearPurchaseCart,
    setSelectedSupplier,
    getPurchaseCartTotals,
    setShowConfirmationModal,
  } = usePurchaseStore()

  const { suppliers } = useSupplierStore()
  const [showSupplierSelect, setShowSupplierSelect] = useState(false)

  const { subtotal, tax, total } = getPurchaseCartTotals()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromPurchaseCart(productId)
    } else {
      updatePurchaseCartItem(productId, { quantity: newQuantity })
    }
  }

  const handleCostChange = (productId, newCost) => {
    updatePurchaseCartItem(productId, { unitCost: Number.parseFloat(newCost) || 0 })
  }

  if (purchaseCart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Carrito vacío</h3>
          <p className="mt-1 text-sm text-gray-500">Agrega productos para comenzar una compra</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header del carrito */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Carrito ({purchaseCart.length} productos)</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearPurchaseCart}
          className="text-red-600 hover:text-red-700 bg-transparent"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>

      {/* Selección de proveedor */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Proveedor</label>
          <Button variant="outline" size="sm" onClick={() => setShowSupplierSelect(!showSupplierSelect)}>
            <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
            {selectedSupplier ? "Cambiar" : "Seleccionar"}
          </Button>
        </div>

        {selectedSupplier ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <p className="font-medium text-gray-900">{selectedSupplier.name}</p>
              <p className="text-sm text-gray-500">{selectedSupplier.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Saldo actual</p>
              <p className={`font-medium ${selectedSupplier.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(Math.abs(selectedSupplier.balance))}
                {selectedSupplier.balance < 0 ? " (a favor)" : " (deuda)"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Selecciona un proveedor para continuar</p>
        )}

        {showSupplierSelect && (
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {suppliers.map((supplier) => (
              <button
                key={supplier.id}
                onClick={() => {
                  setSelectedSupplier(supplier)
                  setShowSupplierSelect(false)
                }}
                className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-sm text-gray-500">{supplier.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${supplier.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(Math.abs(supplier.balance))}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items del carrito */}
      <div className="max-h-96 overflow-y-auto">
        {purchaseCart.map((item) => (
          <div key={item.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-sm text-gray-500">{formatCurrency(item.unitCost)} c/u</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFromPurchaseCart(item.id)}
                  className="p-1 rounded-md hover:bg-red-100 text-red-600 ml-2"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Costo:</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitCost}
                  onChange={(e) => handleCostChange(item.id, e.target.value)}
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <span className="text-sm text-gray-500">Subtotal: {formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (21%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button
          onClick={() => setShowConfirmationModal(true)}
          className="w-full mt-4"
          size="lg"
          disabled={!selectedSupplier || purchaseCart.length === 0}
        >
          Procesar Compra
        </Button>
      </div>
    </div>
  )
}

export default PurchaseCart
