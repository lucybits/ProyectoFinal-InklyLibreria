import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()

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
    </div>
  )
}

export default Home