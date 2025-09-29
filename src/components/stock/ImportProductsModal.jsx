"use client"

import { useState } from "react"
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { productsService } from "@/services/productsService"
import { useProductStore } from "@/store/productStore"

export default function ImportProductsModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fetchProducts = useProductStore((state) => state.fetchProducts)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    // Validar tipo de archivo
    const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]

    if (!validTypes.includes(selectedFile.type)) {
      alert("Por favor selecciona un archivo Excel válido (.xlsx o .xls)")
      return
    }

    // Validar tamaño (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Tamaño máximo: 5MB")
      return
    }

    setFile(selectedFile)
    setResults(null)
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await productsService.downloadExcelTemplate()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "plantilla_productos.xlsx")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading template:", error)
      alert("Error al descargar la plantilla")
    }
  }

  const handleImport = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo")
      return
    }

    setImporting(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await productsService.importProductsFromExcel(formData)

      setResults(response.data.data)

      // Recargar productos si hubo importaciones exitosas
      if (response.data.data.success > 0) {
        await fetchProducts({}, true)
      }
    } catch (error) {
      console.error("Error importing products:", error)
      alert(error.response?.data?.message || "Error al importar productos")
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResults(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Importar Productos desde Excel</h2>
              <p className="text-sm text-gray-500">Carga masiva de productos desde archivo Excel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={importing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">Instrucciones de importación</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Descarga la plantilla de Excel y complétala con tus productos</li>
                  <li>Los campos requeridos son: nombre y precio_nivel_1</li>
                  <li>Las categorías se crearán automáticamente si no existen</li>
                  <li>Los productos con código de barras duplicado serán omitidos</li>
                  <li>El stock inicial creará un movimiento de entrada automático</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="flex justify-center">
            <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Descargar Plantilla de Excel
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {file ? file.name : "Arrastra tu archivo Excel aquí"}
            </p>
            <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              disabled={importing}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer bg-transparent" disabled={importing} asChild>
                <span>Seleccionar Archivo</span>
              </Button>
            </label>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Archivo seleccionado: {file.name}</span>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Exitosos</p>
                  <p className="text-2xl font-bold text-green-600">{results.success}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-600">Errores</p>
                  <p className="text-2xl font-bold text-red-600">{results.errors}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-600">Omitidos</p>
                  <p className="text-2xl font-bold text-yellow-600">{results.skipped}</p>
                </div>
              </div>

              {/* Details */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-900">Detalles de la importación</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {results.details.map((detail, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-3 ${
                        detail.status === "success"
                          ? "bg-green-50"
                          : detail.status === "error"
                            ? "bg-red-50"
                            : "bg-yellow-50"
                      }`}
                    >
                      {detail.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : detail.status === "error" ? (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Fila {detail.row}</p>
                        <p className="text-sm text-gray-600">{detail.message}</p>
                        {detail.data && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {detail.data.nombre || detail.data.name || "Sin nombre"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {results ? "Cerrar" : "Cancelar"}
          </Button>
          {!results && (
            <Button onClick={handleImport} disabled={!file || importing} className="gap-2">
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar Productos
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
