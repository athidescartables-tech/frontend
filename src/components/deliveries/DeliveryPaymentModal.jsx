"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { NumericFormat } from "react-number-format"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { useCustomerStore } from "../../stores/customerStore"
import { useToast } from "../../contexts/ToastContext"
import { formatCurrency } from "../../lib/formatters"
import { PAYMENT_METHODS } from "../../lib/constants"
import Button from "../common/Button"
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"

const DeliveryPaymentModal = ({ onClose }) => {
  const {
    showPaymentModal,
    setShowPaymentModal,
    cartTotal,
    paymentMethod,
    setPaymentMethod,
    customer,
    createDelivery,
    loading,
  } = useDeliveriesStore()

  const { getCustomerBalance } = useCustomerStore()
  const { showToast } = useToast()

  const [paymentData, setPaymentData] = useState({
    amountReceived: 0,
    cardNumber: "",
    installments: 1,
    reference: "",
    interestRate: 0,
  })

  const [customerBalance, setCustomerBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const amountInputRef = useRef(null)

  const finalTotal = cartTotal
  const change = paymentData.amountReceived - finalTotal

  const isDefaultCustomer = customer && customer.document_number === "00000000" && customer.name === "Consumidor Final"

  const paymentMethodsOptions = [
    {
      id: PAYMENT_METHODS.EFECTIVO,
      name: "Efectivo",
      icon: BanknotesIcon,
      color: "bg-green-50 border-green-200 text-green-800",
      activeColor: "bg-green-500 text-white border-green-500",
      hoverColor: "hover:bg-green-100 hover:border-green-300",
    },
    {
      id: PAYMENT_METHODS.TARJETA_CREDITO,
      name: "Crédito",
      icon: CreditCardIcon,
      color: "bg-purple-50 border-purple-200 text-purple-800",
      activeColor: "bg-purple-500 text-white border-purple-500",
      hoverColor: "hover:bg-purple-100 hover:border-purple-300",
    },
    {
      id: PAYMENT_METHODS.TRANSFERENCIA,
      name: "Transferencia",
      icon: DevicePhoneMobileIcon,
      color: "bg-indigo-50 border-indigo-200 text-indigo-800",
      activeColor: "bg-indigo-500 text-white border-indigo-500",
      hoverColor: "hover:bg-indigo-100 hover:border-indigo-300",
    },
    {
      id: PAYMENT_METHODS.CUENTA_CORRIENTE,
      name: "Cuenta Corriente",
      icon: BuildingLibraryIcon,
      color: "bg-orange-50 border-orange-200 text-orange-800",
      activeColor: "bg-orange-500 text-white border-orange-500",
      hoverColor: "hover:bg-orange-100 hover:border-orange-300",
      disabled: !customer || isDefaultCustomer,
    },
  ]

  useEffect(() => {
    if (!customer || isDefaultCustomer) {
      setCustomerBalance(null)
      return
    }

    let isMounted = true
    const timeoutId = setTimeout(async () => {
      if (!isMounted) return

      setLoadingBalance(true)
      try {
        const balance = await getCustomerBalance(customer.id, true)
        if (isMounted) {
          setCustomerBalance(balance)
        }
      } catch (error) {
        console.error("Error obteniendo saldo:", error)
        if (isMounted) {
          setCustomerBalance(null)
        }
      } finally {
        if (isMounted) {
          setLoadingBalance(false)
        }
      }
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [customer, isDefaultCustomer, getCustomerBalance]) // Updated dependency array

  useEffect(() => {
    if (showPaymentModal) {
      setPaymentData({
        amountReceived: paymentMethod === PAYMENT_METHODS.EFECTIVO ? finalTotal : 0,
        cardNumber: "",
        installments: 1,
        reference: "",
        interestRate: 0,
      })
    }
  }, [showPaymentModal, paymentMethod, finalTotal])

  useEffect(() => {
    if (paymentMethod === PAYMENT_METHODS.EFECTIVO && showPaymentModal && amountInputRef.current) {
      setTimeout(() => {
        amountInputRef.current.focus()
        amountInputRef.current.select()
      }, 100)
    }
  }, [paymentMethod, showPaymentModal])

  const currentBalance = customerBalance ? Number.parseFloat(customerBalance.current_balance) || 0 : 0
  const creditLimit = customerBalance ? Number.parseFloat(customerBalance.credit_limit) || 0 : 0
  const availableCredit = Math.max(0, creditLimit - currentBalance)
  const newBalance = currentBalance + Number.parseFloat(finalTotal)
  const exceedsLimit = newBalance > creditLimit

  const handleProcessDelivery = async () => {
    try {
      if (paymentMethod === PAYMENT_METHODS.EFECTIVO && paymentData.amountReceived < finalTotal) {
        showToast("El monto recibido es insuficiente", "error")
        return
      }

      if (paymentMethod === PAYMENT_METHODS.CUENTA_CORRIENTE && (!customer || isDefaultCustomer)) {
        showToast("Debe seleccionar un cliente válido para cuenta corriente", "error")
        return
      }

      if (paymentMethod === PAYMENT_METHODS.CUENTA_CORRIENTE && exceedsLimit) {
        showToast("El reparto excede el límite de crédito del cliente", "error")
        return
      }

      if (paymentMethod === PAYMENT_METHODS.TARJETA_CREDITO && !paymentData.cardNumber) {
        showToast("Ingrese los últimos 4 dígitos de la tarjeta", "error")
        return
      }

      if (paymentMethod === PAYMENT_METHODS.TRANSFERENCIA && !paymentData.reference) {
        showToast("Ingrese la referencia de transferencia", "error")
        return
      }

      await createDelivery(paymentData)

      showToast("Reparto creado exitosamente", "success")
      setShowPaymentModal(false)

      setPaymentData({
        amountReceived: 0,
        cardNumber: "",
        installments: 1,
        reference: "",
        interestRate: 0,
      })

      setCustomerBalance(null)

      // Cerrar el formulario completo
      onClose()
    } catch (error) {
      showToast(error.message || "Error al procesar el reparto", "error")
    }
  }

  const handleAmountChange = (values) => {
    const { floatValue } = values
    setPaymentData({
      ...paymentData,
      amountReceived: floatValue || 0,
    })
  }

  const handleCardNumberChange = (values) => {
    const { value } = values
    setPaymentData({
      ...paymentData,
      cardNumber: value,
    })
  }

  const handleAmountFocus = (e) => {
    setTimeout(() => {
      e.target.select()
    }, 0)
  }

  const handleQuickAmount = (amount) => {
    setPaymentData({ ...paymentData, amountReceived: amount })
    if (amountInputRef.current) {
      amountInputRef.current.focus()
    }
  }

  return (
    <Transition appear show={showPaymentModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setShowPaymentModal(false)}>
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                    Procesar Pago del Reparto
                  </Dialog.Title>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Total a pagar */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                        <p className="text-blue-100 text-xs font-medium mb-1">Total a pagar</p>
                        <p className="text-2xl font-bold mb-1">{formatCurrency(finalTotal)}</p>
                      </div>
                    </div>

                    {/* Métodos de pago */}
                    <div className="lg:col-span-3">
                      <div className="flex flex-wrap gap-2 justify-between">
                        {paymentMethodsOptions.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => !method.disabled && setPaymentMethod(method.id)}
                            disabled={method.disabled}
                            className={`flex-1 min-w-[calc(25%-0.5rem)] flex flex-col items-center p-2 border-2 rounded-lg text-center transition-all duration-200 ${
                              paymentMethod === method.id
                                ? `${method.activeColor} shadow-md transform scale-105`
                                : method.disabled
                                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : `${method.color} ${method.hoverColor} hover:shadow-sm hover:transform hover:scale-102`
                            }`}
                          >
                            <method.icon className="h-4 w-4 mb-1" />
                            <p className="font-medium text-xs">{method.name}</p>
                            {paymentMethod === method.id && <CheckCircleIcon className="h-3 w-3 mt-1" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cliente info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Cliente seleccionado</h4>
                      {customer && (
                        <div className="space-y-2">
                          <div className="p-3 bg-white rounded-lg border">
                            <p className="font-medium text-gray-900 text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.document_number}</p>
                          </div>

                          {!isDefaultCustomer && paymentMethod === PAYMENT_METHODS.CUENTA_CORRIENTE && (
                            <>
                              {loadingBalance ? (
                                <div className="flex items-center justify-center py-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="ml-2 text-xs text-gray-500">Cargando...</span>
                                </div>
                              ) : customerBalance ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-2 bg-white rounded-lg border">
                                      <p className="text-xs text-gray-500">Límite</p>
                                      <p className="font-medium text-xs text-gray-900">{formatCurrency(creditLimit)}</p>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded-lg border">
                                      <p className="text-xs text-gray-500">Disponible</p>
                                      <p
                                        className={`font-medium text-xs ${availableCredit >= finalTotal ? "text-green-600" : "text-red-600"}`}
                                      >
                                        {formatCurrency(availableCredit)}
                                      </p>
                                    </div>
                                  </div>

                                  {exceedsLimit ? (
                                    <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded-lg">
                                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs font-medium text-red-800">Límite excedido</p>
                                        <p className="text-xs text-red-600">
                                          Excede: {formatCurrency(newBalance - creditLimit)}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-lg">
                                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                      <p className="text-xs font-medium text-green-800">Crédito suficiente</p>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Campos específicos del método de pago */}
                    <div className="space-y-4">
                      {/* Campos para efectivo */}
                      {paymentMethod === PAYMENT_METHODS.EFECTIVO && (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">Monto recibido</label>
                            <NumericFormat
                              getInputRef={amountInputRef}
                              value={paymentData.amountReceived || ""}
                              onValueChange={handleAmountChange}
                              onFocus={handleAmountFocus}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="$ "
                              decimalScale={2}
                              allowNegative={false}
                              className="w-full px-3 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium bg-white"
                              placeholder="$ 0,00"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-green-700">Recibido</p>
                              <p className="text-lg font-bold text-green-900">
                                {formatCurrency(paymentData.amountReceived)}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                              <p className="text-xs text-green-700">Vuelto</p>
                              <p className={`text-lg font-bold ${change >= 0 ? "text-green-900" : "text-red-600"}`}>
                                {formatCurrency(Math.max(0, change))}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-green-800 mb-2">Montos rápidos</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                finalTotal,
                                Math.ceil(finalTotal / 1000) * 1000,
                                Math.ceil(finalTotal / 5000) * 5000,
                                Math.ceil(finalTotal / 10000) * 10000,
                              ].map((amount, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleQuickAmount(amount)}
                                  className="px-3 py-2 text-xs bg-white hover:bg-green-100 text-green-800 rounded-lg transition-colors font-medium border border-green-200"
                                >
                                  {formatCurrency(amount)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {paymentData.amountReceived > 0 && paymentData.amountReceived < finalTotal && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-xs font-medium text-red-700">
                                Faltan: {formatCurrency(finalTotal - paymentData.amountReceived)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Campos para tarjeta de crédito */}
                      {paymentMethod === PAYMENT_METHODS.TARJETA_CREDITO && (
                        <div className="bg-purple-50 border-purple-200 rounded-xl p-4 border space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-purple-800 mb-2">Últimos 4 dígitos</label>
                            <NumericFormat
                              value={paymentData.cardNumber}
                              onValueChange={handleCardNumberChange}
                              format="####"
                              mask="_"
                              allowEmptyFormatting
                              className="w-full px-3 py-3 border border-purple-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg focus:ring-2 text-center text-lg font-mono bg-white"
                              placeholder="1234"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-purple-800 mb-1">Cuotas</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="24"
                                  value={paymentData.installments}
                                  onChange={(e) =>
                                    setPaymentData({
                                      ...paymentData,
                                      installments: Math.max(1, Number.parseInt(e.target.value) || 1),
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-center"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-purple-800 mb-1">Interés (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={paymentData.interestRate}
                                  onChange={(e) =>
                                    setPaymentData({
                                      ...paymentData,
                                      interestRate: Math.max(0, Number.parseFloat(e.target.value) || 0),
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-center"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {paymentData.installments > 1 && (
                              <div className="bg-white rounded-lg p-3 border border-purple-200">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                  <div>
                                    <p className="text-xs text-purple-700">Total con interés</p>
                                    <p className="font-semibold text-purple-900">
                                      {formatCurrency(finalTotal * (1 + paymentData.interestRate / 100))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-purple-700">Por cuota</p>
                                    <p className="font-semibold text-purple-900">
                                      {formatCurrency(
                                        (finalTotal * (1 + paymentData.interestRate / 100)) / paymentData.installments,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Campos para transferencia */}
                      {paymentMethod === PAYMENT_METHODS.TRANSFERENCIA && (
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                          <label className="block text-sm font-medium text-indigo-800 mb-2">
                            Referencia de transferencia
                          </label>
                          <input
                            type="text"
                            value={paymentData.reference}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                reference: e.target.value,
                              })
                            }
                            className="w-full px-3 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            placeholder="Número de referencia"
                          />
                        </div>
                      )}

                      {/* Información para cuenta corriente */}
                      {paymentMethod === PAYMENT_METHODS.CUENTA_CORRIENTE && (
                        <div
                          className={`border-2 rounded-xl p-4 ${exceedsLimit ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {exceedsLimit ? (
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                              ) : (
                                <BuildingLibraryIcon className="h-5 w-5 text-orange-500" />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className={`text-sm font-medium ${exceedsLimit ? "text-red-800" : "text-orange-800"}`}>
                                {exceedsLimit ? "Límite excedido" : "Cuenta Corriente"}
                              </p>
                              <p className={`text-xs ${exceedsLimit ? "text-red-700" : "text-orange-700"}`}>
                                {exceedsLimit
                                  ? `Excede por: ${formatCurrency(newBalance - creditLimit)}`
                                  : "Se agregará al saldo pendiente"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 text-sm font-medium rounded-lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleProcessDelivery}
                    loading={loading}
                    className="flex-1 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md"
                    disabled={
                      (paymentMethod === PAYMENT_METHODS.EFECTIVO && paymentData.amountReceived < finalTotal) ||
                      (paymentMethod === PAYMENT_METHODS.TARJETA_CREDITO && !paymentData.cardNumber) ||
                      (paymentMethod === PAYMENT_METHODS.TRANSFERENCIA && !paymentData.reference) ||
                      (paymentMethod === PAYMENT_METHODS.CUENTA_CORRIENTE &&
                        (!customer || isDefaultCustomer || exceedsLimit))
                    }
                  >
                    {loading ? "Procesando..." : "Confirmar Reparto"}
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

export default DeliveryPaymentModal
