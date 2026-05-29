const API = 'http://localhost:5074/api'

export const login = async (email, password) => {
  const response = await fetch(`${API}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()

  if (!response.ok) throw new Error(data.message)

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