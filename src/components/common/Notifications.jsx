"use client"

import { Fragment } from "react"
import { Transition } from "@headlessui/react"
import { useAppStore } from "@/stores/appStore"
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import ToastContainer from "@/components/ui/Toast"

const Notifications = () => {
  const { notifications, removeNotification } = useAppStore()

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircleIcon
      case "error":
        return XCircleIcon
      case "warning":
        return ExclamationTriangleIcon
      default:
        return InformationCircleIcon
    }
  }

  const getColors = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-800 border-green-200"
      case "error":
        return "bg-red-50 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-50 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type)
        return (
          <Transition
            key={notification.id}
            show={true}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${getColors(
                notification.type,
              )}`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        )
      })}
      <ToastContainer />
    </div>
  )
}

export default Notifications
