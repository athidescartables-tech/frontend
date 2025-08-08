import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useSupplierStore = create(
  persist(
    (set, get) => ({
      // Lista de proveedores
      suppliers: [
        {
          id: 1,
          name: "Distribuidora Central S.A.",
          email: "ventas@distribuidoracentral.com.ar",
          phone: "+54 11 4567-8901",
          cuit: "30-12345678-9",
          taxCondition: "responsable_inscripto",
          address: {
            street: "Av. Industrial 1500",
            city: "Buenos Aires",
            province: "CABA",
            postalCode: "1407",
          },
          contactPerson: "Roberto Martínez",
          contactPhone: "+54 11 4567-8902",
          paymentTerms: 30, // días
          discount: 5.0, // porcentaje
          currentBalance: -15000.0, // Negativo = debemos dinero
          creditLimit: 100000.0,
          registrationDate: "2024-01-05",
          lastPurchase: "2024-01-18",
          totalPurchases: 125750.5,
          status: "active",
          category: "distribuidor",
          notes: "Proveedor principal de bebidas y snacks",
        },
        {
          id: 2,
          name: "Alimentos del Norte Ltda.",
          email: "compras@alimentosdelnorte.com",
          phone: "+54 381 456-7890",
          cuit: "30-87654321-2",
          taxCondition: "responsable_inscripto",
          address: {
            street: "Ruta Nacional 9 Km 1234",
            city: "Tucumán",
            province: "Tucumán",
            postalCode: "4000",
          },
          contactPerson: "María Elena Gómez",
          contactPhone: "+54 381 456-7891",
          paymentTerms: 45,
          discount: 3.0,
          currentBalance: 5000.0, // Positivo = nos deben dinero
          creditLimit: 75000.0,
          registrationDate: "2023-11-15",
          lastPurchase: "2024-01-19",
          totalPurchases: 89320.75,
          status: "active",
          category: "fabricante",
          notes: "Especializado en productos regionales",
        },
        {
          id: 3,
          name: "Limpieza Total S.R.L.",
          email: "info@limpiezatotal.com.ar",
          phone: "+54 11 2345-6789",
          cuit: "30-11223344-5",
          taxCondition: "responsable_inscripto",
          address: {
            street: "Parque Industrial Sur Lote 45",
            city: "La Plata",
            province: "Buenos Aires",
            postalCode: "1900",
          },
          contactPerson: "Carlos Fernández",
          contactPhone: "+54 11 2345-6790",
          paymentTerms: 21,
          discount: 2.5,
          currentBalance: -8750.0,
          creditLimit: 50000.0,
          registrationDate: "2024-01-10",
          lastPurchase: "2024-01-17",
          totalPurchases: 32150.0,
          status: "active",
          category: "servicios",
          notes: "Productos de limpieza e higiene",
        },
      ],

      // Movimientos de cuenta corriente con proveedores
      supplierMovements: [
        {
          id: 1,
          supplierId: 1,
          type: "purchase",
          amount: -12000.0, // Negativo = debemos
          description: "Compra - Productos varios",
          date: "2024-01-18T14:30:00",
          reference: "COMPRA-001",
          balance: -15000.0,
          user: "Admin",
        },
        {
          id: 2,
          supplierId: 1,
          type: "payment",
          amount: 10000.0, // Positivo = pagamos
          description: "Pago por transferencia",
          date: "2024-01-17T10:15:00",
          reference: "PAGO-001",
          balance: -3000.0,
          user: "Admin",
        },
        {
          id: 3,
          supplierId: 2,
          type: "credit_note",
          amount: 5000.0,
          description: "Nota de crédito - Devolución",
          date: "2024-01-19T16:45:00",
          reference: "NC-001",
          balance: 5000.0,
          user: "Admin",
        },
        {
          id: 4,
          supplierId: 3,
          type: "purchase",
          amount: -8750.0,
          description: "Compra inicial - Productos de limpieza",
          date: "2024-01-17T11:20:00",
          reference: "COMPRA-002",
          balance: -8750.0,
          user: "Admin",
        },
      ],

      // Configuración
      settings: {
        defaultPaymentTerms: 30,
        defaultDiscount: 0.0,
        requireCuit: true,
        allowNegativeBalance: true,
        maxCreditLimit: 1000000.0,
      },

      loading: false,
      searchQuery: "",
      selectedSupplier: null,

      // Acciones
      addSupplier: async (supplierData) => {
        set({ loading: true })
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const newSupplier = {
            ...supplierData,
            id: Date.now(),
            registrationDate: new Date().toISOString().split("T")[0],
            currentBalance: 0,
            totalPurchases: 0,
            lastPurchase: null,
            status: "active",
          }

          set((state) => ({
            suppliers: [newSupplier, ...state.suppliers],
            loading: false,
          }))

          return { success: true, supplier: newSupplier }
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateSupplier: async (supplierId, supplierData) => {
        set({ loading: true })
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))

          set((state) => ({
            suppliers: state.suppliers.map((supplier) =>
              supplier.id === supplierId ? { ...supplier, ...supplierData } : supplier,
            ),
            loading: false,
          }))

          return { success: true }
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteSupplier: async (supplierId) => {
        set({ loading: true })
        try {
          await new Promise((resolve) => setTimeout(resolve, 500))

          set((state) => ({
            suppliers: state.suppliers.filter((supplier) => supplier.id !== supplierId),
            loading: false,
          }))

          return { success: true }
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      // Movimientos de cuenta corriente
      addSupplierMovement: (supplierId, movement) => {
        const supplier = get().suppliers.find((s) => s.id === supplierId)
        if (!supplier) return

        const newMovement = {
          ...movement,
          id: Date.now(),
          supplierId,
          date: new Date().toISOString(),
          user: "Usuario Actual",
          balance: supplier.currentBalance + movement.amount,
        }

        set((state) => ({
          supplierMovements: [newMovement, ...state.supplierMovements],
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === supplierId
              ? {
                  ...supplier,
                  currentBalance: newMovement.balance,
                  lastPurchase:
                    movement.type === "purchase" ? new Date().toISOString().split("T")[0] : supplier.lastPurchase,
                  totalPurchases:
                    movement.type === "purchase"
                      ? supplier.totalPurchases + Math.abs(movement.amount)
                      : supplier.totalPurchases,
                }
              : supplier,
          ),
        }))
      },

      // Búsqueda y filtros
      setSearchQuery: (query) => set({ searchQuery: query }),

      getFilteredSuppliers: () => {
        const { suppliers, searchQuery } = get()
        if (!searchQuery) return suppliers

        return suppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.phone.includes(searchQuery) ||
            supplier.cuit.includes(searchQuery) ||
            supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      },

      getSupplierById: (id) => get().suppliers.find((supplier) => supplier.id === id),

      getSupplierMovements: (supplierId) =>
        get().supplierMovements.filter((movement) => movement.supplierId === supplierId),

      // Estadísticas
      getSupplierStats: () => {
        const suppliers = get().suppliers
        const activeSuppliers = suppliers.filter((s) => s.status === "active")
        const suppliersWithDebt = suppliers.filter((s) => s.currentBalance < 0) // Nosotros debemos
        const suppliersWithCredit = suppliers.filter((s) => s.currentBalance > 0) // Nos deben

        const totalDebt = suppliersWithDebt.reduce((sum, s) => sum + Math.abs(s.currentBalance), 0)
        const totalCredit = suppliersWithCredit.reduce((sum, s) => sum + s.currentBalance, 0)
        const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0)

        return {
          totalSuppliers: suppliers.length,
          activeSuppliers: activeSuppliers.length,
          suppliersWithDebt: suppliersWithDebt.length,
          suppliersWithCredit: suppliersWithCredit.length,
          totalDebt, // Lo que debemos
          totalCredit, // Lo que nos deben
          totalPurchases,
          netBalance: totalCredit - totalDebt,
        }
      },

      // Configuración
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
    }),
    {
      name: "supplier-storage",
      partialize: (state) => ({
        suppliers: state.suppliers,
        supplierMovements: state.supplierMovements,
        settings: state.settings,
      }),
    },
  ),
)
