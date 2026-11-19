import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AppContext from '../../providers/AppContext'
import Join from './Join'
import { createUser, isUsernameTaken } from '../../services/users.service'
import { deleteAccount, registerUser } from '../../services/auth.service'

const firebaseUser = { uid: 'uid-1' }

jest.mock('../../services/auth.service', () => ({
  registerUser: jest.fn(),
  deleteAccount: jest.fn(),
}))

jest.mock('../../services/users.service', () => ({
  isUsernameTaken: jest.fn(),
  createUser: jest.fn(),
}))

const fill = (placeholder, value) =>
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } })

const submitForm = () => {
  fill('First Name*', 'Niki')
  fill('Last Name*', 'D')
  fill('Username*', 'niki')
  fill('Email*', 'niki@example.test')
  fill('Password*', 'longenough')
  fill('Phone Number*', '0888123456')
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
}

const renderJoin = () => {
  const setContext = jest.fn()
  const close = jest.fn()
  render(
    <AppContext.Provider value={{ setContext }}>
      <Join close={close} />
    </AppContext.Provider>
  )
  return { setContext, close }
}

// CRA resets mock implementations before every test, so set them here.
beforeEach(() => {
  isUsernameTaken.mockResolvedValue(false)
  registerUser.mockResolvedValue({ user: firebaseUser })
  deleteAccount.mockResolvedValue()
})

it('signs the new user in with their saved profile', async () => {
  const profile = { username: 'niki', uid: 'uid-1', firstName: 'Niki' }
  createUser.mockResolvedValue(profile)
  const { setContext, close } = renderJoin()

  submitForm()

  await waitFor(() => expect(setContext).toHaveBeenCalledWith({ user: firebaseUser, userData: profile }))
  expect(close).toHaveBeenCalled()
  expect(deleteAccount).not.toHaveBeenCalled()
})

it('removes the new login again when the profile cannot be saved', async () => {
  createUser.mockRejectedValue(new Error('PERMISSION_DENIED: Permission denied'))
  const { setContext, close } = renderJoin()

  submitForm()

  await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith(firebaseUser))
  expect(setContext).not.toHaveBeenCalled()
  expect(close).not.toHaveBeenCalled()
})
