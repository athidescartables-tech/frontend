"use client"

import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { NumericFormat } from "react-number-format"
import { useCashStore } from "@/stores/cashStore"
import { useAppStore } from "@/stores/appStore"
import Button from "@/components/common/Button"
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const schema = yup.object({
  type: yup.string().required("Selecciona el tipo de movimiento"),
  amount: yup.number().positive("El monto debe ser mayor a 0").required("El monto es requerido"),
  description: yup.string().required("La descripción es requerida"),
  reference: yup.string(),
})

const CashMovementForm = ({ isOpen, onClose }) => {
  const { addCashMovement } = useCashStore()
  const { addNotification } = useAppStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "deposit",
      amount: "",
      description: "",
      reference: "",
    },
  })

  const movementType = watch("type")
  const amount = watch("amount")

  const handleAmountChange = (values) => {
    const { floatValue } = values
    setValue("amount", floatValue || 0)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await addCashMovement({
        type: data.type,
        amount: Number(data.amount),
        description: data.description,
        reference: data.reference || null,
      })

      addNotification({
        type: "success",
        message: "Movimiento registrado correctamente",
      })

      onClose && onClose()
      reset()
    } catch (error) {
      addNotification({
        type: "error",
        message: error.message || "Error al registrar el movimiento",
      })
    } finally {
      setLoading(false)
    }
  }

  const movementTypes = [
    {
      value: "deposit",
      label: "Ingreso de efectivo",
      icon: PlusIcon,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      description: "Dinero que ingresa a la caja",
    },
    {
      value: "withdrawal",
      label: "Retiro de efectivo",
      icon: MinusIcon,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      description: "Dinero que sale de la caja",
    },
    {
      value: "expense",
      label: "Gasto",
      icon: MinusIcon,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      description: "Gastos operativos del negocio",
    },
  ]

  const selectedType = movementTypes.find((type) => type.value === movementType)

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                {/* Header Fijo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${selectedType?.color || "from-blue-500 to-blue-600"} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        Registrar Movimiento
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">Agregar movimiento de efectivo</p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Contenido con Scroll */}
                <div className="flex-1 overflow-y-auto">
                  <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Columna Izquierda - Formulario */}
                      <div className="space-y-6">
                        {/* Tipo de movimiento */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de movimiento *</label>
                          <div className="space-y-3">
                            {movementTypes.map((type) => (
                              <label
                                key={type.value}
                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                  movementType === type.value
                                    ? `${type.bgColor} ${type.borderColor} shadow-md transform scale-105`
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  {...register("type")}
                                  type="radio"
                                  value={type.value}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div className="ml-4 flex items-center flex-1">
                                  <div
                                    className={`w-10 h-10 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center mr-3`}
                                  >
                                    <type.icon className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div
                                      className={`text-sm font-medium ${movementType === type.value ? type.textColor : "text-gray-900"}`}
                                    >
                                      {type.label}
                                    </div>
                                    <div
                                      className={`text-xs ${movementType === type.value ? type.textColor : "text-gray-500"}`}
                                    >
                                      {type.description}
                                    </div>
                                  </div>
                                  {movementType === type.value && (
                                    <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.type && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {errors.type.message}
                            </p>
                          )}
                        </div>

                        {/* Monto */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto *{" "}
                            {selectedType && <span className={selectedType.textColor}>({selectedType.label})</span>}
                          </label>
                          <NumericFormat
                            value={amount || ""}
                            onValueChange={handleAmountChange}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="$ "
                            decimalScale={2}
                            allowNegative={false}
                            className={`w-full px-4 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xl font-bold text-center ${
                              errors.amount
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400 bg-white"
                            }`}
                            placeholder="$ 0,00"
                          />
                          {errors.amount && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {errors.amount.message}
                            </p>
                          )}
                        </div>

                        {/* Descripción */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                          <input
                            {...register("description")}
                            type="text"
                            className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.description
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400 bg-white"
                            }`}
                            placeholder="Describe el motivo del movimiento"
                          />
                          {errors.description && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {errors.description.message}
                            </p>
                          )}
                        </div>

                        {/* Referencia */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Referencia (opcional)</label>
                          <input
                            {...register("reference")}
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all bg-white"
                            placeholder="Número de comprobante, factura, etc."
                          />
                        </div>
                      </div>

                      {/* Columna Derecha - Vista previa */}
                      <div className="space-y-6">
                        {selectedType && (
                          <div
                            className={`${selectedType.bgColor} ${selectedType.borderColor} rounded-xl p-6 border h-fit`}
                          >
                            <h4 className={`font-medium ${selectedType.textColor} mb-4 flex items-center`}>
                              <selectedType.icon className="h-5 w-5 mr-2" />
                              Vista previa del movimiento
                            </h4>
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-lg border">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 mb-1">Tipo</p>
                                  <p className={`text-lg font-bold ${selectedType.textColor}`}>{selectedType.label}</p>
                                </div>
                              </div>
                              {amount && (
                                <div className="bg-white p-4 rounded-lg border">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Monto</p>
                                    <p className={`text-2xl font-bold ${selectedType.textColor}`}>
                                      {movementType === "deposit" ? "+" : "-"}${" "}
                                      {Number(amount).toLocaleString("es-AR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <div className="bg-white p-4 rounded-lg border">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 mb-1">Fecha y hora</p>
                                  <p className="text-sm font-medium text-gray-800">
                                    {new Date().toLocaleString("es-AR")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Información adicional */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Información importante</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Los ingresos aumentan el efectivo en caja</li>
                            <li>• Los retiros y gastos disminuyen el efectivo</li>
                            <li>• Todos los movimientos quedan registrados</li>
                            <li>• La referencia es opcional pero recomendada</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Fijo */}
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 py-3 text-sm font-medium rounded-xl bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    loading={loading}
                    className={`flex-1 py-3 text-sm font-medium bg-gradient-to-r ${selectedType?.color || "from-blue-500 to-blue-600"} hover:opacity-90 rounded-xl shadow-lg`}
                    disabled={loading}
                  >
                    {loading ? "Registrando..." : "Registrar Movimiento"}
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

export default CashMovementForm
