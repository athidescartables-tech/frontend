"use client"

import { useState } from "react"
import { useConfigStore } from "@/stores/configStore"
import { useAppStore } from "@/stores/appStore"
import Card from "@/components/common/Card"
import Button from "@/components/common/Button"
import { ShieldCheckIcon, CheckIcon } from "@heroicons/react/24/outline"

const SecurityConfig = () => {
  const { securityConfig, updateSecurityConfig } = useConfigStore()
  const { addNotification } = useAppStore()
  const [formData, setFormData] = useState(securityConfig)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateSecurityConfig(formData)
    addNotification({
      type: "success",
      title: "Configuración guardada",
      message: "La configuración de seguridad se ha actualizado correctamente",
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Configuración de Seguridad</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración de Sesión */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Configuración de Sesión</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo de Sesión (minutos)</label>
              <input
                type="number"
                name="sessionTimeout"
                value={formData.sessionTimeout}
                onChange={handleInputChange}
                min="5"
                max="480"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Tiempo antes de cerrar sesión automáticamente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intentos de Login Máximos</label>
              <input
                type="number"
                name="maxLoginAttempts"
                value={formData.maxLoginAttempts}
                onChange={handleInputChange}
                min="3"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración de Bloqueo (minutos)</label>
              <input
                type="number"
                name="lockoutDuration"
                value={formData.lockoutDuration}
                onChange={handleInputChange}
                min="5"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Contraseñas */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Política de Contraseñas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitud Mínima</label>
              <input
                type="number"
                name="passwordMinLength"
                value={formData.passwordMinLength}
                onChange={handleInputChange}
                min="6"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireSpecialChars"
                  checked={formData.requireSpecialChars}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Requerir caracteres especiales</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireNumbers"
                  checked={formData.requireNumbers}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Requerir números</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireUppercase"
                  checked={formData.requireUppercase}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Requerir mayúsculas</label>
              </div>
            </div>
          </div>
        </div>

        {/* Autenticación de Dos Factores */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Autenticación de Dos Factores</h4>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="twoFactorAuth"
              checked={formData.twoFactorAuth}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Habilitar autenticación de dos factores</label>
          </div>
          <p className="text-xs text-gray-500 mt-1">Requiere verificación adicional al iniciar sesión</p>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => setFormData(securityConfig)}>
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

export default SecurityConfig
