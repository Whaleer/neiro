import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AnswerPanel } from './components/AnswerPanel'
import { Fretboard } from './components/Fretboard'
import { PracticePanel } from './components/PracticePanel'
import { LanguageToggle } from './components/LanguageToggle'
import { SoundToggle } from './components/SoundToggle'
import { playFretNote, playSound, setSoundEnabled } from './lib/audio'
import { useTranslations } from './lib/i18n'
import { TOTAL_PRACTICE_POSITIONS, createPracticeQuestions, getAccuracy } from './lib/music'
import type { AnswerResult, GameStatus, Language, NoteName, PracticeStats, Question } from './types'

const DEBUG_COMPLETE = import.meta.env.DEV && import.meta.env.VITE_DEBUG_COMPLETE === 'true'
const SOUND_ENABLED_STORAGE_KEY = 'guitarboard:sound-enabled'

const initialStats: PracticeStats = {
  total: 0,
  correct: 0,
}

const debugCompletedStats: PracticeStats = {
  total: TOTAL_PRACTICE_POSITIONS,
  correct: 60,
}

function getInitialSoundEnabled() {
  if (typeof window === 'undefined') {
    return true
  }

  const storage = window.localStorage
  if (!storage || typeof storage.getItem !== 'function') {
    return true
  }

  const storedValue = storage.getItem(SOUND_ENABLED_STORAGE_KEY)
  return storedValue !== 'false'
}

function App() {
  const [language, setLanguage] = useState<Language>('zh')
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getInitialSoundEnabled)
  const [gameStatus, setGameStatus] = useState<GameStatus>(DEBUG_COMPLETE ? 'completed' : 'idle')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [stats, setStats] = useState<PracticeStats>(DEBUG_COMPLETE ? debugCompletedStats : initialStats)
  const [questionQueue, setQuestionQueue] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const previousGameStatusRef = useRef<GameStatus>(gameStatus)
  const nextQuestionTimeoutRef = useRef<number | null>(null)
  const t = useTranslations(language)
  const incorrectCount = stats.total - stats.correct
  const progressValue = Math.min(stats.total, TOTAL_PRACTICE_POSITIONS)
  const progressPercent = Math.round((progressValue / TOTAL_PRACTICE_POSITIONS) * 100)
  const accuracy = getAccuracy(stats)

  useEffect(() => {
    const previousGameStatus = previousGameStatusRef.current
    if (gameStatus === 'completed' && previousGameStatus !== 'completed') {
      playSound('celebration')
    }
    previousGameStatusRef.current = gameStatus
  }, [gameStatus])

  useEffect(() => {
    setSoundEnabled(soundEnabled)
    if (typeof window !== 'undefined') {
      const storage = window.localStorage
      if (storage && typeof storage.setItem === 'function') {
        storage.setItem(SOUND_ENABLED_STORAGE_KEY, String(soundEnabled))
      }
    }
  }, [soundEnabled])

  useEffect(() => {
    if (gameStatus !== 'answered' || !answerResult?.isCorrect) {
      return
    }

    nextQuestionTimeoutRef.current = window.setTimeout(() => {
      goToNextQuestion()
    }, 1000)

    return () => {
      if (nextQuestionTimeoutRef.current !== null) {
        window.clearTimeout(nextQuestionTimeoutRef.current)
        nextQuestionTimeoutRef.current = null
      }
    }
  }, [answerResult, gameStatus])

  const toggleSound = () => {
    setSoundEnabledState((currentValue) => !currentValue)
  }

  const startPractice = () => {
    const nextQuestionQueue = createPracticeQuestions()
    setQuestionQueue(nextQuestionQueue)
    setCurrentQuestionIndex(0)
    setCurrentQuestion(nextQuestionQueue[0] ?? null)
    setAnswerResult(null)
    setStats(initialStats)
    setGameStatus('active')
  }

  const goToNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1
    const nextQuestion = questionQueue[nextQuestionIndex] ?? null
    setCurrentQuestionIndex(nextQuestionIndex)
    setCurrentQuestion(nextQuestion)
    setAnswerResult(null)
    setGameStatus(nextQuestion ? 'active' : 'completed')
  }

  const submitAnswer = (selectedNote: NoteName) => {
    if (!currentQuestion || gameStatus !== 'active') {
      return
    }

    const isCorrect = selectedNote === currentQuestion.correctNote
    if (isCorrect) {
      playFretNote(currentQuestion.position)
    } else {
      playSound('wrong')
    }
    setAnswerResult({
      selectedNote,
      correctNote: currentQuestion.correctNote,
      isCorrect,
    })
    setStats((currentStats) => ({
      total: currentStats.total + 1,
      correct: currentStats.correct + (isCorrect ? 1 : 0),
    }))
    setGameStatus('answered')
  }

  return (
    <main className="app-shell">
      <div className="top-controls-fixed">
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} t={t} />
        <LanguageToggle language={language} onChange={setLanguage} />
      </div>

      <header className="app-header">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <div className="app-body">
        <PracticePanel
          gameStatus={gameStatus}
          stats={stats}
          question={currentQuestion}
          onStart={startPractice}
          onNext={goToNextQuestion}
          t={t}
        />

        <section className="board-stack">
          <div className="progress-panel" aria-label={t.progressLabel}>
            <div className="progress-panel-head">
              <div>
                <p className="progress-kicker">{t.progressLabel}</p>
                <p className="progress-copy">{progressValue} / {TOTAL_PRACTICE_POSITIONS}</p>
              </div>
              <div className="progress-percent">{progressPercent}%</div>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={t.progressLabel}
              aria-valuemin={0}
              aria-valuemax={TOTAL_PRACTICE_POSITIONS}
              aria-valuenow={progressValue}
            >
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Fretboard
            question={currentQuestion}
            answerResult={answerResult}
            t={t}
          />
        </section>

        {answerResult && (
          <div
            className={`feedback-banner ${answerResult.isCorrect ? 'correct' : 'incorrect'}`}
            key={currentQuestion?.id}
          >
            <div className="feedback-icon">
              {answerResult.isCorrect ? '✓' : '✗'}
            </div>
            <div className="feedback-text">
              <strong>
                {answerResult.isCorrect ? t.resultTitleCorrect : t.resultTitleIncorrect}
              </strong>
              <span>
                {t.yourAnswer} {answerResult.selectedNote} · {t.correctAnswer} {answerResult.correctNote}
              </span>
            </div>
          </div>
        )}

        {gameStatus === 'completed' && (
          <section className="summary-card">
            <div className="summary-copy">
              <p className="summary-kicker">{t.statusCompleted}</p>
              <h2>{t.summaryTitle}</h2>
              <p>{t.summaryBody}</p>
            </div>
            <div className="summary-grid">
              <div className="summary-metric">
                <span className="summary-value">{stats.correct}</span>
                <span className="summary-label">{t.scoreLabel}</span>
              </div>
              <div className="summary-metric">
                <span className="summary-value">{incorrectCount}</span>
                <span className="summary-label">{t.incorrectLabel}</span>
              </div>
              <div className="summary-metric">
                <span className="summary-value">{accuracy}%</span>
                <span className="summary-label">{t.accuracyLabel}</span>
              </div>
            </div>
          </section>
        )}

        <AnswerPanel
          disabled={gameStatus !== 'active'}
          onSelect={submitAnswer}
          answerResult={answerResult}
          t={t}
        />
      </div>
    </main>
  )
}

export default App
