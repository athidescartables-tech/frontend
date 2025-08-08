"use client"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useSupplierStore } from "@/stores/supplierStore"
import { useAppStore } from "@/stores/appStore"
import Button from "@/components/common/Button"
import { XMarkIcon, CreditCardIcon } from "@heroicons/react/24/outline"

const schema = yup.object({
  type: yup.string().required("El tipo de movimiento es requerido"),
  amount: yup.number().positive("El monto debe ser mayor a 0").required("El monto es requerido"),
  description: yup.string().required("La descripción es requerida"),
  reference: yup.string(),
})

const SupplierAccountMovementForm = ({ supplier, onClose }) => {
  const { addSupplierMovement } = useSupplierStore()
  const { addNotification } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "payment",
      amount: 0,
      description: "",
      reference: "",
    },
  })

  const movementType = watch("type")

  const onSubmit = async (data) => {
    try {
      // Ajustar el signo del monto según el tipo de movimiento
      let adjustedAmount = data.amount
      if (data.type === "purchase") {
        adjustedAmount = -Math.abs(data.amount) // Compras son negativas (debemos)
      } else if (data.type === "payment") {
        adjustedAmount = Math.abs(data.amount) // Pagos son positivos (pagamos)
      } else if (data.type === "credit_note") {
        adjustedAmount = Math.abs(data.amount) // Notas de crédito son positivas
      } else if (data.type === "debit_note") {
        adjustedAmount = -Math.abs(data.amount) // Notas de débito son negativas
      }

      const movement = {
        ...data,
        amount: adjustedAmount,
      }

      addSupplierMovement(supplier.id, movement)

      addNotification({
        type: "success",
        message: "Movimiento registrado correctamente",
      })

      onClose && onClose()
      reset()
    } catch (error) {
      addNotification({
        type: "error",
        message: "Error al registrar el movimiento",
      })
    }
  }

  const movementTypes = [
    { value: "payment", label: "Pago a Proveedor", description: "Pago realizado al proveedor" },
    { value: "purchase", label: "Compra", description: "Compra realizada al proveedor" },
    { value: "credit_note", label: "Nota de Crédito", description: "Nota de crédito recibida" },
    { value: "debit_note", label: "Nota de Débito", description: "Nota de débito recibida" },
    { value: "adjustment", label: "Ajuste", description: "Ajuste manual de cuenta" },
  ]

  const getMovementDescription = (type) => {
    const movement = movementTypes.find((m) => m.value === type)
    return movement ? movement.description : ""
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <CreditCardIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Nuevo Movimiento</h3>
            <p className="text-sm text-gray-500">{supplier.name}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {/* Tipo de movimiento */}
        <div>
          <label className="form-label">Tipo de movimiento</label>
          <select {...register("type")} className="form-input">
            {movementTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          <p className="mt-1 text-sm text-gray-500">{getMovementDescription(movementType)}</p>
        </div>

        {/* Monto */}
        <div>
          <label className="form-label">Monto ($)</label>
          <input {...register("amount")} type="number" step="0.01" className="form-input" placeholder="0.00" />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="form-label">Descripción</label>
          <input
            {...register("description")}
            type="text"
            className="form-input"
            placeholder="Descripción del movimiento"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Referencia */}
        <div>
          <label className="form-label">Referencia (opcional)</label>
          <input
            {...register("reference")}
            type="text"
            className="form-input"
            placeholder="Número de factura, recibo, etc."
          />
        </div>

        {/* Vista previa del impacto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Vista previa del impacto</h4>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Saldo actual:</span>
              <span className={supplier.currentBalance >= 0 ? "text-green-600" : "text-red-600"}>
                ${supplier.currentBalance.toFixed(2)}
              </span>
            </div>
            {movementType && (
              <div className="flex justify-between font-medium">
                <span>Nuevo saldo:</span>
                <span
                  className={
                    movementType === "payment" || movementType === "credit_note"
                      ? "text-green-600"
                      : movementType === "purchase" || movementType === "debit_note"
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {movementType === "payment" || movementType === "credit_note"
                    ? `$${(supplier.currentBalance + (watch("amount") || 0)).toFixed(2)}`
                    : movementType === "purchase" || movementType === "debit_note"
                      ? `$${(supplier.currentBalance - (watch("amount") || 0)).toFixed(2)}`
                      : `$${supplier.currentBalance.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
          )}
          <Button type="submit" className="flex-1">
            Registrar Movimiento
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SupplierAccountMovementForm
