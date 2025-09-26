"use client"

import { Link } from "react-router-dom"
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useAuth } from "@/contexts/AuthContext"

const AccessDenied = ({
  title = "Acceso Denegado",
  message = "No tienes permisos para acceder a esta sección.",
  showBackButton = true,
  showHomeButton = true,
}) => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>

          {user?.role === "empleado" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Acceso de Empleado:</strong> Tu cuenta tiene permisos limitados. Puedes acceder a Ventas, Caja y
                Clientes. Para otras funciones, contacta a un administrador.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver Atrás
            </button>
          )}

          {showHomeButton && (
            <Link
              to="/"
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Link>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
