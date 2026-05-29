const API = 'http://localhost:5074/api'

export const getOrders = async () => {
  const response = await fetch(`${API}/Orders`)
  const data = await response.json().catch(() => [])
  if (!response.ok) throw new Error(data?.message || 'No se pudieron cargar las ordenes')
  return data
}

export const createOrder = async (order) => {
  const response = await fetch(`${API}/Orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const validationErrors = data?.errors
      ? Object.values(data.errors).flat().join(' ')
      : ''
    throw new Error(data?.message || validationErrors || 'No se pudo registrar la orden')
  }
  return data
}

export const getCustomerOrders = async (customerId) => {
  const response = await fetch(`${API}/Orders/customer/${customerId}`)
  const data = await response.json().catch(() => [])
  if (!response.ok) throw new Error(data?.message || 'No se pudieron cargar las compras')
  return data
}

export const updateOrderStatus = async (id, status) => {
  const response = await fetch(`${API}/Orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo actualizar la orden')
  return data
}

export const deleteOrder = async (id) => {
  const response = await fetch(`${API}/Orders/${id}`, { method: 'DELETE' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo borrar la orden')
  return data
}
