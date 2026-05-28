import { useNavigate } from 'react-router-dom'

function Cart() {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: "'ComixLoud', sans-serif" }}>MI <span>CARRITO</span></h2>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px' }}>Actualmente no tienes productos en tu carrito de compras.</p>
      <button 
        onClick={() => navigate('/comics')} 
        style={{
          background: 'var(--accent-primary)',
          color: '#fff',
          border: 'none',
          padding: '12px 30px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={e => {
          e.currentTarget.style.opacity = '0.9'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseOut={e => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Ver más artículos
      </button>
    </div>
  )
}

export default Cart
