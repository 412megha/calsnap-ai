import { useState, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { round2 } from '../utils/calculateMacros'
import styles from './WeeklyReport.module.css'

function getWeekRange(weekData) {
  if (!weekData || !weekData.length) return ''
  const first = new Date(weekData[0].date + 'T00:00:00')
  const last = new Date(weekData[weekData.length - 1].date + 'T00:00:00')
  const opts = { month: 'short', day: 'numeric' }
  return `${first.toLocaleDateString('en', opts)} – ${last.toLocaleDateString('en', opts)}, ${last.getFullYear()}`
}

function avg(arr) {
  const nonZero = arr.filter(v => v > 0)
  if (!nonZero.length) return 0
  return Math.round(nonZero.reduce((s, v) => s + v, 0) / nonZero.length)
}

function MacroChip({ label, average, goal, status }) {
  const color = status === 'low' ? '#d07030' : status === 'high' ? '#d4607a' : '#408040'
  const bg = status === 'low' ? '#fae0c0' : status === 'high' ? '#fad4e0' : '#d4ecc8'
  return (
    <div className={styles.macroChip} style={{ background: bg, borderColor: color + '55' }}>
      <span className={styles.macroChipLabel}>{label}</span>
      <span className={styles.macroChipValue} style={{ color }}>{average}g</span>
      <span className={styles.macroChipGoal}>goal {goal}g</span>
      <span className={styles.macroChipStatus} style={{ background: color + '22', color }}>{status || '—'}</span>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p style={{ color: '#d4607a', fontWeight: 600 }}>{round2(payload[0].value)} kcal</p>
      </div>
    )
  }
  return null
}

const toggleBtnStyle = {
  width: '100%',
  marginTop: '12px',
  padding: '10px',
  background: 'transparent',
  border: '1px solid #e8a0b8',
  borderRadius: '12px',
  color: '#c97a90',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
}

