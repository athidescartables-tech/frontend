"use client"

import { useState } from "react"
import { useConfigStore } from "../../store/configStore"
import { useToast } from "../../contexts/ToastContext"
import Card from "../common/Card"
import Button from "../common/Button"
import { PrinterIcon, CheckIcon } from "@heroicons/react/24/outline"

const TicketConfig = () => {
  const { printConfig, updatePrintConfig, companyInfo } = useConfigStore()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    ...printConfig,
    // Configuraciones específicas para tickets
    ticketWidth: printConfig.ticketWidth || 80, // mm
    showLogo: printConfig.showLogo !== undefined ? printConfig.showLogo : true,
    showCompanyInfo: printConfig.showCompanyInfo !== undefined ? printConfig.showCompanyInfo : true,
    showThankYouMessage: printConfig.showThankYouMessage !== undefined ? printConfig.showThankYouMessage : true,
    thankYouMessage: printConfig.thankYouMessage || "¡Gracias por su compra!",
    autoPrint: printConfig.autoPrint !== undefined ? printConfig.autoPrint : false,
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updatePrintConfig(formData)
    showToast("Configuración de tickets guardada correctamente", "success")
  }

  const handleTestPrint = () => {
    // Crear datos de prueba para el ticket
    const testSaleData = {
      id: "TEST-001",
      created_at: new Date().toISOString(),
      cashier_name: "Usuario de Prueba",
      customer_name: "Cliente de Prueba",
      payment_method: "efectivo",
      subtotal: 1500.0,
      discount: 0,
      tax: 0,
      total: 1500.0,
      items: [
        {
          product_name: "Producto de Prueba 1",
          quantity: 2,
          unit_price: 500.0,
          subtotal: 1000.0,
          product_unit_type: "unidades",
        },
        {
          product_name: "Producto de Prueba 2",
          quantity: 0.5,
          unit_price: 1000.0,
          subtotal: 500.0,
          product_unit_type: "kg",
        },
      ],
    }

    // Importar dinámicamente el servicio de tickets
    import("../../services/ticketService").then(({ ticketService }) => {
      const ticketData = ticketService.generateTicketData(testSaleData)
      ticketService
        .printThermalTicket(ticketData)
        .then(() => {
          showToast("Ticket de prueba enviado a impresión", "success")
        })
        .catch((error) => {
          showToast(error.message || "Error al imprimir ticket de prueba", "error")
        })
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <PrinterIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Configuración de Tickets</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración de Impresora */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Configuración de Impresora</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Impresora</label>
              <input
                type="text"
                name="printerName"
                value={formData.printerName}
                onChange={handleInputChange}
                placeholder="Impresora térmica por defecto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Deja vacío para usar la impresora predeterminada del sistema</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ancho del Ticket (mm)</label>
              <select
                name="ticketWidth"
                value={formData.ticketWidth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={58}>58mm (Pequeño)</option>
                <option value={80}>80mm (Estándar)</option>
                <option value={110}>110mm (Grande)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de Fuente</label>
              <select
                name="fontSize"
                value={formData.fontSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={10}>Pequeña (10px)</option>
                <option value={12}>Normal (12px)</option>
                <option value={14}>Grande (14px)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoPrint"
                checked={formData.autoPrint}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Imprimir automáticamente después de la venta</label>
            </div>
          </div>
        </div>

        {/* Contenido del Ticket */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Contenido del Ticket</h4>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="showLogo"
                checked={formData.showLogo}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Mostrar logo de la empresa</label>
              {!companyInfo.logo && <span className="ml-2 text-xs text-amber-600">(No hay logo configurado)</span>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="showCompanyInfo"
                checked={formData.showCompanyInfo}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Mostrar información de la empresa</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="includeBarcode"
                checked={formData.includeBarcode}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Incluir código de barras del ticket</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="showThankYouMessage"
                checked={formData.showThankYouMessage}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Mostrar mensaje de agradecimiento</label>
            </div>

            {formData.showThankYouMessage && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje de Agradecimiento</label>
                <input
                  type="text"
                  name="thankYouMessage"
                  value={formData.thankYouMessage}
                  onChange={handleInputChange}
                  placeholder="¡Gracias por su compra!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Vista Previa */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Vista Previa</h4>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="bg-white border border-gray-200 rounded p-3 font-mono text-xs max-w-xs mx-auto">
              {formData.showCompanyInfo && (
                <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                  <div className="font-bold">{companyInfo.name}</div>
                  <div className="text-xs">{companyInfo.address}</div>
                  <div className="text-xs">{companyInfo.phone}</div>
                </div>
              )}

              <div className="mb-2">
                <div>
                  <strong>Ticket #001</strong>
                </div>
                <div>Fecha: {new Date().toLocaleDateString("es-AR")}</div>
                <div>Cajero: Usuario</div>
              </div>

              <div className="border-t border-b border-dashed border-gray-400 py-2 mb-2">
                <div className="mb-1">
                  <div className="font-semibold">Producto Ejemplo</div>
                  <div className="flex justify-between">
                    <span>1 un x $100.00</span>
                    <span>$100.00</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>$100.00</span>
              </div>

              {formData.showThankYouMessage && (
                <div className="text-center mt-2 pt-2 border-t border-dashed border-gray-400">
                  {formData.thankYouMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestPrint}
            className="flex items-center bg-transparent"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Imprimir Prueba
          </Button>

          <div className="flex space-x-3">
            <Button type="button" variant="secondary" onClick={() => setFormData({ ...printConfig })}>
              Cancelar
            </Button>
            <Button type="submit" className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}

export default TicketConfig
