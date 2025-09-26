"use client"

import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import AccessDenied from "@/components/common/AccessDenied"

const ProtectedRoute = ({ children, requiredRole = null, showAccessDenied = false }) => {
  const { isAuthenticated, user, initialized } = useAuth()
  const { error } = useToast()
  const location = useLocation()

  useEffect(() => {
    // Verificar si el usuario tiene el rol requerido
    if (isAuthenticated && user && requiredRole) {
      const userRole = user.role

      // Si es empleado y trata de acceder a rutas de admin
      if (requiredRole === "admin" && userRole !== "admin") {
        if (!showAccessDenied) {
          error("No tienes permisos para acceder a esta sección", {
            title: "Acceso denegado",
          })
        }
      }
    }
  }, [isAuthenticated, user, requiredRole, error, showAccessDenied])

  // Mostrar loading mientras se inicializa la autenticación
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar permisos de rol
  if (requiredRole && user?.role !== requiredRole) {
    // Si es empleado tratando de acceder a rutas de admin
    if (requiredRole === "admin" && user?.role === "empleado") {
      if (showAccessDenied) {
        return (
          <AccessDenied title="Acceso Restringido" message="Esta sección está disponible solo para administradores." />
        )
      }
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
