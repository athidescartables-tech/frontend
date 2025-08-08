"use client"

import { useState, useEffect, Fragment, useMemo } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { NumericFormat } from "react-number-format"
import { useCustomerStore } from "../../stores/customerStore"
import { useToast } from "../../hooks/useToast"
import { formatCurrency } from "../../lib/formatters"
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from "../../lib/constants"
import Button from "../common/Button"
import {
XMarkIcon,
ExclamationTriangleIcon,
BanknotesIcon,
CreditCardIcon,
ArrowsRightLeftIcon,
InformationCircleIcon,
UserIcon,
CheckCircleIcon,
ArrowTrendingUpIcon,
ArrowTrendingDownIcon,
AdjustmentsHorizontalIcon,
SparklesIcon,
CurrencyDollarIcon,
DocumentTextIcon,
ReceiptPercentIcon,
ArrowRightIcon,
ArrowLeftIcon,
} from "@heroicons/react/24/outline"

const AccountTransactionForm = ({ customer, onClose, onSuccess }) => {
const { createAccountTransaction, loading } = useCustomerStore()
const { showToast } = useToast()

const [formData, setFormData] = useState({
  customer_id: customer.id,
  type: "",
  amount: "",
  description: "",
  reference: "",
  payment_method: "efectivo",
})

const [errors, setErrors] = useState({})
const [activeSection, setActiveSection] = useState("type")
const [completedSections, setCompletedSections] = useState(new Set())

// Define form sections
const sections = [
  { id: "type", name: "Tipo de Transacción", icon: ReceiptPercentIcon },
  { id: "amount", name: "Monto", icon: CurrencyDollarIcon },
  { id: "paymentMethod", name: "Método de Pago", icon: CreditCardIcon, conditional: true }, // Conditional section
  { id: "details", name: "Detalles", icon: DocumentTextIcon },
  { id: "confirmation", name: "Confirmación", icon: CheckCircleIcon },
]

// Payment methods options
const paymentMethods = [
  {
    value: "efectivo",
    label: "Efectivo",
    icon: BanknotesIcon,
    affects_cash: true,
    color: "from-green-500 to-green-600",
    description: "Pago en efectivo físico",
  },
  {
    value: "transferencia",
    label: "Transferencia",
    icon: ArrowsRightLeftIcon,
    affects_cash: false,
    color: "from-blue-500 to-blue-600",
    description: "Transferencia bancaria",
  },
  {
    value: "tarjeta_credito",
    label: "Tarjeta de Crédito",
    icon: CreditCardIcon,
    affects_cash: false,
    color: "from-purple-500 to-purple-600",
    description: "Pago con tarjeta",
  },
]

// Transaction types options - UPDATED to only include PAGO and AJUSTE_DEBITO
const transactionTypes = [
  {
    value: TRANSACTION_TYPES.PAGO,
    label: TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.PAGO],
    icon: ArrowTrendingDownIcon,
    color: "from-green-500 to-green-600",
    impact: "decrease",
    description: "Disminuye el saldo del cliente (pago)",
  },
  {
    value: TRANSACTION_TYPES.AJUSTE_DEBITO,
    label: TRANSACTION_TYPE_LABELS[TRANSACTION_TYPES.AJUSTE_DEBITO],
    icon: AdjustmentsHorizontalIcon,
    color: "from-orange-500 to-orange-600",
    impact: "increase",
    description: "Aumenta el saldo del cliente (ajuste)",
  },
]

useEffect(() => {
  // Reset errors when section changes
  setErrors({})
}, [activeSection])

