import { useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'

type PaletteSwatchProps = {
  colors: readonly string[]
}

const PaletteSwatch = ({ colors }: PaletteSwatchProps) => {
  const slices = useMemo(() => colors.slice(0, 4), [colors])

  return (
    <span className="theme-palette-picker__swatch" aria-hidden="true">
      {slices.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="theme-palette-picker__swatch-slice"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

const ThemePalettePicker = () => {
  const { paletteId, setPalette, palettes } = useTheme()

  return (
    <div className="theme-palette-picker" role="group" aria-label="Color palette">
      <span className="theme-palette-picker__label">Palette</span>
      <div className="theme-palette-picker__options">
        {palettes.map((palette) => {
          const isActive = palette.id === paletteId
          const handleSelect = () => {
            if (!isActive) {
              setPalette(palette.id)
            }
          }

          return (
            <button
              key={palette.id}
              type="button"
              className={`theme-palette-picker__option${isActive ? ' is-active' : ''}`}
              onClick={handleSelect}
              aria-pressed={isActive}
              aria-label={`${palette.name} palette`}
              title={`${palette.name} · ${palette.description}`}
            >
              <PaletteSwatch colors={palette.swatch} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemePalettePicker
