import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ColorPalette = 'default' | 'serene-blush' | 'dusk-rose'

type ThemeContextValue = {
  isDark: boolean
  palette: ColorPalette
  toggleTheme: () => void
  setPalette: (palette: ColorPalette) => void
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
  const [palette, setPalette] = useState<ColorPalette>('default')
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
    // Load theme and palette from localStorage after mount
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('theme')
      const savedPalette = window.localStorage.getItem('palette') as ColorPalette | null
      setIsDark(savedTheme === 'dark')
      setPalette(savedPalette || 'default')
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document body
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', isDark)
      document.body.dataset.palette = palette
    }
    // Save to localStorage
    if (typeof window !== 'undefined' && mounted) {
      window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
      window.localStorage.setItem('palette', palette)
    }
  }, [isDark, palette, mounted])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, palette, toggleTheme, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}
