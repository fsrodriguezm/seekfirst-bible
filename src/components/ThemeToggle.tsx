import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import styles from './ThemeToggle.module.css'

type ThemeToggleVariant = 'inline' | 'floating'

type ThemeToggleProps = {
  variant?: ThemeToggleVariant
  className?: string
  hideLabel?: boolean
}

const ThemeToggle = ({
  variant = 'inline',
  className,
  hideLabel = true
}: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const classes = [styles.themeToggle, variant === 'floating' ? styles.floating : styles.inline]
  if (className) classes.push(className)

  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {mounted && (isDark ? <Sun size={20} /> : <Moon size={20} />)}
      {!hideLabel && <span className={styles.label}>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  )
}

export default ThemeToggle
