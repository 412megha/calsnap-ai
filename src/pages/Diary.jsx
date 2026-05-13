import { useUser } from '../context/UserContext'
import { round2 } from '../utils/calculateMacros'
import MealCard from '../components/MealCard'
import BottomNav from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'
import styles from './Diary.module.css'

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_ICONS = { breakfast: '☀️', lunch: '🌿', dinner: '🌙', snack: '🌸' }

export default function Diary() {
  const { todayEntries, deleteDiaryEntry, todayTotals, calorieGoal } = useUser()
  const navigate = useNavigate()

  const grouped = MEAL_ORDER.reduce((acc, meal) => {
    const items = todayEntries.filter(e => e.mealTime === meal)
    if (items.length) acc[meal] = items
    return acc
  }, {})

  const hasEntries = todayEntries.length > 0

  return (
    <div className={`page ${styles.diary}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Today's Diary</h1>
        <span className={styles.date}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Running total */}
      <div className={styles.totalCard}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total calories</span>
          <span className={styles.totalKcal}>{round2(todayTotals.kcal)} / {calorieGoal} kcal</span>
        </div>
        <div className={styles.macroSummary}>
          <span style={{ color: 'var(--rose-dark)' }}>P {round2(todayTotals.protein)}g</span>
          <span style={{ color: 'var(--lavender-dark)' }}>C {round2(todayTotals.carbs)}g</span>
          <span style={{ color: 'var(--peach-dark)' }}>F {round2(todayTotals.fat)}g</span>
        </div>
      </div>

      {!hasEntries ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            <span className={styles.emptyFlower}>✿</span>
          </div>
          <h3 className={styles.emptyTitle}>Start your first bloom</h3>
          <p className={styles.emptySub}>Snap a meal to begin your wellness journey</p>
          <button className={styles.snapBtn} onClick={() => navigate('/scan')}>
            Snap a meal
          </button>
        </div>
      ) : (
        <div className={styles.groups}>
          {MEAL_ORDER.map(meal => {
            const items = grouped[meal]
            if (!items) return null
            const mealKcal = items.reduce((s, e) => s + e.kcal, 0)
            return (
              <div key={meal} className={styles.group}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupIcon}>{MEAL_ICONS[meal]}</span>
                  <span className={styles.groupName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                  <span className={styles.groupKcal}>{round2(mealKcal)} kcal</span>
                </div>
                {items.map(e => (
                  <MealCard key={e.id} entry={e} onDelete={deleteDiaryEntry} />
                ))}
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
