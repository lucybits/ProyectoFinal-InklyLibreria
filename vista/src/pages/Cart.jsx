import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookOpen, FiLayers } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import './Cart.css'

function formatMoneyMXN(value) {
  const num = Number(value ?? 0)
  return `${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)} MXN`
}

function Cart() {
  const navigate = useNavigate()
  const { items, itemsCount, subtotal, setQuantity, removeItem, clear } = useCart()

  const { buyItems, rentItems, buyTotal, rentTotal } = useMemo(() => {
    const buyItems = items.filter(i => i.mode === 'buy')
    const rentItems = items.filter(i => i.mode === 'rent')
    const buyTotal = buyItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    const rentTotal = rentItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    return { buyItems, rentItems, buyTotal, rentTotal }
  }, [items])

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="cart-empty-card">
            <div className="cart-empty-title">MI CARRITO</div>
            <p className="cart-empty-sub">
              Aún no tienes productos agregados. Explora el catálogo y guarda tus favoritos para comprar o rentar.
            </p>
            <div className="cart-empty-actions">
              <button className="cart-btn primary" onClick={() => navigate('/comics')}>
                <FiLayers /> Explorar cómics
              </button>
              <button className="cart-btn secondary" onClick={() => navigate('/books')}>
                <FiBookOpen /> Explorar libros
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderItem = (item) => (
    <div key={item.key} className="cart-item">
      <div
        className="cart-cover"
        onClick={() => navigate(`/product/${item.id}?type=${item.type}`)}
        title="Ver detalle"
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} />
        ) : (
          <div className="cart-placeholder">{item.title?.[0] || '?'}</div>
        )}
      </div>

      <div className="cart-meta">
        <div className="cart-name">{item.title}</div>
        <div className="cart-author">{item.author}</div>
        <div className="cart-tags">
          <span className={`cart-tag ${item.mode === 'buy' ? 'buy' : 'rent'}`}>
            {item.mode === 'buy' ? 'COMPRA' : 'RENTA'}
          </span>
          <span className="cart-tag">{item.type === 'comic' ? 'CÓMIC' : 'LIBRO'}</span>
        </div>
      </div>

      <div className="cart-controls">
        <div className="cart-price">{formatMoneyMXN(item.unitPrice)}</div>
        <div className="cart-line">
          Total: {formatMoneyMXN(item.unitPrice * item.quantity)}
        </div>

        <div className="cart-qty" aria-label="Cantidad">
          <button onClick={() => setQuantity(item.key, Math.max(1, item.quantity - 1))}>-</button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={e => setQuantity(item.key, Math.max(1, Number(e.target.value || 1)))}
          />
          <button onClick={() => setQuantity(item.key, item.quantity + 1)}>+</button>
        </div>

        <button className="cart-remove" onClick={() => removeItem(item.key)}>
          Quitar
        </button>
      </div>
    </div>
  )

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div>
          <div className="cart-title">MI CARRITO</div>
          <div className="cart-sub">{itemsCount} artículo(s)</div>
        </div>
        <button className="cart-btn danger" onClick={clear}>
          Vaciar carrito
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-panel cart-panel-items">
          {buyItems.length > 0 && (
            <>
              <div className="cart-section-title">Compra</div>
              <div className="cart-items">{buyItems.map(renderItem)}</div>
              <div style={{ height: 14 }} />
            </>
          )}

          {rentItems.length > 0 && (
            <>
              <div className="cart-section-title">Renta</div>
              <div className="cart-items">{rentItems.map(renderItem)}</div>
            </>
          )}
        </div>

        <div className="cart-panel cart-panel-summary">
          <div className="cart-section-title">Resumen</div>
          <div className="cart-summary">
            <div className="cart-srow">
              <span>Compra</span>
              <span>{formatMoneyMXN(buyTotal)}</span>
            </div>
            <div className="cart-srow">
              <span>Renta</span>
              <span>{formatMoneyMXN(rentTotal)}</span>
            </div>
            <div className="cart-srow">
              <span>Total</span>
              <span className="cart-total">{formatMoneyMXN(subtotal)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button className="cart-btn primary" onClick={() => navigate('/comics')}>
              Seguir comprando
            </button>
            <button className="cart-btn secondary" onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
