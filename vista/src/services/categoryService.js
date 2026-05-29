const API = 'http://localhost:5074/api'

export const getCategories = async () => {
  const response = await fetch(`${API}/Categories`)
  if (!response.ok) throw new Error('Error al obtener categorias')
  return response.json()
}

export const createCategory = async (category) => {
  const response = await fetch(`${API}/Categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo crear la categoria')
  return data
}

export const updateCategory = async (id, category) => {
  const response = await fetch(`${API}/Categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo actualizar la categoria')
  return data
}

export const deleteCategory = async (id) => {
  const response = await fetch(`${API}/Categories/${id}`, { method: 'DELETE' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo borrar la categoria')
  return data
}
