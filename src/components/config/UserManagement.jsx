"use client"

import { useState } from "react"
import { useConfigStore } from "@/stores/configStore"
import { useAppStore } from "@/stores/appStore"
import Card from "@/components/common/Card"
import Button from "@/components/common/Button"
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
  const { users, roles, addUser, updateUser, deleteUser, toggleUserStatus } = useConfigStore()
  const { addNotification } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    role: "seller",
    permissions: [],
    active: true,
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleRoleChange = (e) => {
    const roleId = e.target.value
    const role = roles.find((r) => r.id === roleId)
    setFormData((prev) => ({
      ...prev,
      role: roleId,
      permissions: role ? role.permissions : [],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingUser) {
      updateUser(editingUser.id, formData)
      addNotification({
        type: "success",
        title: "Usuario actualizado",
        message: "El usuario se ha actualizado correctamente",
      })
    } else {
      addUser(formData)
      addNotification({
        type: "success",
        title: "Usuario creado",
        message: "El usuario se ha creado correctamente",
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      name: "",
      role: "seller",
      permissions: [],
      active: true,
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      active: user.active,
    })
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = (userId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
      deleteUser(userId)
      addNotification({
        type: "success",
        title: "Usuario eliminado",
        message: "El usuario se ha eliminado correctamente",
      })
    }
  }

  const handleToggleStatus = (userId) => {
    toggleUserStatus(userId)
    addNotification({
      type: "info",
      title: "Estado actualizado",
      message: "El estado del usuario se ha actualizado",
    })
  }

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : roleId
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UsersIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Usuario Activo</label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={resetForm}>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" className="flex items-center">
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingUser ? "Actualizar" : "Crear"} Usuario
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
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
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit(user)} className="text-primary-600 hover:text-primary-900">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      {user.active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default UserManagement
