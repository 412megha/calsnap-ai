import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export function useAiCoach() {
  const [tip, setTip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTip = useCallback(async ({ totals, goals, preference, fitnessGoal }) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setTip(getLocalTip(totals, goals, preference))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const dietLabel = preference === 'veg' ? 'vegetarian' : 'non-vegetarian'
      const coachModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: 'You are Petal, a warm AI wellness coach for a calorie tracking app. Give ONE short (2-3 sentence), personalized, encouraging tip. Use one flower/nature metaphor. No markdown.',
      })
      const coachResult = await coachModel.generateContent(
        `Stats: ${totals.kcal}/${goals.kcal} kcal, P${totals.protein}g/${goals.protein}g, C${totals.carbs}g/${goals.carbs}g, F${totals.fat}g/${goals.fat}g. Diet: ${dietLabel}. Goal: ${fitnessGoal}. Only suggest ${dietLabel} foods.`
      )
      setTip(coachResult.response.text())
    } catch (e) {
      setError(e.message)
      setTip(getLocalTip(totals, goals, preference))
    } finally {
      setLoading(false)
    }
  }, [])

  return { tip, loading, error, fetchTip }
}

function getLocalTip(totals, goals, preference) {
  const remaining = (goals.kcal || 2000) - (totals.kcal || 0)
  if (remaining < 200) return preference === 'veg'
    ? 'You\'re blooming beautifully today! A light dal soup or fruit bowl would round off your day perfectly.'
    : 'You\'re almost at your goal! A light salad or lean protein snack would be a lovely finish.'
  if ((totals.protein || 0) < (goals.protein || 50) * 0.5) return preference === 'veg'
    ? 'Your petals need protein to flourish! Try adding paneer, lentils, or Greek yogurt to your next meal.'
    : 'Your body blooms with protein! Consider adding eggs, grilled chicken, or Greek yogurt to stay strong.'
  return preference === 'veg'
    ? 'You\'re nurturing yourself beautifully! Keep your meals colorful with veggies and whole grains.'
    : 'Great balance today! Keep nourishing yourself with whole foods and stay hydrated like a garden in morning light.'
}
