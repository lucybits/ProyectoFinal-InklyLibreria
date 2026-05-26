import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme ? JSON.parse(savedTheme) : false
    })

    useEffect(() => {
        const htmlElement = document.documentElement
        if (darkMode) {
            htmlElement.setAttribute('data-theme', 'dark')
        } else {
            htmlElement.setAttribute('data-theme', 'light')
        }
        localStorage.setItem('theme', JSON.stringify(darkMode))
    }, [darkMode])

    const toggleTheme = () => {
        setDarkMode(prev => !prev)
    }

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme debe ser usado dentro de ThemeProvider')
    }
    return context
}
