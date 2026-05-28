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
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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


  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedBooks = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return <div className="books-loading">Cargando libros...</div>
  if (error) return <div className="books-error">{error}</div>

  return (
    <div className="books-container">
      <div className="books-hero">
        <div className="books-hero-text">
          <div className="books-title-row">
            <h1>LIB<span>ROS</span></h1>
            <div className="books-search-container">
              <span className="search-label">BUSCADOR</span>
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
          </div>
          <p className="books-hero-sub">Explora nuestra gran colección de libros disponibles para compra y renta.</p>
        </div>
      </div>

      <div className="books-catalog">
        <div className="books-catalog-header">
          <h2>Todos los libros <span className="count-badge">{filtered.length}</span></h2>
        </div>

        {filtered.length === 0 ? (
          <div className="books-empty-state">
            <img 
              src="https://spaces-cdn.clipsafari.com/q37nllxzqxpd7qtxgx4frpgrdj7i" 
              alt="Empty road" 
              className="books-empty-image" 
            />
            <div className="books-empty-text">
              <h3>VAYA, QUÉ SOLITARIO...</h3>
              <p>No se encontraron libros disponibles</p>
            </div>
          </div>
        ) : (
          <div className="books-grid-wrapper">
            <div className="books-grid">
              {paginatedBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="book-card"
                  onClick={() => navigate(`/product/${book.id}?type=book`)}
                  style={{ animationDelay: `${index * 0.05}s` }}
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
                      <span className="price-buy">${book.price} MXN</span>
                      {book.isAvailableForRental && (
                        <span className="price-rent">Renta ${book.rentalPrice} MXN</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                <span className="pagination-info">Página {currentPage} de {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Books