// Pure validation function (does not set state)
const checkSectionValidity = (sectionId, currentFormData, currentCustomer) => {
  const tempErrors = {};

  switch (sectionId) {
    case "type":
      if (!currentFormData.type) {
        tempErrors.type = "El tipo de transacción es requerido";
      }
      break;
    case "amount":
      if (!currentFormData.amount || Number.parseFloat(currentFormData.amount) <= 0) {
        tempErrors.amount = "El monto debe ser mayor a 0";
      } else if (currentFormData.type === TRANSACTION_TYPES.VENTA) { // Keep this check, though VENTA is removed from options
        const newBalance = currentCustomer.current_balance + Number.parseFloat(currentFormData.amount || 0);
        if (newBalance > currentCustomer.credit_limit) {
          tempErrors.amount = `La venta excede el límite de crédito. Límite: ${formatCurrency(currentCustomer.credit_limit)}, Saldo actual: ${formatCurrency(currentCustomer.current_balance)}`;
        }
      }
      break;
    case "paymentMethod":
      if (currentFormData.type === TRANSACTION_TYPES.PAGO && !currentFormData.payment_method) {
        tempErrors.payment_method = "El método de pago es requerido para pagos";
      }
      break;
    case "details":
      if (!currentFormData.description.trim()) {
        tempErrors.description = "La descripción es requerida";
      } else if (currentFormData.description.trim().length < 5) {
        tempErrors.description = "La descripción debe tener al menos 5 caracteres";
      }
      break;
  }
  return Object.keys(tempErrors).length === 0;
};

// Validation function that sets state for display
const validateSectionAndSetErrors = (sectionId) => {
  const newErrors = {};
  switch (sectionId) {
    case "type":
      if (!formData.type) {
        newErrors.type = "El tipo de transacción es requerido"
      }
      break
    case "amount":
      if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
        newErrors.amount = "El monto debe ser mayor a 0"
      } else if (formData.type === TRANSACTION_TYPES.VENTA) { // Keep this check
        const newBalance = customer.current_balance + Number.parseFloat(formData.amount || 0)
        if (newBalance > customer.credit_limit) {
          newErrors.amount = `La venta excede el límite de crédito. Límite: ${formatCurrency(customer.credit_limit)}, Saldo actual: ${formatCurrency(customer.current_balance)}`
        }
      }
      break
    case "paymentMethod":
      if (formData.type === TRANSACTION_TYPES.PAGO && !formData.payment_method) {
        newErrors.payment_method = "El método de pago es requerido para pagos"
      }
      break
    case "details":
      if (!formData.description.trim()) {
        newErrors.description = "La descripción es requerida"
      } else if (formData.description.trim().length < 5) {
        newErrors.description = "La descripción debe tener al menos 5 caracteres"
      }
      break
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleContinue = () => {
  if (!validateSectionAndSetErrors(activeSection)) { // This will set errors for display
    showToast("Por favor corrige los errores antes de continuar", "error");
    return;
  }

  setCompletedSections((prev) => new Set([...prev, activeSection]))

  const currentIndex = sections.findIndex((s) => s.id === activeSection)
  let nextIndex = currentIndex + 1

  // Skip paymentMethod section if not a PAGO type
  if (sections[nextIndex]?.id === "paymentMethod" && formData.type !== TRANSACTION_TYPES.PAGO) {
    nextIndex++
  }
  
  if (nextIndex < sections.length) {
    setActiveSection(sections[nextIndex].id)
  } else {
    // If it's the last step, consider it completed and move to confirmation or directly submit
    setActiveSection("confirmation")
  }
}

const handleBack = () => {
  const currentIndex = sections.findIndex((s) => s.id === activeSection)
  let prevIndex = currentIndex - 1

  // Account for skipped paymentMethod section
  if (sections[prevIndex]?.id === "paymentMethod" && formData.type !== TRANSACTION_TYPES.PAGO) {
    prevIndex--
  }

  if (prevIndex >= 0) {
    setActiveSection(sections[prevIndex].id)
  }
}

const handleSectionClick = (sectionId) => {
  const sectionIndex = sections.findIndex((s) => s.id === sectionId)
  const currentIndex = sections.findIndex((s) => s.id === activeSection)

  // Allow navigation to completed sections or the next accessible section
  const isAccessible = completedSections.has(sectionId) || sectionIndex <= currentIndex + 1;
  
  if (isAccessible) {
    setActiveSection(sectionId)
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()

  // Filter sections based on current form data for final validation
  const relevantSections = sections.filter(s => {
    if (s.conditional && s.id === 'paymentMethod' && formData.type !== TRANSACTION_TYPES.PAGO) {
      return false;
    }
    return true;
  });

  const allSectionsValid = relevantSections.every((section) => checkSectionValidity(section.id, formData, customer));

  if (!allSectionsValid) {
    // If not all sections are valid, iterate and set errors for the first invalid one
    for (const section of relevantSections) {
      if (!checkSectionValidity(section.id, formData, customer)) {
        validateSectionAndSetErrors(section.id); // Set errors for the first invalid section
        setActiveSection(section.id); // Navigate to the first invalid section
        showToast("Por favor corrige todos los errores en el formulario", "error");
        return;
      }
    }
  }

  try {
    const transactionData = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      description: formData.description.trim(),
      reference: formData.reference.trim() || null,
      // Only include payment_method if type is PAGO
      payment_method: formData.type === TRANSACTION_TYPES.PAGO ? formData.payment_method : undefined,
    }

    const response = await createAccountTransaction(transactionData)

    if (response.data.payment_method && response.data.cash_registration) {
      const { affects_physical_cash, registered } = response.data.cash_registration
      if (registered && affects_physical_cash) {
        showToast(`Pago registrado correctamente. Se agregó ${formatCurrency(formData.amount)} al efectivo físico de la caja.`, "success")
      } else if (!affects_physical_cash) {
        showToast(`Pago registrado correctamente. El pago por ${response.data.payment_method} no afecta el efectivo físico de la caja.`, "info")
      }
    } else {
      showToast("Transacción registrada correctamente", "success")
    }

    onSuccess()
  } catch (error) {
    console.error("Error creating transaction:", error)
    showToast(error.message || "Error creando transacción", "error")
  }
}

const handleChange = (e) => {
  const { name, value } = e.target
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }))

  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }))
  }
}

