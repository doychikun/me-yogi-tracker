import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppContext from '../providers/AppContext'
import Authenticated from './Authenticated'

const renderAt = (context) => render(
  <AppContext.Provider value={context}>
    <MemoryRouter initialEntries={['/yogi-goals']}>
      <Routes>
        <Route path='/home' element={<p>home page</p>} />
        <Route path='/yogi-goals' element={<Authenticated><p>secret page</p></Authenticated>} />
      </Routes>
    </MemoryRouter>
  </AppContext.Provider>
)

it('waits instead of redirecting while the session is being restored', () => {
  renderAt({ user: null, authPending: true })
  expect(screen.queryByText('home page')).not.toBeInTheDocument()
  expect(screen.queryByText('secret page')).not.toBeInTheDocument()
})

it('redirects to home when nobody is signed in', () => {
  renderAt({ user: null, authPending: false })
  expect(screen.getByText('home page')).toBeInTheDocument()
})

it('shows the page to a signed-in user', () => {
  renderAt({ user: { uid: 'u1' }, authPending: false })
  expect(screen.getByText('secret page')).toBeInTheDocument()
})
