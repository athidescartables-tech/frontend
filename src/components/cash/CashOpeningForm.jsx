"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { NumericFormat } from "react-number-format"
import { useCashStore } from "@/stores/cashStore"
import { useAppStore } from "@/stores/appStore"
import { formatCurrency } from "@/lib/formatters"
import Button from "@/components/common/Button"
import { BanknotesIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline"

const schema = yup.object({
  openingAmount: yup.number().positive("El monto debe ser mayor a 0").required("El monto de apertura es requerido"),
  notes: yup.string(),
})

const CashOpeningForm = ({ isOpen, onClose }) => {
  const { openCash, loading, settings } = useCashStore()
  const { addNotification } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      openingAmount: settings.minCashAmount,
      notes: "",
    },
  })

  const openingAmount = watch("openingAmount")

  const handleAmountChange = (values) => {
    const { floatValue } = values
    setValue("openingAmount", floatValue || 0)
  }

  const onSubmit = async (data) => {
    try {
      await openCash(data.openingAmount, data.notes)

      addNotification({
        type: "success",
        message: `Caja abierta con ${formatCurrency(data.openingAmount)}`,
      })

      onClose && onClose()
    } catch (error) {
      addNotification({
        type: "error",
        message: "Error al abrir la caja",
      })
    }
  }

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                {/* Header Fijo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BanknotesIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        Apertura de Caja
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">Inicia una nueva sesión de caja</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Columna Izquierda - Formulario */}
                      <div className="space-y-6">
                        {/* Monto inicial */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto inicial en caja *
                          </label>
                          <NumericFormat
                            value={openingAmount || ""}
                            onValueChange={handleAmountChange}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="$ "
                            decimalScale={2}
                            allowNegative={false}
                            className={`w-full px-4 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-xl font-bold text-center ${
                              errors.openingAmount
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400 bg-white"
                            }`}
                            placeholder="$ 0,00"
                          />
                          {errors.openingAmount && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              {errors.openingAmount.message}
                            </p>
                          )}
                        </div>

                        {/* Notas */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observaciones (opcional)
                          </label>
                          <textarea
                            {...register("notes")}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400 transition-all resize-none bg-white"
                            placeholder="Observaciones sobre la apertura de caja..."
                          />
                        </div>
                      </div>

                      {/* Columna Derecha - Vista previa */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 h-fit">
                          <h4 className="font-medium text-green-900 mb-4 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Resumen de apertura
                          </h4>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                              <div className="text-center">
                                <p className="text-sm text-green-700 mb-1">Monto inicial</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {formatCurrency(openingAmount || 0)}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                              <div className="text-center">
                                <p className="text-sm text-green-700 mb-1">Fecha y hora</p>
                                <p className="text-sm font-medium text-green-800">
                                  {new Date().toLocaleString("es-AR")}
                                </p>
                              </div>
                            </div>
                            {openingAmount && (
                              <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="text-center">
                                  <p className="text-sm text-green-700 mb-1">Estado</p>
                                  <div className="flex items-center justify-center">
                                    {openingAmount >= settings.minCashAmount &&
                                    openingAmount <= settings.maxCashAmount ? (
                                      <div className="flex items-center text-green-600">
                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                        <span className="text-sm font-medium">Monto óptimo</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-yellow-600">
                                        <InformationCircleIcon className="h-4 w-4 mr-1" />
                                        <span className="text-sm font-medium">Fuera del rango recomendado</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
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
                    className="flex-1 py-3 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg"
                    disabled={loading}
                  >
                    {loading ? "Abriendo..." : "Abrir Caja"}
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

export default CashOpeningForm
