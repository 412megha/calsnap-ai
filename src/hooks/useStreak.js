import { useUser } from '../context/UserContext'

export function useStreak() {
  const { streak, milestones } = useUser()

  function milestoneEmoji(days) {
    if (days >= 30) return '🌸'
    if (days >= 14) return '🌺'
    if (days >= 7) return '🌼'
    return '🌷'
  }

  const nextMilestone = [3, 7, 14, 30].find(m => !milestones.includes(m)) || 30
  const daysToNext = Math.max(0, nextMilestone - streak)

  return { streak, milestones, nextMilestone, daysToNext, milestoneEmoji }
}
