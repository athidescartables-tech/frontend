import { create } from "zustand"
import { useStockStore } from "./stockStore"
import { useSupplierStore } from "./supplierStore"
import { STOCK_MOVEMENTS, PAYMENT_METHODS } from "@/lib/constants"

export const usePurchaseStore = create((set, get) => ({
  // Estado del carrito de compras
  purchaseCart: [],

  // Compras realizadas
  purchases: [
    {
      id: 1001,
      supplierId: 1,
      supplierName: "Distribuidora Norte S.A.",
      date: new Date("2024-01-15").toISOString(),
      items: [
        {
          id: 1,
          name: "Coca Cola 500ml",
          quantity: 50,
          unitCost: 350.0,
          total: 17500.0,
        },
        {
          id: 2,
          name: "Pan Lactal Bimbo",
          quantity: 25,
          unitCost: 650.0,
          total: 16250.0,
        },
      ],
      subtotal: 33750.0,
      tax: 7087.5,
      total: 40837.5,
      paymentMethod: PAYMENT_METHODS.TRANSFERENCIA,
      status: "completed",
      user: "Admin",
      notes: "Compra inicial de stock",
    },
    {
      id: 1002,
      supplierId: 2,
      supplierName: "Lácteos del Sur",
      date: new Date("2024-01-20").toISOString(),
      items: [
        {
          id: 3,
          name: "Leche La Serenísima 1L",
          quantity: 30,
          unitCost: 420.0,
          total: 12600.0,
        },
      ],
      subtotal: 12600.0,
      tax: 2646.0,
      total: 15246.0,
      paymentMethod: PAYMENT_METHODS.CUENTA_CORRIENTE,
      status: "completed",
      user: "Comprador",
      notes: "Reposición de lácteos",
    },
  ],

  selectedSupplier: null,
  loading: false,

  // Acciones del carrito
  addToPurchaseCart: (product, quantity = 1, unitCost = 0) => {
    set((state) => {
      const existingItem = state.purchaseCart.find((item) => item.id === product.id)

      if (existingItem) {
        return {
          purchaseCart: state.purchaseCart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total: (item.quantity + quantity) * (unitCost || item.unitCost),
                }
              : item,
          ),
        }
      }

      return {
        purchaseCart: [
          ...state.purchaseCart,
          {
            ...product,
            quantity,
            unitCost: unitCost || product.cost || 0,
            total: quantity * (unitCost || product.cost || 0),
          },
        ],
      }
    })
  },

  removeFromPurchaseCart: (productId) => {
    set((state) => ({
      purchaseCart: state.purchaseCart.filter((item) => item.id !== productId),
    }))
  },

  updatePurchaseCartItem: (productId, updates) => {
    set((state) => ({
      purchaseCart: state.purchaseCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              ...updates,
              total: (updates.quantity || item.quantity) * (updates.unitCost || item.unitCost),
            }
          : item,
      ),
    }))
  },

  clearPurchaseCart: () => {
    set({ purchaseCart: [], selectedSupplier: null })
  },

  setSelectedSupplier: (supplier) => {
    set({ selectedSupplier: supplier })
  },

  // Calcular totales del carrito
  getPurchaseCartTotals: () => {
    const { purchaseCart } = get()
    const subtotal = purchaseCart.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.21 // IVA 21%
    const total = subtotal + tax

    return { subtotal, tax, total }
  },

  // Procesar compra
  processPurchase: async (paymentData) => {
    const { purchaseCart, selectedSupplier } = get()

    if (purchaseCart.length === 0 || !selectedSupplier) {
      throw new Error("Carrito vacío o proveedor no seleccionado")
    }

    set({ loading: true })

    try {
      const { subtotal, tax, total } = get().getPurchaseCartTotals()

      const newPurchase = {
        id: Date.now(),
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        date: new Date().toISOString(),
        items: [...purchaseCart],
        subtotal,
        tax,
        total,
        paymentMethod: paymentData.method,
        status: "completed",
        user: "Usuario Actual", // En producción vendría del auth store
        notes: paymentData.notes || "",
      }

      // Agregar la compra
      set((state) => ({
        purchases: [newPurchase, ...state.purchases],
      }))

      // Actualizar stock para cada producto comprado
      const stockStore = useStockStore.getState()
      purchaseCart.forEach((item) => {
        stockStore.addStockMovement({
          productId: item.id,
          type: STOCK_MOVEMENTS.ENTRADA,
          quantity: item.quantity,
          reason: "Compra",
          cost: item.unitCost,
          supplier: selectedSupplier.name,
          purchaseId: newPurchase.id,
        })
      })

      // Si es cuenta corriente, actualizar la cuenta del proveedor
      if (paymentData.method === PAYMENT_METHODS.CUENTA_CORRIENTE) {
        const supplierStore = useSupplierStore.getState()
        supplierStore.addAccountMovement(selectedSupplier.id, {
          type: "debit",
          amount: total,
          description: `Compra #${newPurchase.id}`,
          reference: `COMPRA-${newPurchase.id}`,
        })
      }

      // Limpiar carrito
      get().clearPurchaseCart()

      return newPurchase
    } catch (error) {
      console.error("Error al procesar compra:", error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  // Obtener compras por rango de fechas
  getPurchasesByDateRange: (startDate, endDate) => {
    return get().purchases.filter((purchase) => {
      const purchaseDate = new Date(purchase.date)
      return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate)
    })
  },

  // Obtener compras por proveedor
  getPurchasesBySupplier: (supplierId) => {
    return get().purchases.filter((purchase) => purchase.supplierId === supplierId)
  },

  // Obtener estadísticas de compras
  getPurchaseStats: () => {
    const purchases = get().purchases
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const todayPurchases = purchases.filter((p) => new Date(p.date) >= startOfDay)
    const monthPurchases = purchases.filter((p) => new Date(p.date) >= startOfMonth)

    const todayTotal = todayPurchases.reduce((sum, p) => sum + p.total, 0)
    const monthTotal = monthPurchases.reduce((sum, p) => sum + p.total, 0)

    return {
      totalPurchases: purchases.length,
      todayPurchases: todayPurchases.length,
      monthPurchases: monthPurchases.length,
      todayTotal,
      monthTotal,
    }
  },
}))
