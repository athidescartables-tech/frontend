"use client"

import { useState } from "react"
import { useConfigStore } from "@/stores/configStore"
import { useAppStore } from "@/stores/appStore"
import Card from "@/components/common/Card"
import Button from "@/components/common/Button"
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline"

const BackupConfig = () => {
  const { exportConfig, importConfig } = useConfigStore()
  const { addNotification } = useAppStore()
  const [importData, setImportData] = useState("")

  const handleExport = () => {
    try {
      const configData = exportConfig()
      const blob = new Blob([configData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sistema-ventas-config-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addNotification({
        type: "success",
        title: "Configuración exportada",
        message: "La configuración se ha exportado correctamente",
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al exportar",
        message: "No se pudo exportar la configuración",
      })
    }
  }

  const handleImport = () => {
    if (!importData.trim()) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Por favor, pegue los datos de configuración",
      })
      return
    }

    const result = importConfig(importData)

    addNotification({
      type: result.success ? "success" : "error",
      title: result.success ? "Configuración importada" : "Error al importar",
      message: result.message,
    })

    if (result.success) {
      setImportData("")
    }
  }

  const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target.result)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Exportar Configuración */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <CloudArrowDownIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Exportar Configuración</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Descarga un archivo con toda la configuración del sistema para hacer respaldo o transferir a otro sistema.
        </p>
        <Button onClick={handleExport} className="flex items-center">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Descargar Configuración
        </Button>
      </Card>

      {/* Importar Configuración */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <CloudArrowUpIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Importar Configuración</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Restaura la configuración desde un archivo de respaldo. Esto sobrescribirá la configuración actual.
        </p>

        <div className="space-y-4">
          {/* Importar desde archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar archivo de configuración</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          {/* O pegar datos manualmente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">O pegar datos de configuración</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={8}
              placeholder="Pegue aquí el JSON de configuración..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setImportData("")}>
              Limpiar
            </Button>
            <Button onClick={handleImport} className="flex items-center" disabled={!importData.trim()}>
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Importar Configuración
            </Button>
          </div>
        </div>
      </Card>

      {/* Advertencia */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Advertencia</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Importar una configuración sobrescribirá todas las configuraciones actuales del sistema. Se recomienda
                hacer un respaldo antes de importar.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default BackupConfig
