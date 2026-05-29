import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Comics from './pages/comics/Comics'
import Books from './books/Books'
import Cart from './pages/Cart'
import ProductDetail from './pages/product/ProductDetail'
import Navbar from './components/navbar/Navbar'
import Footer from './components/footer/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import './App.css'

function Layout() {
  const location = useLocation()
  const hideAuthPages = location.pathname === '/login' || location.pathname === '/register'
  const needsNavbarOffset = !hideAuthPages && location.pathname !== '/'

  return (
    <>
      {!hideAuthPages && <Navbar />}
      <div
        key={location.pathname}
        className={`page-transition ${needsNavbarOffset ? 'with-navbar-offset' : ''}`}
      >

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/comics" element={<Comics />} />
            <Route path="/books" element={<Books />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Routes>
      </div>
      {!hideAuthPages && <Footer />}
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  )
}

export default App