import { useNavigate, useLocation } from 'react-router-dom'
import { FaGithub } from 'react-icons/fa'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { darkMode, toggleTheme } = useTheme()

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>
        ARK<span>HAUS</span>
      </div>

      {isHome ? (
        <div className="navbar-right">
          <a onClick={() => navigate('/about')}>Nosotros</a>
          <a onClick={() => navigate('/faq')}>FAQ</a>
          <a onClick={() => navigate('/contact')}>Contacto</a>
          <FaGithub onClick={() => window.open('https://github.com/tu-repo', '_blank')} />
          <span onClick={toggleTheme} className="theme-toggle">
            {darkMode ? <FiSun /> : <FiMoon />}
          </span>
        </div>
      ) : (
        <>
          <div className="navbar-links">
            <a onClick={() => navigate('/comics')}>CÓMICS</a>
            <a onClick={() => navigate('/books')}>LIBROS</a>
            <a onClick={() => navigate('/rentals')}>RENTAS</a>
          </div>
          <div className="navbar-actions">
            <button onClick={() => navigate('/cart')}>Carrito</button>
            <button onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar