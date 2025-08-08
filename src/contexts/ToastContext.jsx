"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import Toast from "@/components/common/Toast"

export const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast debe ser usado dentro de ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // Función helper para procesar mensajes
  const processMessage = (message) => {
    // Si es un objeto, extraer el mensaje
    if (typeof message === "object" && message !== null) {
      return message.message || message.error || JSON.stringify(message)
    }
    // Si es una cadena, devolverla directamente
    return String(message)
  }

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message: processMessage(message),
      type: options.type || "info",
      title: options.title,
      duration: options.duration || 5000,
    }

    setToasts((prev) => [...prev, toast])

    // Auto remove toast
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message, options = {}) => {
      return addToast(message, { ...options, type: "success" })
    },
    [addToast],
  )

  const error = useCallback(
    (message, options = {}) => {
      return addToast(message, { ...options, type: "error" })
    },
    [addToast],
  )

  const warning = useCallback(
    (message, options = {}) => {
      return addToast(message, { ...options, type: "warning" })
    },
    [addToast],
  )

  const info = useCallback(
    (message, options = {}) => {
      return addToast(message, { ...options, type: "info" })
    },
    [addToast],
  )

  // Función showToast para compatibilidad
  const showToast = useCallback(
    (message, type = "info", options = {}) => {
      return addToast(message, { ...options, type })
    },
    [addToast],
  )

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    showToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-[9999]">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
              {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={removeToast} />
              ))}
            </div>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export default ToastContext