export default function WeeklyReport({ report, weekData, calorieGoal, goals }) {
  const [pdfState, setPdfState] = useState('idle')
  const [expanded, setExpanded] = useState(false)
  const reportRef = useRef(null)

  const weekRange = getWeekRange(weekData)
  const avgCalories = avg(weekData.map(d => d.kcal))
  const avgProtein = avg(weekData.map(d => d.protein))
  const avgCarbs = avg(weekData.map(d => d.carbs))
  const avgFat = avg(weekData.map(d => d.fat))
  const todayStr = new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })

  const macroStatus = (average, goal) => {
    if (!goal) return 'good'
    if (average < goal * 0.8) return 'low'
    if (average > goal * 1.2) return 'high'
    return 'good'
  }

  const toggleExpand = () => {
    if (expanded) {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setExpanded(prev => !prev)
  }

  const downloadPDF = async () => {
    setPdfState('loading')
    try {
      const btn = document.getElementById('pdf-download-btn')
      if (btn) btn.style.display = 'none'

      const reportEl = document.getElementById('weekly-report')
      const canvas = await html2canvas(reportEl, {
        scale: 2,
        backgroundColor: '#fdf6f2',
        useCORS: true,
        logging: false,
      })

      if (btn) btn.style.display = ''

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width

      if (imgHeight <= pageHeight) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        const scale = pageHeight / imgHeight
        const scaledWidth = imgWidth * scale
        const xOffset = (pageWidth - scaledWidth) / 2
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, 0, scaledWidth, pageHeight)
      }

      pdf.save(`CalSnap-Weekly-Report-${new Date().toISOString().slice(0, 10)}.pdf`)
      setPdfState('done')
      setTimeout(() => setPdfState('idle'), 2500)
    } catch (e) {
      console.error('PDF generation error:', e)
      const btn = document.getElementById('pdf-download-btn')
      if (btn) btn.style.display = ''
      setPdfState('idle')
    }
  }

  const barChart = (
    <div className={styles.section}>
      <div className={styles.chartMeta}>
        <span className={styles.chartLabel}>Daily Calories</span>
        <span className={styles.avgBadge}>Avg {avgCalories} kcal/day</span>
      </div>
      <ResponsiveContainer width="100%" height={155}>
        <BarChart data={weekData} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#806068' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#806068' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            y={calorieGoal}
            stroke="#9060c8"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{ value: 'Goal', position: 'insideTopRight', fontSize: 10, fill: '#9060c8' }}
          />
          <Bar dataKey="kcal" radius={[5, 5, 0, 0]}>
            {weekData.map((d, i) => (
              <Cell key={i} fill={d.kcal > calorieGoal ? '#d4607a' : '#e0789a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div ref={reportRef}>
      {!expanded ? (
        /* ── Collapsed preview ── */
        <div className={styles.report}>
          {barChart}

          {report.highlights?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionPill} style={{ background: '#fad4e0', color: '#a0304a' }}>
                📈 Highlights
              </div>
              <ul className={styles.bulletList}>
                {report.highlights.slice(0, 2).map((h, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletDot} style={{ background: '#e0789a' }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={toggleExpand} style={toggleBtnStyle}>See More ↓</button>
        </div>
      ) : (
        /* ── Full expanded report ── */
        <div>
          <div id="weekly-report" className={styles.report}>
            {/* Header */}
            <div className={styles.reportHeader}>
              <div className={styles.appLogo}>CalSnap 🌸</div>
              <h2 className={styles.reportTitle}>Weekly Nutrition Report</h2>
              <p className={styles.dateRange}>{weekRange}</p>
            </div>

            {/* Overview */}
            <div className={styles.section}>
              <div className={styles.sectionPill} style={{ background: '#fad4e0', color: '#a0304a' }}>
                🌸 Overview
              </div>
              <p className={styles.overviewText}>{report.overview}</p>
              <div className={styles.dayBadges}>
                <div className={styles.dayBadge} style={{ background: '#d4ecc8', borderColor: '#a8d898' }}>
                  <span className={styles.dayBadgeIcon}>✨</span>
                  <span className={styles.dayBadgeLabel}>Best Day</span>
                  <span className={styles.dayBadgeName}>{report.bestDay?.day || '—'}</span>
                  {report.bestDay?.calories > 0 && (
                    <span className={styles.dayBadgeKcal}>{report.bestDay.calories} kcal</span>
                  )}
                </div>
                <div className={styles.dayBadge} style={{ background: '#fad4e0', borderColor: '#f0a8b8' }}>
                  <span className={styles.dayBadgeIcon}>🌿</span>
                  <span className={styles.dayBadgeLabel}>Most Calories</span>
                  <span className={styles.dayBadgeName}>{report.worstDay?.day || '—'}</span>
                  {report.worstDay?.calories > 0 && (
                    <span className={styles.dayBadgeKcal}>{report.worstDay.calories} kcal</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bar chart + macro table */}
            <div className={styles.section}>
              <div className={styles.chartMeta}>
                <span className={styles.chartLabel}>Daily Calories</span>
                <span className={styles.avgBadge}>Avg {avgCalories} kcal/day</span>
              </div>
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={weekData} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#806068' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#806068' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={calorieGoal}
                    stroke="#9060c8"
                    strokeDasharray="5 3"
                    strokeWidth={1.5}
                    label={{ value: 'Goal', position: 'insideTopRight', fontSize: 10, fill: '#9060c8' }}
                  />
                  <Bar dataKey="kcal" radius={[5, 5, 0, 0]}>
                    {weekData.map((d, i) => (
                      <Cell key={i} fill={d.kcal > calorieGoal ? '#d4607a' : '#e0789a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className={styles.macroTableWrap}>
                <table className={styles.macroTable}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th style={{ color: '#d4607a' }}>P (g)</th>
                      <th style={{ color: '#9060c8' }}>C (g)</th>
                      <th style={{ color: '#d07030' }}>F (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.map((d, i) => (
                      <tr key={i} className={i % 2 === 0 ? styles.rowEven : ''}>
                        <td className={styles.dayCell}>{d.label}</td>
                        <td>{round2(d.protein)}</td>
                        <td>{round2(d.carbs)}</td>
                        <td>{round2(d.fat)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Macro Summary */}
            <div className={styles.section}>
              <div className={styles.sectionPill} style={{ background: '#e4d8f8', color: '#5030a0' }}>
                💪 Macro Summary
              </div>
              <div className={styles.macroRow}>
                <MacroChip label="Protein" average={avgProtein} goal={goals?.protein || 0} status={macroStatus(avgProtein, goals?.protein)} />
                <MacroChip label="Carbs"   average={avgCarbs}   goal={goals?.carbs || 0}   status={macroStatus(avgCarbs, goals?.carbs)} />
                <MacroChip label="Fat"     average={avgFat}     goal={goals?.fat || 0}     status={macroStatus(avgFat, goals?.fat)} />
              </div>
            </div>

            {/* Highlights */}
            {report.highlights?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionPill} style={{ background: '#fad4e0', color: '#a0304a' }}>
                  📈 Highlights
                </div>
                <ul className={styles.bulletList}>
                  {report.highlights.map((h, i) => (
                    <li key={i} className={styles.bulletItem}>
                      <span className={styles.bulletDot} style={{ background: '#e0789a' }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Improve */}
            {report.improvements?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionPill} style={{ background: '#e4d8f8', color: '#5030a0' }}>
                  ⚠️ Areas to Improve
                </div>
                <ul className={styles.bulletList}>
                  {report.improvements.map((imp, i) => (
                    <li key={i} className={styles.bulletItem}>
                      <span className={styles.bulletDot} style={{ background: '#9060c8' }} />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Week Goal */}
            {report.nextWeekGoal && (
              <div className={styles.section}>
                <div className={styles.sectionPill} style={{ background: '#d4ecc8', color: '#205020' }}>
                  🎯 Next Week Goal
                </div>
                <p className={styles.goalText}>{report.nextWeekGoal}</p>
              </div>
            )}

            {/* Footer */}
            <div className={styles.reportFooter}>
              Generated by CalSnap 🌸 · {todayStr}
            </div>
          </div>

          {/* Download PDF — outside report div so it's not captured */}
          <button
            id="pdf-download-btn"
            className={styles.downloadBtn}
            onClick={downloadPDF}
            disabled={pdfState === 'loading'}
            data-state={pdfState}
          >
            {pdfState === 'loading' ? 'Generating PDF...' : pdfState === 'done' ? '✓ Downloaded!' : '⬇ Download PDF Report'}
          </button>

          <button onClick={toggleExpand} style={toggleBtnStyle}>See Less ↑</button>
        </div>
      )}
    </div>
  )
}
