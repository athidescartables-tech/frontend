"use client"

import { useAuth } from "@/contexts/AuthContext"

export const usePermissions = () => {
  const { user } = useAuth()

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  const canAccess = (requiredRole) => {
    if (!requiredRole) return true
    return user?.role === requiredRole
  }

  const canAccessMultiple = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.includes(user?.role)
  }

  // Permisos específicos del sistema
  const permissions = {
    // Permisos básicos
    isAdmin: user?.role === "admin",
    isEmployee: user?.role === "empleado",

    // Permisos de módulos - Empleados pueden acceder a estos
    canMakeSales: hasAnyRole(["admin", "empleado"]),
    canManageCash: hasAnyRole(["admin", "empleado"]),
    canManageCustomers: hasAnyRole(["admin", "empleado"]),

    // Permisos solo para admin
    canManageStock: hasRole("admin"),
    canManageCategories: hasRole("admin"),
    canManagePurchases: hasRole("admin"),
    canManageSuppliers: hasRole("admin"),
    canViewReports: hasRole("admin"),
    canManageConfiguration: hasRole("admin"),
    canManageUsers: hasRole("admin"),

    // Permisos de navegación
    canAccessDashboard: hasAnyRole(["admin", "empleado"]),
    canAccessAdminSections: hasRole("admin"),
  }

  return {
    user,
    hasRole,
    hasAnyRole,
    canAccess,
    canAccessMultiple,
    permissions,
  }
}

export default usePermissions
