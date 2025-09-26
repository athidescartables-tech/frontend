"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/contexts/ToastContext"
import { userService } from "@/services/userService"
import Card from "@/components/common/Card"
import LoadingButton from "@/components/common/LoandingButton"
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

const UserManagement = () => {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "empleado",
    active: true,
  })
  const [formErrors, setFormErrors] = useState({})

  // Roles disponibles
  const roles = [
    { id: "admin", name: "Administrador" },
    { id: "empleado", name: "Empleado" },
  ]

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await userService.getUsers()
      if (result.success) {
        setUsers(result.data)
      } else {
        toast.error("Error cargando usuarios", result.error)
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      toast.error("Error cargando usuarios", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Limpiar error del campo específico
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido"
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      errors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Ingresa un email válido"
    }

    if (!editingUser && !formData.password) {
      errors.password = "La contraseña es requerida"
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.role) {
      errors.role = "El rol es requerido"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      let result

      if (editingUser) {
        // Actualizar usuario existente
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          active: formData.active,
        }
        result = await userService.updateUser(editingUser.id, updateData)
      } else {
        // Crear nuevo usuario
        const createData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        }
        result = await userService.createUser(createData)
      }

      if (result.success) {
        toast.success(
          editingUser ? "Usuario actualizado" : "Usuario creado",
          result.message || `El usuario se ha ${editingUser ? "actualizado" : "creado"} correctamente`,
        )
        resetForm()
        loadUsers() // Recargar la lista
      } else {
        toast.error(editingUser ? "Error actualizando usuario" : "Error creando usuario", result.error)
      }
    } catch (error) {
      console.error("Error en formulario de usuario:", error)
      toast.error("Error", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "empleado",
      active: true,
    })
    setFormErrors({})
    setEditingUser(null)
    setShowForm(false)
  }

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // No mostrar contraseña existente
      role: user.role,
      active: user.active,
    })
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
      setLoading(true)
      try {
        const result = await userService.deleteUser(userId)
        if (result.success) {
          toast.success("Usuario eliminado", result.message || "El usuario se ha eliminado correctamente")
          loadUsers() // Recargar la lista
        } else {
          toast.error("Error eliminando usuario", result.error)
        }
      } catch (error) {
        console.error("Error eliminando usuario:", error)
        toast.error("Error eliminando usuario", "Esta funcionalidad aún no está disponible")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    setLoading(true)
    try {
      const result = await userService.toggleUserStatus(userId, !currentStatus)
      if (result.success) {
        toast.success("Estado actualizado", result.message || "El estado del usuario se ha actualizado")
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, active: !currentStatus } : user)),
        )
      } else {
        toast.error("Error actualizando estado", result.error)
      }
    } catch (error) {
      console.error("Error actualizando estado:", error)
      toast.error("Error actualizando estado", "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : roleId
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca"
    try {
      return new Date(dateString).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </button>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Formulario */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Juan Pérez"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border ${
                      formErrors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="juan@empresa.com"
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                      className={`w-full px-3 py-2 border ${
                        formErrors.password ? "border-red-300" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border ${
                      formErrors.role ? "border-red-300" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
                </div>
              </div>

              {editingUser && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Usuario Activo</label>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  loadingText={editingUser ? "Actualizando..." : "Creando..."}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {editingUser ? "Actualizar" : "Crear"} Usuario
                </LoadingButton>
              </div>
            </form>
          </div>
        )}

        {/* Lista de usuarios */}
        {loading && !showForm ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRoleName(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.last_login)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar usuario"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.active)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title={user.active ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar usuario"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No hay usuarios registrados</p>
                <p className="text-sm">Crea el primer usuario para comenzar</p>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default UserManagement
