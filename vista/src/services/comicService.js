const API = 'http://localhost:5074/api'

export const getComics = async () => {
  const response = await fetch(`${API}/Comics`)
  if (!response.ok) throw new Error('Error al obtener comics')
  return response.json()
}

export const getComicById = async (id) => {
  const response = await fetch(`${API}/Comics/${id}`)
  if (!response.ok) throw new Error('Comic no encontrado')
  return response.json()
}

export const createComic = async (comic) => {
  const response = await fetch(`${API}/Comics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comic)
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo crear el comic')
  return data
}

export const updateComic = async (id, comic) => {
  const response = await fetch(`${API}/Comics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comic)
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo actualizar el comic')
  return data
}

export const deleteComic = async (id) => {
  const response = await fetch(`${API}/Comics/${id}`, { method: 'DELETE' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo borrar el comic')
  return data
}
