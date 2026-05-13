import styles from './ProgressBar.module.css'

export default function ProgressBar({ value, max, color, label, showLabel = true }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div className={styles.wrap}>
      {showLabel && label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.count}>{value} / {max}</span>
        </div>
      )}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{
            width: `${pct}%`,
            background: color || 'var(--progress-gradient)'
          }}
        />
      </div>
    </div>
  )
}
