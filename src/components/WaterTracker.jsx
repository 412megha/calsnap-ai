import { useUser } from '../context/UserContext'
import styles from './WaterTracker.module.css'

function WaterBottle({ index, filled, onClick }) {
  const capColor = filled ? '#9060c8' : '#c8b8d8'
  const bodyFill = filled ? '#e4d8f8' : '#f5f0fc'
  const borderColor = filled ? '#9060c8' : '#c8b8d8'
  const gradId = `wbGrad${index}`
  const clipId = `wbClip${index}`
  const liquidTop = 10 + 34 - 27

  return (
    <button className={styles.bottleBtn} onClick={onClick} aria-label={`Bottle ${index + 1}`}>
      <svg width="30" height="52" viewBox="0 0 30 52">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0a0e8" />
            <stop offset="100%" stopColor="#9060c8" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x="2" y="10" width="26" height="34" rx="6" />
          </clipPath>
        </defs>

        {/* Cap */}
        <rect x="10" y="0" width="10" height="5" rx="2" fill={capColor} />

        {/* Neck sides */}
        <line x1="10" y1="5" x2="10" y2="11" stroke={borderColor} strokeWidth="1.5" />
        <line x1="20" y1="5" x2="20" y2="11" stroke={borderColor} strokeWidth="1.5" />

        {/* Body */}
        <rect x="2" y="10" width="26" height="34" rx="6" fill={bodyFill} stroke={borderColor} strokeWidth="1.5" />

        {/* Liquid fill at 80% body height */}
        {filled && (
          <rect
            x="2" y={liquidTop} width="26" height="27"
            fill={`url(#${gradId})`}
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* Shine */}
        {filled && (
          <ellipse cx="9" cy={liquidTop + 4} rx="2.5" ry="3.5" fill="rgba(255,255,255,0.45)" />
        )}
      </svg>
      <span className={styles.bottleNum}>{index + 1}</span>
    </button>
  )
}

export default function WaterTracker() {
  const { todayWater, waterGoal, logWater } = useUser()
  const goal = waterGoal || 8

  return (
    <div className={styles.card}>
      <div className={styles.bottles}>
        {Array.from({ length: goal }).map((_, i) => (
          <WaterBottle
            key={i}
            index={i}
            filled={i < todayWater}
            onClick={() => logWater(i < todayWater ? -1 : 1)}
          />
        ))}
      </div>
      <div className={styles.label}>
        hydration ✦ {todayWater} of {goal} bottles
      </div>
    </div>
  )
}
