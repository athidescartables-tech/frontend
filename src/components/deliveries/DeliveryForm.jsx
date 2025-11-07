"use client"

import { useState, useEffect } from "react"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { useCustomerStore } from "../../stores/customerStore"
import { useUserStore } from "../../stores/authStore"
import { XMarkIcon } from "@heroicons/react/24/outline"

const DeliveryForm = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    driver_id: "",
    items: [],
    total: 0,
    notes: "",
  })

  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 1,
    unit_price: 0,
  })

  const { createDelivery, loading: deliveryLoading } = useDeliveriesStore()
  const { customers, fetchCustomers } = useCustomerStore()
  const { users, fetchUsers } = useUserStore()

  useEffect(() => {
    if (show) {
      fetchCustomers()
      fetchUsers()
    }
  }, [show])

  const handleAddItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      return
    }

    const itemSubtotal = newItem.quantity * newItem.unit_price

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...newItem,
          subtotal: itemSubtotal,
        },
      ],
      total: prev.total + itemSubtotal,
    }))

    setNewItem({
      product_id: "",
      quantity: 1,
      unit_price: 0,
    })
  }

  const handleRemoveItem = (index) => {
    const item = formData.items[index]
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      total: prev.total - item.subtotal,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.customer_id || !formData.driver_id || formData.items.length === 0) {
      alert("Completa todos los campos requeridos")
      return
    }

    try {
      await createDelivery(formData)
      setFormData({
        customer_id: "",
        driver_id: "",
        items: [],
        total: 0,
        notes: "",
      })
      onClose()
    } catch (error) {
      console.error("Error creating delivery:", error)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:max-w-2xl rounded-t-lg md:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold">Nuevo Reparto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Cliente *</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone || "Sin teléfono"}
                </option>
              ))}
            </select>
          </div>

          {/* Repartidor */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Repartidor *</label>
            <select
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un repartidor</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Productos *</label>

            {formData.items.length > 0 && (
              <div className="mb-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        Cant: {item.quantity} x ${item.unit_price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Cantidad"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Precio unitario"
                step="0.01"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Agregar Producto
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <span className="text-sm text-gray-600">Total del Reparto:</span>
            <div className="text-2xl font-bold text-gray-900">${formData.total.toFixed(2)}</div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={deliveryLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {deliveryLoading ? "Creando..." : "Crear Reparto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeliveryForm
