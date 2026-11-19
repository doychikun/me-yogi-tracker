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

const fill = (label, value) =>
  fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } })

const submitForm = () => {
  fill('First name', 'Niki')
  fill('Last name', 'D')
  fill('Username', 'niki')
  fill('Email', 'niki@example.test')
  fill('Password', 'longenough')
  fill('Phone number', '0888 123 456')
  fireEvent.click(screen.getByRole('button', { name: /create account/i }))
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
  expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
    username: 'niki',
    uid: 'uid-1',
    phoneNumber: '+359 888123456',
    phoneCountry: 'BG',
  }))
  expect(createUser.mock.calls[0][0]).not.toHaveProperty('gender')
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

it('accepts a phone number that is not 10 digits', async () => {
  createUser.mockResolvedValue({ username: 'niki' })
  renderJoin()

  fill('First name', 'Niki')
  fill('Last name', 'D')
  fill('Username', 'niki')
  fill('Email', 'niki@example.test')
  fill('Password', 'longenough')
  fill('Phone number', '88 812 345')
  fireEvent.click(screen.getByRole('button', { name: /create account/i }))

  await waitFor(() => expect(createUser).toHaveBeenCalled())
  expect(screen.queryByText(/10 digits/)).toBeNull()
})

it('has no sex / gender field', () => {
  renderJoin()
  expect(screen.queryByText(/sex/i)).toBeNull()
  expect(screen.queryByRole('combobox', { name: /gender|sex/i })).toBeNull()
})
