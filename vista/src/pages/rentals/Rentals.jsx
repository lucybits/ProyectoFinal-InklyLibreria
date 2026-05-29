import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { getRentals } from "../../services/rentalService";
import './Rentals.css'

function Rentals() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'book' | 'comic'
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    getRentals()
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = items.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || item.type === filter
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return <div className="rentals-loading">Cargando rentas...</div>
  if (error) return <div className="rentals-error">{error}</div>

  return (
    <div className="rentals-container">

      <div className="rentals-hero">
        <div className="rentals-hero-text">
          <div className="rentals-title-row">
            <h1>REN<span>TAS</span></h1>
            <div className="rentals-search-container">
              <span className="search-label">BUSCADOR</span>
              <div className="rentals-search-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por título o autor..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rentals-search-hero"
                />
              </div>
            </div>
          </div>
          <p className="rentals-hero-sub">Renta libros y cómics por una fracción del precio de compra.</p>
        </div>
      </div>

      <div className="rentals-catalog">
        <div className="rentals-catalog-header">
          <h2>Disponibles para renta <span className="count-badge">{filtered.length}</span></h2>
          <div className="rentals-filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setCurrentPage(1) }}
            >
              Todos
            </button>
            <button
              className={`filter-tab ${filter === 'book' ? 'active' : ''}`}
              onClick={() => { setFilter('book'); setCurrentPage(1) }}
            >
              Libros
            </button>
            <button
              className={`filter-tab ${filter === 'comic' ? 'active' : ''}`}
              onClick={() => { setFilter('comic'); setCurrentPage(1) }}
            >
              Cómics
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rentals-empty-state">
            <div className="rentals-empty-text">
              <h3>NADA POR AQUÍ...</h3>
              <p>No se encontraron títulos disponibles para renta</p>
            </div>
          </div>
        ) : (
          <div className="rentals-grid-wrapper">
            <div className="rentals-grid">
              {paginated.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rental-card"
                  onClick={() => navigate(`/product/${item.id}?type=${item.type}`)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="rental-card-cover">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} />
                      : <div className="rental-card-placeholder">{item.title[0]}</div>
                    }
                    <span className={`type-badge ${item.type}`}>
                      {item.type === 'book' ? 'Libro' : 'Cómic'}
                    </span>
                  </div>
                  <div className="rental-card-info">
                    <p className="rental-card-author">{item.author}</p>
                    <h3 className="rental-card-title">{item.title}</h3>
                    <div className="rental-card-prices">
                      <span className="price-rent">Renta ${item.rentalPrice} MXN</span>
                      <span className="price-buy">Compra ${item.price} MXN</span>
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

export default Rentals