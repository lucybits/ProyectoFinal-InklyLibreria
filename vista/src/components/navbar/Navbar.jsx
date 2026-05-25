import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaGithub } from 'react-icons/fa'
import { FiSun, FiMoon, FiUser, FiShoppingCart, FiLogOut } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { darkMode, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    checkUser()
    // Listen to changes in localStorage or location
    window.addEventListener('storage', checkUser)
    return () => {
      window.removeEventListener('storage', checkUser)
    }
  }, [location])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.user-profile-menu')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setShowDropdown(false)
    navigate('/')
  }

  const handleLogoClick = () => {
    if (localStorage.getItem('user')) {
      navigate('/comics')
    } else {
      navigate('/')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick}>
        ARK<span>HAUS</span>
      </div>

      {isHome && !user ? (
        <div className="navbar-right">
          <a onClick={() => navigate('/about')} className={isActive('/about') ? 'active' : ''}>NOSOTROS</a>
          <a onClick={() => navigate('/faq')} className={isActive('/faq') ? 'active' : ''}>FAQ</a>
          <a onClick={() => navigate('/contact')} className={isActive('/contact') ? 'active' : ''}>CONTACTO</a>
          <span className="navbar-icon-btn github-btn" onClick={() => window.open('https://github.com/lucybits/ProyectoFinal-ArkhausLibreria', '_blank')} title="GitHub">
            <FaGithub />
          </span>
          <span className="navbar-icon-btn theme-btn" onClick={toggleTheme} title="Cambiar tema">
            {darkMode ? <FiSun /> : <FiMoon />}
          </span>
        </div>
      ) : (
        <>
          <div className="navbar-links">
            <a onClick={() => navigate('/comics')} className={isActive('/comics') ? 'active' : ''}>CÓMICS</a>
            <a onClick={() => navigate('/books')} className={isActive('/books') ? 'active' : ''}>LIBROS</a>
            <a onClick={() => navigate('/rentals')} className={isActive('/rentals') ? 'active' : ''}>RENTAS</a>
          </div>
          <div className="navbar-actions-icons">
            {/* Cart Icon */}
            <span className="navbar-icon-btn" onClick={() => navigate('/cart')} title="Carrito">
              <FiShoppingCart />
            </span>

            {/* Theme Toggle */}
            <span className="navbar-icon-btn theme-btn" onClick={toggleTheme} title="Cambiar tema">
              {darkMode ? <FiSun /> : <FiMoon />}
            </span>

            {/* User Profile Dropdown or Login Button */}
            {user ? (
              <div className="user-profile-menu">
                <span className="navbar-icon-btn user-btn" onClick={() => setShowDropdown(!showDropdown)} title={user.name}>
                  <FiUser />
                </span>
                {showDropdown && (
                  <div className="user-dropdown animate-fade-in">
                    <div className="dropdown-info">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    {user.isAdmin && (
                      <button className="dropdown-item admin-btn" onClick={() => { navigate('/admin'); setShowDropdown(false); }}>
                        Panel Admin
                      </button>
                    )}
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <FiLogOut /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-nav-btn" onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar