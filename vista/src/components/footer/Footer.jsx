import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import './Footer.css'

function Footer() {
  const navigate = useNavigate()
  const { darkMode } = useTheme()

  return (
    <footer className={`footer ${darkMode ? 'footer-light' : 'footer-dark'}`}>
      <div className="footer-content">
        <div className="footer-logo">
          ARK<span>HAUS</span>
          <p className="footer-tagline">Historias everywhere.</p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Cuenta</h4>
            <a onClick={() => navigate('/login')}>Iniciar sesión</a>
            <a onClick={() => navigate('/register')}>Registrarse</a>
          </div>

          <div className="footer-column">
            <h4>Arkhaus</h4>
            <a onClick={() => navigate('/faq')}>FAQ</a>
            <a onClick={() => navigate('/about')}>Nosotros</a>
            <a onClick={() => navigate('/contact')}>Contacto</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Arkhaus. Proyecto académico del Instituto Tecnológico de Hermosillo</p>
      </div>
    </footer>
  )
}

export default Footer