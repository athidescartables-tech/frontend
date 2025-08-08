"use client"

import { useState } from "react"
import { useConfigStore } from "@/stores/configStore"
import { useAppStore } from "@/stores/appStore"
import Card from "@/components/common/Card"
import Button from "@/components/common/Button"
import { BuildingOfficeIcon, PhotoIcon, CheckIcon } from "@heroicons/react/24/outline"

const CompanyConfig = () => {
  const { companyInfo, updateCompanyInfo } = useConfigStore()
  const { addNotification } = useAppStore()
  const [formData, setFormData] = useState(companyInfo)
  const [logoPreview, setLogoPreview] = useState(companyInfo.logo)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoData = e.target.result
        setLogoPreview(logoData)
        setFormData((prev) => ({
          ...prev,
          logo: logoData,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateCompanyInfo(formData)
    addNotification({
      type: "success",
      title: "Configuración guardada",
      message: "La información de la empresa se ha actualizado correctamente",
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <BuildingOfficeIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Información de la Empresa</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <PhotoIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Seleccionar Logo
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 2MB</p>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CUIT/CUIL</label>
            <input
              type="text"
              name="cuit"
              value={formData.cuit}
              onChange={handleInputChange}
              placeholder="20-12345678-9"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+54 11 1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contacto@empresa.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://www.empresa.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => setFormData(companyInfo)}>
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

export default CompanyConfig
