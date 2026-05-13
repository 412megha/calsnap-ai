import { useState } from 'react'
import { round2 } from '../utils/calculateMacros'
import ScoreBadge from './ScoreBadge'
import styles from './MealCard.module.css'

const MEAL_COLORS = {
  breakfast: { bg: 'var(--surface-peach)', border: '#e8b070' },
  lunch:     { bg: 'var(--surface-rose)',  border: '#e890a8' },
  dinner:    { bg: 'var(--surface-lavender)', border: '#b098d8' },
  snack:     { bg: 'var(--surface-matcha)', border: '#80b878' },
}

export default function MealCard({ entry, onDelete }) {
  const cfg = MEAL_COLORS[entry.mealTime] || MEAL_COLORS.snack
  const [expanded, setExpanded] = useState(false)
  const hasItems = Array.isArray(entry.items) && entry.items.length > 0

  return (
    <div className={styles.card} style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.border}` }}>
      <div className={styles.top}>
        <div className={styles.nameRow}>
          <span className={styles.dot} style={{ background: entry.isVeg ? 'var(--matcha-dark)' : 'var(--rose-dark)' }} />
          <span className={styles.name}>{entry.name}</span>
          {entry.score && <ScoreBadge score={entry.score} />}
          {hasItems && (
            <button
              className={styles.expandBtn}
              onClick={() => setExpanded(e => !e)}
              aria-label={expanded ? 'Collapse items' : 'Expand items'}
            >
              {expanded ? '▾' : '▸'}
            </button>
          )}
        </div>
        <span className={styles.kcal}>{round2(entry.kcal)} kcal</span>
      </div>

      <div className={styles.macros}>
        <span className={styles.macro} style={{ background: 'rgba(255,255,255,0.6)', color: 'var(--rose-text)' }}>P {round2(entry.protein)}g</span>
        <span className={styles.macro} style={{ background: 'rgba(255,255,255,0.6)', color: 'var(--lavender-text)' }}>C {round2(entry.carbs)}g</span>
        <span className={styles.macro} style={{ background: 'rgba(255,255,255,0.6)', color: 'var(--peach-text)' }}>F {round2(entry.fat)}g</span>
        {entry.mood && <span className={styles.tag}>{entry.mood}</span>}
        {hasItems && (
          <span className={styles.itemCount}>{entry.items.length} items</span>
        )}
      </div>

      {/* Collapsible items */}
      {hasItems && expanded && (
        <div className={styles.itemsList}>
          {entry.items.map((item, i) => (
            <div key={i} className={styles.subItem}>
              <div className={styles.subLeft}>
                <span
                  className={styles.subDot}
                  style={{ background: item.isVeg ? 'var(--matcha-dark)' : 'var(--rose-dark)' }}
                />
                <span className={styles.subName}>{item.name}</span>
                {item.quantity && (
                  <span className={styles.subQty}>· {item.quantity}</span>
                )}
              </div>
              <span className={styles.subKcal}>{round2(item.kcal)} kcal</span>
            </div>
          ))}
        </div>
      )}

      {onDelete && (
        <button className={styles.del} onClick={() => onDelete(entry.id)} aria-label="Delete entry">
          ×
        </button>
      )}
    </div>
  )
}
