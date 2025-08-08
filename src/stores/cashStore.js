import { create } from "zustand"
import { persist } from "zustand/middleware"
import { cashService } from "../services/cashService"
import { clearCacheForUrl } from "../config/api" // Import the cache clearing function

export const useCashStore = create(
  persist(
    (set, get) => ({
      // Estado actual de la caja
      currentCash: {
        id: null,
        openingDate: null,
        openingAmount: 0,
        currentAmount: 0, // Solo efectivo físico
        expectedAmount: 0, // Solo efectivo físico esperado
        isOpen: false,
        openedBy: null,
        lastMovement: null,
        // CORREGIDO: Separación clara por método de pago (SIN cuenta corriente)
        salesCash: 0, // Solo ventas en efectivo (afecta caja física)
        salesCard: 0, // Solo ventas con tarjeta (NO afecta caja física)
        salesTransfer: 0, // Solo transferencias (NO afecta caja física)
        totalSales: 0, // Número de ventas
        // CORREGIDO: Separar depósitos de pagos cuenta corriente POR MÉTODO
        deposits: 0, // Solo depósitos normales (afecta caja física)
        pagosCuentaCorrienteEfectivo: 0, // NUEVO: Pagos cta cte en efectivo (afecta caja física)
        pagosCuentaCorrienteTarjeta: 0, // NUEVO: Pagos cta cte con tarjeta (NO afecta caja física)
        pagosCuentaCorrienteTransferencia: 0, // NUEVO: Pagos cta cte por transferencia (NO afecta caja física)
        // NUEVO: Total general de todos los métodos procesados
        totalGeneralAmount: 0, // Suma de efectivo + tarjeta + transferencia + pagos cta cte
      },

      // Movimientos de caja (solo sesión actual, sin ventas cuenta corriente)
      cashMovements: [],

      // Historial de cierres
      cashHistory: [],
      historyPagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },

      // Configuración
      settings: {
        minCashAmount: 2000.0,
        maxCashAmount: 20000.0,
        autoCloseTime: "22:00",
        requireCountForClose: true,
        allowNegativeCash: false,
      },

      loading: false,
      error: null,
      isLoadingHistory: false,
      isLoadingStatus: false,
      lastStatusFetch: null,

      // Acciones
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // CORREGIDO: Obtener estado actual CON pagos cuenta corriente separados por método
      fetchCurrentStatus: async () => {
        const state = get()
        const now = Date.now()

        if (state.isLoadingStatus || (state.lastStatusFetch && now - state.lastStatusFetch < 2000)) {
          console.warn("⚠️ Evitando llamada múltiple al estado de caja")
          return state.currentCash
        }

        set({ loading: true, error: null, isLoadingStatus: true, lastStatusFetch: now })

        try {
          console.log("🔄 Cargando estado de caja...")
          const response = await cashService.getCurrentStatus()

          if (response && response.success === true) {
            const sessionData = response.data.session || {}
            const movements = Array.isArray(response.data.movements) ? response.data.movements : []
            const settings = response.data.settings || {}

            // CORREGIDO: Usar los datos separados por método de pago del backend
            const newCashState = {
              id: sessionData.id || null,
              openingDate: sessionData.opening_date || null,
              openingAmount: Number(sessionData.opening_amount || 0),
              // CRÍTICO: currentAmount es SOLO efectivo físico
              currentAmount: Number(sessionData.calculated_amount || 0),
              expectedAmount: Number(sessionData.calculated_amount || 0),
              isOpen: Boolean(sessionData.status === "open"),
              openedBy: sessionData.opened_by_name || null,
              lastMovement: sessionData.lastMovement || null,

              // CORREGIDO: Separación clara por método de pago (SIN cuenta corriente)
              salesCash: Number(sessionData.sales_cash || 0), // Solo efectivo (SÍ afecta caja)
              salesCard: Number(sessionData.sales_card || 0), // Solo tarjeta (NO afecta caja)
              salesTransfer: Number(sessionData.sales_transfer || 0), // Solo transferencias (NO afecta caja)
              totalSales: Number(sessionData.total_sales || 0),

              // CORREGIDO: Separar depósitos de pagos cuenta corriente POR MÉTODO
              deposits: Number(sessionData.deposits || 0), // Solo depósitos normales
              pagosCuentaCorrienteEfectivo: Number(sessionData.pagos_cuenta_corriente_efectivo || 0), // Pagos cta cte en efectivo
              pagosCuentaCorrienteTarjeta: Number(sessionData.pagos_cuenta_corriente_tarjeta || 0), // Pagos cta cte con tarjeta
              pagosCuentaCorrienteTransferencia: Number(sessionData.pagos_cuenta_corriente_transferencia || 0), // Pagos cta cte por transferencia

              // NUEVO: Total general de todos los métodos procesados
              totalGeneralAmount: Number(sessionData.total_general_amount || 0),
            }

            set({
              currentCash: newCashState,
              cashMovements: movements,
              settings: {
                minCashAmount: Number(settings.min_cash_amount || 2000.0),
                maxCashAmount: Number(settings.max_cash_amount || 20000.0),
                autoCloseTime: settings.auto_close_time || "22:00",
                requireCountForClose: Boolean(settings.require_count_for_close ?? true),
                allowNegativeCash: Boolean(settings.allow_negative_cash ?? false),
              },
              loading: false,
              isLoadingStatus: false,
              error: null,
            })

            console.log("✅ Estado actualizado correctamente (PAGOS CTA CTE SEPARADOS POR MÉTODO)")
            console.log("💰 LÓGICA CONTABLE APLICADA:")
            console.log("  - Efectivo físico en caja:", newCashState.currentAmount)
            console.log("  - Ventas efectivo (afecta caja):", newCashState.salesCash)
            console.log("  - Ventas tarjeta (NO afecta caja):", newCashState.salesCard)
            console.log("  - Ventas transferencia (NO afecta caja):", newCashState.salesTransfer)
            console.log("  - Depósitos normales (afecta caja):", newCashState.deposits)
            console.log("  - Pagos cta cte EFECTIVO (afecta caja):", newCashState.pagosCuentaCorrienteEfectivo)
            console.log("  - Pagos cta cte TARJETA (NO afecta caja):", newCashState.pagosCuentaCorrienteTarjeta)
            console.log("  - Pagos cta cte TRANSFERENCIA (NO afecta caja):", newCashState.pagosCuentaCorrienteTransferencia)
            console.log("  - Total general:", newCashState.totalGeneralAmount)

            return newCashState
          } else {
            throw new Error(response?.message || "Error en la respuesta del servidor")
          }
        } catch (error) {
          console.error("💥 Error fetching cash status:", error)
          set({
            error: error.response?.data?.message || error.message || "Error al cargar el estado de caja",
            loading: false,
            isLoadingStatus: false,
          })
          throw error
        }
      },

      // Abrir caja
      openCash: async (openingAmount, notes = "") => {
        set({ loading: true, error: null })
        try {
          const response = await cashService.openCash(openingAmount, notes)
          if (response && response.success) {
            clearCacheForUrl('/cash/status'); // Invalidate cache for status
            await get().fetchCurrentStatus()
          }
          return response
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          })
          throw error
        }
      },

      // CORREGIDO: Cerrar caja con lógica contable correcta SIN cuenta corriente
      closeCash: async (countData, notes = "") => {
        set({ loading: true, error: null })
        try {
          // Calcular monto físico contado si se proporciona
          let physicalCount = null
          if (countData && (countData.bills || countData.coins)) {
            physicalCount = get().calculateCountedAmount(countData)
          } else if (countData && countData.physicalAmount !== undefined) {
            physicalCount = countData.physicalAmount
          }

          const response = await cashService.closeCash(notes, physicalCount)

          if (response && response.success) {
            set({ cashMovements: [] })
            clearCacheForUrl('/cash/status'); // Invalidate cache for status
            await get().fetchCurrentStatus()
          }
          return response
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          })
          throw error
        }
      },

      // Agregar movimiento
      addCashMovement: async (movement) => {
        set({ loading: true, error: null })
        try {
          const response = await cashService.addMovement(
            movement.type,
            movement.amount,
            movement.description,
            movement.reference,
          )

          if (response && response.success) {
            set((state) => ({
              cashMovements: [response.data, ...state.cashMovements],
              loading: false,
            }))
            clearCacheForUrl('/cash/status'); // Invalidate cache for status
            await get().fetchCurrentStatus()
          }
          return response
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          })
          throw error
        }
      },

      // Obtener movimientos
      fetchMovements: async (params = {}) => {
        set({ loading: true, error: null })
        try {
          const response = await cashService.getMovements(params)
          if (response && response.success) {
            set({
              cashMovements: response.data.movements,
              loading: false,
            })
          }
          return response
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          })
          throw error
        }
      },

      // Obtener historial
      fetchHistory: async (params = {}) => {
        const state = get()
        if (state.isLoadingHistory) {
          console.warn("⚠️ Ya hay una solicitud de historial en progreso")
          return
        }

        set({ loading: true, error: null, isLoadingHistory: true })
        try {
          const response = await cashService.getCashHistory(params)
          if (response && response.success) {
            set({
              cashHistory: response.data.history || [],
              historyPagination: response.data.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                pages: 0,
              },
              loading: false,
              isLoadingHistory: false,
            })
          }
          return response
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message || "Error al cargar historial",
            loading: false,
            isLoadingHistory: false,
          })
          throw error
        }
      },

      // Obtener detalles de sesión
      fetchSessionDetails: async (sessionId) => {
        set({ loading: true, error: null })
        try {
          const response = await cashService.getSessionDetails(sessionId)
          if (response && response.success) {
            set({ loading: false })
            return response.data
          }
          throw new Error(response?.message || "Error al obtener detalles")
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          })
          throw error
        }
      },

      // CORREGIDO: Cálculo de arqueo físico
      calculateCountedAmount: (countData) => {
        const billsTotal = Object.entries(countData.bills || {}).reduce(
          (sum, [denomination, quantity]) => sum + Number.parseInt(denomination) * (Number.parseInt(quantity) || 0),
          0,
        )

        const coinsTotal = Object.entries(countData.coins || {}).reduce(
          (sum, [denomination, quantity]) => sum + Number.parseInt(denomination) * (Number.parseInt(quantity) || 0),
          0,
        )

        return billsTotal + coinsTotal
      },

      // CORREGIDO: Estadísticas del día con pagos cuenta corriente separados por método y cancelaciones
      getTodayStats: () => {
        const state = get()
        const movements = state.cashMovements

        // CRÍTICO: Solo contar movimientos que afectan el efectivo físico
        const cashSales = movements
          .filter((m) => m.type === "sale" && m.payment_method === "efectivo")
          .reduce((sum, m) => sum + Number.parseFloat(m.amount || 0), 0)

        const expenses = movements
          .filter((m) => m.type === "expense")
          .reduce((sum, m) => sum + Math.abs(Number.parseFloat(m.amount || 0)), 0)

        const withdrawals = movements
          .filter((m) => m.type === "withdrawal")
          .reduce((sum, m) => sum + Math.abs(Number.parseFloat(m.amount || 0)), 0)

        // CORREGIDO: Separar depósitos normales de pagos cuenta corriente
        const deposits = movements
          .filter((m) => m.type === "deposit" && !(
            m.description && (
              m.description.toLowerCase().includes("cuenta corriente") ||
              m.description.toLowerCase().includes("pago cuenta") ||
              m.description.toLowerCase().includes("cta cte") ||
              m.description.toLowerCase().includes("cta. cte")
            )
          ))
          .reduce((sum, m) => sum + Number.parseFloat(m.amount || 0), 0)

        // CORREGIDO: Separar pagos cuenta corriente por método de pago
        const pagosCuentaCorrienteEfectivo = movements
          .filter((m) => m.type === "deposit" && 
            m.description && (
              m.description.toLowerCase().includes("cuenta corriente") ||
              m.description.toLowerCase().includes("pago cuenta") ||
              m.description.toLowerCase().includes("cta cte") ||
              m.description.toLowerCase().includes("cta. cte")
            ) && 
            m.payment_method === "efectivo"
          )
          .reduce((sum, m) => sum + Number.parseFloat(m.amount || 0), 0)

        const pagosCuentaCorrienteTarjeta = movements
          .filter((m) => m.type === "deposit" && 
            m.description && (
              m.description.toLowerCase().includes("cuenta corriente") ||
              m.description.toLowerCase().includes("pago cuenta") ||
              m.description.toLowerCase().includes("cta cte") ||
              m.description.toLowerCase().includes("cta. cte")
            ) && 
            (m.payment_method === "tarjeta_credito" || m.payment_method === "tarjeta_debito" || m.payment_method === "tarjeta")
          )
          .reduce((sum, m) => sum + Number.parseFloat(m.amount || 0), 0)

        const pagosCuentaCorrienteTransferencia = movements
          .filter((m) => m.type === "deposit" && 
            m.description && (
              m.description.toLowerCase().includes("cuenta corriente") ||
              m.description.toLowerCase().includes("pago cuenta") ||
              m.description.toLowerCase().includes("cta cte") ||
              m.description.toLowerCase().includes("cta. cte")
            ) && 
            (m.payment_method === "transferencia" || m.payment_method === "transfer")
          )
          .reduce((sum, m) => sum + Number.parseFloat(m.amount || 0), 0)

        // NUEVO: Calcular cancelaciones del día
        const cancellations = movements
          .filter((m) => m.type === "cancellation")
          .reduce((sum, m) => sum + Math.abs(Number.parseFloat(m.amount || 0)), 0)

        // CRÍTICO: netAmount incluye SOLO efectivo físico
        const netAmount = state.currentCash.openingAmount + cashSales + deposits + pagosCuentaCorrienteEfectivo - expenses - withdrawals

        return {
          sales: cashSales, // Solo ventas en efectivo
          expenses,
          withdrawals,
          deposits, // Solo depósitos normales
          pagosCuentaCorrienteEfectivo, // NUEVO: Pagos cta cte en efectivo
          pagosCuentaCorrienteTarjeta, // NUEVO: Pagos cta cte con tarjeta
          pagosCuentaCorrienteTransferencia, // NUEVO: Pagos cta cte por transferencia
          cancellations, // NUEVO: Total de cancelaciones del día
          totalMovements: movements.length,
          netAmount, // Solo efectivo físico
        }
      },

      // Actualizar configuración
      updateSettings: async (newSettings) => {
        set({ loading: true, error: null })
        try {
          const response = await cashService.updateSettings(newSettings)
          if (response && response.success) {
            set((state) => ({
              settings: { ...state.settings, ...response.data },
              loading: false,
            }))
          }
          return response
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          })
          throw error
        }
      },

      // NUEVO: Validar que la caja esté abierta (para usar en otros stores)
      validateCashOpen: () => {
        const state = get()
        return state.currentCash.isOpen
      },

      // CORREGIDO: Obtener resumen contable para cierre CON pagos cuenta corriente separados
      getClosingSummary: () => {
        const state = get()
        const todayStats = get().getTodayStats()

        return {
          // Efectivo físico
          physicalCash: {
            opening: state.currentCash.openingAmount,
            salesCash: state.currentCash.salesCash,
            deposits: todayStats.deposits, // Solo depósitos normales
            pagosCuentaCorrienteEfectivo: state.currentCash.pagosCuentaCorrienteEfectivo, // Solo pagos cta cte en efectivo
            expenses: todayStats.expenses,
            withdrawals: todayStats.withdrawals,
            expected: state.currentCash.currentAmount,
          },
          // Otros métodos (NO afectan efectivo físico)
          otherMethods: {
            salesCard: state.currentCash.salesCard,
            salesTransfer: state.currentCash.salesTransfer,
            pagosCuentaCorrienteTarjeta: state.currentCash.pagosCuentaCorrienteTarjeta, // NUEVO: Pagos cta cte con tarjeta
            pagosCuentaCorrienteTransferencia: state.currentCash.pagosCuentaCorrienteTransferencia, // NUEVO: Pagos cta cte por transferencia
            total: state.currentCash.salesCard + state.currentCash.salesTransfer + state.currentCash.pagosCuentaCorrienteTarjeta + state.currentCash.pagosCuentaCorrienteTransferencia,
          },
          // Totales generales
          totals: {
            totalSales: state.currentCash.totalSales,
            totalGeneralAmount: state.currentCash.totalGeneralAmount, // NUEVO: Total general
            physicalCashExpected: state.currentCash.currentAmount,
            // NUEVO: Total de pagos cuenta corriente (todos los métodos)
            totalPagosCuentaCorriente: state.currentCash.pagosCuentaCorrienteEfectivo + state.currentCash.pagosCuentaCorrienteTarjeta + state.currentCash.pagosCuentaCorrienteTransferencia,
            // NUEVO: Total de cancelaciones
            totalCancellations: todayStats.cancellations,
          },
        }
      },

      // NUEVO: Obtener información detallada de pagos cuenta corriente
      getPagosCuentaCorrienteDetails: () => {
        const state = get()
        const totalPagos = state.currentCash.pagosCuentaCorrienteEfectivo + state.currentCash.pagosCuentaCorrienteTarjeta + state.currentCash.pagosCuentaCorrienteTransferencia
        
        if (totalPagos === 0) {
          return {
            total: 0,
            hasPayments: false,
            affectsPhysicalCash: false,
            status: "Sin pagos"
          }
        }

        const efectivo = state.currentCash.pagosCuentaCorrienteEfectivo
        const otros = state.currentCash.pagosCuentaCorrienteTarjeta + state.currentCash.pagosCuentaCorrienteTransferencia

        let status = ""
        let affectsPhysicalCash = false

        if (efectivo > 0 && otros > 0) {
          status = "Mixto: efectivo y otros métodos"
          affectsPhysicalCash = "partial"
        } else if (efectivo > 0) {
          status = "Solo efectivo"
          affectsPhysicalCash = true
        } else {
          status = "Solo otros métodos"
          affectsPhysicalCash = false
        }

        return {
          total: totalPagos,
          hasPayments: true,
          efectivo,
          otros,
          status,
          affectsPhysicalCash
        }
      },
    }),
    {
      name: "cash-storage",
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
)
