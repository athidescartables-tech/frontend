"use client"

import { useState } from "react"
import { useSalesStore } from "../../stores/salesStore"
import { formatCurrency, formatStock, validateQuantity, getUnitLabel } from "../../lib/formatters"
import { PAYMENT_METHODS } from "../../lib/constants"
import Button from "../common/Button"
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline"

const Cart = () => {
  const {
    cart,
    cartTotal,
    customer,
    paymentMethod,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setShowPaymentModal,
  } = useSalesStore()


  const [editingQuantity, setEditingQuantity] = useState(null)
  const [tempQuantity, setTempQuantity] = useState("")
  
   const finalTotal = cartTotal // SIN descuentos


  const handleQuantityChange = (item, delta) => {
    const currentQuantity = item.quantity
    let newQuantity

    if (item.unit_type === "kg") {
      newQuantity = Math.max(0.01, currentQuantity + delta * 0.01) // Changed delta from 0.001 to 0.01
      newQuantity = Math.round(newQuantity * 100) / 100 // Round to 2 decimal places
    } else {
      newQuantity = Math.max(1, currentQuantity + delta)
    }

    if (newQuantity <= item.stock) {
      updateCartItemQuantity(item.id, newQuantity)
    }
  }

  const startEditingQuantity = (item) => {
    setEditingQuantity(item.id)
    // Format tempQuantity to 2 decimal places for kg products
    setTempQuantity(item.unit_type === "kg" ? item.quantity.toFixed(2) : item.quantity.toString())
  }

  const confirmQuantityEdit = (item) => {
    const newQuantity = Number.parseFloat(tempQuantity)

    // Round newQuantity to 2 decimal places for kg products
    const roundedNewQuantity = item.unit_type === "kg" ? Math.round(newQuantity * 100) / 100 : newQuantity;

    if (validateQuantity(roundedNewQuantity, item.unit_type) && roundedNewQuantity > 0 && roundedNewQuantity <= item.stock) {
      updateCartItemQuantity(item.id, roundedNewQuantity)
    } else {
      // Revert to original quantity if invalid
      setTempQuantity(item.unit_type === "kg" ? item.quantity.toFixed(2) : item.quantity.toString())
    }

    setEditingQuantity(null)
  }

  const cancelQuantityEdit = () => {
    setEditingQuantity(null)
    setTempQuantity("")
  }

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Carrito vacío</h3>
          <p className="mt-1 text-sm text-gray-500">Agrega productos para comenzar una venta</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-10rem)]">
      {/* Header del carrito */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Carrito de Compras</h3>
            <p className="text-sm text-gray-600">
              {cart.length} producto{cart.length !== 1 ? "s" : ""} • {formatCurrency(finalTotal)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 bg-white border-red-200 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Items del carrito - REDISEÑADO más minimalista */}
      <div className="flex-1 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={item.id}
            className="px-4 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {/* Imagen más pequeña */}
              <div className="h-9 w-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <PhotoIcon className="h-4 w-4 text-gray-400" /> 
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Nombre y precio unitario */}
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                  <span className="text-xs text-gray-500 ml-1">
                    ({formatCurrency(item.price)}/{getUnitLabel(item.unit_type)})
                  </span>
                </h4>
                {/* Descripción */}
                {item.description && <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>}

                {/* Controles de cantidad y subtotal */}
                <div className="flex items-center justify-between mt-1">
                  {/* Controles de cantidad más compactos */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      className="p-0.5 rounded-md hover:bg-gray-200 text-gray-600"
                      disabled={
                        (item.unit_type === "kg" && item.quantity <= 0.01) || // Changed from 0.001 to 0.01
                        (item.unit_type === "unidades" && item.quantity <= 1)
                      }
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>

                    {/* Campo de cantidad editable más pequeño */}
                    {editingQuantity === item.id ? (
                      <input
                        type="number"
                        value={tempQuantity}
                        onChange={(e) => setTempQuantity(e.target.value)}
                        onBlur={() => confirmQuantityEdit(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmQuantityEdit(item)
                          if (e.key === "Escape") cancelQuantityEdit()
                        }}
                        className="w-14 text-center text-xs font-medium border border-gray-300 rounded px-1 py-0.5"
                        step={item.unit_type === "kg" ? "0.01" : "1"} // Changed step to 0.01
                        min={item.unit_type === "kg" ? "0.01" : "1"} // Changed min to 0.01
                        max={item.stock}
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => startEditingQuantity(item)}
                        className="min-w-[2.5rem] text-center text-xs font-medium hover:bg-gray-200 rounded px-1.5 py-0.5"
                        title="Clic para editar cantidad"
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

                  {/* Subtotal del item */}
                  <div className="text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(item.totalPrice)} {/* Changed to item.totalPrice */}
                  </div>
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

      {/* Totales - REDISEÑADO más elegante SIN descuentos */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 flex-shrink-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(cartTotal)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(finalTotal)}</span>
          </div>

          {/* Información del método de pago más compacta */}
          <div className="text-xs text-gray-500 text-center bg-white rounded-lg py-1.5 px-2 border">
            <div className="flex items-center justify-center space-x-1">
              <span>
                {paymentMethod === PAYMENT_METHODS.CUENTA_CORRIENTE
                  ? "💳 Cuenta Corriente"
                  : paymentMethod === PAYMENT_METHODS.TARJETA_CREDITO
                    ? "💳 Tarjeta Crédito"
                    : paymentMethod === PAYMENT_METHODS.TRANSFERENCIA
                      ? "🏦 Transferencia"
                      : "💵 Efectivo"}
              </span>
              {customer && <span>• {customer.name}</span>}
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowPaymentModal(true)}
          className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          size="lg"
          disabled={cart.length === 0} // Only disable if cart is empty
        >
          {"Procesar Venta"}
        </Button>
      </div>
    </div>
  )
}

export default Cart
