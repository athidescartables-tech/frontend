"use client"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useSupplierStore } from "@/stores/supplierStore"
import { useAppStore } from "@/stores/appStore"
import Button from "@/components/common/Button"
import { XMarkIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline"

const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
  phone: yup.string().required("El teléfono es requerido"),
  cuit: yup.string().required("El CUIT es requerido"),
  taxCondition: yup.string().required("La condición fiscal es requerida"),
  street: yup.string().required("La dirección es requerida"),
  city: yup.string().required("La ciudad es requerida"),
  province: yup.string().required("La provincia es requerida"),
  postalCode: yup.string().required("El código postal es requerido"),
  contactPerson: yup.string().required("La persona de contacto es requerida"),
  contactPhone: yup.string().required("El teléfono de contacto es requerido"),
  paymentTerms: yup
    .number()
    .min(0, "Los términos de pago no pueden ser negativos")
    .required("Los términos de pago son requeridos"),
  discount: yup
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor a 100%"),
  creditLimit: yup.number().min(0, "El límite de crédito no puede ser negativo").required("El límite es requerido"),
  category: yup.string().required("La categoría es requerida"),
  notes: yup.string(),
})

const SupplierForm = ({ supplier, onClose, onSave }) => {
  const { addSupplier, updateSupplier, loading, settings } = useSupplierStore()
  const { addNotification } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: supplier
      ? {
          ...supplier,
          street: supplier.address?.street || "",
          city: supplier.address?.city || "",
          province: supplier.address?.province || "",
          postalCode: supplier.address?.postalCode || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          cuit: "",
          taxCondition: "responsable_inscripto",
          street: "",
          city: "",
          province: "",
          postalCode: "",
          contactPerson: "",
          contactPhone: "",
          paymentTerms: settings.defaultPaymentTerms,
          discount: settings.defaultDiscount,
          creditLimit: 50000.0,
          category: "distribuidor",
          notes: "",
        },
  })

  const onSubmit = async (data) => {
    try {
      const supplierData = {
        ...data,
        address: {
          street: data.street,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
        },
      }

      // Remover campos de dirección del objeto principal
      delete supplierData.street
      delete supplierData.city
      delete supplierData.province
      delete supplierData.postalCode

      if (supplier) {
        await updateSupplier(supplier.id, supplierData)
        addNotification({
          type: "success",
          message: "Proveedor actualizado correctamente",
        })
      } else {
        await addSupplier(supplierData)
        addNotification({
          type: "success",
          message: "Proveedor creado correctamente",
        })
      }

      onSave && onSave(supplierData)
      onClose && onClose()
      reset()
    } catch (error) {
      addNotification({
        type: "error",
        message: "Error al guardar el proveedor",
      })
    }
  }

  const taxConditions = [
    { value: "responsable_inscripto", label: "Responsable Inscripto" },
    { value: "monotributo", label: "Monotributo" },
    { value: "exento", label: "Exento" },
    { value: "consumidor_final", label: "Consumidor Final" },
  ]

  const categories = [
    { value: "distribuidor", label: "Distribuidor" },
    { value: "fabricante", label: "Fabricante" },
    { value: "importador", label: "Importador" },
    { value: "servicios", label: "Servicios" },
    { value: "mayorista", label: "Mayorista" },
  ]

  const provinces = [
    "Buenos Aires",
    "CABA",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán",
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">{supplier ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Información básica */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Información Básica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Razón social / Nombre</label>
              <input
                {...register("name")}
                type="text"
                className="form-input"
                placeholder="Distribuidora Central S.A."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Email</label>
              <input {...register("email")} type="email" className="form-input" placeholder="ventas@proveedor.com" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Teléfono</label>
              <input {...register("phone")} type="tel" className="form-input" placeholder="+54 11 1234-5678" />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">CUIT</label>
              <input {...register("cuit")} type="text" className="form-input" placeholder="30-12345678-9" />
              {errors.cuit && <p className="mt-1 text-sm text-red-600">{errors.cuit.message}</p>}
            </div>

            <div>
              <label className="form-label">Condición fiscal</label>
              <select {...register("taxCondition")} className="form-input">
                {taxConditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {errors.taxCondition && <p className="mt-1 text-sm text-red-600">{errors.taxCondition.message}</p>}
            </div>

            <div>
              <label className="form-label">Categoría</label>
              <select {...register("category")} className="form-input">
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Dirección</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Calle y número</label>
              <input {...register("street")} type="text" className="form-input" placeholder="Av. Industrial 1500" />
              {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>}
            </div>

            <div>
              <label className="form-label">Ciudad</label>
              <input {...register("city")} type="text" className="form-input" placeholder="Buenos Aires" />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className="form-label">Provincia</label>
              <select {...register("province")} className="form-input">
                <option value="">Seleccionar provincia</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>}
            </div>

            <div>
              <label className="form-label">Código postal</label>
              <input {...register("postalCode")} type="text" className="form-input" placeholder="1407" />
              {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>}
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Persona de Contacto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombre completo</label>
              <input {...register("contactPerson")} type="text" className="form-input" placeholder="Roberto Martínez" />
              {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>}
            </div>

            <div>
              <label className="form-label">Teléfono directo</label>
              <input {...register("contactPhone")} type="tel" className="form-input" placeholder="+54 11 1234-5679" />
              {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>}
            </div>
          </div>
        </div>

        {/* Términos comerciales */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Términos Comerciales</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Términos de pago (días)</label>
              <input {...register("paymentTerms")} type="number" className="form-input" placeholder="30" />
              {errors.paymentTerms && <p className="mt-1 text-sm text-red-600">{errors.paymentTerms.message}</p>}
            </div>

            <div>
              <label className="form-label">Descuento (%)</label>
              <input {...register("discount")} type="number" step="0.1" className="form-input" placeholder="0.0" />
              {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>}
            </div>

            <div>
              <label className="form-label">Límite de crédito ($)</label>
              <input
                {...register("creditLimit")}
                type="number"
                step="0.01"
                className="form-input"
                placeholder="50000.00"
              />
              {errors.creditLimit && <p className="mt-1 text-sm text-red-600">{errors.creditLimit.message}</p>}
            </div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="form-label">Notas</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="form-input"
            placeholder="Observaciones sobre el proveedor..."
          />
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={loading} className="flex-1">
            {supplier ? "Actualizar" : "Crear"} Proveedor
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SupplierForm
