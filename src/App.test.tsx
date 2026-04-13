import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('starts practice, answers once, and advances to the next question', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.2)

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.getByText('弦 1 · 空弦')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'E' }))

    expect(screen.getAllByText('回答正确').length).toBeGreaterThan(0)
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一题' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'E' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '下一题' }))

    expect(screen.getByText('弦 2 · 品 2')).toBeInTheDocument()
    expect(screen.queryByText('回答正确')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toBeEnabled()
  })

  it('switches to English labels', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('heading', { name: 'Memorize note names directly on the fretboard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start practice' })).toBeInTheDocument()
  })
})
