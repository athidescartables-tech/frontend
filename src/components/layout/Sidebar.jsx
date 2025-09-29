"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Link, useLocation } from "react-router-dom"
import {
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useAuth } from "@/contexts/AuthContext"

const navigation = [
  // Rutas para todos los usuarios autenticados
  { name: "Dashboard", href: "/", icon: HomeIcon, roles: ["admin", "empleado"] },

  // Rutas permitidas para empleados
  { name: "Ventas", href: "/ventas", icon: ShoppingCartIcon, roles: ["admin", "empleado"] },
  { name: "Caja", href: "/caja", icon: CurrencyDollarIcon, roles: ["admin", "empleado"] },
  { name: "Clientes", href: "/clientes", icon: UsersIcon, roles: ["admin", "empleado"] },

  // Rutas solo para admin
  { name: "Stock", href: "/stock", icon: CubeIcon, roles: ["admin"] },
  { name: "Categorías", href: "/categorias", icon: TagIcon, roles: ["admin"] },
  { name: "Reportes", href: "/reportes", icon: ChartBarIcon, roles: ["admin"] },
  { name: "Configuración", href: "/configuracion", icon: Cog6ToothIcon, roles: ["admin"] },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const location = useLocation()
  const { user } = useAuth()

  const filteredNavigation = navigation.filter((item) => {
    // Si no hay usuario, no mostrar nada
    if (!user?.role) return false

    // Verificar si el rol del usuario está en los roles permitidos para este item
    return item.roles.includes(user.role)
  })

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center w-full mt-5">
          <div className="w-full">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <BuildingStorefrontIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Athi Descartables</h1>
                <p className="text-xs text-gray-500">Sistema de Ventas</p>
              </div>
            </div>
            {/* Línea separadora */}
            <div className="w-full h-px bg-gray-200 mt-4"></div>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={clsx(
                      location.pathname === item.href
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
                        : "text-gray-700 hover:text-blue-700 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200",
                    )}
                  >
                    <item.icon
                      className={clsx(
                        location.pathname === item.href ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600",
                        "h-5 w-5 shrink-0 transition-colors",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          <li className="mt-auto">
            <div
              className={clsx(
                "rounded-lg p-3 border",
                user?.role === "admin" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200",
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={clsx(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    user?.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700",
                  )}
                >
                  <span className="text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Usuario"}</p>
                  <p className={clsx("text-xs truncate", user?.role === "admin" ? "text-blue-600" : "text-gray-500")}>
                    {user?.role === "admin" ? "Administrador" : "Empleado"}
                  </p>
                </div>
                <div
                  className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    user?.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800",
                  )}
                >
                  {user?.role === "admin" ? "Admin" : "Empleado"}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )

  if (isMobile) {
    return (
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    )
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <SidebarContent />
    </div>
  )
}

export default Sidebar
