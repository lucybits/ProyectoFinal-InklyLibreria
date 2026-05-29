import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookOpen, FiCheckCircle, FiLayers, FiTruck } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orderService'
import { createRental, saveLocalRental } from '../services/rentalService'
import './Cart.css'

function formatMoneyMXN(value) {
  const num = Number(value ?? 0)
  return `${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)} MXN`
}

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function parseAddress(address = '') {
  const zip = address.match(/(?:C\.?P\.?\s*)?(\d{5})/i)?.[1] || ''
  const parts = address.split(',').map(part => part.trim()).filter(Boolean)
  const street = parts[0] || ''
  const colonia = (parts[1] || '').replace(/^col\.?\s*/i, '')
  const city = parts.length >= 4 ? parts[3].replace(/C\.?P\.?\s*\d{5}/i, '').trim() : ''
  const state = parts.length >= 1 ? parts[parts.length - 1] : ''
  return { street, colonia, zipCode: zip, city, state }
}

function getCurrentUser() {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem('user'), null)
}

function buildInitialShipping(user) {
  const parsed = parseAddress(user?.address)
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    street: parsed.street,
    colonia: parsed.colonia,
    zipCode: parsed.zipCode,
    city: parsed.city,
    state: parsed.state,
  }
}

function plusDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function formatShipmentDate(daysFromNow) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
}

function saveShipmentPreview({ user, shipping, shippingAddress, items, subtotal, type }) {
  if (typeof window === 'undefined') return

  const deliveryDays = type === 'rental' ? 2 : 4
  localStorage.setItem('arkhaus:last-shipment', JSON.stringify({
    id: `ARK-${Date.now().toString().slice(-6)}`,
    type,
    customerName: shipping.name || user?.name || 'Cliente Arkhaus',
    phone: shipping.phone || user?.phone || '',
    address: shippingAddress,
    total: subtotal,
    createdAt: new Date().toISOString(),
    estimatedDelivery: formatShipmentDate(deliveryDays),
    items: items.map(item => ({
      title: item.title,
      type: item.type,
      mode: item.mode,
      quantity: item.quantity,
    })),
  }))
}

async function getCustomerById(customerId) {
  const response = await fetch(`http://localhost:5074/api/Customers/${customerId}`)
  if (!response.ok) throw new Error('No se pudieron cargar los datos del cliente')
  return response.json()
}

