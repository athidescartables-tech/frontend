"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { PrinterIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import Button from "../common/Button"

const PrintTicketModal = ({ show, onClose, onPrintTicket, onSkip }) => {
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
                <div className="p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Venta Procesada Exitosamente!
                  </Dialog.Title>
                  <p className="text-sm text-gray-600">¿Deseas imprimir el ticket de esta venta?</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                  <Button variant="outline" onClick={onSkip} className="flex-1 bg-transparent">
                    No, gracias
                  </Button>
                  <Button onClick={onPrintTicket} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Ver e Imprimir
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

export default PrintTicketModal
