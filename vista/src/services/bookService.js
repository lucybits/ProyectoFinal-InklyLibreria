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
