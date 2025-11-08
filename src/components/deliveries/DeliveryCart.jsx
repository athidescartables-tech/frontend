"use client"

import { useState } from "react"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { formatCurrency, formatStock } from "../../lib/formatters"
import Button from "../common/Button"
import { TrashIcon, MinusIcon, PlusIcon, ShoppingCartIcon, PhotoIcon } from "@heroicons/react/24/outline"

const DeliveryCart = ({ buttonMode = false, onClose }) => {
  const { cart, cartTotal, customer, driver, updateCartItemQuantity, removeFromCart, clearCart, setShowPaymentModal } =
    useDeliveriesStore()

  const [editingQuantity, setEditingQuantity] = useState(null)
  const [tempQuantity, setTempQuantity] = useState("")

  if (buttonMode) {
    return (
      <Button
        onClick={() => {
          if (cart.length === 0) return
          setShowPaymentModal(true)
        }}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-3 font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={cart.length === 0 || !customer || !driver}
      >
        <ShoppingCartIcon className="h-5 w-5 inline mr-2" />
        {!customer ? "Selecciona Cliente" : !driver ? "Selecciona Repartidor" : `Procesar (${cart.length})`}
      </Button>
    )
  }

  const handleQuantityChange = (item, delta) => {
    const currentQuantity = item.quantity
    let newQuantity

    if (item.unit_type === "kg") {
      newQuantity = Math.max(0.01, currentQuantity + delta * 0.01)
      newQuantity = Math.round(newQuantity * 100) / 100
    } else {
      newQuantity = Math.max(1, currentQuantity + delta)
    }

    if (newQuantity <= item.stock) {
      updateCartItemQuantity(item.id, newQuantity)
    }
  }

  const startEditingQuantity = (item) => {
    setEditingQuantity(item.id)
    setTempQuantity(item.unit_type === "kg" ? item.quantity.toFixed(2) : item.quantity.toString())
  }

  const confirmQuantityEdit = (item) => {
    const newQuantity = Number.parseFloat(tempQuantity)
    const roundedNewQuantity = item.unit_type === "kg" ? Math.round(newQuantity * 100) / 100 : newQuantity

    if (roundedNewQuantity > 0 && roundedNewQuantity <= item.stock) {
      updateCartItemQuantity(item.id, roundedNewQuantity)
    }
    setEditingQuantity(null)
  }

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Carrito vacío</h3>
          <p className="mt-1 text-sm text-gray-500">Agrega productos para el reparto</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full max-h-[calc(100vh-16rem)]">
      {/* Header del carrito */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Carrito</h3>
            <p className="text-xs text-gray-600">
              {cart.length} producto{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 bg-white border-red-200 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items del carrito */}
      <div className="flex-1 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={`${item.id}-${item.price_level || 1}`}
            className="px-4 py-2 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center space-x-2">
              {/* Imagen */}
              <div className="h-9 w-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <PhotoIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Nombre y precio */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                    <span className="text-xs text-gray-500 ml-1">
                      ({formatCurrency(item.unit_price)}/{item.unit_type === "kg" ? "kg" : "u"})
                    </span>
                  </h4>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      className="p-0.5 rounded-md hover:bg-gray-200 text-gray-600"
                      disabled={
                        (item.unit_type === "kg" && item.quantity <= 0.01) ||
                        (item.unit_type === "unidades" && item.quantity <= 1)
                      }
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>

                    {editingQuantity === item.id ? (
                      <input
                        type="number"
                        value={tempQuantity}
                        onChange={(e) => setTempQuantity(e.target.value)}
                        onBlur={() => confirmQuantityEdit(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmQuantityEdit(item)
                          if (e.key === "Escape") setEditingQuantity(null)
                        }}
                        className="w-14 text-center text-xs font-medium border border-gray-300 rounded px-1 py-0.5"
                        step={item.unit_type === "kg" ? "0.01" : "1"}
                        min={item.unit_type === "kg" ? "0.01" : "1"}
                        max={item.stock}
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => startEditingQuantity(item)}
                        className="min-w-[2.5rem] text-center text-xs font-medium hover:bg-gray-200 rounded px-1.5 py-0.5"
                      >
                        {formatStock(item.quantity, item.unit_type, false)}
                      </button>
                    )}

                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      className="p-0.5 rounded-md hover:bg-gray-200 text-gray-600"
                      disabled={item.quantity >= item.stock}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-0.5 rounded-md hover:bg-red-100 text-red-600 ml-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</div>
                </div>

                {/* Advertencia de stock */}
                {item.quantity >= item.stock && (
                  <p className="text-xs text-red-500 font-medium mt-0.5">Stock máximo alcanzado</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totales y botón de procesar */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="space-y-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(cartTotal)}</span>
          </div>
        </div>

        <Button
          onClick={() => setShowPaymentModal(true)}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
          size="lg"
          disabled={cart.length === 0 || !customer || !driver}
        >
          {!customer ? "Selecciona Cliente" : !driver ? "Selecciona Repartidor" : "Procesar Reparto"}
        </Button>
      </div>
    </div>
  )
}

export default DeliveryCart
