import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import * as audio from './lib/audio'
import * as music from './lib/music'

describe('App', () => {
  it('keeps mode one flow and auto-advances after a correct answer', async () => {
    const user = userEvent.setup()
    const playFretNoteSpy = vi.spyOn(audio, 'playFretNote').mockImplementation(() => {})
    vi.spyOn(audio, 'playSound').mockImplementation(() => {})
    vi.spyOn(music, 'createPracticeQuestions').mockReturnValue([
      music.createQuestion({ stringIndex: 0, fretIndex: 1 }),
      music.createQuestion({ stringIndex: 1, fretIndex: 2 }),
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始练习' }))
    await user.click(screen.getByRole('button', { name: 'F' }))

    expect(playFretNoteSpy).toHaveBeenCalledWith({ stringIndex: 0, fretIndex: 1 })
    expect(screen.getAllByText('回答正确').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByText('弦 2 · 品 2')).toBeInTheDocument()
    }, { timeout: 1500 })

    expect(screen.queryByText('回答正确')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toBeEnabled()
  })

  it('switches to mode two and hides the answer panel', async () => {
    const user = userEvent.setup()
    vi.spyOn(music, 'createCircleOfFifthsRounds').mockReturnValue([
      {
        targetNote: 'C',
        targetPositions: [
          { stringIndex: 0, fretIndex: 8 },
          { stringIndex: 1, fretIndex: 1 },
        ],
      },
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '模式二' }))
    await user.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.queryByText('选择音名')).not.toBeInTheDocument()
    expect(screen.getByText('请找出 1 到 6 弦中所有的 C')).toBeInTheDocument()
  })

  it('handles correct and incorrect clicks in mode two and requires manual continue', async () => {
    const user = userEvent.setup()
    const playFretNoteSpy = vi.spyOn(audio, 'playFretNote').mockImplementation(() => {})
    const playSoundSpy = vi.spyOn(audio, 'playSound').mockImplementation(() => {})
    vi.spyOn(music, 'createCircleOfFifthsRounds').mockReturnValue([
      {
        targetNote: 'C',
        targetPositions: [
          { stringIndex: 0, fretIndex: 8 },
          { stringIndex: 1, fretIndex: 1 },
        ],
      },
      {
        targetNote: 'F',
        targetPositions: [
          { stringIndex: 0, fretIndex: 1 },
        ],
      },
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '模式二' }))
    await user.click(screen.getByRole('button', { name: '开始练习' }))

    await user.click(screen.getByRole('button', { name: '弦 1, 品 1' }))
    expect(playSoundSpy).toHaveBeenCalledWith('wrong')
    expect(screen.getByText('0 / 72')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '弦 1, 品 8' }))
    await user.click(screen.getByRole('button', { name: '弦 2, 品 1' }))

    expect(playFretNoteSpy).toHaveBeenCalledWith({ stringIndex: 0, fretIndex: 8 })
    expect(playFretNoteSpy).toHaveBeenCalledWith({ stringIndex: 1, fretIndex: 1 })
    expect(screen.getByText('阶段进度')).toBeInTheDocument()
    expect(screen.getByText('本阶段错误')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '继续到 F' }))

    expect(screen.getByText('请找出 1 到 6 弦中所有的 F')).toBeInTheDocument()
  })

  it('completes mode two and shows the final summary', async () => {
    const user = userEvent.setup()
    const playSoundSpy = vi.spyOn(audio, 'playSound').mockImplementation(() => {})
    vi.spyOn(music, 'createCircleOfFifthsRounds').mockReturnValue([
      {
        targetNote: 'C',
        targetPositions: [
          { stringIndex: 0, fretIndex: 8 },
        ],
      },
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '模式二' }))
    await user.click(screen.getByRole('button', { name: '开始练习' }))
    await user.click(screen.getByRole('button', { name: '弦 1, 品 8' }))

    expect(screen.getByText('阶段进度')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '查看总结' }))

    expect(screen.getByRole('heading', { name: '本轮完成总结' })).toBeInTheDocument()
    expect(playSoundSpy).toHaveBeenCalledWith('celebration')
  })

  it('renders circle of fifths and highlights current note', async () => {
    const user = userEvent.setup()
    vi.spyOn(music, 'createCircleOfFifthsRounds').mockReturnValue([
      {
        targetNote: 'C',
        targetPositions: [
          { stringIndex: 0, fretIndex: 8 },
        ],
      },
      {
        targetNote: 'F',
        targetPositions: [
          { stringIndex: 0, fretIndex: 1 },
        ],
      },
    ])

    render(<App />)

    expect(screen.queryByRole('group', { name: '五度圈' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '模式二' }))
    await user.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.getByRole('group', { name: '五度圈' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'C' })).toHaveClass('cof-current')
  })

  it('jumps to a note via circle of fifths click', async () => {
    const user = userEvent.setup()
    vi.spyOn(music, 'createCircleOfFifthsRounds').mockReturnValue([
      {
        targetNote: 'C',
        targetPositions: [
          { stringIndex: 0, fretIndex: 8 },
        ],
      },
      {
        targetNote: 'F',
        targetPositions: [
          { stringIndex: 0, fretIndex: 1 },
        ],
      },
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '模式二' }))
    await user.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.getByText('请找出 1 到 6 弦中所有的 C')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'F' }))

    expect(screen.getByText('请找出 1 到 6 弦中所有的 F')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'F' })).toHaveClass('cof-current')
  })

  it('switches to English labels', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('heading', { name: 'Memorize note names directly on the fretboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start practice' })).toBeInTheDocument()
  })
})
