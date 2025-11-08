"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { NumericFormat } from "react-number-format"
import { useDeliveriesStore } from "../../stores/deliveriesStore"
import { useToast } from "../../contexts/ToastContext"
import { formatCurrency, formatStock } from "../../lib/formatters"
import Button from "../common/Button"
import { XMarkIcon, ScaleIcon, CurrencyDollarIcon, PlusIcon, CubeIcon, TagIcon } from "@heroicons/react/24/outline"

const DeliveryQuantityModal = () => {
  const { showQuantityModal, setShowQuantityModal, selectedProduct, addToCart } = useDeliveriesStore()
  const { showToast } = useToast()

  const [inputMode, setInputMode] = useState("amount")
  const [amountInput, setAmountInput] = useState("")
  const [quantityInput, setQuantityInput] = useState("")
  const [calculatedQuantity, setCalculatedQuantity] = useState(0)
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [selectedPriceLevel, setSelectedPriceLevel] = useState(1)

  const amountInputRef = useRef(null)
  const quantityInputRef = useRef(null)

  useEffect(() => {
    if (showQuantityModal && selectedProduct) {
      setSelectedPriceLevel(1)

      if (selectedProduct.unit_type === "kg") {
        setInputMode("amount")
        const currentPrice = selectedProduct.price_level_1 || selectedProduct.price
        const suggestedAmount = Math.ceil((currentPrice * 0.25) / 100) * 100
        setAmountInput(suggestedAmount.toString())
        setQuantityInput("0.25")
      } else {
        setInputMode("quantity")
        setQuantityInput("1")
        setAmountInput("")
      }
    }
  }, [showQuantityModal, selectedProduct])

  useEffect(() => {
    if (showQuantityModal) {
      setTimeout(() => {
        if (inputMode === "amount" && amountInputRef.current) {
          amountInputRef.current.focus()
          amountInputRef.current.select()
        } else if (inputMode === "quantity" && quantityInputRef.current) {
          quantityInputRef.current.focus()
          quantityInputRef.current.select()
        }
      }, 100)
    }
  }, [inputMode, showQuantityModal])

  const getCurrentPrice = () => {
    if (!selectedProduct) return 0
    switch (selectedPriceLevel) {
      case 2:
        return selectedProduct.price_level_2 || selectedProduct.price
      case 3:
        return selectedProduct.price_level_3 || selectedProduct.price
      default:
        return selectedProduct.price_level_1 || selectedProduct.price
    }
  }

  useEffect(() => {
    if (!selectedProduct) return

    const currentPrice = getCurrentPrice()

    if (inputMode === "amount" && amountInput) {
      const amount = Number.parseFloat(amountInput) || 0
      if (amount > 0) {
        const quantity = amount / currentPrice
        setCalculatedQuantity(selectedProduct.unit_type === "kg" ? Math.round(quantity * 100) / 100 : quantity)
        setCalculatedAmount(amount)
      } else {
        setCalculatedQuantity(0)
        setCalculatedAmount(0)
      }
    } else if (inputMode === "quantity" && quantityInput) {
      const quantity = Number.parseFloat(quantityInput) || 0
      if (quantity > 0) {
        const amount = quantity * currentPrice
        setCalculatedAmount(Math.round(amount * 100) / 100)
        setCalculatedQuantity(selectedProduct.unit_type === "kg" ? Math.round(quantity * 100) / 100 : quantity)
      } else {
        setCalculatedQuantity(0)
        setCalculatedAmount(0)
      }
    }
  }, [amountInput, quantityInput, inputMode, selectedProduct, selectedPriceLevel])

  useEffect(() => {
    if (!selectedProduct) return

    const currentPrice = getCurrentPrice()

    if (inputMode === "amount" && selectedProduct.unit_type === "kg") {
      const suggestedAmount = Math.ceil((currentPrice * 0.25) / 100) * 100
      setAmountInput(suggestedAmount.toString())
    } else if (inputMode === "quantity" && quantityInput) {
      const quantity = Number.parseFloat(quantityInput) || 0
      if (quantity > 0) {
        const amount = quantity * currentPrice
        setCalculatedAmount(Math.round(amount * 100) / 100)
      }
    }
  }, [selectedPriceLevel])

  const handleAmountChange = (values) => {
    const { floatValue } = values
    setAmountInput(floatValue?.toString() || "")
  }

  const handleQuantityChange = (values) => {
    const { floatValue } = values
    setQuantityInput(floatValue?.toString() || "")
  }

  const handleConfirm = () => {
    if (!selectedProduct) return

    const finalQuantity = calculatedQuantity
    const finalAmount = calculatedAmount

    if (finalQuantity <= 0) {
      showToast("La cantidad debe ser mayor a 0", "error")
      return
    }

    if (finalQuantity > selectedProduct.stock) {
      showToast(
        `Stock insuficiente. Disponible: ${formatStock(selectedProduct.stock, selectedProduct.unit_type)}`,
        "error",
      )
      return
    }

    if (finalAmount <= 0) {
      showToast("El importe debe ser mayor a 0", "error")
      return
    }

    addToCart(selectedProduct, finalQuantity, finalAmount, selectedPriceLevel)

    const message =
      selectedProduct.unit_type === "kg"
        ? `Agregado: ${formatStock(finalQuantity, "kg")} de ${selectedProduct.name} por ${formatCurrency(finalAmount)}`
        : `Agregado: ${finalQuantity} ${selectedProduct.name} por ${formatCurrency(finalAmount)}`

    showToast(message, "success")
    setShowQuantityModal(false)
  }

  const handleCancel = () => {
    setShowQuantityModal(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  const getQuickValues = () => {
    if (!selectedProduct) return []

    if (selectedProduct.unit_type === "kg") {
      if (inputMode === "amount") {
        return [
          { label: "$500", value: 500 },
          { label: "$1000", value: 1000 },
          { label: "$1500", value: 1500 },
          { label: "$2000", value: 2000 },
        ]
      } else {
        return [
          { label: "0.25kg", value: 0.25 },
          { label: "0.5kg", value: 0.5 },
          { label: "1kg", value: 1 },
          { label: "2kg", value: 2 },
        ]
      }
    } else {
      return [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "5", value: 5 },
        { label: "10", value: 10 },
      ]
    }
  }

  const quickValues = getQuickValues()

  if (!selectedProduct) return null

  const isKgProduct = selectedProduct.unit_type === "kg"
  const currentPrice = getCurrentPrice()
  const hasMultiplePrices = selectedProduct.price_level_2 || selectedProduct.price_level_3

  return (
    <Transition appear show={showQuantityModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${isKgProduct ? "bg-blue-100" : "bg-green-100"}`}
                    >
                      {isKgProduct ? (
                        <ScaleIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CubeIcon className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold text-gray-900">
                        {isKgProduct ? "Cantidad por Peso" : "Cantidad"}
                      </Dialog.Title>
                      <p className="text-xs text-gray-500 truncate max-w-40" title={selectedProduct.name}>
                        {selectedProduct.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {hasMultiplePrices && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TagIcon className="h-4 w-4 inline mr-1" />
                        Nivel de precio:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((level) => {
                          const price =
                            selectedProduct[`price_level_${level}`] || (level === 1 ? selectedProduct.price : null)
                          if (!price) return null

                          return (
                            <button
                              key={level}
                              onClick={() => setSelectedPriceLevel(level)}
                              className={`p-2 rounded-lg border-2 transition-all text-xs ${
                                selectedPriceLevel === level
                                  ? level === 1
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : level === 2
                                      ? "border-blue-500 bg-blue-50 text-blue-700"
                                      : "border-purple-500 bg-purple-50 text-purple-700"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <div className="font-medium">Precio {level}</div>
                              <div className="font-bold">{formatCurrency(price)}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Precio {isKgProduct ? "por kg" : "unitario"}:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(currentPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900">
                        {formatStock(selectedProduct.stock, selectedProduct.unit_type)}
                      </span>
                    </div>
                  </div>

                  {isKgProduct && (
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setInputMode("amount")}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          inputMode === "amount"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        Importe
                      </button>
                      <button
                        onClick={() => setInputMode("quantity")}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          inputMode === "quantity"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <ScaleIcon className="h-4 w-4 mr-1" />
                        Cantidad
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {inputMode === "amount" && isKgProduct ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Importe en pesos:</label>
                        <NumericFormat
                          getInputRef={amountInputRef}
                          value={amountInput}
                          onValueChange={handleAmountChange}
                          onKeyDown={handleKeyDown}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="$ "
                          decimalScale={2}
                          allowNegative={false}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium text-center"
                          placeholder="$ 0,00"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad {isKgProduct ? "en kg" : "de unidades"}:
                        </label>
                        <NumericFormat
                          getInputRef={quantityInputRef}
                          value={quantityInput}
                          onValueChange={handleQuantityChange}
                          onKeyDown={handleKeyDown}
                          thousandSeparator="."
                          decimalSeparator=","
                          suffix={isKgProduct ? " kg" : ""}
                          decimalScale={isKgProduct ? 2 : 0}
                          allowNegative={false}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium text-center"
                          placeholder={isKgProduct ? "0,00 kg" : "0"}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-2">
                      {quickValues.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            if (inputMode === "amount" && isKgProduct) {
                              setAmountInput(item.value.toString())
                            } else {
                              setQuantityInput(item.value.toString())
                            }
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {calculatedQuantity > 0 && calculatedAmount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-center text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600">Cantidad:</span>
                          <span className="font-semibold text-blue-900">
                            {formatStock(calculatedQuantity, selectedProduct.unit_type)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-blue-600">Total:</span>
                          <span className="font-semibold text-blue-900">{formatCurrency(calculatedAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {calculatedQuantity > selectedProduct.stock && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="text-xs text-red-700 text-center">⚠️ Excede el stock disponible</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50">
                  <Button variant="outline" onClick={handleCancel} className="flex-1 text-sm py-2 bg-transparent">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2"
                    disabled={calculatedQuantity <= 0 || calculatedQuantity > selectedProduct.stock}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar
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

export default DeliveryQuantityModal
