import { round2 } from '../utils/calculateMacros'
import styles from './MacroRing.module.css'

const MACRO_CONFIG = {
  protein: {
    petalFilled: '#d4607a',
    petalEmpty: '#f0b0c0',
    centerBg: '#fad4e0',
    cardBg: '#fad4e0',
    cardBorder: '#f0a8bc',
    textColor: '#a0304a',
    label: 'Protein',
  },
  carbs: {
    petalFilled: '#9060c8',
    petalEmpty: '#c8b0e8',
    centerBg: '#e4d8f8',
    cardBg: '#e4d8f8',
    cardBorder: '#b8a0e0',
    textColor: '#5030a0',
    label: 'Carbs',
  },
  fat: {
    petalFilled: '#d07030',
    petalEmpty: '#e8b888',
    centerBg: '#fae0c0',
    cardBg: '#fae0c0',
    cardBorder: '#e8b880',
    textColor: '#a04810',
    label: 'Fat',
  },
}

export default function MacroRing({ macro, value, goal, unit = 'g' }) {
  const cfg = MACRO_CONFIG[macro]
  const pct = Math.min(1, goal > 0 ? value / goal : 0)
  const litPetals = Math.round(pct * 8)

  return (
    <div className={styles.card} style={{ background: cfg.cardBg, borderColor: cfg.cardBorder }}>
      <svg width="100" height="100" viewBox="0 0 100 100" className={styles.svg}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="24"
            rx="9"
            ry="14"
            fill={i < litPetals ? cfg.petalFilled : cfg.petalEmpty}
            opacity={i < litPetals ? 1 : 0.5}
            transform={`rotate(${i * 45} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="22" fill={cfg.centerBg} />
        <text
          x="50" y="46"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontStyle="italic"
          fontWeight="600"
          fill={cfg.textColor}
          fontFamily="'Playfair Display', Georgia, serif"
        >
          {Math.round(pct * 100)}%
        </text>
        <text
          x="50" y="57"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7.5"
          fill={cfg.textColor}
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          letterSpacing="0.06em"
        >
          {cfg.label.toUpperCase()}
        </text>
      </svg>
      <div className={styles.value} style={{ color: cfg.textColor }}>
        {round2(value)}<span className={styles.unit}>{unit}</span>
      </div>
    </div>
  )
}
