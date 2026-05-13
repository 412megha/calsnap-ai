export const round2 = (val) => {
  if (val === null || val === undefined) return 0
  return Math.round(Number(val) * 100) / 100
}

export function calculateMacros(entries) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.kcal || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function macroGoals(calorieGoal) {
  return {
    protein: Math.round((calorieGoal * 0.25) / 4),
    carbs: Math.round((calorieGoal * 0.45) / 4),
    fat: Math.round((calorieGoal * 0.30) / 9),
  }
}

export function forecastCalories(todayEntries) {
  if (!todayEntries.length) return 0
  const now = new Date()
  const minutesPassed = now.getHours() * 60 + now.getMinutes()
  const minutesInDay = 1440
  const ratio = minutesInDay / Math.max(minutesPassed, 1)
  const current = calculateMacros(todayEntries).kcal
  return Math.round(current * ratio)
}
