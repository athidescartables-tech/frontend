"use client"

import { useEffect } from "react"
import { useCashStore } from "@/stores/cashStore"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import Card from "@/components/common/Card"
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

const CashSummary = () => {
  const { currentCash, fetchCurrentStatus, getTodayStats, getClosingSummary, getPagosCuentaCorrienteDetails, loading } = useCashStore()
  const todayStats = getTodayStats()
  const closingSummary = getClosingSummary()
  const pagosCuentaCorrienteDetails = getPagosCuentaCorrienteDetails()

  useEffect(() => {
    fetchCurrentStatus()
  }, [fetchCurrentStatus])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        <span className="text-gray-600">Cargando resumen...</span>
      </div>
    )
  }

  if (!currentCash.isOpen) {
    return (
      <div className="text-center py-12">
        <BanknotesIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Caja Cerrada</h3>
        <p className="mt-2 text-gray-500">La caja debe estar abierta para ver el resumen</p>
      </div>
    )
  }

  // CORREGIDO: Función para renderizar el indicador de impacto en efectivo físico
  const renderCashImpactIndicator = (affectsPhysicalCash) => {
    if (affectsPhysicalCash === "partial") {
      return (
        <div className="flex items-center text-xs">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1 text-yellow-600" />
          <span className="text-yellow-600">Parcialmente afecta efectivo físico</span>
        </div>
      )
    } else if (affectsPhysicalCash === true) {
      return <dd className="text-xs text-green-600">✓ Afecta efectivo físico</dd>
    } else {
      return <dd className="text-xs text-gray-500">✗ No afecta efectivo físico</dd>
    }
  }

  return (
    <div className="space-y-6">
      {/* CORREGIDO: Información de la sesión con total general */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Sesión Actual
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Fecha de apertura</p>
              <p className="font-semibold">{formatDateTime(currentCash.openingDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Abierta por</p>
              <p className="font-semibold flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {currentCash.openedBy || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Efectivo físico actual</p>
              <p className="font-bold text-lg text-blue-600">{formatCurrency(currentCash.currentAmount)}</p>
              <p className="text-xs text-gray-500">Solo efectivo físico</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total general recibido</p>
              <p className="font-bold text-lg text-green-600">{formatCurrency(currentCash.totalGeneralAmount)}</p>
              <p className="text-xs text-gray-500">Todos los métodos</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* CORREGIDO: Ventas separadas claramente por método de pago (SIN cuenta corriente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ventas en Efectivo</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(currentCash.salesCash)}</dd>
                  <dd className="text-xs text-green-600">✓ Afecta efectivo físico</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ventas con Tarjeta</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(currentCash.salesCard)}</dd>
                  <dd className="text-xs text-gray-500">✗ No afecta efectivo físico</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowsRightLeftIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transferencias</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(currentCash.salesTransfer)}</dd>
                  <dd className="text-xs text-gray-500">✗ No afecta efectivo físico</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* CORREGIDO: Card de pagos cuenta corriente con indicador inteligente */}
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptPercentIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pagos Cta. Cte.</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(pagosCuentaCorrienteDetails.total)}
                  </dd>
                  {pagosCuentaCorrienteDetails.hasPayments ? (
                    <div className="space-y-1">
                      {renderCashImpactIndicator(pagosCuentaCorrienteDetails.affectsPhysicalCash)}
                      {pagosCuentaCorrienteDetails.affectsPhysicalCash === "partial" && (
                        <div className="text-xs text-gray-600">
                          <div>Efectivo: {formatCurrency(pagosCuentaCorrienteDetails.efectivo)}</div>
                          <div>Otros: {formatCurrency(pagosCuentaCorrienteDetails.otros)}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <dd className="text-xs text-gray-400">Sin pagos registrados</dd>
                  )}
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Estadísticas del día - Solo movimientos que afectan efectivo físico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Ventas</dt>
                  <dd className="text-lg font-semibold text-gray-900">{currentCash.totalSales}</dd>
                  <dd className="text-xs text-gray-500">Procesadas en caja</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlusIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ingresos Adicionales</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(todayStats.deposits)}</dd>
                  <dd className="text-xs text-green-600">✓ Afecta efectivo físico</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MinusIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Gastos</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(todayStats.expenses)}</dd>
                  <dd className="text-xs text-red-600">✓ Afecta efectivo físico</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MinusIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Retiros</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(todayStats.withdrawals)}</dd>
                  <dd className="text-xs text-red-600">✓ Afecta efectivo físico</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* NUEVO: Card de cancelaciones */}
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cancelaciones</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(todayStats.cancellations)}</dd>
                  <dd className="text-xs text-red-500">Ventas canceladas hoy</dd>
                </dl>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* CORREGIDO: Resumen financiero con separación correcta de pagos cuenta corriente */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Resumen Financiero del Día</h3>
          <p className="text-sm text-gray-500 mt-1">
            Separación clara entre efectivo físico y otros métodos de pago
          </p>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* EFECTIVO FÍSICO - Lo que está realmente en la caja */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-4 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Efectivo Físico en Caja
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-green-700">Monto inicial:</span>
                  <span className="font-semibold">
                    {formatCurrency(closingSummary.physicalCash.opening)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-green-700">Ventas en efectivo:</span>
                  <span className="font-semibold text-green-600">
                    +{formatCurrency(closingSummary.physicalCash.salesCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-green-700">Pagos cta cte (efectivo):</span>
                  <span className="font-semibold text-green-600">
                    +{formatCurrency(closingSummary.physicalCash.pagosCuentaCorrienteEfectivo)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-green-700">Ingresos adicionales:</span>
                  <span className="font-semibold text-green-600">
                    +{formatCurrency(closingSummary.physicalCash.deposits)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-green-700">Gastos y retiros:</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(closingSummary.physicalCash.expenses + closingSummary.physicalCash.withdrawals)}
                  </span>
                </div>
                {/* NUEVO: Mostrar cancelaciones si hay */}
                {closingSummary.totals.totalCancellations > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-green-700">Cancelaciones:</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(closingSummary.totals.totalCancellations)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-green-100 px-3 rounded-lg border-t border-green-300">
                  <span className="text-lg font-medium text-green-900">Efectivo físico esperado:</span>
                  <span className="text-xl font-bold text-green-900">
                    {formatCurrency(closingSummary.physicalCash.expected)}
                  </span>
                </div>
              </div>
            </div>

            {/* OTROS MÉTODOS - No afectan el efectivo físico */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Otros Métodos de Pago
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-700">Ventas con tarjeta:</span>
                  <span className="font-semibold">{formatCurrency(closingSummary.otherMethods.salesCard)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-700">Transferencias:</span>
                  <span className="font-semibold">{formatCurrency(closingSummary.otherMethods.salesTransfer)}</span>
                </div>
                {/* NUEVO: Pagos cuenta corriente separados por método */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-700">Pagos cta cte (tarjeta):</span>
                  <span className="font-semibold">{formatCurrency(closingSummary.otherMethods.pagosCuentaCorrienteTarjeta)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-700">Pagos cta cte (transferencia):</span>
                  <span className="font-semibold">{formatCurrency(closingSummary.otherMethods.pagosCuentaCorrienteTransferencia)}</span>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Nota:</strong> Las ventas a cuenta corriente NO se procesan en caja. Solo se registran los pagos posteriores cuando el cliente paga su deuda.
                  </p>
                </div>
                <div className="flex justify-between items-center py-3 bg-blue-100 px-3 rounded-lg border-t border-blue-300">
                  <span className="text-lg font-medium text-blue-900">Total otros métodos:</span>
                  <span className="text-xl font-bold text-blue-900">
                    {formatCurrency(closingSummary.otherMethods.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CORREGIDO: Total general de todos los métodos procesados */}
          <div className="mt-6 bg-gradient-to-r from-gray-100 to-slate-100 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Total general recibido:
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(closingSummary.totals.totalGeneralAmount)}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>Incluye efectivo, tarjeta, transferencias y pagos de cuenta corriente</p>
              {pagosCuentaCorrienteDetails.hasPayments && (
                <p className="text-indigo-600">
                  <strong>Pagos cuenta corriente:</strong> {formatCurrency(closingSummary.totals.totalPagosCuentaCorriente)} 
                  ({pagosCuentaCorrienteDetails.status})
                </p>
              )}
              {closingSummary.totals.totalCancellations > 0 && (
                <p className="text-red-600">
                  <strong>Cancelaciones del día:</strong> {formatCurrency(closingSummary.totals.totalCancellations)}
                </p>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default CashSummary
