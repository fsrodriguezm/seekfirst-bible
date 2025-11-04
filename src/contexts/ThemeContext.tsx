import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'

type ThemePaletteDefinition = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly swatch: readonly string[]
}

const PALETTES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Original SeekFirst palette',
    swatch: ['#f8fafc', '#e2e8f0', '#6366f1', '#1e293b'],
  },
  {
    id: 'serene-blush',
    name: 'Serene Blush',
    description: 'Soft blush and champagne hues',
    swatch: ['#f9edf0', '#e6c8b7', '#ba6a36', '#261311'],
  },
  {
    id: 'amber-spice',
    name: 'Amber Spice',
    description: 'Warm amber with cognac accents',
    swatch: ['#fff4e5', '#f1c27d', '#d0812e', '#3b220f'],
  },
  {
    id: 'emerald-haze',
    name: 'Emerald Haze',
    description: 'Minimal greens with misty neutrals',
    swatch: ['#e2f1ec', '#c0d9d2', '#1c3934', '#142523'],
  },
  {
    id: 'dusk-rose',
    name: 'Dusk Rose',
    description: 'Muted mauves and evening blues',
    swatch: ['#f4edf2', '#d8c7d7', '#7a3b5d', '#2f1c2b'],
  },
] as const satisfies readonly ThemePaletteDefinition[]

type PaletteId = (typeof PALETTES)[number]['id']

type ThemePaletteOption = {
  id: PaletteId
  name: string
  description: string
  swatch: readonly string[]
}

type ThemeContextValue = {
  isDark: boolean
  toggleTheme: () => void
  paletteId: PaletteId
  setPalette: (palette: PaletteId) => void
  palettes: readonly ThemePaletteOption[]
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
  const [paletteId, setPaletteId] = useState<PaletteId>(PALETTES[0]?.id ?? 'classic')

  const paletteOptions = useMemo<readonly ThemePaletteOption[]>(
    () => PALETTES.map(({ id, name, description, swatch }) => ({ id, name, description, swatch })),
    []
  )

  const isValidPalette = useCallback(
    (value: string | null): value is PaletteId => paletteOptions.some((option) => option.id === value),
    [paletteOptions]
  )

  useEffect(() => {
    // Load theme from localStorage or system preference after mount
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('theme')
      if (saved === 'dark' || saved === 'light') {
        setIsDark(saved === 'dark')
      } else {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
        setIsDark(prefersDark)
      }
      const storedPalette = window.localStorage.getItem('themePalette')
      if (isValidPalette(storedPalette)) {
        setPaletteId(storedPalette)
      }
      setMounted(true)
    }
  }, [isValidPalette])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem('theme')) return
      setIsDark(event.matches)
    }

    const addListener = mediaQuery.addEventListener?.bind(mediaQuery)
    const removeListener = mediaQuery.removeEventListener?.bind(mediaQuery)

    if (addListener && removeListener) {
      addListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (removeListener) {
        removeListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme to document body
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', isDark)
      document.body.classList.toggle('light-theme', !isDark)
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    }
    // Save to localStorage
    if (typeof window !== 'undefined' && mounted) {
      window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }, [isDark, mounted])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.palette = paletteId
    }
    if (typeof window !== 'undefined' && mounted) {
      window.localStorage.setItem('themePalette', paletteId)
    }
  }, [paletteId, mounted])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  const setPalette = useCallback((palette: PaletteId) => {
    setPaletteId(palette)
  }, [])

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      paletteId,
      setPalette,
      palettes: paletteOptions,
    }),
    [isDark, toggleTheme, paletteId, setPalette, paletteOptions]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
