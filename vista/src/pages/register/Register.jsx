import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { register } from '../../services/authService'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
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
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="phone"
              placeholder="6621234567"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="address"
              placeholder="Tu dirección"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {error && <p className="register-error">{error}</p>}

          <button className="register-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <p className="register-login">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')}>Inicia sesión</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register