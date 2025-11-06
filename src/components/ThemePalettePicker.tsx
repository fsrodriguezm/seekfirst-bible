import { useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import styles from './ThemePalettePicker.module.css'

type PaletteSwatchProps = {
  colors: readonly string[]
}

const PaletteSwatch = ({ colors }: PaletteSwatchProps) => {
  const slices = useMemo(() => colors.slice(0, 4), [colors])

  return (
    <span className={styles.swatch} aria-hidden="true">
      {slices.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className={styles.swatchSlice}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

type ThemePalettePickerProps = {
  className?: string
}

const ThemePalettePicker = ({ className }: ThemePalettePickerProps = {}) => {
  const { palette, setPalette, palettes } = useTheme()
  const classes = [styles.picker]
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')} role="group" aria-label="Color palette">
      <span className={styles.label}>Palette</span>
      <div className={styles.options}>
        {palettes.map((paletteOption) => {
          const isActive = paletteOption.id === palette
          const handleSelect = () => {
            if (!isActive) {
              setPalette(paletteOption.id)
            }
          }

          return (
            <button
              key={paletteOption.id}
              type="button"
              className={`${styles.option}${isActive ? ` ${styles.isActive}` : ''}`}
              onClick={handleSelect}
              aria-pressed={isActive}
              aria-label={`${paletteOption.name} palette`}
              title={`${paletteOption.name} · ${paletteOption.description}`}
            >
              <PaletteSwatch colors={paletteOption.swatch} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemePalettePicker
