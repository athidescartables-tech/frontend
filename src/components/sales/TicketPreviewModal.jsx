"use client"

import { useState, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, PrinterIcon, EyeIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "../../lib/formatters"
import { ticketService } from "../../services/ticketService"
import { useToast } from "../../contexts/ToastContext"
import Button from "../common/Button"

const TicketPreviewModal = ({ show, onClose, saleData }) => {
  const [printing, setPrinting] = useState(false)
  const { showToast } = useToast()

  if (!saleData) return null

  const ticketData = ticketService.generateTicketData(saleData)

  const handlePrint = async () => {
    setPrinting(true)
    try {
      await ticketService.printThermalTicket(ticketData)
      showToast("Ticket enviado a impresión", "success")
      onClose()
    } catch (error) {
      showToast(error.message || "Error al imprimir ticket", "error")
    } finally {
      setPrinting(false)
    }
  }

  const getUnitLabel = (unitType) => {
    const labels = {
      unidades: "un",
      kg: "kg",
      litros: "lt",
      metros: "m",
    }
    return labels[unitType] || "un"
  }

  return (
    <Transition appear show={show} as={Fragment}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-5 w-5 text-gray-600" />
                    <Dialog.Title className="text-lg font-semibold text-gray-900">Vista Previa del Ticket</Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Ticket Preview */}
                <div className="p-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
                      <div className="font-bold text-base mb-1">{ticketData.company.name}</div>
                      <div className="text-xs leading-tight">
                        {ticketData.company.address}
                        <br />
                        {ticketData.company.phone}
                        <br />
                        {ticketData.company.email}
                        <br />
                        {ticketData.company.cuit && `CUIT: ${ticketData.company.cuit}`}
                      </div>
                    </div>

                    {/* Sale Info */}
                    <div className="mb-3 text-xs">
                      <div>
                        <strong>Ticket #{ticketData.sale.id}</strong>
                      </div>
                      <div>
                        Fecha: {ticketData.sale.date} {ticketData.sale.time}
                      </div>
                      <div>Cajero: {ticketData.sale.cashier}</div>
                      <div>Cliente: {ticketData.sale.customer}</div>
                      <div>Pago: {ticketData.sale.paymentMethod}</div>
                    </div>

                    {/* Items */}
                    <div className="border-t border-b border-dashed border-gray-400 py-3 mb-3">
                      {ticketData.items.map((item, index) => (
                        <div key={index} className="mb-2">
                          <div className="font-semibold">{item.name}</div>
                          <div className="flex justify-between text-xs">
                            <span>
                              {item.quantity} {getUnitLabel(item.unitType)} x {formatCurrency(item.unitPrice)}
                            </span>
                            <span>{formatCurrency(item.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(ticketData.totals.subtotal)}</span>
                      </div>
                      {ticketData.totals.discount > 0 && (
                        <div className="flex justify-between mb-1">
                          <span>Descuento:</span>
                          <span>-{formatCurrency(ticketData.totals.discount)}</span>
                        </div>
                      )}
                      {ticketData.totals.tax > 0 && (
                        <div className="flex justify-between mb-1">
                          <span>Impuestos:</span>
                          <span>{formatCurrency(ticketData.totals.tax)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm border-t border-gray-400 pt-2 mt-2">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(ticketData.totals.total)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-400 text-xs">
                      ¡Gracias por su compra!
                      <br />
                      {new Date().toLocaleString("es-AR")}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                  <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                    Cancelar
                  </Button>
                  <Button onClick={handlePrint} loading={printing} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    {printing ? "Imprimiendo..." : "Imprimir"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default TicketPreviewModal
