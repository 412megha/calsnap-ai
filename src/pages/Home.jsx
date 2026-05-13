import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { round2 } from '../utils/calculateMacros'
import { useCalorieData } from '../hooks/useCalorieData'
import MacroRing from '../components/MacroRing'
import AiCoachCard from '../components/AiCoachCard'
import WaterTracker from '../components/WaterTracker'
import StreakBadge from '../components/StreakBadge'
import MealCard from '../components/MealCard'
import ProgressBar from '../components/ProgressBar'
import BottomNav from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

function greeting(name) {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name}`
  if (h < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

export default function Home() {
  const { name, streak, dietaryPreference, calorieGoal, todayEntries } = useUser()
  const { todayTotals, goals, forecast } = useCalorieData()
  const navigate = useNavigate()

  const remaining = calorieGoal - todayTotals.kcal
  const recentMeals = todayEntries.slice(-3).reverse()

  return (
    <div className={`page ${styles.home}`}>
      {/* Header */}
      <div className={styles.topBar}>
        <div>
          <h2 className={styles.greeting}>{greeting(name || 'there')}</h2>
          <p className={styles.date}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Hero calorie card */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating deco blobs */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />

        <div className={styles.heroContent}>
          <div className={styles.calBlock}>
            <span className={styles.calNum}>{round2(todayTotals.kcal)}</span>
            <span className={styles.calUnit}>kcal eaten</span>
          </div>
          <div className={styles.calDivider} />
          <div className={styles.calBlock}>
            <span className={styles.calNum} style={{ color: remaining < 0 ? 'var(--rose-dark)' : 'var(--matcha-dark)' }}>
              {round2(Math.abs(remaining))}
            </span>
            <span className={styles.calUnit}>{remaining < 0 ? 'over goal' : 'remaining'}</span>
          </div>
        </div>

        <ProgressBar value={todayTotals.kcal} max={calorieGoal} showLabel={false} />

        <div className={styles.heroFooter}>
          <span className={styles.forecast}>Forecast: <em>{forecast} kcal</em></span>
          <span className={styles.prefBadge} style={{
            background: dietaryPreference === 'veg' ? 'var(--surface-matcha)' : 'var(--surface-rose)',
            color: dietaryPreference === 'veg' ? 'var(--matcha-text)' : 'var(--rose-text)',
            border: `1.5px solid ${dietaryPreference === 'veg' ? 'var(--matcha-dark)' : 'var(--rose-dark)'}`
          }}>
            <span className={styles.prefDot} style={{ background: dietaryPreference === 'veg' ? 'var(--matcha-dark)' : 'var(--rose-dark)' }} />
            {dietaryPreference === 'veg' ? 'vegetarian · suggestions on' : 'Non-Veg'}
          </span>
        </div>
      </motion.div>

      {/* Macro rings */}
      <div className={styles.rings}>
        <MacroRing macro="protein" value={todayTotals.protein} goal={goals.protein} />
        <MacroRing macro="carbs"   value={todayTotals.carbs}   goal={goals.carbs} />
        <MacroRing macro="fat"     value={todayTotals.fat}     goal={goals.fat} />
      </div>

      {/* AI Coach */}
      <div className={styles.section}>
        <AiCoachCard />
      </div>

      {/* Water */}
      <div className={styles.section}>
        <WaterTracker />
      </div>

      {/* Today's diary preview */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Today's meals</h3>
          <button className={styles.seeAll} onClick={() => navigate('/diary')}>See all</button>
        </div>
        {recentMeals.length === 0 ? (
          <div className={styles.empty}>
            <p>No meals logged yet.</p>
            <button className={styles.scanBtn} onClick={() => navigate('/scan')}>Snap your first meal ✿</button>
          </div>
        ) : (
          recentMeals.map(e => <MealCard key={e.id} entry={e} />)
        )}
      </div>

      <BottomNav />
    </div>
  )
}
