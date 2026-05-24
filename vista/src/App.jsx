import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Navbar from './components/navbar/Navbar'
import Footer from './components/footer/Footer'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function Layout() {
  const location = useLocation()
  const hideAuthPages = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      {!hideAuthPages && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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