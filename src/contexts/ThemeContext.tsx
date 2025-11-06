import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode
} from 'react'

const PALETTES = [
  {
    id: 'default',
    name: 'Default',
    description: 'Original SeekFirst palette',
    swatch: ['#f8fafc', '#e2e8f0', '#38bdf8', '#1e293b']
  },
  {
    id: 'serene-blush',
    name: 'Serene Blush',
    description: 'Soft blush and champagne hues',
    swatch: ['#fdf4ff', '#fae8ff', '#c026d3', '#701a75']
  },
  {
    id: 'dusk-rose',
    name: 'Dusk Rose',
    description: 'Muted mauves and evening blues',
    swatch: ['#fff1f2', '#ffe4e6', '#f43f5e', '#9f1239']
  },
  {
    id: 'emerald-haze',
    name: 'Emerald Haze',
    description: 'Misty greens with grounded neutrals',
    swatch: ['#e2f1ec', '#c0d9d2', '#1c3934', '#142523']
  }
] as const

export type ColorPalette = (typeof PALETTES)[number]['id']

type ThemePaletteOption = {
  id: ColorPalette
  name: string
  description: string
  swatch: readonly string[]
}

type ThemeContextValue = {
  isDark: boolean
  toggleTheme: () => void
  palette: ColorPalette
  setPalette: (palette: ColorPalette) => void
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
  const [paletteId, setPaletteId] = useState<ColorPalette>(PALETTES[0]?.id ?? 'default')

  const paletteOptions = useMemo<readonly ThemePaletteOption[]>(
    () => PALETTES.map(({ id, name, description, swatch }) => ({ id, name, description, swatch })),
    []
  )

  const isValidPalette = useCallback(
    (value: string | null): value is ColorPalette => paletteOptions.some((option) => option.id === value),
    [paletteOptions]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedTheme = window.localStorage.getItem('theme')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setIsDark(storedTheme === 'dark')
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
      setIsDark(prefersDark)
    }

    const storedPalette =
      window.localStorage.getItem('palette') ?? window.localStorage.getItem('themePalette')
    if (isValidPalette(storedPalette)) {
      setPaletteId(storedPalette)
    }

    setMounted(true)
  }, [isValidPalette])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem('theme')) return
      setIsDark(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', isDark)
      document.body.classList.toggle('light-theme', !isDark)
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    }

    if (typeof window !== 'undefined' && mounted) {
      window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }, [isDark, mounted])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.palette = paletteId
    }

    if (typeof window !== 'undefined' && mounted) {
      window.localStorage.setItem('palette', paletteId)
      window.localStorage.setItem('themePalette', paletteId)
    }
  }, [paletteId, mounted])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  const setPalette = useCallback((palette: ColorPalette) => {
    setPaletteId(palette)
  }, [])

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      palette: paletteId,
      setPalette,
      palettes: paletteOptions
    }),
    [isDark, toggleTheme, paletteId, setPalette, paletteOptions]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
