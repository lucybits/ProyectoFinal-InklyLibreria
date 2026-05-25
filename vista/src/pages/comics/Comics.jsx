import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { getComics } from '../../services/comicService'
import './Comics.css'

function Comics() {
  const navigate = useNavigate()
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getComics()
      .then(data => {
        setComics(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const featured = [...comics]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3)

  const filtered = comics.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="comics-loading">Cargando cómics...</div>
  if (error) return <div className="comics-error">{error}</div>

  return (
    <div className="comics-container">

      <div className="comics-hero">
        <div className="comics-hero-text">
          <div className="comics-title-row">
            <h1>CÓM<span>ICS</span></h1>
            <div className="comics-search-container">
              <span className="search-label">BUSCADOR</span>
              <div className="comics-search-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por título o autor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="comics-search-hero"
                />
              </div>
            </div>
          </div>
          <p className="comics-hero-sub">Explora nuestra colección de cómics disponibles para compra y renta.</p>
        </div>

        <div className="comics-featured">
          {featured.map((comic, i) => (
            <div
              key={comic.id}
              className={`featured-card ${i === 0 ? 'featured-main' : 'featured-side'}`}
              onClick={() => navigate(`/product/${comic.id}?type=comic`)}
            >
              <div className="featured-cover">
                {comic.imageUrl
                  ? <img src={comic.imageUrl} alt={comic.title} />
                  : <div className="featured-placeholder">{comic.title[0]}</div>
                }
              </div>
              <div className="featured-info">
                <p className="featured-author">{comic.author}</p>
                <h3 className="featured-title">{comic.title}</h3>
                <div className="featured-prices">
                  <span className="price-buy">${comic.price}</span>
                  {comic.isAvailableForRental && (
                    <span className="price-rent">Renta ${comic.rentalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="comics-catalog">
        <div className="comics-catalog-header">
          <h2>Todos los cómics</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="comics-empty-state">
            <img 
              src="https://spaces-cdn.clipsafari.com/q37nllxzqxpd7qtxgx4frpgrdj7i" 
              alt="Empty road" 
              className="comics-empty-image" 
            />
            <div className="comics-empty-text">
              <h3>VAYA, QUÉ SOLITARIO...</h3>
              <p>No se encontraron cómics disponibles</p>
            </div>
          </div>
        ) : (
          <div className="comics-grid">
            {filtered.map(comic => (
              <div
                key={comic.id}
                className="comic-card"
                onClick={() => navigate(`/product/${comic.id}?type=comic`)}
              >
                <div className="comic-card-cover">
                  {comic.imageUrl
                    ? <img src={comic.imageUrl} alt={comic.title} />
                    : <div className="comic-card-placeholder">{comic.title[0]}</div>
                  }
                  {comic.isAvailableForRental && (
                    <span className="rental-badge">Rentable</span>
                  )}
                </div>
                <div className="comic-card-info">
                  <p className="comic-card-author">{comic.author}</p>
                  <h3 className="comic-card-title">{comic.title}</h3>
                  <div className="comic-card-prices">
                    <span className="price-buy">${comic.price}</span>
                    {comic.isAvailableForRental && (
                      <span className="price-rent">Renta ${comic.rentalPrice}</span>
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

export default Comics