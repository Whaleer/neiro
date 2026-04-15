import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AnswerPanel } from './components/AnswerPanel'
import { CircleOfFifths } from './components/CircleOfFifths'
import { Fretboard } from './components/Fretboard'
import { PracticePanel } from './components/PracticePanel'
import { LanguageToggle } from './components/LanguageToggle'
import { SoundToggle } from './components/SoundToggle'
import { ModeToggle } from './components/ModeToggle'
import { playFretNote, playSound, setSoundEnabled } from './lib/audio'
import { useTranslations } from './lib/i18n'
import {
  TOTAL_PRACTICE_POSITIONS,
  createCircleOfFifthsRounds,
  createPracticeQuestions,
  getAccuracy,
  getNoteAtPosition,
  getPositionKey,
} from './lib/music'
import type {
  AnswerResult,
  CircleOfFifthsNoteRound,
  ClickableFretState,
  FretPosition,
  GameStatus,
  Language,
  NoteName,
  PracticeMode,
  PracticeStats,
  Question,
} from './types'

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

function formatFindAllPrompt(language: Language, prefix: string, note: NoteName, suffix: string) {
  if (language === 'zh') {
    return `${prefix} ${note}`
  }

  return `${prefix} ${note} ${suffix}`.trim()
}

function App() {
  const [language, setLanguage] = useState<Language>('zh')
  const [mode, setMode] = useState<PracticeMode>('identify-note-name')
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getInitialSoundEnabled)
  const [gameStatus, setGameStatus] = useState<GameStatus>(DEBUG_COMPLETE ? 'completed' : 'idle')

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [questionQueue, setQuestionQueue] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const [findAllRounds, setFindAllRounds] = useState<CircleOfFifthsNoteRound[]>([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [foundPositionKeys, setFoundPositionKeys] = useState<string[]>([])
  const [mistakePositionKeys, setMistakePositionKeys] = useState<string[]>([])
  const [stageMistakes, setStageMistakes] = useState(0)

  const [stats, setStats] = useState<PracticeStats>(DEBUG_COMPLETE ? debugCompletedStats : initialStats)

  const previousGameStatusRef = useRef<GameStatus>(gameStatus)
  const nextQuestionTimeoutRef = useRef<number | null>(null)
  const mistakeTimeoutsRef = useRef<number[]>([])

  const t = useTranslations(language)
  const accuracy = getAccuracy(stats)
  const incorrectCount = stats.total - stats.correct

  const currentRound = findAllRounds[currentRoundIndex] ?? null
  const stageTargetCount = currentRound?.targetPositions.length ?? 0
  const isFindAllMode = mode === 'find-all-note-positions'
  const isIdentifyMode = mode === 'identify-note-name'

  const progressValue = Math.min(
    isFindAllMode ? stats.correct : stats.total,
    TOTAL_PRACTICE_POSITIONS,
  )
  const progressPercent = Math.round((progressValue / TOTAL_PRACTICE_POSITIONS) * 100)

  const findAllPrompt = currentRound
    ? formatFindAllPrompt(language, t.findAllPromptPrefix, currentRound.targetNote, t.findAllPromptSuffix)
    : null

  const practiceTargetLabel = isFindAllMode
    ? currentRound?.targetNote ?? null
    : currentQuestion
      ? `${t.string} ${currentQuestion.position.stringIndex + 1} · ${t.fret} ${currentQuestion.position.fretIndex}`
      : null

  const stageContinueLabel = currentRoundIndex < findAllRounds.length - 1
    ? `${t.continueButton} ${findAllRounds[currentRoundIndex + 1]?.targetNote ?? ''}`.trim()
    : t.viewSummaryButton

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
    if (!isIdentifyMode || gameStatus !== 'answered' || !answerResult?.isCorrect) {
      return
    }

    nextQuestionTimeoutRef.current = window.setTimeout(() => {
      goToNextIdentifyQuestion()
    }, 1000)

    return () => {
      if (nextQuestionTimeoutRef.current !== null) {
        window.clearTimeout(nextQuestionTimeoutRef.current)
        nextQuestionTimeoutRef.current = null
      }
    }
  }, [answerResult, gameStatus, isIdentifyMode])

  useEffect(() => () => {
    mistakeTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }, [])

  const resetFindAllState = () => {
    setFindAllRounds([])
    setCurrentRoundIndex(0)
    setFoundPositionKeys([])
    setMistakePositionKeys([])
    setStageMistakes(0)
  }

  const resetIdentifyState = () => {
    setCurrentQuestion(null)
    setAnswerResult(null)
    setQuestionQueue([])
    setCurrentQuestionIndex(0)
  }

  const handleModeChange = (nextMode: PracticeMode) => {
    if (nextMode === mode) {
      return
    }

    if (nextQuestionTimeoutRef.current !== null) {
      window.clearTimeout(nextQuestionTimeoutRef.current)
      nextQuestionTimeoutRef.current = null
    }

    mistakeTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    mistakeTimeoutsRef.current = []

    setMode(nextMode)
    setStats(initialStats)
    setGameStatus('idle')
    resetIdentifyState()
    resetFindAllState()
  }

  const toggleSound = () => {
    setSoundEnabledState((currentValue) => !currentValue)
  }

  const startIdentifyPractice = () => {
    const nextQuestionQueue = createPracticeQuestions()
    setQuestionQueue(nextQuestionQueue)
    setCurrentQuestionIndex(0)
    setCurrentQuestion(nextQuestionQueue[0] ?? null)
    setAnswerResult(null)
    setStats(initialStats)
    setGameStatus('active')
  }

  const startFindAllPractice = () => {
    const rounds = createCircleOfFifthsRounds()
    setFindAllRounds(rounds)
    setCurrentRoundIndex(0)
    setFoundPositionKeys([])
    setMistakePositionKeys([])
    setStageMistakes(0)
    setStats(initialStats)
    setGameStatus('active')
  }

  const startPractice = () => {
    if (isIdentifyMode) {
      startIdentifyPractice()
      return
    }

    startFindAllPractice()
  }

  const goToNextIdentifyQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1
    const nextQuestion = questionQueue[nextQuestionIndex] ?? null
    setCurrentQuestionIndex(nextQuestionIndex)
    setCurrentQuestion(nextQuestion)
    setAnswerResult(null)
    setGameStatus(nextQuestion ? 'active' : 'completed')
  }

  const goToNextFindAllRound = () => {
    if (currentRoundIndex >= findAllRounds.length - 1) {
      setGameStatus('completed')
      return
    }

    setCurrentRoundIndex((currentValue) => currentValue + 1)
    setFoundPositionKeys([])
    setMistakePositionKeys([])
    setStageMistakes(0)
    setGameStatus('active')
  }

  const jumpToNote = (note: NoteName) => {
    const targetIndex = findAllRounds.findIndex((round) => round.targetNote === note)
    if (targetIndex === -1 || targetIndex === currentRoundIndex) {
      return
    }

    setCurrentRoundIndex(targetIndex)
    setFoundPositionKeys([])
    setMistakePositionKeys([])
    setStageMistakes(0)
    setGameStatus('active')
  }

  const goToNextQuestion = () => {
    if (isIdentifyMode) {
      goToNextIdentifyQuestion()
      return
    }

    if (gameStatus === 'stage-completed') {
      goToNextFindAllRound()
    }
  }

  const submitAnswer = (selectedNote: NoteName) => {
    if (!currentQuestion || gameStatus !== 'active' || !isIdentifyMode) {
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

  const registerMistake = (position: FretPosition) => {
    const key = getPositionKey(position)

    setMistakePositionKeys((currentKeys) => {
      if (currentKeys.includes(key)) {
        return currentKeys
      }
      return [...currentKeys, key]
    })

    const timeoutId = window.setTimeout(() => {
      setMistakePositionKeys((currentKeys) => currentKeys.filter((value) => value !== key))
      mistakeTimeoutsRef.current = mistakeTimeoutsRef.current.filter((value) => value !== timeoutId)
    }, 600)

    mistakeTimeoutsRef.current.push(timeoutId)
  }

  const handleFindAllCellClick = (position: FretPosition) => {
    if (!isFindAllMode || gameStatus !== 'active' || !currentRound) {
      return
    }

    const key = getPositionKey(position)
    if (foundPositionKeys.includes(key)) {
      return
    }

    const clickedNote = getNoteAtPosition(position)
    const isCorrect = clickedNote === currentRound.targetNote

    setStats((currentStats) => ({
      total: currentStats.total + 1,
      correct: currentStats.correct + (isCorrect ? 1 : 0),
    }))

    if (!isCorrect) {
      playSound('wrong')
      setStageMistakes((currentValue) => currentValue + 1)
      registerMistake(position)
      return
    }

    playFretNote(position)
    setFoundPositionKeys((currentKeys) => {
      const nextKeys = [...currentKeys, key]
      if (nextKeys.length >= currentRound.targetPositions.length) {
        setGameStatus('stage-completed')
      }
      return nextKeys
    })
  }

  const getClickableState = (position: FretPosition): ClickableFretState => {
    if (!isFindAllMode || !currentRound || position.fretIndex < 1) {
      return {
        isClickable: false,
        isFound: false,
        isMistake: false,
      }
    }

    const key = getPositionKey(position)
    const targetKeys = new Set(currentRound.targetPositions.map(getPositionKey))

    return {
      isClickable: gameStatus === 'active' && !foundPositionKeys.includes(key),
      isFound: targetKeys.has(key) && foundPositionKeys.includes(key),
      isMistake: mistakePositionKeys.includes(key),
    }
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
        <p className="subtitle">{isIdentifyMode ? t.subtitleIdentify : t.subtitleFindAll}</p>
      </header>

      <div className="app-body">
        <ModeToggle mode={mode} onChange={handleModeChange} t={t} />

        <PracticePanel
          gameStatus={gameStatus}
          mode={mode}
          stats={stats}
          question={currentQuestion}
          targetLabel={practiceTargetLabel}
          onStart={startPractice}
          onNext={goToNextQuestion}
          t={t}
        />

          <section className="board-stack">
            {gameStatus !== 'idle' && (
            <div className="progress-panel" aria-label={t.progressLabel}>
              <div className="progress-panel-head">
                <div>
                  <p className="progress-kicker">{t.progressLabel}</p>
                  <p className="progress-copy">{progressValue} / {TOTAL_PRACTICE_POSITIONS}</p>
                </div>
                <div className="progress-percent">{progressPercent}%</div>
              </div>
              {isFindAllMode && gameStatus === 'stage-completed' && currentRound ? (
                <div className="stage-complete-banner" key={currentRound.targetNote}>
                  <div className="stage-complete-note-pill">{currentRound.targetNote}</div>
                  <div className="stage-complete-metrics">
                    <div className="stage-metric-pill">
                      <span className="stage-metric-value">{foundPositionKeys.length}/{stageTargetCount}</span>
                      <span className="stage-metric-label">{t.stageProgressLabel}</span>
                    </div>
                    <div className="stage-metric-pill">
                      <span className="stage-metric-value">{stageMistakes}</span>
                      <span className="stage-metric-label">{t.stageMistakesLabel}</span>
                    </div>
                  </div>
                  <button className="stage-continue-btn" type="button" onClick={goToNextQuestion}>
                    {stageContinueLabel}
                  </button>
                </div>
              ) : (
              <div
                className="progress-track"
                role="progressbar"
                aria-label={t.progressLabel}
                aria-valuemin={0}
                aria-valuemax={TOTAL_PRACTICE_POSITIONS}
                aria-valuenow={progressValue}
              >
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              )}
            </div>
            )}

          <Fretboard
            mode={mode}
            question={currentQuestion}
            answerResult={answerResult}
            welcomeMode={gameStatus === 'idle'}
            onCellClick={handleFindAllCellClick}
            getClickableState={getClickableState}
            t={t}
          />
        </section>

        {isFindAllMode && currentRound && (
          <section className="find-all-prompt">
            <p>{findAllPrompt}</p>
          </section>
        )}

        {isFindAllMode && currentRound && (
          <CircleOfFifths
            rounds={findAllRounds}
            currentRoundIndex={currentRoundIndex}
            gameStatus={gameStatus}
            onSegmentClick={jumpToNote}
            t={t}
          />
        )}

        {isIdentifyMode && answerResult && (
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

        {isIdentifyMode && gameStatus !== 'idle' && (
          <AnswerPanel
            disabled={gameStatus !== 'active'}
            onSelect={submitAnswer}
            answerResult={answerResult}
            t={t}
          />
        )}
      </div>
    </main>
  )
}

export default App
