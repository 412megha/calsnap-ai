import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useUser } from '../context/UserContext'
import { scoreMeal } from '../utils/scoreMeal'
import { round2 } from '../utils/calculateMacros'
import { isVegKeyword } from '../utils/filterByPreference'
import ScoreBadge from '../components/ScoreBadge'
import BottomNav from '../components/BottomNav'
import styles from './Scan.module.css'

console.log('[CalSnap] Gemini key present:', !!import.meta.env.VITE_GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const MEAL_TIMES = ['breakfast', 'lunch', 'dinner', 'snack']
const MOODS = ['😊 Great', '😐 Okay', '😴 Tired', '💪 Energized', '😩 Sluggish']

export default function Scan() {
  const { dietaryPreference, addDiaryEntry } = useUser()
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [mealTime, setMealTime] = useState(guessCurrentMeal())
  const [mood, setMood] = useState('')
  const [added, setAdded] = useState(false)
  const fileRef = useRef()
  const cameraRef = useRef()

  function guessCurrentMeal() {
    const h = new Date().getHours()
    if (h < 10) return 'breakfast'
    if (h < 14) return 'lunch'
    if (h < 18) return 'snack'
    return 'dinner'
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result
        const base64 = dataUrl.split(',')[1]
        const SUPPORTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        const rawType = dataUrl.split(';')[0].split(':')[1]
        const mediaType = SUPPORTED.includes(rawType) ? rawType : 'image/jpeg'
        resolve({ base64, mediaType, dataUrl })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setResult(null)
    setError(null)
    setAdded(false)
    const { dataUrl } = await readFileAsBase64(file)
    setImage(dataUrl)
    analyzeImage(file)
  }

  async function analyzeImage(file) {
    setLoading(true)
    setError(null)
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        setResult(getMockResult())
        return
      }

      const { base64, mediaType } = await readFileAsBase64(file)

      console.log('[CalSnap] base64 length:', base64?.length, '— should be 50 000+')
      console.log('[CalSnap] mediaType:', mediaType)
      if (!base64 || base64.length < 5000) {
        throw new Error('Image did not load correctly. Please try again.')
      }

      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const prompt = `You are a precise food recognition and nutrition AI. Look carefully at this specific image and identify every food item CLEARLY VISIBLE.

RULES:
- ONLY describe what you can actually see. Never invent or assume items.
- Be specific: "Green grapes" not "grapes", "Kiwi slices" not "fruit".
- If you cannot clearly identify an item, name it "Unidentified item" with low confidence.
- Return ONLY valid JSON — no markdown, no code fences, no commentary.

Return this exact JSON structure:
{
  "name": "overall dish or meal name",
  "confidence": number (0-100),
  "isVeg": boolean,
  "alternative": "healthier ${dietaryPreference === 'veg' ? 'vegetarian ' : ''}alternative suggestion",
  "items": [
    {
      "name": "exact specific name of what you see",
      "quantity": "estimated quantity visible (e.g. 1 slice, ~10 pcs, 1 cup)",
      "kcal": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "isVeg": boolean
    }
  ],
  "kcal": total kcal (sum of all items),
  "protein": total protein grams,
  "carbs": total carbs grams,
  "fat": total fat grams
}`

      const geminiResult = await geminiModel.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mediaType, data: base64 } },
          ],
        }],
      })

      const raw = geminiResult.response.text().trim()
      // Strip markdown code fences in case Claude adds them despite instructions
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
      const json = JSON.parse(cleaned)
      const score = scoreMeal(json)
      setResult({ ...json, score })
    } catch (e) {
      console.error('[CalSnap] Full error:', e)
      console.error('[CalSnap] Error message:', e.message)
      console.error('[CalSnap] Error status:', e.status)
      setError(e.message || 'Could not analyze the image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getMockResult() {
    return {
      name: 'Mixed Grain Bowl',
      confidence: 87,
      isVeg: true,
      score: 8,
      alternative: dietaryPreference === 'veg'
        ? 'Try adding edamame for more complete protein'
        : 'Add grilled chicken for extra protein',
      items: [
        { name: 'Brown rice', quantity: '½ cup', kcal: 110, protein: 2, carbs: 23, fat: 1, isVeg: true },
        { name: 'Roasted chickpeas', quantity: '¼ cup', kcal: 120, protein: 6, carbs: 18, fat: 3, isVeg: true },
        { name: 'Avocado', quantity: '2 slices', kcal: 80, protein: 1, carbs: 4, fat: 7, isVeg: true },
        { name: 'Mixed greens', quantity: '1 cup', kcal: 15, protein: 1, carbs: 3, fat: 0, isVeg: true },
        { name: 'Tahini dressing', quantity: '1 tbsp', kcal: 95, protein: 3, carbs: 4, fat: 8, isVeg: true },
      ],
      kcal: 420,
      protein: 13,
      carbs: 52,
      fat: 19,
    }
  }

  function addToDiary() {
    if (!result) return
    addDiaryEntry({
      name: result.name,
      kcal: result.kcal,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      score: result.score,
      isVeg: result.isVeg ?? isVegKeyword(result.name),
      mealTime,
      mood: mood.split(' ')[1] || '',
      items: result.items || [],
    })
    setAdded(true)
  }

  const itemCount = result?.items?.length || 0

  return (
    <div className={`page ${styles.scan}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Snap a meal</h1>
        <p className={styles.sub}>Point at food to get instant nutrition</p>
      </div>

      {/* Viewfinder */}
      <div className={styles.viewfinder} onClick={() => !image && fileRef.current.click()}>
        {image ? (
          <img src={image} alt="food" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.corner} />
            <CameraIcon />
            <p className={styles.placeholderText}>Tap to take / upload a photo</p>
          </div>
        )}
        {loading && (
          <motion.div className={styles.loader}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}>
            <div className={styles.pulse} />
            <span>Analyzing with AI...</span>
          </motion.div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.uploadBtn} onClick={() => fileRef.current.click()}>
          Upload photo
        </button>
        <button className={styles.cameraBtn} onClick={() => cameraRef.current.click()}>
          Camera
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />

      {error && <p className={styles.error}>{error}</p>}

      {/* Result card */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div className={styles.result}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>

            {/* Meal header */}
            <div className={styles.resultHeader}>
              <span className={styles.vegDot} style={{ background: result.isVeg ? 'var(--matcha-dark)' : 'var(--rose-dark)' }} />
              <h2 className={styles.foodName}>{result.name}</h2>
              <ScoreBadge score={result.score} />
            </div>

            {/* Total macro chips */}
            <div className={styles.macroRow}>
              <div className={styles.macroChip} style={{ background: 'var(--surface-rose)', color: 'var(--rose-text)' }}>
                <span className={styles.macroVal}>{round2(result.kcal)}</span>
                <span className={styles.macroLbl}>kcal</span>
              </div>
              <div className={styles.macroChip} style={{ background: 'var(--surface-rose)', color: 'var(--rose-text)' }}>
                <span className={styles.macroVal}>{round2(result.protein)}g</span>
                <span className={styles.macroLbl}>protein</span>
              </div>
              <div className={styles.macroChip} style={{ background: 'var(--surface-lavender)', color: 'var(--lavender-text)' }}>
                <span className={styles.macroVal}>{round2(result.carbs)}g</span>
                <span className={styles.macroLbl}>carbs</span>
              </div>
              <div className={styles.macroChip} style={{ background: 'var(--surface-peach)', color: 'var(--peach-text)' }}>
                <span className={styles.macroVal}>{round2(result.fat)}g</span>
                <span className={styles.macroLbl}>fat</span>
              </div>
            </div>

            <div className={styles.confidence}>
              Confidence: <strong>{result.confidence}%</strong>
            </div>

            {result.alternative && (
              <div className={styles.altCard}>
                <span className={styles.altLabel}>Healthier alternative</span>
                <p className={styles.altText}>{result.alternative}</p>
              </div>
            )}

            {/* Item breakdown */}
            {result.items && result.items.length > 0 && (
              <div className={styles.breakdown}>
                <p className={styles.breakdownTitle}>What's on your plate 🌸</p>
                {result.items.map((item, i) => (
                  <div key={i} className={styles.itemRow}>
                    <div className={styles.itemLeft}>
                      <span
                        className={styles.itemDot}
                        style={{ background: item.isVeg ? 'var(--matcha-dark)' : 'var(--rose-dark)' }}
                      />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemNameLine}>
                          {item.name}
                          {item.quantity && (
                            <span className={styles.itemQty}> · {item.quantity}</span>
                          )}
                        </div>
                        <div className={styles.itemMacros}>
                          <span className={styles.itemPill} style={{ background: 'var(--surface-rose)', color: 'var(--rose-text)' }}>
                            P {round2(item.protein)}g
                          </span>
                          <span className={styles.itemPill} style={{ background: 'var(--surface-lavender)', color: 'var(--lavender-text)' }}>
                            C {round2(item.carbs)}g
                          </span>
                          <span className={styles.itemPill} style={{ background: 'var(--surface-peach)', color: 'var(--peach-text)' }}>
                            F {round2(item.fat)}g
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={styles.itemKcal}>{round2(item.kcal)} kcal</span>
                  </div>
                ))}

                {/* Total row */}
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <div className={styles.totalMacros}>
                    <span>P {round2(result.protein)}g</span>
                    <span>C {round2(result.carbs)}g</span>
                    <span>F {round2(result.fat)}g</span>
                  </div>
                  <span className={styles.totalKcal}>{round2(result.kcal)} kcal</span>
                </div>
              </div>
            )}

            {/* Meal time selector */}
            <div className={styles.timeRow}>
              {MEAL_TIMES.map(t => (
                <button
                  key={t}
                  className={`${styles.timeChip} ${mealTime === t ? styles.timeActive : ''}`}
                  onClick={() => setMealTime(t)}>
                  {t}
                </button>
              ))}
            </div>

            {/* Mood tag */}
            <div className={styles.moodRow}>
              <span className={styles.moodLabel}>How do you feel?</span>
              <div className={styles.moodChips}>
                {MOODS.map(m => (
                  <button
                    key={m}
                    className={`${styles.moodChip} ${mood === m ? styles.moodActive : ''}`}
                    onClick={() => setMood(m === mood ? '' : m)}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {added ? (
              <div className={styles.addedMsg}>
                {itemCount > 0 ? `${itemCount} items added to diary ✓` : 'Added to diary ✓'}
              </div>
            ) : (
              <button className={styles.addBtn} onClick={addToDiary}>
                Add {itemCount > 0 ? `${itemCount} items` : 'meal'} to Diary
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.4">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#d4607a" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="#d4607a" strokeWidth="1.5" />
    </svg>
  )
}
