const API = 'http://localhost:5074/api'

export const getComics = async () => {
  const response = await fetch(`${API}/Comics`)
  if (!response.ok) throw new Error('Error al obtener cómics')
  return response.json()
}

export const getComicById = async (id) => {
  const response = await fetch(`${API}/Comics/${id}`)
  if (!response.ok) throw new Error('Cómic no encontrado')
  return response.json()
}