import api from "@/config/api"

const customersService = {
// Obtener todos los clientes con filtros mejorados
getCustomers: async (params = {}) => {
  const queryParams = new URLSearchParams()

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      queryParams.append(key, params[key])
    }
  })

  const queryString = queryParams.toString()
  const url = queryString ? `/customers?${queryString}` : "/customers"

  const response = await api.get(url)
  return response.data
},

// Obtener cliente por ID
getCustomerById: async (id) => {
  const response = await api.get(`/customers/${id}`)
  return response.data
},

// Obtener saldo de un cliente
getCustomerBalance: async (id) => {
  const response = await api.get(`/customers/${id}/balance`)
  return response.data
},

// Crear cliente
createCustomer: async (customerData) => {
  const response = await api.post("/customers", customerData)
  return response.data
},

// Actualizar cliente
updateCustomer: async (id, customerData) => {
  const response = await api.put(`/customers/${id}`, customerData)
  return response.data
},

// Eliminar cliente
deleteCustomer: async (id) => {
  const response = await api.delete(`/customers/${id}`)
  return response.data
},

// Obtener transacciones de un cliente
getCustomerTransactions: async (customerId, params = {}) => {
  const queryParams = new URLSearchParams()

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      queryParams.append(key, params[key])
    }
  })

  const queryString = queryParams.toString()
  const url = queryString
    ? `/customers/${customerId}/transactions?${queryString}`
    : `/customers/${customerId}/transactions`

  const response = await api.get(url)
  return response.data
},

// Crear transacción de cuenta corriente
createAccountTransaction: async (transactionData) => {
  const response = await api.post("/customers/transactions", transactionData)
  return response.data
},

// Obtener estadísticas
getStats: async () => {
  const response = await api.get("/customers/stats")
  return response.data
},
}

export default customersService
