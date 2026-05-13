import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import FlowerIcon from '../assets/FlowerIcon'
import styles from './Onboarding.module.css'

const SLIDE = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: 'easeInOut' }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useUser()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '',
    photo: null,
    calorieGoal: 2000,
    dietaryPreference: 'non-veg',
    fitnessGoal: 'maintain',
  })
  const fileRef = useRef()

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setData(d => ({ ...d, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  function next() {
    if (step < 2) setStep(s => s + 1)
    else finish()
  }

  function finish() {
    completeOnboarding(data)
    navigate('/home')
  }

  const canNext = [
    data.name.trim().length > 0,
    data.calorieGoal >= 1000,
    true
  ][step]

  return (
    <div className={styles.page}>
      <div className={styles.deco1} />
      <div className={styles.deco2} />

      <div className={styles.header}>
        <FlowerIcon size={32} color="#d4607a" />
        <h1 className={styles.logo}>CalSnap</h1>
        <p className={styles.tagline}>Your wellness bloom begins here</p>
      </div>

      <div className={styles.steps}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`${styles.dot} ${i === step ? styles.dotActive : i < step ? styles.dotDone : ''}`} />
        ))}
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" {...SLIDE} className={styles.slide}>
              <h2 className={styles.stepTitle}>Let's bloom together</h2>
              <p className={styles.stepSub}>What should we call you?</p>

              <div className={styles.photoWrap}>
                <button className={styles.photoBtn} onClick={() => fileRef.current.click()}>
                  {data.photo
                    ? <img src={data.photo} alt="you" className={styles.photoImg} />
                    : <span className={styles.photoPlaceholder}><FlowerIcon size={28} color="#d4607a" /></span>
                  }
                  <span className={styles.photoLabel}>Add photo</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
              </div>

              <input
                className={styles.input}
                placeholder="Your first name…"
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                autoFocus
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" {...SLIDE} className={styles.slide}>
              <h2 className={styles.stepTitle}>Set your goals</h2>
              <p className={styles.stepSub}>Daily calorie target & diet</p>

              <div className={styles.goalRow}>
                <label className={styles.goalLabel}>Daily calories</label>
                <div className={styles.goalInput}>
                  <button className={styles.stepper} onClick={() => setData(d => ({ ...d, calorieGoal: Math.max(1000, d.calorieGoal - 50) }))}>−</button>
                  <input
                    type="number"
                    className={styles.numInput}
                    value={data.calorieGoal}
                    onChange={e => setData(d => ({ ...d, calorieGoal: Number(e.target.value) }))}
                  />
                  <button className={styles.stepper} onClick={() => setData(d => ({ ...d, calorieGoal: Math.min(5000, d.calorieGoal + 50) }))}>+</button>
                </div>
              </div>

              <p className={styles.sectionLabel}>Dietary preference</p>
              <div className={styles.prefGrid}>
                {[
                  { v: 'veg',     label: 'Vegetarian',     dot: 'var(--matcha-dark)', desc: 'Plant-based meals' },
                  { v: 'non-veg', label: 'Non-Vegetarian', dot: 'var(--rose-dark)',   desc: 'All foods welcome' },
                ].map(({ v, label, dot, desc }) => (
                  <button
                    key={v}
                    className={`${styles.prefCard} ${data.dietaryPreference === v ? styles.prefActive : ''}`}
                    onClick={() => setData(d => ({ ...d, dietaryPreference: v }))}
                  >
                    <span className={styles.prefDot} style={{ background: dot }} />
                    <span className={styles.prefLabel}>{label}</span>
                    <span className={styles.prefDesc}>{desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...SLIDE} className={styles.slide}>
              <h2 className={styles.stepTitle}>Your fitness vibe</h2>
              <p className={styles.stepSub}>What are you blooming toward?</p>

              <div className={styles.goalGrid}>
                {[
                  { v: 'lose',     label: 'Lose weight',  icon: '🌿', desc: 'Trim & tone naturally' },
                  { v: 'maintain', label: 'Maintain',     icon: '🌸', desc: 'Stay balanced & glowing' },
                  { v: 'gain',     label: 'Gain muscle',  icon: '🌺', desc: 'Build strength & bloom' },
                ].map(({ v, label, icon, desc }) => (
                  <button
                    key={v}
                    className={`${styles.goalCard} ${data.fitnessGoal === v ? styles.goalActive : ''}`}
                    onClick={() => setData(d => ({ ...d, fitnessGoal: v }))}
                  >
                    <span className={styles.goalIcon}>{icon}</span>
                    <span className={styles.goalLabel}>{label}</span>
                    <span className={styles.goalDesc}>{desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.footer}>
        {step > 0 && (
          <button className={styles.back} onClick={() => setStep(s => s - 1)}>Back</button>
        )}
        <button className={styles.next} onClick={next} disabled={!canNext}>
          {step === 2 ? 'Start blooming ✿' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
