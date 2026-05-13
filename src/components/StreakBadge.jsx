import FlowerIcon from '../assets/FlowerIcon'
import styles from './StreakBadge.module.css'

export default function StreakBadge({ streak }) {
  return (
    <div className={styles.pill}>
      <FlowerIcon size={16} color="#d4607a" />
      <span className={styles.text}>
        <em>{streak} day</em> glow
      </span>
    </div>
  )
}