function Cart() {
  const navigate = useNavigate()
  const { items, itemsCount, subtotal, setQuantity, removeItem, clear } = useCart()
  const user = getCurrentUser()
  const [shipping, setShipping] = useState(() => buildInitialShipping(user))
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: '', success: '', kind: '' })

  useEffect(() => {
    if (!user?.id) return

    let alive = true
    getCustomerById(user.id)
      .then(customer => {
        if (!alive) return
        const freshUser = {
          ...user,
          name: customer.name || user.name,
          email: customer.email || user.email,
          phone: customer.phone || user.phone || '',
          address: customer.address || user.address || '',
        }
        localStorage.setItem('user', JSON.stringify(freshUser))
        setShipping(buildInitialShipping(freshUser))
      })
      .catch(() => {
        setShipping(current => ({ ...buildInitialShipping(user), ...current }))
      })

    return () => {
      alive = false
    }
  }, [user?.id])

  const { buyItems, rentItems, buyTotal, rentTotal } = useMemo(() => {
    const buyItems = items.filter(i => i.mode === 'buy')
    const rentItems = items.filter(i => i.mode === 'rent')
    const buyTotal = buyItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    const rentTotal = rentItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    return { buyItems, rentItems, buyTotal, rentTotal }
  }, [items])

  const updateShipping = (field, value) => {
    setShipping(current => ({ ...current, [field]: value }))
    setCheckoutState(current => ({ ...current, error: '', success: current.success }))
  }

  const missingShippingFields = useMemo(() => {
    const required = ['name', 'phone', 'street', 'colonia', 'zipCode', 'city', 'state']
    return required.filter(field => !String(shipping[field] || '').trim())
  }, [shipping])

  const shippingAddress = useMemo(() => (
    [shipping.street, shipping.colonia, shipping.zipCode, shipping.city, shipping.state]
      .map(value => String(value || '').trim())
      .filter(Boolean)
      .join(', ')
  ), [shipping])

  const registerRentalLocally = (item, quantityIndex = 0) => {
    const startDate = new Date().toISOString()
    const endDate = plusDays(14)
    saveLocalRental({
      localKey: `${Date.now()}-${item.key}-${quantityIndex}`,
      customerId: user.id,
      itemId: item.id,
      type: item.type,
      title: item.title,
      author: item.author,
      imageUrl: item.imageUrl,
      price: item.unitPrice,
      startDate,
      endDate,
      status: 'active',
      shipping: {
        name: shipping.name,
        phone: shipping.phone,
        address: shippingAddress,
      },
    })
  }

  const confirmCheckout = async () => {
    if (!user?.id) {
      setCheckoutState({ loading: false, error: 'Inicia sesion para confirmar tu compra o renta.', success: '', kind: '' })
      return
    }

    if (missingShippingFields.length > 0) {
      setCheckoutState({ loading: false, error: 'Completa la zona de envios antes de confirmar.', success: '', kind: '' })
      return
    }

    setCheckoutState({ loading: true, error: '', success: '', kind: '' })

    try {
      const checkoutItems = [...buyItems, ...rentItems]
      const checkoutType = rentItems.length > 0 && buyItems.length === 0 ? 'rental' : 'purchase'

      if (buyItems.length > 0) {
        await createOrder({
          customerId: user.id,
          type: 'purchase',
          status: 'pending',
          total: buyTotal,
          orderDetails: buyItems.map(item => ({
            bookId: item.type === 'book' ? item.id : null,
            comicId: item.type === 'comic' ? item.id : null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        })
      }

      if (rentItems.length > 0) {
        await createOrder({
          customerId: user.id,
          type: 'rental',
          status: 'pending',
          total: rentTotal,
          orderDetails: rentItems.map(item => ({
            bookId: item.type === 'book' ? item.id : null,
            comicId: item.type === 'comic' ? item.id : null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        })

        for (const item of rentItems) {
          for (let index = 0; index < item.quantity; index += 1) {
            const rental = {
              customerId: user.id,
              bookId: item.type === 'book' ? item.id : null,
              comicId: item.type === 'comic' ? item.id : null,
              startDate: new Date().toISOString(),
              endDate: plusDays(14),
              status: 'active',
              price: item.unitPrice,
            }
            await createRental(rental)
            registerRentalLocally(item, index)
          }
        }
      }

      saveShipmentPreview({
        user,
        shipping,
        shippingAddress,
        items: checkoutItems,
        subtotal,
        type: checkoutType,
      })

      clear()
      setCheckoutState({
        loading: false,
        error: '',
        success: rentItems.length > 0
          ? 'Listo. Tu renta quedo registrada y ya aparece en Rentas.'
          : 'Listo. Tu compra quedo registrada para envio.',
        kind: rentItems.length > 0 ? 'rental' : 'purchase',
      })
    } catch (err) {
      setCheckoutState({
        loading: false,
        error: err.message || 'No se pudo confirmar. Revisa que la API este encendida.',
        success: '',
        kind: '',
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="cart-empty-card">
            <div className="cart-empty-title">MI CARRITO</div>
            {checkoutState.success ? (
              <div className="cart-message success"><FiCheckCircle /> {checkoutState.success}</div>
            ) : (
              <p className="cart-empty-sub">
                Aun no tienes productos agregados. Explora el catalogo y guarda tus favoritos para comprar o rentar.
              </p>
            )}
            <div className="cart-empty-actions">
              {checkoutState.kind === 'rental' && (
                <button className="cart-btn primary" onClick={() => navigate('/rentals')}>
                  Ver mis rentas
                </button>
              )}
              {checkoutState.kind === 'purchase' && (
                <button className="cart-btn primary" onClick={() => navigate('/shipment')}>
                  Ver envio
                </button>
              )}
              <button className="cart-btn primary" onClick={() => navigate('/comics')}>
                <FiLayers /> Explorar comics
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

          <div className="cart-shipping">
            <div className="cart-section-title">
              <FiTruck /> Zona de envios
            </div>
            <p className="cart-shipping-copy">
              Usamos los datos de tu registro para enviar compras y rentas fisicas. Puedes corregirlos antes de confirmar.
            </p>
            <div className="cart-form-grid">
              <label>
                Nombre
                <input value={shipping.name} onChange={e => updateShipping('name', e.target.value)} />
              </label>
              <label>
                Telefono
                <input value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} />
              </label>
              <label className="wide">
                Calle y numero
                <input value={shipping.street} onChange={e => updateShipping('street', e.target.value)} />
              </label>
              <label>
                Colonia
                <input value={shipping.colonia} onChange={e => updateShipping('colonia', e.target.value)} />
              </label>
              <label>
                Codigo postal
                <input
                  value={shipping.zipCode}
                  inputMode="numeric"
                  maxLength="5"
                  onChange={e => updateShipping('zipCode', e.target.value)}
                />
              </label>
              <label>
                Ciudad
                <input value={shipping.city} onChange={e => updateShipping('city', e.target.value)} />
              </label>
              <label>
                Estado
                <input value={shipping.state} onChange={e => updateShipping('state', e.target.value)} />
              </label>
            </div>
          </div>

          <div className="cart-actions">
            {checkoutState.error && <div className="cart-message error">{checkoutState.error}</div>}
            {checkoutState.success && <div className="cart-message success"><FiCheckCircle /> {checkoutState.success}</div>}
            <button className="cart-btn primary" onClick={confirmCheckout} disabled={checkoutState.loading}>
              {checkoutState.loading ? 'Confirmando...' : 'Confirmar envio'}
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
