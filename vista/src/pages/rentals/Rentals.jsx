import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiPackage, FiRefreshCw, FiSearch, FiShoppingCart, FiX } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import {
  deleteRental,
  getCustomerRentals,
  getLocalRentals,
  removeLocalRental,
  updateLocalRental
} from '../../services/rentalService'
import './Rentals.css'

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function getCurrentUser() {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem('user'), null)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function daysLeft(endDate) {
  if (!endDate) return 0
  const today = new Date()
  const expires = new Date(endDate)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expiresDate = new Date(expires.getFullYear(), expires.getMonth(), expires.getDate())
  const diff = expiresDate.getTime() - todayDate.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function normalizeRental(rental) {
  const product = rental.book || rental.comic || {}
  const type = rental.type || (rental.bookId || rental.book ? 'book' : 'comic')
  const endDate = rental.endDate
  const remaining = daysLeft(endDate)

  return {
    ...rental,
    localKey: rental.localKey || `api-${rental.id}`,
    type,
    itemId: rental.itemId || rental.bookId || rental.comicId || product.id,
    title: rental.title || product.title || 'Titulo no disponible',
    author: rental.author || product.author || 'Autor no disponible',
    imageUrl: rental.imageUrl || product.imageUrl || '',
    price: Number(rental.price ?? product.rentalPrice ?? 0),
    startDate: rental.startDate,
    endDate,
    status: remaining < 0 ? 'expired' : (rental.status || 'active'),
    remaining,
  }
}

function statusText(rental) {
  if (rental.status === 'expired') return 'Vencida'
  if (rental.remaining === 0) return 'Vence hoy'
  if (rental.remaining === 1) return '1 dia restante'
  return `${rental.remaining} dias restantes`
}

function Rentals() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const user = getCurrentUser()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [rentalToClose, setRentalToClose] = useState(null)
  const [closingRental, setClosingRental] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    let alive = true
    const localRentals = getLocalRentals(user.id).map(normalizeRental)

    getCustomerRentals(user.id)
      .then(apiRentals => {
        if (!alive) return
        const apiItems = Array.isArray(apiRentals) ? apiRentals.map(normalizeRental) : []
        const merged = [...localRentals]
        apiItems.forEach(apiItem => {
          const exists = merged.some(item => (
            item.id && apiItem.id
              ? item.id === apiItem.id
              : item.localKey === apiItem.localKey
          ))
          if (!exists) merged.push(apiItem)
        })
        setItems(merged)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setItems(localRentals)
        setError(localRentals.length ? '' : 'No se pudieron cargar tus rentas desde el servidor.')
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [user?.id])

  const filtered = useMemo(() => {
    return items.filter(item => {
      const text = `${item.title} ${item.author}`.toLowerCase()
      const matchSearch = text.includes(search.toLowerCase())
      const matchFilter =
        filter === 'all' ||
        (filter === 'active' && item.status !== 'expired') ||
        (filter === 'expired' && item.status === 'expired')
      return matchSearch && matchFilter
    })
  }, [items, search, filter])

  const activeCount = items.filter(item => item.status !== 'expired').length
  const expiringSoon = items.filter(item => item.status !== 'expired' && item.remaining <= 3).length

  const renewRental = (item) => {
    if (!item.localKey || item.localKey.startsWith('api-')) {
      addItem({
        id: item.itemId,
        type: item.type,
        mode: 'rent',
        title: item.title,
        author: item.author,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity: 1,
        isAvailableForRental: true,
      })
      navigate('/cart')
      return
    }

    const base = item.remaining > 0 ? new Date(item.endDate) : new Date()
    base.setDate(base.getDate() + 14)
    const updated = updateLocalRental(user.id, item.localKey, {
      endDate: base.toISOString(),
      status: 'active',
    }).map(normalizeRental)
    setItems(updated)
  }

  const rentAgain = (item) => {
    addItem({
      id: item.itemId,
      type: item.type,
      mode: 'rent',
      title: item.title,
      author: item.author,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      quantity: 1,
      isAvailableForRental: true,
    })
    navigate('/cart')
  }

  const closeRental = async () => {
    if (!rentalToClose || !user?.id) return

    setClosingRental(true)
    setError('')

    try {
      if (rentalToClose.id) {
        await deleteRental(rentalToClose.id)
      }

      removeLocalRental(user.id, rentalToClose.localKey)
      setItems(current => current.filter(item => item.localKey !== rentalToClose.localKey))
      setRentalToClose(null)
    } catch (err) {
      setError(err.message || 'No se pudo cerrar la renta.')
    } finally {
      setClosingRental(false)
    }
  }

  if (loading) return <div className="rentals-loading">Cargando tus rentas...</div>

  return (
    <div className="rentals-container">
      <div className="rentals-hero">
        <div className="rentals-hero-text">
          <h1>MIS <span>RENTAS</span></h1>
          <p className="rentals-hero-sub">
            Aqui puedes ver lo que rentaste, cuanto tiempo queda y renovar antes de que expire.
          </p>
        </div>
      </div>

      <div className="rentals-dashboard">
        <div className="rental-stat">
          <FiPackage />
          <span>Activas</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="rental-stat warning">
          <FiClock />
          <span>Por vencer</span>
          <strong>{expiringSoon}</strong>
        </div>
        <div className="rentals-search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar en mis rentas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rentals-search-hero"
          />
        </div>
      </div>

      <div className="rentals-catalog">
        <div className="rentals-catalog-header">
          <h2>Rentas registradas <span className="count-badge">{filtered.length}</span></h2>
          <div className="rentals-filter-tabs">
            <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              Todas
            </button>
            <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
              Activas
            </button>
            <button className={`filter-tab ${filter === 'expired' ? 'active' : ''}`} onClick={() => setFilter('expired')}>
              Vencidas
            </button>
          </div>
        </div>

        {error && <div className="rentals-error-inline">{error}</div>}

        {filtered.length === 0 ? (
          <div className="rentals-empty-state">
            <div className="rentals-empty-text">
              <h3>SIN RENTAS TODAVIA</h3>
              <p>Cuando confirmes una renta desde el carrito, aparecera aqui con su fecha de expiracion.</p>
              <button className="rental-action primary" onClick={() => navigate('/comics')}>
                Explorar catalogo
              </button>
            </div>
          </div>
        ) : (
          <div className="rented-list">
            {filtered.map(item => (
              <article key={item.localKey} className={`rented-card ${item.status === 'expired' ? 'expired' : ''}`}>
                <button
                  className="rented-cover"
                  onClick={() => navigate(`/product/${item.itemId}?type=${item.type}`)}
                  title="Ver detalle"
                >
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span>{item.title?.[0] || '?'}</span>}
                </button>

                <div className="rented-info">
                  <div className="rented-tags">
                    <span>{item.type === 'comic' ? 'Comic' : 'Libro'}</span>
                    <span className={item.status === 'expired' ? 'danger' : 'ok'}>{statusText(item)}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.author}</p>
                  <div className="rented-dates">
                    <span>Inicio: {formatDate(item.startDate)}</span>
                    <span>Expira: {formatDate(item.endDate)}</span>
                  </div>
                  {item.shipping?.address && (
                    <div className="rented-shipping">Envio: {item.shipping.address}</div>
                  )}
                </div>

                <div className="rented-actions">
                  <button className="rental-action primary" onClick={() => renewRental(item)}>
                    <FiRefreshCw /> Renovar 14 dias
                  </button>
                  <button className="rental-action secondary" onClick={() => rentAgain(item)}>
                    <FiShoppingCart /> Volver a rentar
                  </button>
                  <button className="rental-action ghost" onClick={() => setRentalToClose(item)}>
                    <FiCheckCircle /> Cerrar renta
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {rentalToClose && (
        <div className="rental-modal-overlay" role="dialog" aria-modal="true">
          <div className="rental-modal">
            <button
              className="rental-modal-close"
              onClick={() => setRentalToClose(null)}
              aria-label="Cerrar"
              disabled={closingRental}
            >
              <FiX />
            </button>
            <div className="rental-modal-icon">
              <FiCheckCircle />
            </div>
            <h3>Confirmar cierre de renta</h3>
            <p>
              Esta renta dejara de aparecer en tu lista. Usa esta opcion cuando ya no necesites
              darle seguimiento a <strong>{rentalToClose.title}</strong>.
            </p>
            <div className="rental-modal-actions">
              <button className="rental-action secondary" onClick={() => setRentalToClose(null)} disabled={closingRental}>
                Conservar
              </button>
              <button className="rental-action primary" onClick={closeRental} disabled={closingRental}>
                {closingRental ? 'Cerrando...' : 'Cerrar renta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rentals
