const API = 'http://localhost:5074/api'

export const login = async (email, password) => {
  let response
  try {
    response = await fetch(`${API}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Revisa que el backend este corriendo en http://localhost:5074')
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) throw new Error(data.message || 'No se pudo iniciar sesion')

  return data
}

export const register = async (customer) => {
  const response = await fetch(`${API}/Auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  })

  const data = await response.json()

  if (!response.ok) throw new Error(data.message)

  return data
}
