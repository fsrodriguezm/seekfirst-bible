import ThemeToggle from './ThemeToggle'
import ThemePalettePicker from './ThemePalettePicker'
import styles from './ThemeSelector.module.css'

const ThemeSelector = () => (
  <div className={styles.controls}>
    <ThemeToggle hideLabel className={styles.themeToggle} />
    <ThemePalettePicker className={styles.paletteBar} />
  </div>
)

export default ThemeSelector
