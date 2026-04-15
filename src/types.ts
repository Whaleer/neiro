export type NoteName =
  | 'C'
  | 'bD'
  | 'D'
  | 'bE'
  | 'E'
  | 'F'
  | 'bG'
  | 'G'
  | 'bA'
  | 'A'
  | 'bB'
  | 'B'

export type TuningNote = NoteName

export type Language = 'zh' | 'en'
export type PracticeMode = 'identify-note-name' | 'find-all-note-positions'

export type FretPosition = {
  stringIndex: number
  fretIndex: number
}

export type Question = {
  id: string
  position: FretPosition
  correctNote: NoteName
}

export type AnswerResult = {
  selectedNote: NoteName
  correctNote: NoteName
  isCorrect: boolean
}

export type PracticeStats = {
  total: number
  correct: number
}

export type GameStatus = 'idle' | 'active' | 'answered' | 'stage-completed' | 'completed'

export type CircleOfFifthsNoteRound = {
  targetNote: NoteName
  targetPositions: FretPosition[]
}

export type ClickableFretState = {
  isClickable: boolean
  isFound: boolean
  isMistake: boolean
}

export type Translations = {
  languageLabel: string
  chinese: string
  english: string
  title: string
  subtitle: string
  boardTitle: string
  boardHint: string
  openString: string
  fret: string
  string: string
  answerTitle: string
  answerHintIdle: string
  answerHintActive: string
  answerHintAnswered: string
  resultTitleCorrect: string
  resultTitleIncorrect: string
  yourAnswer: string
  correctAnswer: string
  practiceTitle: string
  practiceIdleBody: string
  practiceActiveBody: string
  practiceAnsweredBody: string
  startButton: string
  nextButton: string
  statusLabel: string
  statusIdle: string
  statusActive: string
  statusAnswered: string
  scoreLabel: string
  totalLabel: string
  accuracyLabel: string
  targetLabel: string
  progressLabel: string
  restartButton: string
  statusCompleted: string
  summaryTitle: string
  summaryBody: string
  incorrectLabel: string
  soundOn: string
  soundOff: string
  soundToggleLabel: string
  modeIdentify: string
  modeFindAll: string
  modeSwitcherLabel: string
  stageMistakesLabel: string
  stageCompleteTitle: string
  stageCompleteBody: string
  continueButton: string
  viewSummaryButton: string
  findAllPromptPrefix: string
  findAllPromptSuffix: string
  totalProgressLabel: string
  stageProgressLabel: string
  subtitleIdentify: string
  subtitleFindAll: string
  circleOfFifthsLabel: string
}
