import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useConfigStore = create(
  persist(
    (set, get) => ({
      // Configuración de la empresa
      companyInfo: {
        name: "Mi Empresa",
        address: "Dirección de la empresa",
        phone: "+54 11 1234-5678",
        email: "contacto@miempresa.com",
        cuit: "20-12345678-9",
        logo: null,
        website: "",
        description: "Descripción de la empresa",
      },

      // Configuración del sistema
      systemConfig: {
        currency: "ARS",
        locale: "es-AR",
        timezone: "America/Argentina/Buenos_Aires",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm",
        decimalPlaces: 2,
        thousandSeparator: ".",
        decimalSeparator: ",",
        taxRate: 21, // IVA por defecto
        lowStockThreshold: 10,
        autoBackup: true,
        backupFrequency: "daily", // daily, weekly, monthly
      },

      printConfig: {
        printerName: "",
        paperSize: "A4", // A4, Letter, Thermal
        orientation: "portrait", // portrait, landscape
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
        includeHeader: true,
        includeFooter: true,
        includeBarcode: false,
        fontSize: 12,
        // Configuraciones específicas para tickets
        ticketWidth: 80, // mm (58, 80, 110)
        showLogo: true,
        showCompanyInfo: true,
        showThankYouMessage: true,
        thankYouMessage: "¡Gracias por su compra!",
        autoPrint: false,
      },

      // Configuración de notificaciones
      notificationConfig: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        lowStockAlerts: true,
        salesReports: true,
        backupAlerts: true,
        systemUpdates: true,
      },

      // Configuración de seguridad
      securityConfig: {
        sessionTimeout: 30, // minutos
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15, // minutos
        twoFactorAuth: false,
      },

      // Usuarios del sistema
      users: [
        {
          id: 1,
          username: "admin",
          email: "admin@sistema.com",
          name: "Administrador",
          role: "admin",
          permissions: ["all"],
          active: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          username: "vendedor1",
          email: "vendedor1@sistema.com",
          name: "Juan Pérez",
          role: "seller",
          permissions: ["sales", "customers", "stock_view"],
          active: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],

      // Roles y permisos
      roles: [
        {
          id: "admin",
          name: "Administrador",
          description: "Acceso completo al sistema",
          permissions: ["all"],
        },
        {
          id: "manager",
          name: "Gerente",
          description: "Gestión de ventas, compras y reportes",
          permissions: ["sales", "purchases", "reports", "customers", "suppliers", "stock"],
        },
        {
          id: "seller",
          name: "Vendedor",
          description: "Solo ventas y consulta de stock",
          permissions: ["sales", "customers", "stock_view"],
        },
        {
          id: "cashier",
          name: "Cajero",
          description: "Manejo de caja y ventas",
          permissions: ["sales", "cash", "customers"],
        },
      ],

      // Configuración de módulos
      moduleConfig: {
        sales: { enabled: true, features: ["cart", "discounts", "payments"] },
        purchases: { enabled: true, features: ["suppliers", "orders", "receiving"] },
        stock: { enabled: true, features: ["movements", "alerts", "adjustments"] },
        cash: { enabled: true, features: ["opening", "closing", "movements"] },
        customers: { enabled: true, features: ["accounts", "history", "payments"] },
        suppliers: { enabled: true, features: ["accounts", "orders", "payments"] },
        reports: { enabled: true, features: ["charts", "exports", "scheduling"] },
        categories: { enabled: true, features: ["colors", "icons", "hierarchy"] },
      },

      // Estado de carga
      loading: false,
      error: null,

      // Acciones
      updateCompanyInfo: (info) => {
        set((state) => ({
          companyInfo: { ...state.companyInfo, ...info },
        }))
      },

      updateSystemConfig: (config) => {
        set((state) => ({
          systemConfig: { ...state.systemConfig, ...config },
        }))
      },

      updatePrintConfig: (config) => {
        set((state) => ({
          printConfig: { ...state.printConfig, ...config },
        }))
      },

      updateNotificationConfig: (config) => {
        set((state) => ({
          notificationConfig: { ...state.notificationConfig, ...config },
        }))
      },

      updateSecurityConfig: (config) => {
        set((state) => ({
          securityConfig: { ...state.securityConfig, ...config },
        }))
      },

      updateModuleConfig: (moduleId, config) => {
        set((state) => ({
          moduleConfig: {
            ...state.moduleConfig,
            [moduleId]: { ...state.moduleConfig[moduleId], ...config },
          },
        }))
      },

      // Gestión de usuarios
      addUser: (user) => {
        const newUser = {
          ...user,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          active: true,
        }
        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, ...updates } : user)),
        }))
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        }))
      },

      toggleUserStatus: (userId) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, active: !user.active } : user)),
        }))
      },

      // Gestión de roles
      addRole: (role) => {
        const newRole = {
          ...role,
          id: role.id || Date.now().toString(),
        }
        set((state) => ({
          roles: [...state.roles, newRole],
        }))
      },

      updateRole: (roleId, updates) => {
        set((state) => ({
          roles: state.roles.map((role) => (role.id === roleId ? { ...role, ...updates } : role)),
        }))
      },

      deleteRole: (roleId) => {
        set((state) => ({
          roles: state.roles.filter((role) => role.id !== roleId),
        }))
      },

      // Backup y restauración
      exportConfig: () => {
        const state = get()
        const config = {
          companyInfo: state.companyInfo,
          systemConfig: state.systemConfig,
          printConfig: state.printConfig,
          notificationConfig: state.notificationConfig,
          securityConfig: state.securityConfig,
          moduleConfig: state.moduleConfig,
          roles: state.roles,
          exportDate: new Date().toISOString(),
        }
        return JSON.stringify(config, null, 2)
      },

      importConfig: (configJson) => {
        try {
          const config = JSON.parse(configJson)
          set((state) => ({
            ...state,
            ...config,
            users: state.users, // Mantener usuarios existentes
          }))
          return { success: true, message: "Configuración importada correctamente" }
        } catch (error) {
          return { success: false, message: "Error al importar configuración" }
        }
      },

      // Reset a valores por defecto
      resetToDefaults: () => {
        set((state) => ({
          ...state,
          systemConfig: {
            currency: "ARS",
            locale: "es-AR",
            timezone: "America/Argentina/Buenos_Aires",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            decimalPlaces: 2,
            thousandSeparator: ".",
            decimalSeparator: ",",
            taxRate: 21,
            lowStockThreshold: 10,
            autoBackup: true,
            backupFrequency: "daily",
          },
        }))
      },
    }),
    {
      name: "config-storage",
      partialize: (state) => ({
        companyInfo: state.companyInfo,
        systemConfig: state.systemConfig,
        printConfig: state.printConfig,
        notificationConfig: state.notificationConfig,
        securityConfig: state.securityConfig,
        moduleConfig: state.moduleConfig,
        users: state.users,
        roles: state.roles,
      }),
    },
  ),
)
