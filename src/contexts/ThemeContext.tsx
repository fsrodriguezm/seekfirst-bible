import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type ThemeContextValue = {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

type ThemeProviderProps = {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    // Load theme from localStorage after mount
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('theme')
      setIsDark(saved === 'dark')
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document body
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', isDark)
    }
    // Save to localStorage
    if (typeof window !== 'undefined' && mounted) {
      window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }, [isDark, mounted])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
