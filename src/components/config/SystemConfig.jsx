"use client"

import { useState } from "react"
import { useConfigStore } from "@/stores/configStore"
import { useAppStore } from "@/stores/appStore"
import Card from "@/components/common/Card"
import Button from "@/components/common/Button"
import { CogIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

const SystemConfig = () => {
  const { systemConfig, updateSystemConfig, resetToDefaults } = useConfigStore()
  const { addNotification } = useAppStore()
  const [formData, setFormData] = useState(systemConfig)

  const currencies = [
    { value: "ARS", label: "Peso Argentino (ARS)" },
    { value: "USD", label: "Dólar Estadounidense (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
  ]

  const locales = [
    { value: "es-AR", label: "Español (Argentina)" },
    { value: "es-ES", label: "Español (España)" },
    { value: "en-US", label: "Inglés (Estados Unidos)" },
  ]

  const timezones = [
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
    { value: "America/Argentina/Cordoba", label: "Córdoba" },
    { value: "America/Argentina/Mendoza", label: "Mendoza" },
  ]

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ]

  const timeFormats = [
    { value: "HH:mm", label: "24 horas (HH:mm)" },
    { value: "hh:mm A", label: "12 horas (hh:mm AM/PM)" },
  ]

  const backupFrequencies = [
    { value: "daily", label: "Diario" },
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensual" },
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateSystemConfig(formData)
    addNotification({
      type: "success",
      title: "Configuración guardada",
      message: "La configuración del sistema se ha actualizado correctamente",
    })
  }

  const handleReset = () => {
    if (window.confirm("¿Está seguro de que desea restaurar la configuración por defecto?")) {
      resetToDefaults()
      setFormData(systemConfig)
      addNotification({
        type: "info",
        title: "Configuración restaurada",
        message: "Se ha restaurado la configuración por defecto",
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CogIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h3>
        </div>
        <Button type="button" variant="secondary" onClick={handleReset} className="flex items-center">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Restaurar Defecto
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración Regional */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Configuración Regional</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Idioma/Región</label>
              <select
                name="locale"
                value={formData.locale}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {locales.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {timezones.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Fecha</label>
              <select
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {dateFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Hora</label>
              <select
                name="timeFormat"
                value={formData.timeFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {timeFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configuración Numérica */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Configuración Numérica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Decimales</label>
              <input
                type="number"
                name="decimalPlaces"
                value={formData.decimalPlaces}
                onChange={handleInputChange}
                min="0"
                max="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Separador de Miles</label>
              <input
                type="text"
                name="thousandSeparator"
                value={formData.thousandSeparator}
                onChange={handleInputChange}
                maxLength="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Separador Decimal</label>
              <input
                type="text"
                name="decimalSeparator"
                value={formData.decimalSeparator}
                onChange={handleInputChange}
                maxLength="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IVA por Defecto (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Stock */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Configuración de Stock</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Umbral de Stock Bajo</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Backup */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Configuración de Respaldo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoBackup"
                checked={formData.autoBackup}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Respaldo Automático</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Respaldo</label>
              <select
                name="backupFrequency"
                value={formData.backupFrequency}
                onChange={handleInputChange}
                disabled={!formData.autoBackup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              >
                {backupFrequencies.map((frequency) => (
                  <option key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => setFormData(systemConfig)}>
            Cancelar
          </Button>
          <Button type="submit" className="flex items-center">
            <CheckIcon className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default SystemConfig
