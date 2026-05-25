import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Comics from './pages/comics/Comics'
import Books from './pages/Books'
import Cart from './pages/Cart'
import Navbar from './components/navbar/Navbar'
import Footer from './components/footer/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function Layout() {
  const location = useLocation()
  const hideAuthPages = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      {!hideAuthPages && <Navbar />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas (requieren sesión) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/comics" element={<Comics />} />
          <Route path="/books" element={<Books />} />
          <Route path="/cart" element={<Cart />} />
        </Route>
      </Routes>
      {!hideAuthPages && <Footer />}
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App