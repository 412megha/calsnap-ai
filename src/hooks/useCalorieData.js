import { useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { calculateMacros, macroGoals, forecastCalories } from '../utils/calculateMacros'

export function useCalorieData() {
  const { diary, calorieGoal, todayEntries, todayTotals } = useUser()

  const goals = useMemo(() => macroGoals(calorieGoal), [calorieGoal])

  const forecast = useMemo(() => forecastCalories(todayEntries), [todayEntries])

  const weekData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en', { weekday: 'short' })
      const entries = diary[key] || []
      const { kcal, protein, carbs, fat } = calculateMacros(entries)
      days.push({ date: key, label, kcal, protein, carbs, fat })
    }
    return days
  }, [diary])

  const bestDay = useMemo(() => {
    if (!weekData.length) return null
    return weekData.reduce((best, d) => (d.kcal <= calorieGoal && d.kcal > (best?.kcal || 0) ? d : best), null)
  }, [weekData, calorieGoal])

  const worstDay = useMemo(() => {
    if (!weekData.length) return null
    return weekData.reduce((worst, d) => (d.kcal > (worst?.kcal || 0) ? d : worst), null)
  }, [weekData])

  return { todayTotals, goals, forecast, weekData, bestDay, worstDay }
}
