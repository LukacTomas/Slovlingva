import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import App from '../App'

// App calls loadData() on mount which fetches JSON files — stub fetch to prevent
// unhandled rejections in the test environment.
const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ '1': [], '2': [], '3': [], '4': [], sentences: [] }),
  } as unknown as Response)
)

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the app title while loading', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByText(/slovlingva/i)).toBeInTheDocument()
  })

  it('renders a heading element', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
