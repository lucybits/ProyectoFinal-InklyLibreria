import { useEffect } from 'react'
import { FiX, FiAlertCircle } from 'react-icons/fi'
import './Snackbar.css'

function Snackbar({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => onClose(), 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="snackbar">
      <FiAlertCircle className="snackbar-icon" />
      <span className="snackbar-message">{message}</span>
      <button className="snackbar-close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  )
}

export default Snackbar