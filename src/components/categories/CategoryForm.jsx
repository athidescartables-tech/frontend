"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useCategoryStore } from "../../stores/categoryStore"
import { useToast } from "../../hooks/useToast"
import Button from "../common/Button"
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  TagIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  SwatchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

const CategoryForm = ({ category, onClose, onSave }) => {
  const { createCategory, updateCategory, loading } = useCategoryStore()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "📦",
  })

  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState("basic")
  const [completedSections, setCompletedSections] = useState(new Set())

  // Secciones del formulario
  const sections = [
    { id: "basic", name: "Información Básica", icon: TagIcon },
    { id: "appearance", name: "Apariencia", icon: SwatchIcon },
    { id: "details", name: "Detalles", icon: SparklesIcon },
  ]

  const predefinedColors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6B7280", // Gray
  ]

  const predefinedIcons = [
    "📦", "🥤", "🍞", "🥛", "🧽", "🍿", "🍎", "🥩", "🐟", "🍚",
    "🧊", "🍫", "🚬", "💊", "🧴", "🧻", "🍳", "🥄", "🍽️", "🛒",
  ]

  // Cargar datos de la categoría si estamos editando
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        color: category.color || "#3B82F6",
        icon: category.icon || "📦",
      })
      // Para edición, marcar todas las secciones como completadas
      setCompletedSections(new Set(["basic", "appearance", "details"]))
    } else {
      // Reset form for new category
      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        icon: "📦",
      })
      setCompletedSections(new Set())
    }
    setErrors({})
    setActiveSection("basic")
  }, [category])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validar sección específica
  const validateSection = (sectionId) => {
    const newErrors = {}

    switch (sectionId) {
      case "basic":
        if (!formData.name.trim()) {
          newErrors.name = "El nombre es requerido"
        } else if (formData.name.trim().length < 2) {
          newErrors.name = "El nombre debe tener al menos 2 caracteres"
        }
        break

      case "appearance":
        if (!formData.color) {
          newErrors.color = "El color es requerido"
        }
        if (!formData.icon) {
          newErrors.icon = "El icono es requerido"
        }
        break

      case "details":
        // Validaciones opcionales para detalles
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Continuar a la siguiente sección
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

  // Volver a la sección anterior
  const handleBack = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection)
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id)
    }
  }

  // Ir directamente a una sección
  const handleSectionClick = (sectionId) => {
    const sectionIndex = sections.findIndex((s) => s.id === sectionId)
    const currentIndex = sections.findIndex((s) => s.id === activeSection)

    // Permitir ir a secciones completadas o la siguiente sección
    if (completedSections.has(sectionId) || sectionIndex <= currentIndex + 1 || category) {
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
        color: formData.color,
        icon: formData.icon,
      }

      if (category) {
        await updateCategory(category.id, dataToSend)
        showToast("Categoría actualizada correctamente", "success")
      } else {
        await createCategory(dataToSend)
        showToast("Categoría creada correctamente", "success")
      }

      onSave?.()
      onClose?.()
    } catch (error) {
      console.error("Error saving category:", error)
      showToast(error.message || "Error al guardar la categoría", "error")
    }
  }

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection)
  const isLastSection = currentSectionIndex === sections.length - 1

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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                        {category ? (
                          <PencilIcon className="h-6 w-6 text-white" />
                        ) : (
                          <PlusIcon className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                        {category ? "Editar Categoría" : "Nueva Categoría"}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        {category
                          ? "Modifica la información de la categoría"
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
                    {/* Sidebar */}
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
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
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
                            const isAccessible = isCompleted || index <= currentSectionIndex + 1 || category

                            return (
                              <button
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                disabled={!isAccessible}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                                  isCurrent
                                    ? "bg-primary-50 text-primary-700 border-2 border-primary-200 shadow-sm"
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
                                  {isCurrent && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {/* Vista previa de la categoría */}
                        {formData.name && (
                          <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa</h4>
                            <div className="text-center">
                              <div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl mb-3 shadow-lg mx-auto"
                                style={{ backgroundColor: formData.color + "20", color: formData.color }}
                              >
                                {formData.icon}
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {formData.name || "Nombre de la categoría"}
                              </p>
                              {formData.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {formData.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="lg:col-span-3 flex flex-col">
                      <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)] p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Sección Información Básica */}
                          {activeSection === "basic" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
                                <div className="flex items-center mb-4">
                                  <TagIcon className="h-6 w-6 text-primary-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-primary-900">Información Básica</h3>
                                </div>

                                <div className="space-y-6">
                                  {/* Nombre */}
                                  <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                      Nombre de la categoría *
                                    </label>
                                    <input
                                      type="text"
                                      name="name"
                                      id="name"
                                      value={formData.name}
                                      onChange={handleChange}
                                      className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                                        errors.name
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-300 hover:border-gray-400 bg-white"
                                      }`}
                                      placeholder="Ej: Bebidas, Lácteos, Limpieza..."
                                    />
                                    {errors.name && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.name}
                                      </p>
                                    )}
                                  </div>

                                  {/* Vista previa grande */}
                                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                                    <div className="text-center">
                                      <div
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl mb-3 shadow-lg"
                                        style={{ backgroundColor: formData.color + "20", color: formData.color }}
                                      >
                                        {formData.icon}
                                      </div>
                                      <p className="text-sm font-medium text-gray-700">
                                        {formData.name || "Nombre de la categoría"}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">Vista previa de la categoría</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Información adicional */}
                                <div className="mt-6 p-4 bg-white rounded-lg border border-primary-200">
                                  <div className="flex items-start">
                                    <InformationCircleIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-2" />
                                    <div className="text-sm text-primary-800">
                                      <p className="font-medium">Sobre las categorías:</p>
                                      <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                                        <li>Ayudan a organizar tus productos</li>
                                        <li>Facilitan la búsqueda y navegación</li>
                                        <li>Se pueden personalizar con colores e iconos</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sección Apariencia */}
                          {activeSection === "appearance" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                                <div className="flex items-center mb-4">
                                  <SwatchIcon className="h-6 w-6 text-purple-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-purple-900">Personalización Visual</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Color */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                                    <div className="space-y-4">
                                      <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="h-12 w-24 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        {predefinedColors.map((color) => (
                                          <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, color }))}
                                            className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${
                                              formData.color === color ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-300"
                                            }`}
                                            style={{ backgroundColor: color }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {errors.color && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.color}
                                      </p>
                                    )}
                                  </div>

                                  {/* Icono */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Icono *</label>
                                    <div className="space-y-4">
                                      <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                                          errors.icon ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        placeholder="Ej: 📦"
                                      />
                                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {predefinedIcons.map((icon) => (
                                          <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                                            className={`w-12 h-12 text-xl border-2 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 ${
                                              formData.icon === icon ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200" : "border-gray-300"
                                            }`}
                                          >
                                            {icon}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    {errors.icon && (
                                      <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.icon}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Vista previa de la apariencia */}
                                <div className="mt-6 p-6 bg-white rounded-lg border border-purple-200">
                                  <div className="text-center">
                                    <div
                                      className="inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl mb-4 shadow-lg"
                                      style={{ backgroundColor: formData.color + "20", color: formData.color }}
                                    >
                                      {formData.icon}
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {formData.name || "Nombre de la categoría"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">Así se verá tu categoría</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sección Detalles */}
                          {activeSection === "details" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                <div className="flex items-center mb-4">
                                  <SparklesIcon className="h-6 w-6 text-green-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-green-900">Información Adicional</h3>
                                </div>

                                <div className="space-y-6">
                                  {/* Descripción */}
                                  <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                      Descripción
                                    </label>
                                    <textarea
                                      name="description"
                                      id="description"
                                      value={formData.description}
                                      onChange={handleChange}
                                      rows={4}
                                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 transition-all resize-none bg-white"
                                      placeholder="Descripción opcional de la categoría, qué tipo de productos incluye, características especiales, etc."
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                      La descripción es opcional pero ayuda a identificar mejor la categoría
                                    </p>
                                  </div>

                                  {/* Resumen final */}
                                  <div className="p-6 bg-white rounded-lg border border-green-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">Resumen de la categoría:</h4>
                                    <div className="flex items-start space-x-4">
                                      <div
                                        className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg"
                                        style={{ backgroundColor: formData.color + "20", color: formData.color }}
                                      >
                                        {formData.icon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-lg font-semibold text-gray-900">
                                          {formData.name || "Nombre de la categoría"}
                                        </p>
                                        {formData.description && (
                                          <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                                        )}
                                        <div className="flex items-center mt-2 space-x-4">
                                          <div className="flex items-center">
                                            <div
                                              className="w-4 h-4 rounded-full mr-2"
                                              style={{ backgroundColor: formData.color }}
                                            ></div>
                                            <span className="text-xs text-gray-500">Color: {formData.color}</span>
                                          </div>
                                          <span className="text-xs text-gray-500">Icono: {formData.icon}</span>
                                        </div>
                                      </div>
                                    </div>
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

                {/* Footer con navegación */}
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
                      className="py-3 px-6 text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg"
                      disabled={loading}
                    >
                      {loading ? "Guardando..." : category ? "Actualizar Categoría" : "Crear Categoría"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="py-3 px-6 text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg"
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

export default CategoryForm
