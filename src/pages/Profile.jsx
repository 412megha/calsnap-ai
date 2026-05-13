import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useStreak } from '../hooks/useStreak'
import FlowerIcon from '../assets/FlowerIcon'
import BottomNav from '../components/BottomNav'
import styles from './Profile.module.css'

const GOALS_LABEL = { lose: 'Lose weight', maintain: 'Maintain', gain: 'Gain muscle' }
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function pad(n) { return String(n).padStart(2, '0') }
function dateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }

export default function Profile() {
  const { name, photo, calorieGoal, dietaryPreference, fitnessGoal, waterGoal, notifications, diary, update } = useUser()
  const { streak, milestones, nextMilestone, daysToNext, milestoneEmoji } = useStreak()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name, calorieGoal, waterGoal })

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  function saveEdits() {
    update(draft)
    setEditing(false)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const todayStr = now.toISOString().slice(0, 10)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Build cells: leading nulls + day numbers
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function isLogged(day) {
    const key = dateStr(viewYear, viewMonth, day)
    return diary[key] && diary[key].length > 0
  }

  function isToday(day) {
    return dateStr(viewYear, viewMonth, day) === todayStr
  }

  function isFuture(day) {
    return dateStr(viewYear, viewMonth, day) > todayStr
  }

  // Streak start date for footer label
  const streakStart = new Date(now)
  streakStart.setDate(now.getDate() - Math.max(0, streak - 1))
  const streakStartLabel = streakStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })

  return (
    <div className={`page ${styles.profile}`}>
      <div className={styles.header}>
        <div className={styles.photoWrap}>
          {photo
            ? <img src={photo} alt={name} className={styles.photo} />
            : <div className={styles.photoFallback}><FlowerIcon size={36} color="#d4607a" /></div>
          }
        </div>

        {editing ? (
          <div className={styles.editBlock}>
            <input
              className={styles.nameInput}
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Your name"
            />
            <div className={styles.editRow}>
              <label className={styles.editLabel}>Calorie goal</label>
              <input
                type="number"
                className={styles.numInput}
                value={draft.calorieGoal}
                onChange={e => setDraft(d => ({ ...d, calorieGoal: Number(e.target.value) }))}
              />
            </div>
            <div className={styles.editRow}>
              <label className={styles.editLabel}>Water goal (glasses)</label>
              <input
                type="number"
                className={styles.numInput}
                value={draft.waterGoal || 8}
                onChange={e => setDraft(d => ({ ...d, waterGoal: Number(e.target.value) }))}
              />
            </div>
            <div className={styles.editActions}>
              <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={saveEdits}>Save</button>
            </div>
          </div>
        ) : (
          <div className={styles.info}>
            <h2 className={styles.name}>{name || 'Your name'}</h2>
            <p className={styles.goal}>{calorieGoal} kcal/day · {GOALS_LABEL[fitnessGoal]}</p>
            <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit profile</button>
          </div>
        )}
      </div>

      {/* Streak */}
      <div className={styles.streakCard}>
        <div className={styles.streakTop}>
          <FlowerIcon size={20} color="#d4607a" />
          <span className={styles.streakTitle}><em>{streak}</em> day glow streak</span>
        </div>
        <p className={styles.streakSub}>
          {daysToNext === 0
            ? `${milestoneEmoji(nextMilestone)} You hit the ${nextMilestone}-day milestone!`
            : `${daysToNext} days to ${nextMilestone}-day milestone ${milestoneEmoji(nextMilestone)}`}
        </p>
        <div className={styles.milestones}>
          {[3, 7, 14, 30].map(m => (
            <div key={m} className={`${styles.milestone} ${milestones.includes(m) ? styles.milestoneAchieved : ''}`}>
              <span>{milestoneEmoji(m)}</span>
              <span>{m}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary preference toggle */}
      <div className={styles.settingsCard}>
        <h3 className={styles.settingsTitle}>Diet preference</h3>
        <div className={styles.toggleRow}>
          <button
            className={`${styles.prefBtn} ${dietaryPreference === 'veg' ? styles.prefActiveVeg : ''}`}
            onClick={() => update({ dietaryPreference: 'veg' })}>
            <span className={styles.dot} style={{ background: 'var(--matcha-dark)' }} />
            Vegetarian
          </button>
          <button
            className={`${styles.prefBtn} ${dietaryPreference === 'non-veg' ? styles.prefActiveNonVeg : ''}`}
            onClick={() => update({ dietaryPreference: 'non-veg' })}>
            <span className={styles.dot} style={{ background: 'var(--rose-dark)' }} />
            Non-Vegetarian
          </button>
        </div>
        <p className={styles.prefNote}>
          {dietaryPreference === 'veg'
            ? 'vegetarian · suggestions on'
            : 'AI suggestions show all food options'}
        </p>
      </div>

      {/* Settings */}
      <div className={styles.settingsCard}>
        <h3 className={styles.settingsTitle}>Settings</h3>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Notifications</span>
          <button
            className={`${styles.toggle} ${notifications ? styles.toggleOn : ''}`}
            onClick={() => update({ notifications: !notifications })}>
            <div className={styles.toggleThumb} />
          </button>
        </div>
      </div>

      {/* Streak calendar */}
      <div className={styles.settingsCard}>
        <div className={styles.calNav}>
          <button className={styles.calArrow} onClick={prevMonth}>‹</button>
          <span className={styles.calTitle}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            className={styles.calArrow}
            onClick={nextMonth}
            disabled={viewYear === now.getFullYear() && viewMonth === now.getMonth()}
          >
            ›
          </button>
        </div>

        <div className={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <div key={i} className={styles.weekdayLabel}>{d}</div>
          ))}
        </div>

        <div className={styles.calGrid}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} className={styles.calEmpty} />
            const logged = isLogged(day)
            const today = isToday(day)
            const future = isFuture(day)
            return (
              <div
                key={i}
                className={[
                  styles.calCell,
                  logged ? styles.calLogged : '',
                  today ? styles.calToday : '',
                  future ? styles.calFuture : '',
                ].join(' ')}
              >
                <span className={styles.calDayNum}>{day}</span>
                {logged && <div className={styles.calFlowerDot}>✿</div>}
              </div>
            )
          })}
        </div>

        <p className={styles.calFooter}>
          🌸 {streak} day streak · started {streakStartLabel}
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
