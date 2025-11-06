import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { ColorPalette } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import styles from './ThemeSelector.module.css'

const ThemeSelector = () => {
  const { isDark, palette, toggleTheme, setPalette } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const palettes: { value: ColorPalette; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'serene-blush', label: 'Serene Blush' },
    { value: 'dusk-rose', label: 'Dusk Rose' }
  ]

  return (
    <div className={styles.themeControls}>
      <button
        className={styles.themeToggleBtn}
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {mounted ? (isDark ? <Sun size={20} /> : <Moon size={20} />) : null}
      </button>
      <select
        className={styles.paletteSelect}
        value={palette}
        onChange={(e) => setPalette(e.target.value as ColorPalette)}
        aria-label="Select color palette"
      >
        {palettes.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ThemeSelector