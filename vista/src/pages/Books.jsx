import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { getBooks } from '../services/bookService'
import './Books.css'

function Books() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getBooks()
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const featured = [...books]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3)

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="books-loading">Cargando libros...</div>
  if (error) return <div className="books-error">{error}</div>

  return (
    <div className="books-container">
      <div className="books-hero">
        <div className="books-hero-text">
          <div className="books-title-row">
            <h1>LIB<span>ROS</span></h1>
            <div className="books-search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="books-search-hero"
              />
            </div>
          </div>
          <p className="books-hero-sub">Explora nuestra gran colección de libros disponibles para compra y renta.</p>
        </div>

        <div className="books-featured">
          {featured.map((book, i) => (
            <div
              key={book.id}
              className={`featured-card ${i === 0 ? 'featured-main' : 'featured-side'}`}
              onClick={() => navigate(`/product/${book.id}?type=book`)}
            >
              <div className="featured-cover">
                {book.imageUrl
                  ? <img src={book.imageUrl} alt={book.title} />
                  : <div className="featured-placeholder">{book.title[0]}</div>
                }
              </div>
              <div className="featured-info">
                <p className="featured-author">{book.author}</p>
                <h3 className="featured-title">{book.title}</h3>
                <div className="featured-prices">
                  <span className="price-buy">${book.price}</span>
                  {book.isAvailableForRental && (
                    <span className="price-rent">Renta ${book.rentalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="books-catalog">
        <div className="books-catalog-header">
          <h2>Todos los libros</h2>
        </div>

        {filtered.length === 0 ? (
          <p className="books-empty">No se encontraron libros disponibles</p>
        ) : (
          <div className="books-grid">
            {filtered.map(book => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => navigate(`/product/${book.id}?type=book`)}
              >
                <div className="book-card-cover">
                  {book.imageUrl
                    ? <img src={book.imageUrl} alt={book.title} />
                    : <div className="book-card-placeholder">{book.title[0]}</div>
                  }
                  {book.isAvailableForRental && (
                    <span className="rental-badge">Rentable</span>
                  )}
                </div>
                <div className="book-card-info">
                  <p className="book-card-author">{book.author}</p>
                  <h3 className="book-card-title">{book.title}</h3>
                  <div className="book-card-prices">
                    <span className="price-buy">${book.price}</span>
                    {book.isAvailableForRental && (
                      <span className="price-rent">Renta ${book.rentalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Books
