import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiHome, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi'
import './Shipment.css'

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function formatMoneyMXN(value) {
  const num = Number(value ?? 0)
  return `${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)} MXN`
}

function fallbackShipment() {
  return {
    id: 'ARK-000247',
    type: 'purchase',
    customerName: 'Cliente Arkhaus',
    phone: 'Pendiente',
    address: 'Calle ejemplo 123, Colonia Centro, 83000, Hermosillo, Sonora',
    total: 500,
    estimatedDelivery: 'martes, 02 de junio',
    items: [
      { title: 'Doomsday Clock Vol. 2', type: 'comic', mode: 'buy', quantity: 1 },
    ],
  }
}

function Shipment() {
  const navigate = useNavigate()
  const shipment = useMemo(() => {
    if (typeof window === 'undefined') return fallbackShipment()
    return safeParse(localStorage.getItem('arkhaus:last-shipment'), fallbackShipment())
  }, [])

  const typeText = shipment.type === 'rental' ? 'Renta fisica' : 'Compra fisica'

  return (
    <div className="shipment-container">
      <section className="shipment-hero">
        <div>
          <p className="shipment-kicker">Seguimiento provisional</p>
          <h1>Tu envio esta en preparacion</h1>
          <p>
            Esta pantalla es una vista de ejemplo para mostrar al cliente cuanto tardaria
            en llegar su pedido fisico.
          </p>
        </div>
        <div className="shipment-code">
          <span>Pedido</span>
          <strong>{shipment.id}</strong>
        </div>
      </section>

      <section className="shipment-layout">
        <div className="shipment-panel shipment-status">
          <div className="shipment-panel-title">
            <FiTruck /> Estado del envio
          </div>

          <div className="shipment-timeline">
            <div className="shipment-step done">
              <span><FiCheckCircle /></span>
              <div>
                <strong>Pedido confirmado</strong>
                <p>Tu {typeText.toLowerCase()} fue registrada correctamente.</p>
              </div>
            </div>
            <div className="shipment-step active">
              <span><FiPackage /></span>
              <div>
                <strong>Preparando paquete</strong>
                <p>Estamos verificando disponibilidad y cuidando el empaque.</p>
              </div>
            </div>
            <div className="shipment-step">
              <span><FiTruck /></span>
              <div>
                <strong>En camino</strong>
                <p>El repartidor actualizara el estado cuando salga de tienda.</p>
              </div>
            </div>
            <div className="shipment-step">
              <span><FiHome /></span>
              <div>
                <strong>Entregado</strong>
                <p>Entrega fisica en la direccion registrada.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="shipment-panel shipment-summary">
          <div className="shipment-panel-title">
            <FiClock /> Estimacion
          </div>
          <div className="shipment-estimate">
            <span>Llega aprox.</span>
            <strong>{shipment.estimatedDelivery}</strong>
            <p>Tiempo estimado: 2 a 4 dias habiles.</p>
          </div>

          <div className="shipment-address">
            <div className="shipment-panel-title">
              <FiMapPin /> Destino
            </div>
            <p>{shipment.customerName}</p>
            <p>{shipment.phone}</p>
            <p>{shipment.address}</p>
          </div>
        </aside>
      </section>

      <section className="shipment-panel shipment-items">
        <div className="shipment-panel-title">
          <FiPackage /> Productos
        </div>
        {shipment.items.map((item, index) => (
          <div className="shipment-item" key={`${item.title}-${index}`}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.type === 'comic' ? 'Comic' : 'Libro'} · {item.mode === 'rent' ? 'Renta' : 'Compra'}</span>
            </div>
            <span>Cantidad: {item.quantity}</span>
          </div>
        ))}
        <div className="shipment-total">
          <span>Total registrado</span>
          <strong>{formatMoneyMXN(shipment.total)}</strong>
        </div>
      </section>

      <div className="shipment-actions">
        <button onClick={() => navigate('/comics')}>Seguir explorando</button>
        <button className="secondary" onClick={() => navigate('/cart')}>Volver al carrito</button>
      </div>
    </div>
  )
}

export default Shipment
