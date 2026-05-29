const API = 'http://localhost:5074/api'

export const getBooks = async () => {
  const response = await fetch(`${API}/Books`)
  if (!response.ok) throw new Error('Error al obtener libros')
  return response.json()
}

export const getBookById = async (id) => {
  const response = await fetch(`${API}/Books/${id}`)
  if (!response.ok) throw new Error('Libro no encontrado')
  return response.json()
}

export const createBook = async (book) => {
  const response = await fetch(`${API}/Books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo crear el libro')
  return data
}

export const updateBook = async (id, book) => {
  const response = await fetch(`${API}/Books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo actualizar el libro')
  return data
}

export const deleteBook = async (id) => {
  const response = await fetch(`${API}/Books/${id}`, { method: 'DELETE' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo borrar el libro')
  return data
}
