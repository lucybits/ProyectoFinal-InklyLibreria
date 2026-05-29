const API = 'http://localhost:5074/api'

const LOCAL_RENTALS_KEY = 'arkhaus:rental-history'

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export const getRentals = async () => {
  const [booksRes, comicsRes] = await Promise.all([
    fetch(`${API}/Books`),
    fetch(`${API}/Comics`)
  ])
  if (!booksRes.ok) throw new Error('Error al obtener libros')
  if (!comicsRes.ok) throw new Error('Error al obtener cómics')

  const books = await booksRes.json()
  const comics = await comicsRes.json()

  const rentableBooks = books
    .filter(b => b.isAvailableForRental)
    .map(b => ({ ...b, type: 'book' }))

  const rentableComics = comics
    .filter(c => c.isAvailableForRental)
    .map(c => ({ ...c, type: 'comic' }))

  return [...rentableBooks, ...rentableComics]
}

export const getAllRentals = async () => {
  const response = await fetch(`${API}/Rentals`)
  const data = await response.json().catch(() => [])
  if (!response.ok) throw new Error(data?.message || 'No se pudieron cargar las rentas')
  return data
}

export const createRental = async (rental) => {
  const response = await fetch(`${API}/Rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rental)
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo registrar la renta')
  return data
}

export const getCustomerRentals = async (customerId) => {
  const response = await fetch(`${API}/Rentals/customer/${customerId}`)
  const data = await response.json().catch(() => [])
  if (!response.ok) throw new Error(data?.message || 'No se pudieron cargar tus rentas')
  return data
}

export const deleteRental = async (rentalId) => {
  const response = await fetch(`${API}/Rentals/${rentalId}`, {
    method: 'DELETE'
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo cerrar la renta')
  return data
}

export const updateRentalStatus = async (rentalId, status) => {
  const response = await fetch(`${API}/Rentals/${rentalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'No se pudo actualizar la renta')
  return data
}

export const getLocalRentals = (customerId) => {
  if (typeof window === 'undefined') return []
  const all = safeParse(localStorage.getItem(LOCAL_RENTALS_KEY), [])
  return Array.isArray(all)
    ? all.filter(rental => String(rental.customerId) === String(customerId))
    : []
}

export const saveLocalRental = (rental) => {
  if (typeof window === 'undefined') return rental
  const all = safeParse(localStorage.getItem(LOCAL_RENTALS_KEY), [])
  const next = Array.isArray(all) ? [rental, ...all] : [rental]
  localStorage.setItem(LOCAL_RENTALS_KEY, JSON.stringify(next))
  return rental
}

export const updateLocalRental = (customerId, rentalKey, patch) => {
  if (typeof window === 'undefined') return []
  const all = safeParse(localStorage.getItem(LOCAL_RENTALS_KEY), [])
  const next = Array.isArray(all)
    ? all.map(rental => (
      String(rental.customerId) === String(customerId) && rental.localKey === rentalKey
        ? { ...rental, ...patch }
        : rental
    ))
    : []
  localStorage.setItem(LOCAL_RENTALS_KEY, JSON.stringify(next))
  return next.filter(rental => String(rental.customerId) === String(customerId))
}

export const removeLocalRental = (customerId, rentalKey) => {
  if (typeof window === 'undefined') return []
  const all = safeParse(localStorage.getItem(LOCAL_RENTALS_KEY), [])
  const next = Array.isArray(all)
    ? all.filter(rental => !(
      String(rental.customerId) === String(customerId) && rental.localKey === rentalKey
    ))
    : []
  localStorage.setItem(LOCAL_RENTALS_KEY, JSON.stringify(next))
  return next.filter(rental => String(rental.customerId) === String(customerId))
}
