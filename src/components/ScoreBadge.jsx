import { scoreColor, scoreBg } from '../utils/scoreMeal'
import styles from './ScoreBadge.module.css'

export default function ScoreBadge({ score }) {
  return (
    <span
      className={styles.badge}
      style={{ background: scoreBg(score), color: scoreColor(score) }}
    >
      {score}/10
    </span>
  )
}