const calculateNewBalance = () => {
  if (!formData.amount || !formData.type) return customer.current_balance

  const amount = Number.parseFloat(formData.amount)
  // Only AJUSTE_DEBITO increases balance among the new allowed types
  if (formData.type === TRANSACTION_TYPES.AJUSTE_DEBITO) {
    return customer.current_balance + amount
  } else { // This will cover TRANSACTION_TYPES.PAGO
    return customer.current_balance - amount
  }
}

const newBalance = calculateNewBalance()
// The exceedsLimit check is primarily for TRANSACTION_TYPES.VENTA, which is now removed.
// However, keeping it for robustness in case of future type additions or backend changes.
const exceedsLimit = formData.type === TRANSACTION_TYPES.VENTA && newBalance > customer.credit_limit
const selectedPaymentMethod = paymentMethods.find(method => method.value === formData.payment_method)
const selectedTransactionType = transactionTypes.find(type => type.value === formData.type)

const currentSectionIndex = sections.findIndex((s) => s.id === activeSection)
const isLastSection = activeSection === "confirmation";
const isFirstSection = activeSection === "type";

const getAccessibleSections = useMemo(() => {
  const currentIdx = sections.findIndex(s => s.id === activeSection);
  return sections.filter((s, idx) => {
    // If it's the paymentMethod section and the type is not PAGO, it's not accessible.
    if (s.id === 'paymentMethod' && formData.type !== TRANSACTION_TYPES.PAGO) {
      return false;
    }
    return completedSections.has(s.id) || idx <= currentIdx + 1;
  });
}, [sections, activeSection, formData.type, completedSections]);

// Memoized value for the "Continuar" button's disabled state
const isCurrentSectionValid = useMemo(() => {
  return checkSectionValidity(activeSection, formData, customer);
}, [activeSection, formData, customer]);

