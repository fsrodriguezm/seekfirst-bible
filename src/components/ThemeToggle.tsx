import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

type ThemeToggleVariant = 'inline' | 'floating'

type ThemeToggleProps = {
  variant?: ThemeToggleVariant
  className?: string
  hideLabel?: boolean
}

const ThemeToggle = ({
  variant = 'inline',
  className,
  hideLabel = true,
}: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const classes = ['theme-toggle', `theme-toggle--${variant}`]
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
      {!hideLabel && <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  )
}

export default ThemeToggle
