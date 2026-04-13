import { useState } from 'react'
import './App.css'
import { AnswerPanel } from './components/AnswerPanel'
import { Fretboard } from './components/Fretboard'
import { PracticePanel } from './components/PracticePanel'
import { LanguageToggle } from './components/LanguageToggle'
import { useTranslations } from './lib/i18n'
import { createQuestion } from './lib/music'
import type { AnswerResult, Language, NoteName, PracticeStats, Question } from './types'

type GameStatus = 'idle' | 'active' | 'answered'

const initialStats: PracticeStats = {
  total: 0,
  correct: 0,
}

function App() {
  const [language, setLanguage] = useState<Language>('zh')
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [stats, setStats] = useState<PracticeStats>(initialStats)
  const t = useTranslations(language)

  const startPractice = () => {
    setCurrentQuestion(createQuestion())
    setAnswerResult(null)
    setStats(initialStats)
    setGameStatus('active')
  }

  const goToNextQuestion = () => {
    setCurrentQuestion(createQuestion())
    setAnswerResult(null)
    setGameStatus('active')
  }

  const submitAnswer = (selectedNote: NoteName) => {
    if (!currentQuestion || gameStatus !== 'active') {
      return
    }

    const isCorrect = selectedNote === currentQuestion.correctNote
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
      <div className="lang-toggle-fixed">
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

        <Fretboard
          question={currentQuestion}
          answerResult={answerResult}
          t={t}
        />

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