return (
  <Transition appear show={true} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
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
            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      Nueva Transacción
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Paso {currentSectionIndex + 1} de{" "}
                      {sections.length - (formData.type !== TRANSACTION_TYPES.PAGO && sections.some(s => s.id === 'paymentMethod') ? 1 : 0)}:{" "}
                      {sections.find((s) => s.id === activeSection)?.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Customer Info (always visible) */}
              <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center shadow-sm">
                    <UserIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span className="text-gray-600">Saldo:{" "}
                      <span className={`font-semibold ${customer.current_balance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(customer.current_balance)}
                      </span></span>
                      <span className="text-gray-600">Límite:{" "}
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(customer.credit_limit)}
                      </span></span>
                      <span className="text-gray-600">Disponible:{" "}
                      <span className="font-semibold text-green-600">
                        {formatCurrency(Math.max(0, customer.credit_limit - customer.current_balance))}
                      </span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                  {/* Sidebar Navigation */}
                  <div className="lg:col-span-1 p-6 border-r border-gray-100">
                    <div className="lg:sticky lg:top-0 space-y-4">
                      {/* Progress indicator */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Progreso</span>
                          <span>
                            {completedSections.size + (isLastSection ? 1 : 0)}/
                            {sections.length - (formData.type !== TRANSACTION_TYPES.PAGO && sections.some(s => s.id === 'paymentMethod') ? 1 : 0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                ((completedSections.size + (isLastSection ? 1 : 0)) / (sections.length - (formData.type !== TRANSACTION_TYPES.PAGO && sections.some(s => s.id === 'paymentMethod') ? 1 : 0))) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Navigation sections */}
                      <div className="space-y-2">
                        {sections.map((section, index) => { // Iterate over all sections
                          const isCompleted = completedSections.has(section.id)
                          const isCurrent = activeSection === section.id
                          const isAccessible = completedSections.has(section.id) || index <= currentSectionIndex + 1;
                          // Conditional section logic for accessibility
                          const isPaymentMethodSection = section.id === 'paymentMethod';
                          const shouldSkipPaymentMethod = isPaymentMethodSection && formData.type !== TRANSACTION_TYPES.PAGO;

                          if (shouldSkipPaymentMethod) {
                            return null; // Do not render this section if it's conditional and not applicable
                          }
                          
                          return (
                            <button
                              key={section.id}
                              onClick={() => handleSectionClick(section.id)}
                              disabled={!isAccessible} // Use the calculated isAccessible
                              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                                isCurrent
                                  ? "bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm"
                                  : isCompleted
                                    ? "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                                    : "text-gray-400 border-2 border-transparent cursor-not-allowed"
                              }`}
                            >
                              <section.icon className="h-5 w-5 mr-3" />
                              <span className="font-medium">{section.name}</span>
                              <div className="ml-auto">
                                {isCompleted && !isCurrent && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                                {isCurrent && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="lg:col-span-3 flex flex-col">
                    <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] p-6 custom-scrollbar">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section: Tipo de Transacción */}
                        {activeSection === "type" && (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                              <div className="flex items-center mb-4">
                                <ReceiptPercentIcon className="h-6 w-6 text-blue-600 mr-3" />
                                <h3 className="text-lg font-semibold text-blue-900">Tipo de Transacción *</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {transactionTypes.map((type) => (
                                  <label
                                    key={type.value}
                                    className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                      formData.type === type.value
                                        ? "border-blue-500 bg-blue-50 shadow-lg"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="type"
                                      value={type.value}
                                      checked={formData.type === type.value}
                                      onChange={handleChange}
                                      className="sr-only"
                                    />
                                    <div className="p-4">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center shadow-sm`}>
                                          <type.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 text-base">{type.label}</h4>
                                        </div>
                                        {formData.type === type.value && (
                                          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                                      <div className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-2 ${
                                        type.impact === 'increase' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                      }`}>
                                        {type.impact === 'increase' ? '↗' : '↙'}
                                        {type.impact === 'increase' ? 'Aumenta saldo' : 'Disminuye saldo'}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              {errors.type && (
                                <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  {errors.type}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Section: Monto */}
                        {activeSection === "amount" && (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                              <div className="flex items-center mb-4">
                                <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
                                <h3 className="text-lg font-semibold text-green-900">Monto de la Transacción *</h3>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                  <span className="text-gray-400 text-2xl font-semibold">$</span>
                                </div>
                                <NumericFormat
                                  name="amount"
                                  value={formData.amount}
                                  onValueChange={(values) => handleChange({ target: { name: "amount", value: values.value }})}
                                  min="0.01"
                                  decimalScale={2}
                                  fixedDecimalScale
                                  allowNegative={false}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  className={`w-full pl-12 pr-6 py-4 text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                                    errors.amount ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
                                  }`}
                                  placeholder="0,00"
                                />
                              </div>
                              {errors.amount && (
                                <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  {errors.amount}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Section: Método de Pago (condicional) */}
                        {activeSection === "paymentMethod" && formData.type === TRANSACTION_TYPES.PAGO && (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                              <div className="flex items-center mb-4">
                                <CreditCardIcon className="h-6 w-6 text-purple-600 mr-3" />
                                <h3 className="text-lg font-semibold text-purple-900">Método de Pago *</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {paymentMethods.map((method) => (
                                  <label
                                    key={method.value}
                                    className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                      formData.payment_method === method.value
                                        ? "border-blue-500 bg-blue-50 shadow-lg"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="payment_method"
                                      value={method.value}
                                      checked={formData.payment_method === method.value}
                                      onChange={handleChange}
                                      className="sr-only"
                                    />
                                    <div className="p-4">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center shadow-sm`}>
                                          <method.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900">{method.label}</h4>
                                        </div>
                                        {formData.payment_method === method.value && (
                                          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600">{method.description}</p>
                                      <div className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-2 ${
                                        method.affects_cash ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                      }`}>
                                        {method.affects_cash ? "✓" : "✗"}
                                        {method.affects_cash ? "Afecta efectivo" : "No afecta efectivo"}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              {errors.payment_method && (
                                <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  {errors.payment_method}
                                </p>
                              )}
                              {selectedPaymentMethod && (
                                <div className={`mt-6 p-4 rounded-xl border-2 ${
                                  selectedPaymentMethod.affects_cash
                                    ? "bg-green-50 border-green-200"
                                    : "bg-blue-50 border-blue-200"
                                }`}>
                                  <div className="flex items-start gap-3">
                                    <InformationCircleIcon className={`h-5 w-5 mt-0.5 ${
                                      selectedPaymentMethod.affects_cash ? "text-green-600" : "text-blue-600"
                                    }`} />
                                    <div>
                                      <h4 className={`font-semibold text-base ${
                                        selectedPaymentMethod.affects_cash ? "text-green-800" : "text-blue-800"
                                      }`}>
                                        {selectedPaymentMethod.affects_cash ? "Pago en Efectivo" : "Pago Electrónico"}
                                      </h4>
                                      <p className={`text-sm mt-1 ${
                                        selectedPaymentMethod.affects_cash ? "text-green-700" : "text-blue-700"
                                      }`}>
                                        {selectedPaymentMethod.affects_cash
                                          ? "Este pago se registrará en la caja y aumentará el efectivo físico disponible."
                                          : "Este pago se registrará en el sistema pero no afectará el efectivo físico de la caja."
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Section: Detalles */}
                        {activeSection === "details" && (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                              <div className="flex items-center mb-4">
                                <DocumentTextIcon className="h-6 w-6 text-orange-600 mr-3" />
                                <h3 className="text-lg font-semibold text-orange-900">Descripción y Referencia *</h3>
                              </div>
                              <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                  Descripción *
                                </label>
                                <textarea
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  rows={4}
                                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 resize-none ${
                                    errors.description ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
                                  }`}
                                  placeholder="Describe detalladamente el motivo de la transacción..."
                                />
                                {errors.description && (
                                  <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                    {errors.description}
                                  </p>
                                )}
                              </div>
                              <div className="mt-6">
                                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                                  Referencia <span className="text-gray-500 font-normal">(Opcional)</span>
                                </label>
                                <input
                                  type="text"
                                  name="reference"
                                  value={formData.reference}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                  placeholder="Número de factura, recibo, comprobante, etc."
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section: Confirmación */}
                        {activeSection === "confirmation" && (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                              <div className="flex items-center mb-4">
                                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                                <h3 className="text-lg font-semibold text-green-900">Confirmación de Transacción</h3>
                              </div>
                              <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Resumen de la Transacción</p>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="font-semibold text-gray-900">Tipo:</div>
                                    <div>{selectedTransactionType?.label || "N/A"}</div>

                                    <div className="font-semibold text-gray-900">Monto:</div>
                                    <div className={`font-semibold ${selectedTransactionType?.impact === 'increase' ? 'text-red-600' : 'text-green-600'}`}>
                                      {selectedTransactionType?.impact === 'increase' ? '+' : '-'}{formatCurrency(Number.parseFloat(formData.amount))}
                                    </div>

                                    {formData.type === TRANSACTION_TYPES.PAGO && (
                                      <>
                                        <div className="font-semibold text-gray-900">Método de Pago:</div>
                                        <div>{selectedPaymentMethod?.label || "N/A"}</div>
                                      </>
                                    )}
                                    <div className="font-semibold text-gray-900">Descripción:</div>
                                    <div className="text-gray-700">{formData.description || "N/A"}</div>

                                    {formData.reference && (
                                      <>
                                        <div className="font-semibold text-gray-900">Referencia:</div>
                                        <div className="text-gray-700">{formData.reference}</div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className={`p-4 rounded-xl border-2 ${
                                  exceedsLimit
                                    ? "bg-red-50 border-red-200"
                                    : selectedTransactionType?.impact === 'increase'
                                      ? "bg-orange-50 border-orange-200"
                                      : "bg-green-50 border-green-200"
                                }`}>
                                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5" />
                                    Impacto en Saldo del Cliente
                                  </h4>
                                  <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Saldo Actual</p>
                                      <p className="text-lg font-bold text-gray-900">{formatCurrency(customer.current_balance)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Cambio</p>
                                      <p className={`text-lg font-bold ${
                                        selectedTransactionType?.impact === 'increase' ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        {selectedTransactionType?.impact === 'increase' ? '+' : '-'}{formatCurrency(Number.parseFloat(formData.amount))}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Nuevo Saldo</p>
                                      <p className={`text-lg font-bold ${exceedsLimit ? "text-red-600" : "text-blue-600"}`}>
                                        {formatCurrency(newBalance)}
                                      </p>
                                    </div>
                                  </div>
                                  {exceedsLimit && (
                                    <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
                                      <p className="text-red-800 font-semibold flex items-center gap-2 text-sm">
                                        <ExclamationTriangleIcon className="h-5 w-5" />
                                        ⚠️ Esta transacción excede el límite de crédito del cliente
                                      </p>
                                      <p className="text-red-700 text-xs mt-1">
                                        El nuevo saldo ({formatCurrency(newBalance)}) supera el límite autorizado ({formatCurrency(customer.credit_limit)})
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with step navigation */}
              <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="py-3 text-sm font-medium rounded-xl bg-transparent"
                >
                  Cancelar
                </Button>

                <div className="flex-1"></div>

                {/* Back button */}
                {!isFirstSection && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="py-3 px-6 text-sm font-medium rounded-xl bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Atrás
                  </Button>
                )}

                {/* Continue or Create Transaction button */}
                {isLastSection ? (
                  <Button
                    type="submit"
                    loading={loading}
                    onClick={handleSubmit}
                    className="py-3 px-6 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg"
                    disabled={loading || exceedsLimit}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Crear Transacción
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    className="py-3 px-6 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg"
                    disabled={!isCurrentSectionValid} // Use the memoized validity
                  >
                    Continuar
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
)
}

export default AccountTransactionForm
