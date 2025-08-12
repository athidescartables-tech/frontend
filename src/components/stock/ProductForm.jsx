"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { NumericFormat } from "react-number-format"
import { useProductStore } from "../../stores/productStore"
import { useCategoryStore } from "../../stores/categoryStore"
import { useToast } from "../../contexts/ToastContext"
import { formatQuantity } from "../../lib/formatters"
import Button from "../common/Button"
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  SwatchIcon,
  ScaleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"

const ProductForm = ({ isOpen, product, onClose, onSave }) => {
  const { createProduct, updateProduct, loading } = useProductStore()
  const { categories, fetchCategories } = useCategoryStore()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: "10",
    category_id: "",
    barcode: "",
    image: "",
    unit_type: "unidades",
    active: true,
  })

  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState("basic")
  const [completedSections, setCompletedSections] = useState(new Set())

  // Secciones del formulario
  const sections = [
    { id: "basic", name: "Básico", icon: TagIcon },
    { id: "pricing", name: "Precios", icon: CurrencyDollarIcon },
    { id: "inventory", name: "Inventario", icon: CubeIcon },
    { id: "media", name: "Imagen", icon: PhotoIcon },
  ]

  // Cargar categorías al montar
  useEffect(() => {
    if (isOpen) {
      fetchCategories({ active: "true" })
    }
  }, [isOpen, fetchCategories])

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        stock: product.stock?.toString() || "",
        min_stock: product.min_stock?.toString() || "10",
        category_id: product.category_id?.toString() || "",
        barcode: product.barcode || "",
        image: product.image || "",
        unit_type: product.unit_type || "unidades",
        active: product.active !== undefined ? product.active : true,
      })
      // Para edición, marcar todas las secciones como completadas
      setCompletedSections(new Set(["basic", "pricing", "inventory", "media"]))
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        cost: "",
        stock: "",
        min_stock: "10",
        category_id: "",
        barcode: "",
        image: "",
        unit_type: "unidades",
        active: true,
      })
      setCompletedSections(new Set())
    }
    setErrors({})
    setActiveSection("basic")
  }, [product, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    // Lógica especial para cambios de unidad de medida
    if (name === "unit_type") {
      if (value === "unidades" && formData.unit_type === "kg") {
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
          stock: prev.stock ? Math.floor(Number.parseFloat(prev.stock)).toString() : "",
          min_stock: prev.min_stock ? Math.floor(Number.parseFloat(prev.min_stock)).toString() : "",
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }))
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Manejar cambios en campos numéricos con validación por unidad
  const handleNumericChange = (name, value) => {
    let processedValue = value

    // Para campos de stock, validar según el tipo de unidad
    if ((name === "stock" || name === "min_stock") && formData.unit_type === "unidades") {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        processedValue = Math.floor(numValue).toString()
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Manejar cambios en los campos de precio con formato
  const handlePriceChange = (name, values) => {
    const { value } = values
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

  const validateSection = (sectionId) => {
    const newErrors = {}

    switch (sectionId) {
      case "basic":
        if (!formData.name.trim()) {
          newErrors.name = "El nombre es requerido"
        }
        break

      case "pricing":
        if (!formData.price || Number.parseFloat(formData.price) <= 0) {
          newErrors.price = "El precio debe ser mayor a 0"
        }
        if (formData.cost && Number.parseFloat(formData.cost) < 0) {
          newErrors.cost = "El costo no puede ser negativo"
        }
        break

      case "inventory":
        // Validar stock según tipo de unidad
        if (!product && formData.stock) {
          const stockValue = Number.parseFloat(formData.stock)
          if (stockValue < 0) {
            newErrors.stock = "El stock no puede ser negativo"
          } else if (formData.unit_type === "unidades" && !Number.isInteger(stockValue)) {
            newErrors.stock = "Para productos por unidades, el stock debe ser un número entero"
          }
        }

        const minStockValue = formData.min_stock ? Number.parseFloat(formData.min_stock) : 10
        if (!formData.min_stock || minStockValue < 0) {
          newErrors.min_stock = "El stock mínimo es requerido y no puede ser negativo"
        } else if (formData.unit_type === "unidades" && !Number.isInteger(minStockValue)) {
          newErrors.min_stock = "Para productos por unidades, el stock mínimo debe ser un número entero"
        }
        break

      case "media":
        // Validación de imagen más flexible
        if (formData.image && formData.image.trim() !== "") {
          const urlRegex = /^https?:\/\/.+/
          if (!urlRegex.test(formData.image)) {
            newErrors.image = "La imagen debe ser una URL válida (http:// o https://)"
          }
        }
        break
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  // NUEVO: Continuar a la siguiente sección
  const handleContinue = () => {
    if (!validateSection(activeSection)) {
      showToast("Por favor corrige los errores antes de continuar", "error")
      return
    }

    // Marcar sección como completada
    setCompletedSections((prev) => new Set([...prev, activeSection]))

    // Ir a la siguiente sección
    const currentIndex = sections.findIndex((s) => s.id === activeSection)
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id)
    }
  }

  // NUEVO: Volver a la sección anterior
  const handleBack = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection)
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id)
    }
  }

  // NUEVO: Ir directamente a una sección (solo si está completada o es la siguiente)
  const handleSectionClick = (sectionId) => {
    const sectionIndex = sections.findIndex((s) => s.id === sectionId)
    const currentIndex = sections.findIndex((s) => s.id === activeSection)

    // Permitir ir a secciones completadas o la siguiente sección
    if (completedSections.has(sectionId) || sectionIndex <= currentIndex + 1 || product) {
      setActiveSection(sectionId)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar todas las secciones
    const allSectionsValid = sections.every((section) => validateSection(section.id))

    if (!allSectionsValid) {
      showToast("Por favor corrige todos los errores en el formulario", "error")
      return
    }

    try {
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: Number.parseFloat(formData.price),
        cost: formData.cost ? Number.parseFloat(formData.cost) : 0,
        min_stock: formData.min_stock ? Number.parseFloat(formData.min_stock) : 10,
        category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
        barcode: formData.barcode.trim() || null,
        image: formData.image.trim() || null,
        unit_type: formData.unit_type,
        active: formData.active,
      }

      // Solo agregar stock si no estamos editando
      if (!product) {
        dataToSend.stock = formData.stock ? Number.parseFloat(formData.stock) : 0
      }

      if (product) {
        await updateProduct(product.id, dataToSend)
        showToast("Producto actualizado correctamente", "success")
      } else {
        await createProduct(dataToSend)
        showToast("Producto creado correctamente", "success")
      }

      onSave?.()
      onClose()
    } catch (error) {
      console.error("Error saving product:", error)
      showToast(error.message || "Error al guardar el producto", "error")
    }
  }

  const willGenerateAlert = () => {
    const currentStock = Number.parseFloat(formData.stock) || 0
    const minStock = Number.parseFloat(formData.min_stock) || 10
    return currentStock <= minStock
  }

  // Calcular margen de ganancia
  const calculateMargin = () => {
    const price = Number.parseFloat(formData.price) || 0
    const cost = Number.parseFloat(formData.cost) || 0
    if (price > 0 && cost > 0) {
      return (((price - cost) / price) * 100).toFixed(1)
    }
    return 0
  }

  // Obtener configuración de input según tipo de unidad
  const getQuantityInputProps = (fieldName) => {
    const baseProps = {
      name: fieldName,
      value: formData[fieldName],
      onChange: (e) => handleNumericChange(fieldName, e.target.value),
      className: `block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold text-center ${
        errors[fieldName] ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400 bg-white"
      }`,
    }

    if (formData.unit_type === "unidades") {
      return {
        ...baseProps,
        type: "number",
        min: "0",
        step: "1",
        placeholder: "0",
      }
    } else {
      return {
        ...baseProps,
        type: "number",
        min: "0",
        step: "0.001",
        placeholder: "0.000",
      }
    }
  }

  const selectedCategory = categories.find((cat) => cat.id === Number.parseInt(formData.category_id))
  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection)
  const isLastSection = currentSectionIndex === sections.length - 1

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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        {product ? (
                          <PencilIcon className="h-6 w-6 text-white" />
                        ) : (
                          <PlusIcon className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        {product ? "Editar Producto" : "Nuevo Producto"}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        {product
                          ? "Modifica la información del producto"
                          : `Paso ${currentSectionIndex + 1} de ${sections.length}: ${
                              sections[currentSectionIndex]?.name
                            }`}
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

                {/* Contenido Principal */}
                <div className="flex-1 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    {/* ACTUALIZADO: Sidebar fijo */}
                    <div className="lg:col-span-1 p-6 border-r border-gray-100">
                      <div className="lg:sticky lg:top-0 space-y-4">
                        {/* Progress indicator */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Progreso</span>
                            <span>
                              {completedSections.size + (isLastSection ? 1 : 0)}/{sections.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  ((completedSections.size + (isLastSection ? 1 : 0)) / sections.length) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Navigation sections */}
                        <div className="space-y-2">
                          {sections.map((section, index) => {
                            const isCompleted = completedSections.has(section.id)
                            const isCurrent = activeSection === section.id
                            const isAccessible = isCompleted || index <= currentSectionIndex + 1 || product

                            return (
                              <button
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                disabled={!isAccessible}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                                  isCurrent
                                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm"
                                    : isCompleted
                                      ? "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                                      : isAccessible
                                        ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent"
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

                        {/* Vista previa del producto */}
                        {formData.name && (
                          <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Nombre:</span>
                                <span className="text-xs font-medium text-gray-900 truncate ml-2">
                                  {formData.name || "Sin nombre"}
                                </span>
                              </div>
                              {formData.price && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Precio:</span>
                                  <span className="text-xs font-bold text-green-600">
                                    $
                                    {Number.parseFloat(formData.price || 0).toLocaleString("es-AR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Unidad:</span>
                                <span className="text-xs font-medium text-blue-600">
                                  {formData.unit_type === "kg" ? "Kilogramos" : "Unidades"}
                                </span>
                              </div>
                              {selectedCategory && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Categoría:</span>
                                  <span className="text-xs font-medium text-gray-900">{selectedCategory.name}</span>
                                </div>
                              )}
                              {formData.cost && formData.price && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Margen:</span>
                                  <span className="text-xs font-medium text-blue-600">{calculateMargin()}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTUALIZADO: Contenido del formulario con scroll independiente y altura fija */}
                    <div className="lg:col-span-3 flex flex-col">
                      <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] p-6 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Sección Básica */}
                          {activeSection === "basic" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                <div className="flex items-center mb-4">
                                  <TagIcon className="h-6 w-6 text-blue-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-blue-900">Información Básica</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                  {/* Nombre */}
                                  <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                      Nombre del producto *
                                    </label>
                                    <input
                                      type="text"
                                      name="name"
                                      id="name"
                                      value={formData.name}
                                      onChange={handleChange}
                                      className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.name
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-300 hover:border-gray-400 bg-white"
                                      }`}
                                      placeholder="Ingresa el nombre del producto"
                                    />
                                    {errors.name && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.name}
                                      </p>
                                    )}
                                  </div>

                                  {/* Descripción */}
                                  <div>
                                    <label
                                      htmlFor="description"
                                      className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                      Descripción
                                    </label>
                                    <textarea
                                      name="description"
                                      id="description"
                                      rows={4}
                                      value={formData.description}
                                      onChange={handleChange}
                                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all resize-none bg-white"
                                      placeholder="Descripción detallada del producto (opcional)"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Categoría */}
                                    <div>
                                      <label
                                        htmlFor="category_id"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                      >
                                        Categoría
                                      </label>
                                      <div className="relative">
                                        <select
                                          name="category_id"
                                          id="category_id"
                                          value={formData.category_id}
                                          onChange={handleChange}
                                          className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all bg-white appearance-none"
                                        >
                                          <option value="">Sin categoría</option>
                                          {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                              {category.name}
                                            </option>
                                          ))}
                                        </select>
                                        <SwatchIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                      </div>
                                    </div>

                                    {/* Código de barras */}
                                    <div>
                                      <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                                        Código de barras
                                      </label>
                                      <input
                                        type="text"
                                        name="barcode"
                                        id="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all bg-white"
                                        placeholder="Código de barras (opcional)"
                                      />
                                    </div>
                                  </div>

                                  {/* Selector de unidad de medida */}
                                  <div>
                                    <label htmlFor="unit_type" className="block text-sm font-medium text-gray-700 mb-2">
                                      Unidad de medida *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div
                                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                          formData.unit_type === "unidades"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        onClick={() =>
                                          handleChange({ target: { name: "unit_type", value: "unidades" } })
                                        }
                                      >
                                        <div className="flex items-center">
                                          <input
                                            type="radio"
                                            name="unit_type"
                                            value="unidades"
                                            checked={formData.unit_type === "unidades"}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                          />
                                          <div className="ml-3">
                                            <div className="flex items-center">
                                              <CubeIcon className="h-5 w-5 text-gray-600 mr-2" />
                                              <span className="text-sm font-medium text-gray-900">Por Unidades</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Productos que se venden por unidades individuales (ej: botellas, paquetes)
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div
                                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                          formData.unit_type === "kg"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        onClick={() => handleChange({ target: { name: "unit_type", value: "kg" } })}
                                      >
                                        <div className="flex items-center">
                                          <input
                                            type="radio"
                                            name="unit_type"
                                            value="kg"
                                            checked={formData.unit_type === "kg"}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                          />
                                          <div className="ml-3">
                                            <div className="flex items-center">
                                              <ScaleIcon className="h-5 w-5 text-gray-600 mr-2" />
                                              <span className="text-sm font-medium text-gray-900">Por Kilogramos</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Productos que se venden por peso (ej: frutas, verduras, carnes)
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {formData.unit_type === "kg" && (
                                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start">
                                          <InformationCircleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                                          <div className="text-sm text-amber-800">
                                            <p className="font-medium">Productos por kilogramos:</p>
                                            <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                                              <li>Permite cantidades decimales (ej: 1.250 kg)</li>
                                              <li>El precio se aplica por kilogramo</li>
                                              <li>Ideal para productos a granel</li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sección Precios */}
                          {activeSection === "pricing" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                <div className="flex items-center mb-4">
                                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-green-900">Configuración de Precios</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Precio de venta */}
                                  <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                      Precio de venta * {formData.unit_type === "kg" && "(por kg)"}
                                    </label>
                                    <NumericFormat
                                      name="price"
                                      value={formData.price}
                                      onValueChange={(values) => handlePriceChange("price", values)}
                                      thousandSeparator="."
                                      decimalSeparator=","
                                      prefix="$ "
                                      decimalScale={2}
                                      allowNegative={false}
                                      className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold ${
                                        errors.price
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-300 hover:border-gray-400 bg-white"
                                      }`}
                                      placeholder="$ 0,00"
                                    />
                                    {errors.price && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.price}
                                      </p>
                                    )}
                                  </div>

                                  {/* Costo */}
                                  <div>
                                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                                      Costo del producto {formData.unit_type === "kg" && "(por kg)"}
                                    </label>
                                    <NumericFormat
                                      name="cost"
                                      value={formData.cost}
                                      onValueChange={(values) => handlePriceChange("cost", values)}
                                      thousandSeparator="."
                                      decimalSeparator=","
                                      prefix="$ "
                                      decimalScale={2}
                                      allowNegative={false}
                                      className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.cost
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-300 hover:border-gray-400 bg-white"
                                      }`}
                                      placeholder="$ 0,00"
                                    />
                                    {errors.cost && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.cost}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Información de margen */}
                                {formData.price && formData.cost && (
                                  <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Precio de Venta {formData.unit_type === "kg" && "(por kg)"}
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                          $
                                          {Number.parseFloat(formData.price).toLocaleString("es-AR", {
                                            minimumFractionDigits: 2,
                                          })}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Costo {formData.unit_type === "kg" && "(por kg)"}
                                        </p>
                                        <p className="text-lg font-bold text-red-600">
                                          $
                                          {Number.parseFloat(formData.cost).toLocaleString("es-AR", {
                                            minimumFractionDigits: 2,
                                          })}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Margen</p>
                                        <p className="text-lg font-bold text-blue-600">{calculateMargin()}%</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 text-center">
                                      <p className="text-sm text-gray-600">
                                        Ganancia por {formData.unit_type === "kg" ? "kilogramo" : "unidad"}:{" "}
                                        <span className="font-semibold text-green-600">
                                          $
                                          {(
                                            Number.parseFloat(formData.price || 0) -
                                            Number.parseFloat(formData.cost || 0)
                                          ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Sección Inventario */}
                          {activeSection === "inventory" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                                <div className="flex items-center mb-4">
                                  <CubeIcon className="h-6 w-6 text-purple-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-purple-900">Control de Inventario</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Stock inicial/actual */}
                                  <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                                      {product ? "Stock actual" : "Stock inicial"} (
                                      {formData.unit_type === "kg" ? "kg" : "unidades"})
                                    </label>
                                    <input {...getQuantityInputProps("stock")} disabled={!!product} />
                                    {errors.stock && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.stock}
                                      </p>
                                    )}
                                    {product && (
                                      <p className="mt-2 text-xs text-blue-600 flex items-center">
                                        <InformationCircleIcon className="h-4 w-4 mr-1" />
                                        Para modificar el stock, usa "Movimientos de Stock"
                                      </p>
                                    )}
                                  </div>

                                  {/* Stock mínimo */}
                                  <div>
                                    <label htmlFor="min_stock" className="block text-sm font-medium text-gray-700 mb-2">
                                      Stock mínimo para alertas * ({formData.unit_type === "kg" ? "kg" : "unidades"})
                                    </label>
                                    <input {...getQuantityInputProps("min_stock")} />
                                    {errors.min_stock && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.min_stock}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Vista previa de alertas */}
                                {formData.stock && formData.min_stock && (
                                  <div className="mt-6">
                                    <div
                                      className={`p-4 rounded-lg border-2 ${
                                        willGenerateAlert()
                                          ? "bg-amber-50 border-amber-200"
                                          : "bg-green-50 border-green-200"
                                      }`}
                                    >
                                      <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                          {willGenerateAlert() ? (
                                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                                          ) : (
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <h5
                                            className={`text-sm font-medium mb-1 ${
                                              willGenerateAlert() ? "text-amber-800" : "text-green-800"
                                            }`}
                                          >
                                            {willGenerateAlert()
                                              ? "⚠️ Se generará alerta de stock bajo"
                                              : "✅ Stock suficiente"}
                                          </h5>
                                          <div className="text-xs space-y-1">
                                            <div className="grid grid-cols-2 gap-4">
                                              <p>
                                                <strong>Stock actual:</strong>{" "}
                                                {formatQuantity(formData.stock, formData.unit_type)}
                                              </p>
                                              <p>
                                                <strong>Stock mínimo:</strong>{" "}
                                                {formatQuantity(formData.min_stock, formData.unit_type)}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Estado activo (solo para edición) */}
                                {product && (
                                  <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                                    <div className="flex items-center space-x-3">
                                      <input
                                        id="active"
                                        name="active"
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                        Producto activo y disponible para la venta
                                      </label>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 ml-7">
                                      Los productos inactivos no aparecerán en el punto de venta
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Sección Imagen */}
                          {activeSection === "media" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                                <div className="flex items-center mb-4">
                                  <PhotoIcon className="h-6 w-6 text-orange-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-orange-900">Imagen del Producto</h3>
                                </div>

                                <div>
                                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de la imagen
                                  </label>
                                  <input
                                    type="url"
                                    name="image"
                                    id="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                      errors.image
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400 bg-white"
                                    }`}
                                    placeholder="https://ejemplo.com/imagen.jpg (opcional)"
                                  />
                                  {errors.image && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                      {errors.image}
                                    </p>
                                  )}
                                  <p className="mt-2 text-xs text-gray-500">
                                    Ingresa la URL completa de la imagen del producto. Se mostrará en el catálogo y
                                    punto de venta.
                                  </p>
                                </div>

                                {/* Vista previa de imagen */}
                                {formData.image && !errors.image && (
                                  <div className="mt-6">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Vista previa:</p>
                                    <div className="flex justify-center">
                                      <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                          src={formData.image || "/placeholder.svg"}
                                          alt="Vista previa"
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.style.display = "none"
                                            e.target.nextSibling.style.display = "flex"
                                          }}
                                        />
                                        <div
                                          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400"
                                          style={{ display: "none" }}
                                        >
                                          <div className="text-center">
                                            <PhotoIcon className="h-8 w-8 mx-auto mb-2" />
                                            <p className="text-xs">Error al cargar imagen</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTUALIZADO: Footer con navegación paso a paso */}
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

                  {/* Botón Atrás */}
                  {currentSectionIndex > 0 && (
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

                  {/* Botón Continuar o Crear/Actualizar */}
                  {isLastSection ? (
                    <Button
                      type="submit"
                      loading={loading}
                      onClick={handleSubmit}
                      className="py-3 px-6 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg"
                      disabled={loading}
                    >
                      {loading ? "Guardando..." : product ? "Actualizar Producto" : "Crear Producto"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="py-3 px-6 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg"
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

export default ProductForm
