import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AppContext from '../../providers/AppContext'
import YogiGoals from './YogiGoals'
import { toDateKey } from '../../common/sessionStats'

// In-memory stand-in for sessions/{username} in the Realtime Database
const mockStore = {}

jest.mock('../../services/sessions', () => ({
  getUserSessions: ({ owner }) => Promise.resolve(Object.values(mockStore[owner] || {})),
  createSession: ({ owner, ...session }) => {
    const created = { id: `id-${Date.now()}-${Math.random()}`, ...session, minutes: Number(session.minutes) }
    mockStore[owner] = { ...(mockStore[owner] || {}), [created.id]: created }
    return Promise.resolve(created)
  },
}))

// In-memory stand-in for goals/{username}/{id}
const mockGoals = {}

jest.mock('../../services/goals/goals', () => ({
  getUserGoals: ({ owner }) => Promise.resolve(Object.values(mockGoals[owner] || {})),
  getAllGoals: () => Promise.resolve({ val: () => mockGoals }),
  createGoal: (goal) => {
    mockGoals[goal.owner] = { ...(mockGoals[goal.owner] || {}), [goal.id]: goal }
    return Promise.resolve()
  },
  updateGoal: ({ id, owner, updates }) => {
    mockGoals[owner][id] = { ...updates, id, owner }
    return Promise.resolve()
  },
  removeGoal: ({ id, owner }) => {
    delete mockGoals[owner][id]
    return Promise.resolve()
  },
}))

const goal = (owner, id, name) => ({
  id, name, owner, goal: 10, progress: 4, unit: 'hours', from: '2026-11-01', to: '2026-11-30',
})

beforeEach(() => {
  Object.keys(mockGoals).forEach(key => delete mockGoals[key])
})

const renderPage = () => render(
  <AppContext.Provider value={{ userData: { username: 'niki' } }}>
    <YogiGoals />
  </AppContext.Provider>
)

const statValue = (caption) => screen.getByText(caption).previousSibling.textContent

it('logging a session updates streak and weekly minutes, and survives a reload', async () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  mockStore.niki = { a: { id: 'a', date: toDateKey(yesterday), style: 'yin', minutes: 20, note: '' } }

  const { unmount } = renderPage()
  await waitFor(() => expect(statValue('day streak')).toBe('1'))

  fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '35' } })
  fireEvent.click(screen.getByRole('button', { name: /log session/i }))

  await waitFor(() => expect(statValue('day streak')).toBe('2'))
  expect(Object.values(mockStore.niki)).toHaveLength(2)

  // "Reload": mount fresh and read back from the store
  unmount()
  renderPage()
  await waitFor(() => expect(statValue('day streak')).toBe('2'))
  const weekly = Number(statValue('minutes this week'))
  // yesterday may fall in last week when today is Monday
  expect([35, 55]).toContain(weekly)
  // the vinyasa bar in the chart is labelled with its minutes
  expect(screen.getAllByText('35').length).toBeGreaterThan(0)
})

it('removing the last goal clears it from the page', async () => {
  mockGoals.niki = { g1: goal('niki', 'g1', 'Daily stretch') }

  renderPage()
  await screen.findByText('Daily stretch')

  fireEvent.click(screen.getByRole('button', { name: /remove/i }))

  await waitFor(() => expect(screen.queryByText('Daily stretch')).not.toBeInTheDocument())
  expect(screen.queryByText('My Goals')).not.toBeInTheDocument()
  expect(mockGoals.niki).toEqual({})
})

it("copying someone else's goal adds it to My Goals", async () => {
  mockGoals.ana = { a1: goal('ana', 'a1', 'Headstand practice') }

  renderPage()
  fireEvent.change(screen.getByPlaceholderText('compare goals'), { target: { value: 'head' } })
  await screen.findByText('Found goals')

  fireEvent.click(screen.getByRole('button', { name: /add to my goals/i }))

  await screen.findByText("ana's Headstand practice")
  expect(screen.getByText('My Goals')).toBeInTheDocument()
  expect(Object.values(mockGoals.niki)).toHaveLength(1)
})

it('keeps what you typed in the add-goal form when the page re-renders', async () => {
  mockGoals.ana = { a1: goal('ana', 'a1', 'Headstand practice') }
  renderPage()
  await waitFor(() => expect(statValue('day streak')).toBe('0'))

  fireEvent.click(screen.getByRole('button', { name: /add new goal/i }))
  const name = await screen.findByPlaceholderText('Name')
  fireEvent.change(name, { target: { value: 'Morning flow' } })

  // A search hit updates YogiGoals' state while the dialog is open
  fireEvent.change(screen.getByPlaceholderText('compare goals'), { target: { value: 'head' } })
  await screen.findByText('Found goals')

  expect(screen.getByPlaceholderText('Name')).toHaveValue('Morning flow')
})
