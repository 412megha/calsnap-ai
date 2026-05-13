import { useEffect } from 'react'
import { motion } from 'framer-motion'
import FlowerIcon from '../assets/FlowerIcon'
import { useAiCoach } from '../hooks/useAiCoach'
import { useUser } from '../context/UserContext'
import { useCalorieData } from '../hooks/useCalorieData'
import styles from './AiCoachCard.module.css'

export default function AiCoachCard() {
  const { dietaryPreference, fitnessGoal } = useUser()
  const { todayTotals, goals } = useCalorieData()
  const { tip, loading, fetchTip } = useAiCoach()

  const params = { totals: todayTotals, goals: { ...goals, kcal: 2000 }, preference: dietaryPreference, fitnessGoal }

  useEffect(() => {
    fetchTip(params)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <FlowerIcon size={22} color="#d4607a" />
        <span className={styles.title}>Petal Coach</span>
        <button
          className={styles.refresh}
          onClick={() => fetchTip(params)}
          aria-label="Refresh tip"
        >
          <span className={loading ? styles.spin : ''}>↻</span>
        </button>
      </div>
      <div className={styles.body}>
        {loading ? (
          <motion.div className={styles.loader}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}>
            Petal is thinking...
          </motion.div>
        ) : (
          <p className={styles.tip}>{tip || 'Tap ↻ for your personalized tip!'}</p>
        )}
      </div>
    </div>
  )
}
