"use client"

import { useState, useEffect } from "react"
import { useCashStore } from "@/stores/cashStore"
import { useAuth } from "@/contexts/AuthContext"
import Card from "@/components/common/Card"
import { formatCurrency } from "@/lib/formatters"
import {
  BanknotesIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShoppingCartIcon, // Icono para Ventas
  CubeIcon, // Icono para Stock
  UsersIcon, // Icono para Clientes
  ChartBarIcon, // Icono para Reportes
  WalletIcon, // Icono para Caja
} from "@heroicons/react/24/outline"
import { Link } from "react-router-dom" // Importar Link de react-router-dom

const Dashboard = () => {
  const { user } = useAuth()
  const { currentCash, fetchCurrentStatus } = useCashStore()
  const [loading, setLoading] = useState(true)

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        await fetchCurrentStatus()
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [fetchCurrentStatus])

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    )
  }

  const quickLinks = [
    { name: "Hacer una Venta", icon: ShoppingCartIcon, path: "/ventas", color: "text-blue-600" },
    { name: "Ir a Caja", icon: WalletIcon, path: "/caja", color: "text-green-600" },
    { name: "Ir a Stock", icon: CubeIcon, path: "/stock", color: "text-purple-600" },
    { name: "Ir a Clientes", icon: UsersIcon, path: "/clientes", color: "text-orange-600" },
    { name: "Ir a Reportes", icon: ChartBarIcon, path: "/reportes", color: "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido, {user?.name || "Usuario"}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general de tu negocio -{" "}
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Estado de caja */}
      {!currentCash.isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Caja Cerrada</h3>
              <p className="text-sm text-yellow-700 mt-1">
                La caja está cerrada. Debes abrirla para comenzar a operar y procesar ventas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado de caja abierta */}
      {currentCash.isOpen && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BanknotesIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Caja Abierta</h3>
                <p className="text-sm text-green-700 mt-1">
                  Efectivo disponible: {formatCurrency(currentCash.currentAmount)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600">Abierta por: {currentCash.openedBy}</p>
              <p className="text-xs text-green-600">
                <ClockIcon className="h-3 w-3 inline mr-1" />
                {new Date(currentCash.openingDate).toLocaleTimeString("es-AR")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enlaces Rápidos */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.name} to={link.path} className="block">
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <link.icon className={`h-10 w-10 mb-3 ${link.color}`} />
                  <h3 className="text-base font-semibold text-gray-800">{link.name}</h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
