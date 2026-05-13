export function scoreMeal({ kcal, protein, carbs, fat }) {
  let score = 5

  // High protein relative to calories boosts score
  const proteinRatio = kcal > 0 ? (protein * 4) / kcal : 0
  if (proteinRatio > 0.30) score += 2
  else if (proteinRatio > 0.20) score += 1

  // Moderate fat
  const fatRatio = kcal > 0 ? (fat * 9) / kcal : 0
  if (fatRatio > 0.45) score -= 2
  else if (fatRatio < 0.25) score += 1

  // Reasonable calorie range per meal
  if (kcal > 800) score -= 2
  else if (kcal < 150) score += 1
  else if (kcal >= 300 && kcal <= 600) score += 1

  return Math.min(10, Math.max(1, score))
}

export function scoreColor(score) {
  if (score >= 8) return 'var(--matcha-dark)'
  if (score >= 5) return 'var(--lavender-dark)'
  return 'var(--rose-dark)'
}

export function scoreBg(score) {
  if (score >= 8) return 'var(--surface-matcha)'
  if (score >= 5) return 'var(--surface-lavender)'
  return 'var(--surface-rose)'
}
