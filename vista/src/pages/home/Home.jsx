import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { darkMode } = useTheme()
  const waveColor = darkMode ? '#ffffff' : '#111111'

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      navigate('/comics')
    }
  }, [navigate])

  return (
    <div className="home-container">
      <p className="home-description">
        UN ENTERO UNIVERSO DE HISTORIAS TE ESPERA EN ARKHAUS.
      </p>
      <p className="home-subdescription">
        Compra o renta cómics y libros hasta con un 50% de descuento.
      </p>
      <div className="home-buttons">
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Comenzar
        </button>
        <button className="btn-outline" onClick={() => navigate('/register')}>
          Soy nuevo en Arkhaus
        </button>
      </div>

      <div className="home-wave">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C400,140 1040,0 1440,60 L1440,140 L0,140 Z" fill={waveColor} />
        </svg>
      </div>
    </div>
  )
}

export default Home