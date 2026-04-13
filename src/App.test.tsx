import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import * as audio from './lib/audio'
import * as music from './lib/music'

describe('App', () => {
  it('starts practice, answers once, and advances to the next question after 1 second', async () => {
    const user = userEvent.setup()
    const playFretNoteSpy = vi.spyOn(audio, 'playFretNote').mockImplementation(() => {})
    const playSoundSpy = vi.spyOn(audio, 'playSound').mockImplementation(() => {})
    vi.spyOn(music, 'createPracticeQuestions').mockReturnValue([
      music.createQuestion({ stringIndex: 0, fretIndex: 1 }),
      music.createQuestion({ stringIndex: 1, fretIndex: 2 }),
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.getByText('弦 1 · 品 1')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '进度' })).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0 / 72')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'F' }))

    expect(playFretNoteSpy).toHaveBeenCalledWith({ stringIndex: 0, fretIndex: 1 })
    expect(playSoundSpy).not.toHaveBeenCalledWith('wrong')
    expect(screen.getAllByText('回答正确').length).toBeGreaterThan(0)
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '进度' })).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getByText('1 / 72')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'F' })).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('弦 2 · 品 2')).toBeInTheDocument()
    }, { timeout: 1500 })

    expect(screen.queryByText('回答正确')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toBeEnabled()
  })

  it('plays the wrong sound for an incorrect answer', async () => {
    const user = userEvent.setup()
    const playFretNoteSpy = vi.spyOn(audio, 'playFretNote').mockImplementation(() => {})
    const playSoundSpy = vi.spyOn(audio, 'playSound').mockImplementation(() => {})
    vi.spyOn(music, 'createPracticeQuestions').mockReturnValue([
      music.createQuestion({ stringIndex: 0, fretIndex: 1 }),
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始练习' }))
    await user.click(screen.getByRole('button', { name: 'E' }))

    expect(playFretNoteSpy).not.toHaveBeenCalled()
    expect(playSoundSpy).toHaveBeenCalledWith('wrong')
    expect(screen.getByRole('button', { name: '下一题' })).toBeEnabled()
  })

  it('switches to English labels', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('heading', { name: 'Memorize note names directly on the fretboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start practice' })).toBeInTheDocument()
  })

  it('toggles sound globally', async () => {
    const user = userEvent.setup()

    render(<App />)

    const soundToggle = screen.getByRole('button', { name: '音效开关' })
    expect(soundToggle).toHaveAttribute('aria-pressed', 'true')

    await user.click(soundToggle)

    expect(soundToggle).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('音效关')).toBeInTheDocument()
  })

  it('finishes the session after the last question', async () => {
    const user = userEvent.setup()
    const playSoundSpy = vi.spyOn(audio, 'playSound').mockImplementation(() => {})
    vi.spyOn(music, 'createPracticeQuestions').mockReturnValue([
      music.createQuestion({ stringIndex: 0, fretIndex: 1 }),
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始练习' }))
    await user.click(screen.getByRole('button', { name: 'F' }))

    expect(screen.getAllByText('回答正确').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '本轮完成总结' })).toBeInTheDocument()
    }, { timeout: 1500 })

    expect(screen.queryByRole('button', { name: '下一题' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新开始' })).toBeInTheDocument()
    expect(screen.getByText('1 / 72')).toBeInTheDocument()
    expect(playSoundSpy).toHaveBeenCalledWith('celebration')
  })
})
