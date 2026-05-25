import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { login } from '../../services/authService'
import Snackbar from '../../components/snackbar/Snackbar'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/comics')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Snackbar message={error} onClose={() => setError('')} />

      <button className="login-back" onClick={() => navigate('/')}>
        <FiArrowLeft />
      </button>

      <button className="login-theme-toggle" onClick={toggleTheme}>
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      <div className="login-card">
        <div className="login-logo" onClick={() => navigate('/')}>
          ARK<span>HAUS</span>
        </div>
        <p className="login-subtitle">INICIA SESIÓN PARA CONTINUAR</p>

        <div className="login-form">
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

          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          <p className="login-register">
            ¿No tienes cuenta?{' '}
            <span onClick={() => navigate('/register')}>Regístrate</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login