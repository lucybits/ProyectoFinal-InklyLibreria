import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { FiSun, FiMoon, FiArrowLeft, FiChevronDown } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { register } from '../../services/authService'
import Snackbar from '../../components/snackbar/Snackbar'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  const hasUser = Boolean(localStorage.getItem('user'))
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    colonia: '',
    zipCode: '',
    city: '',
    state: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.confirmEmail.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim() ||
      !form.street.trim() ||
      !form.colonia.trim() ||
      !form.zipCode.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    if (form.email.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase()) {
      setError('Los correos electrónicos no coinciden.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const concatenatedAddress = `${form.street}, Col. ${form.colonia}, C.P. ${form.zipCode}, ${form.city}, ${form.state}`
      await register({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: concatenatedAddress
      })
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (hasUser) {
    return <Navigate to="/comics" replace />
  }

  return (
    <div className="register-container">
      <Snackbar message={error} onClose={() => setError('')} />

      <button className="register-back" onClick={() => navigate('/')}>
        <FiArrowLeft />
      </button>

      <button className="register-theme-toggle" onClick={toggleTheme}>
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      <div className="register-card">
        <div className="register-logo" onClick={() => navigate('/')}>
          ARK<span>HAUS</span>
        </div>
        <p className="register-subtitle">CREA TU CUENTA</p>

        <div className="register-form">
          <div className="register-grid">

            <div className="form-group">
              <label>Nombre <span className="required">*</span></label>
              <input
                type="text"
                name="firstName"
                placeholder="Primer nombre"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Apellido <span className="required">*</span></label>
              <input
                type="text"
                name="lastName"
                placeholder="Primer apellido"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Confirmar correo electrónico <span className="required">*</span></label>
              <input
                type="email"
                name="confirmEmail"
                placeholder="correo@ejemplo.com"
                value={form.confirmEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Contraseña <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Confirmar contraseña <span className="required">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Teléfono (opcional)</label>
              <div className="phone-input">
                <span className="phone-badge">+52</span>
                <input
                  type="text"
                  name="phone"
                  placeholder="XXXXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Calle y Número <span className="required">*</span></label>
              <input
                type="text"
                name="street"
                placeholder="Av. Morelos #123"
                value={form.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Colonia <span className="required">*</span></label>
              <input
                type="text"
                name="colonia"
                placeholder="Centro"
                value={form.colonia}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Código Postal <span className="required">*</span></label>
              <input
                type="text"
                name="zipCode"
                placeholder="83000"
                value={form.zipCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Ciudad <span className="required">*</span></label>
              <input
                type="text"
                name="city"
                placeholder="Hermosillo"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estado <span className="required">*</span></label>
              <input
                type="text"
                name="state"
                placeholder="Sonora"
                value={form.state}
                onChange={handleChange}
              />
            </div>

          </div>

          <button className="register-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <p className="register-login">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')}>Inicia sesión</span>
          </p>
        </div>
      </div>

      {showScrollIndicator && createPortal(
        <div className="register-scroll-indicator">
          <span>Desliza para ver más</span>
          <FiChevronDown className="bounce-arrow" />
        </div>,
        document.body
      )}
    </div>
  )
}

export default Register