import ThemeToggle from './ThemeToggle'
import ThemePalettePicker from './ThemePalettePicker'
import styles from './ThemeSelector.module.css'

const ThemeSelector = () => (
  <div className={styles.controls}>
    <ThemePalettePicker className={styles.paletteBar} />
    <ThemeToggle hideLabel className={styles.themeToggle} />
  </div>
)

export default ThemeSelector
