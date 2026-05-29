/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const CART_STORAGE_KEY_PREFIX = 'cart'

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function getUserCartKey() {
  if (typeof window === 'undefined') return `${CART_STORAGE_KEY_PREFIX}:guest`
  const raw = localStorage.getItem('user')
  const user = raw ? safeParse(raw, null) : null
  const id = user?.id ?? user?.userId ?? user?.email ?? user?.name
  const token = String(id ?? 'guest').trim().toLowerCase()
  return `${CART_STORAGE_KEY_PREFIX}:${token || 'guest'}`
}

function loadInitialState(storageKey) {
  if (typeof window === 'undefined') return { items: [] }
  const raw = localStorage.getItem(storageKey)
  const data = raw ? safeParse(raw, { items: [] }) : { items: [] }
  if (!data || !Array.isArray(data.items)) return { items: [] }
  return { items: data.items }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE': {
      const incoming = action.payload
      if (!incoming || !Array.isArray(incoming.items)) return { items: [] }
      return { items: incoming.items }
    }
    case 'ADD_ITEM': {
      const incoming = action.payload
      const key = `${incoming.type}:${incoming.id}:${incoming.mode}`
      const existingIdx = state.items.findIndex(i => i.key === key)
      if (existingIdx >= 0) {
        const next = [...state.items]
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + (incoming.quantity ?? 1),
        }
        return { ...state, items: next }
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            key,
            id: incoming.id,
            type: incoming.type,
            mode: incoming.mode,
            title: incoming.title,
            author: incoming.author,
            imageUrl: incoming.imageUrl,
            unitPrice: incoming.unitPrice,
            quantity: incoming.quantity ?? 1,
            stock: incoming.stock ?? null,
            isAvailableForRental: incoming.isAvailableForRental ?? false,
          },
        ],
      }
    }
    case 'REMOVE_ITEM': {
      return { ...state, items: state.items.filter(i => i.key !== action.payload) }
    }
    case 'SET_QUANTITY': {
      const { key, quantity } = action.payload
      if (!Number.isFinite(quantity)) return state
      if (quantity <= 0) return { ...state, items: state.items.filter(i => i.key !== key) }
      return {
        ...state,
        items: state.items.map(i => (i.key === key ? { ...i, quantity } : i)),
      }
    }
    case 'CLEAR': {
      return { ...state, items: [] }
    }
    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [storageKey, setStorageKey] = useState(getUserCartKey)
  const [state, dispatch] = useReducer(cartReducer, undefined, () => loadInitialState(storageKey))

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'user') {
        setStorageKey(getUserCartKey())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    dispatch({ type: 'SET_STATE', payload: loadInitialState(storageKey) })
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ items: state.items }))
  }, [state.items, storageKey])

  const value = useMemo(() => {
    const itemsCount = state.items.reduce((acc, i) => acc + i.quantity, 0)
    const subtotal = state.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    return {
      items: state.items,
      itemsCount,
      subtotal,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
      removeItem: (key) => dispatch({ type: 'REMOVE_ITEM', payload: key }),
      setQuantity: (key, quantity) => dispatch({ type: 'SET_QUANTITY', payload: { key, quantity } }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }
  }, [state.items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}

