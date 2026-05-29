const API = 'http://localhost:5074/api'

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