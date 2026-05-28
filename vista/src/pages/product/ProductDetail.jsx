import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi'
import { getBookById, getBooks } from '../../services/bookService'
import { getComicById, getComics } from '../../services/comicService'
import { useCart } from '../../context/CartContext'
import './ProductDetail.css'

function formatMoneyMXN(value) {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}

function normalizeType(t) {
  return t === 'comic' ? 'comic' : 'book'
}

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const type = normalizeType(searchParams.get('type'))
  const { addItem } = useCart()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('buy') // 'buy' | 'rent'
  const [quantity, setQuantity] = useState(1)
  const [recommended, setRecommended] = useState([])
  const [loadingRec, setLoadingRec] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')

    const fetcher = type === 'comic' ? getComicById : getBookById
    fetcher(id)
      .then(res => {
        if (!alive) return
        setData(res)
        setLoading(false)
        if (!res?.isAvailableForRental) setMode('buy')
      })
      .catch(e => {
        if (!alive) return
        setError(e?.message || 'No se pudo cargar el producto')
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [id, type])

  const unitPrice = useMemo(() => {
    if (!data) return 0
    if (mode === 'rent') return Number(data.rentalPrice ?? 0)
    return Number(data.price ?? 0)
  }, [data, mode])

  const canRent = Boolean(data?.isAvailableForRental)
  const title = data?.title ?? ''
  const author = data?.author ?? ''
  const description = data?.description ?? ''
  const stock = data?.stock ?? 0
  const imageUrl = data?.imageUrl
  const categoryName = data?.category?.name
  const categoryId = data?.categoryId ?? data?.category?.id ?? null

  const priceLabel = (value) => `${formatMoneyMXN(value)} MXN`

  const addToCart = () => {
    if (!data) return
    addItem({
      id: data.id,
      type,
      mode,
      title: data.title,
      author: data.author,
      imageUrl: data.imageUrl,
      unitPrice,
      quantity,
      stock: data.stock,
      isAvailableForRental: data.isAvailableForRental,
    })
    navigate('/cart')
  }

  useEffect(() => {
    if (!data) return
    let alive = true
    setLoadingRec(true)

    const fetchList = type === 'comic' ? getComics : getBooks
    fetchList()
      .then(list => {
        if (!alive) return
        const currentId = Number(data.id)
        const sameType = Array.isArray(list) ? list : []
        const filtered = sameType.filter(x => Number(x?.id) !== currentId)
        const byCategory = categoryId
          ? filtered.filter(x => Number(x?.categoryId) === Number(categoryId))
          : filtered

        const picked = (byCategory.length ? byCategory : filtered).slice(0, 12)
        setRecommended(picked)
        setLoadingRec(false)
      })
      .catch(() => {
        if (!alive) return
        setRecommended([])
        setLoadingRec(false)
      })

    return () => {
      alive = false
    }
  }, [data, type, categoryId])

  if (loading) return <div className="pd-loading">Cargando detalle...</div>
  if (error) return <div className="pd-error">{error}</div>
  if (!data) return <div className="pd-error">Producto no encontrado</div>

  return (
    <div className="pd-container">
      <div className="pd-topbar">
        <button className="pd-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>
      </div>

      <div
        className="pd-card"
        style={imageUrl ? { '--pd-cover': `url("${imageUrl}")` } : undefined}
      >
        <div className="pd-media">
          {imageUrl ? (
            <img className="pd-img" src={imageUrl} alt={title} />
          ) : (
            <div className="pd-placeholder">{title?.[0] || '?'}</div>
          )}
        </div>

        <div className="pd-info">
          <div className="pd-badges">
            <span className="pd-type">{type === 'comic' ? 'CÓMIC' : 'LIBRO'}</span>
            {canRent && <span className="pd-rentable">RENTABLE</span>}
            {categoryName && <span className="pd-category">{categoryName}</span>}
          </div>

          <h1 className="pd-title">{title}</h1>
          <p className="pd-author">{author}</p>

          {description && <p className="pd-desc">{description}</p>}

          <div className="pd-actions">
            <div className="pd-mode">
              <button
                className={`pd-mode-btn ${mode === 'buy' ? 'active' : ''}`}
                onClick={() => setMode('buy')}
              >
                Comprar ({priceLabel(data.price)})
              </button>
              <button
                className={`pd-mode-btn ${mode === 'rent' ? 'active' : ''}`}
                onClick={() => setMode('rent')}
                disabled={!canRent}
                title={!canRent ? 'Este producto no está disponible para renta' : undefined}
              >
                Rentar ({priceLabel(data.rentalPrice)})
              </button>
            </div>

            <div className="pd-qty-row">
              <label className="pd-qty-label">Cantidad</label>
              <div className="pd-qty">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                >
                  -
                </button>
                <input
                  className="pd-qty-input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                />
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <div className="pd-stock">
                Stock: <span>{stock}</span>
              </div>
            </div>

            <div className="pd-buyrow">
              <div className="pd-price">
                <div className="pd-price-label">Precio</div>
                <div className="pd-price-value">{priceLabel(unitPrice)}</div>
              </div>
              <button className="pd-add" onClick={addToCart} disabled={stock <= 0}>
                <FiShoppingCart /> Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-recs">
        <div className="pd-recs-header">
          <h2>{type === 'comic' ? 'OTROS CÓMICS RECOMENDADOS' : 'OTROS LIBROS RECOMENDADOS'}</h2>
          {categoryName && <p>Basado en: {categoryName}</p>}
        </div>

        {loadingRec ? (
          <div className="pd-recs-loading">Cargando recomendaciones...</div>
        ) : recommended.length === 0 ? (
          <div className="pd-recs-empty">Sin recomendaciones por ahora.</div>
        ) : (
          <div className="pd-recs-row" role="list">
            {recommended.map(item => (
              <button
                key={item.id}
                className="pd-rec-card"
                role="listitem"
                onClick={() => navigate(`/product/${item.id}?type=${type}`)}
                title={item.title}
              >
                <div className="pd-rec-cover">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="pd-rec-placeholder">{item.title?.[0] || '?'}</div>
                  )}
                </div>
                <div className="pd-rec-meta">
                  <div className="pd-rec-title">{item.title}</div>
                  <div className="pd-rec-sub">{priceLabel(item.price)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

