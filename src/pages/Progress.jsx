import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend, CartesianGrid
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useUser } from '../context/UserContext'
import { round2 } from '../utils/calculateMacros'
import { useCalorieData } from '../hooks/useCalorieData'
import BottomNav from '../components/BottomNav'
import WeeklyReport from '../components/WeeklyReport'
import styles from './Progress.module.css'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

function getWeekKey() {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${week}`
}

export default function Progress() {
  const { weeklyReport, saveWeeklyReport, calorieGoal, dietaryPreference, fitnessGoal } = useUser()
  const { weekData, bestDay, worstDay, goals } = useCalorieData()
  const [reportLoading, setReportLoading] = useState(false)
  const [legacyExpanded, setLegacyExpanded] = useState(false)
  const weekKey = getWeekKey()
  const report = weeklyReport[weekKey]

  const isSunday = new Date().getDay() === 0

  function buildMockReport() {
    const best = bestDay || weekData.find(d => d.kcal > 0) || weekData[0]
    const worst = worstDay || weekData[weekData.length - 1]
    const avgProt = Math.round(weekData.reduce((s, d) => s + d.protein, 0) / Math.max(weekData.filter(d => d.kcal > 0).length, 1))
    return {
      overview: `You've been blooming beautifully this week! Your ${best?.label || 'best day'} stood out with great calorie balance and solid macro distribution. Overall a nurturing week for your wellness journey.`,
      bestDay: { day: best?.label || '—', calories: best?.kcal || 0 },
      worstDay: { day: worst?.label || '—', calories: worst?.kcal || 0 },
      highlights: [
        'Consistent daily logging shows great commitment to your goals',
        `Strong performance on ${best?.label || 'your best day'} — great calorie balance`,
        'Keeping track of all three macros shows excellent awareness'
      ],
      improvements: [
        `Aim to keep protein above 80% of your ${goals?.protein || 50}g daily goal each day`,
        'Watch calorie intake on higher-activity days to stay within range'
      ],
      nextWeekGoal: `Focus on hitting your protein target of ${goals?.protein || 50}g daily — try adding a protein-rich snack like Greek yogurt or a handful of nuts in the afternoon.`,
      macroGaps: {
        protein: avgProt < (goals?.protein || 50) * 0.8 ? 'low' : 'good',
        carbs: 'good',
        fat: 'good'
      },
      generatedAt: new Date().toISOString()
    }
  }

  async function generateReport() {
    setReportLoading(true)
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        saveWeeklyReport(weekKey, buildMockReport())
        return
      }

      const summary = weekData
        .map(d => `${d.label}: ${d.kcal} kcal, P${d.protein}g C${d.carbs}g F${d.fat}g`)
        .join('\n')

      const reportModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: [
          'You are Petal, a warm wellness coach. Return ONLY valid JSON — no markdown, no explanation.',
          'Use this exact structure:',
          '{',
          '  "overview": "2-3 sentence overall summary with one nature/flower metaphor",',
          '  "bestDay": { "day": "DayName", "calories": 1850 },',
          '  "worstDay": { "day": "DayName", "calories": 2400 },',
          '  "highlights": ["point 1", "point 2", "point 3"],',
          '  "improvements": ["point 1", "point 2"],',
          '  "nextWeekGoal": "one specific personalized goal sentence",',
          '  "macroGaps": { "protein": "low|good|high", "carbs": "low|good|high", "fat": "low|good|high" }',
          '}',
          'bestDay = day closest to calorie goal without exceeding it.',
          'worstDay = day furthest over calorie goal (or lowest calories if all under).',
          'macroGaps: compare weekly averages against goals — low if under 80%, high if over 120%.',
        ].join('\n'),
      })

      const result = await reportModel.generateContent(
        `Diet: ${dietaryPreference}, Goal: ${fitnessGoal}, Daily calorie target: ${calorieGoal} kcal\nMacro goals — Protein: ${goals?.protein}g, Carbs: ${goals?.carbs}g, Fat: ${goals?.fat}g\n\nWeek data:\n${summary}`
      )

      let parsed
      try {
        const raw = result.response.text().trim()
        const jsonStr = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
        parsed = JSON.parse(jsonStr)
      } catch {
        parsed = buildMockReport()
      }

      saveWeeklyReport(weekKey, { ...parsed, generatedAt: new Date().toISOString() })
    } catch {
      saveWeeklyReport(weekKey, buildMockReport())
    } finally {
      setReportLoading(false)
    }
  }

  const isStructuredReport = report && report.highlights

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p style={{ color: 'var(--rose-dark)' }}>{round2(payload[0].value)} kcal</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`page ${styles.progress}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Weekly Progress</h1>
        <p className={styles.sub}>Your bloom journey this week</p>
      </div>

      {/* Calorie bar chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Daily Calories</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#806068' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#806068' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="kcal" radius={[6, 6, 0, 0]}>
              {weekData.map((d, i) => (
                <Cell key={i} fill={d.kcal <= calorieGoal ? '#f9c8d8' : '#d4607a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Macro trend line chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Macro Trends</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weekData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecdee8" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#806068' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#806068' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="protein" stroke="#d4607a" strokeWidth={2} dot={false} name="Protein" />
            <Line type="monotone" dataKey="carbs"   stroke="#9060c8" strokeWidth={2} dot={false} name="Carbs" />
            <Line type="monotone" dataKey="fat"     stroke="#d07030" strokeWidth={2} dot={false} name="Fat" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Best / worst day */}
      <div className={styles.dayCards}>
        <div className={styles.dayCard} style={{ background: 'var(--surface-matcha)', borderColor: 'var(--matcha)' }}>
          <span className={styles.dayEmoji}>✨</span>
          <span className={styles.dayLabel}>Best day</span>
          <span className={styles.dayValue}>{bestDay?.label || '—'}</span>
          {bestDay && <span className={styles.dayKcal}>{round2(bestDay.kcal)} kcal</span>}
        </div>
        <div className={styles.dayCard} style={{ background: 'var(--surface-rose)', borderColor: 'var(--rose)' }}>
          <span className={styles.dayEmoji}>🌿</span>
          <span className={styles.dayLabel}>Most calories</span>
          <span className={styles.dayValue}>{worstDay?.label || '—'}</span>
          {worstDay && <span className={styles.dayKcal}>{round2(worstDay.kcal)} kcal</span>}
        </div>
      </div>

      {/* Weekly AI Report */}
      <div className={styles.reportSection}>
        <h3 className={styles.reportSectionTitle}>Weekly AI Report</h3>

        {isStructuredReport ? (
          <WeeklyReport
            report={report}
            weekData={weekData}
            calorieGoal={calorieGoal}
            goals={goals}
          />
        ) : report && !isStructuredReport ? (
          /* Legacy plain-text report — expandable via See More/See Less */
          <div className={styles.reportCard}>
            <p className={styles.reportText}>{report.summary}</p>
            <button className={styles.seeMoreBtn} onClick={() => setLegacyExpanded(!legacyExpanded)}>
              {legacyExpanded ? 'See Less ↑' : 'See More ↓'}
            </button>
            <AnimatePresence>
              {legacyExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className={styles.reportMeta}>Generated {new Date(report.generatedAt).toLocaleDateString()}</p>
                  <button className={styles.reportBtn} onClick={generateReport} disabled={reportLoading}>
                    {reportLoading ? 'Regenerating...' : '✨ Generate Full Report'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className={styles.reportCard}>
            <div className={styles.reportEmpty}>
              <p>{isSunday ? 'Generate your weekly bloom report!' : 'Available any time — keep logging to get the best insights!'}</p>
              <button
                className={styles.reportBtn}
                onClick={generateReport}
                disabled={reportLoading}
              >
                {reportLoading ? 'Generating...' : '✨ Generate Report'}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
