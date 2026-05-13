import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const UserContext = createContext(null)

const DEFAULT_STATE = {
  name: '',
  photo: null,
  calorieGoal: 2000,
  dietaryPreference: 'non-veg', // 'veg' | 'non-veg'
  fitnessGoal: 'maintain',      // 'lose' | 'maintain' | 'gain'
  waterGoal: 8,
  onboardingDone: false,
  diary: {},       // { 'YYYY-MM-DD': [{ id, name, kcal, protein, carbs, fat, mealTime, score, isVeg, mood, energy, timestamp }] }
  water: {},       // { 'YYYY-MM-DD': number }
  streak: 0,
  lastLogDate: null,
  milestones: [],  // [3, 7, 14, 30] days achieved
  weeklyReport: {},// { 'YYYY-WW': { summary, bestDay, worstDay, macroGaps, nextGoal } }
  notifications: true,
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function UserProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('calsnap_state')
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE
    } catch {
      return DEFAULT_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('calsnap_state', JSON.stringify(state))
  }, [state])

  const update = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const completeOnboarding = useCallback((data) => {
    setState(prev => ({ ...prev, ...data, onboardingDone: true }))
  }, [])

  const addDiaryEntry = useCallback((entry) => {
    const date = today()
    setState(prev => {
      const dayEntries = prev.diary[date] || []
      const newEntry = { ...entry, id: Date.now(), timestamp: new Date().toISOString() }
      const newDiary = { ...prev.diary, [date]: [...dayEntries, newEntry] }

      let streak = prev.streak
      let lastLogDate = prev.lastLogDate
      const milestones = [...(prev.milestones || [])]

      if (lastLogDate !== date) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yStr = yesterday.toISOString().slice(0, 10)
        streak = lastLogDate === yStr ? streak + 1 : 1
        lastLogDate = date
        ;[3, 7, 14, 30].forEach(m => {
          if (streak >= m && !milestones.includes(m)) milestones.push(m)
        })
      }

      return { ...prev, diary: newDiary, streak, lastLogDate, milestones }
    })
  }, [])

  const deleteDiaryEntry = useCallback((id) => {
    const date = today()
    setState(prev => {
      const dayEntries = (prev.diary[date] || []).filter(e => e.id !== id)
      return { ...prev, diary: { ...prev.diary, [date]: dayEntries } }
    })
  }, [])

  const logWater = useCallback((amount) => {
    const date = today()
    setState(prev => {
      const current = prev.water[date] || 0
      return { ...prev, water: { ...prev.water, [date]: Math.max(0, current + amount) } }
    })
  }, [])

  const saveWeeklyReport = useCallback((weekKey, report) => {
    setState(prev => ({
      ...prev,
      weeklyReport: { ...prev.weeklyReport, [weekKey]: report }
    }))
  }, [])

  const todayEntries = state.diary[today()] || []
  const todayWater = state.water[today()] || 0

  const todayTotals = todayEntries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.kcal || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const value = {
    ...state,
    update,
    completeOnboarding,
    addDiaryEntry,
    deleteDiaryEntry,
    logWater,
    saveWeeklyReport,
    todayEntries,
    todayWater,
    todayTotals,
    today: today(),
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
