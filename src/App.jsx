import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { UserProvider, useUser } from './context/UserContext'
import Onboarding from './pages/Onboarding'
import Home       from './pages/Home'
import Scan       from './pages/Scan'
import Diary      from './pages/Diary'
import Progress   from './pages/Progress'
import Profile    from './pages/Profile'

function AppRoutes() {
  const { onboardingDone } = useUser()

  if (!onboardingDone) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/home" replace />} />
      <Route path="/home"     element={<Home />} />
      <Route path="/scan"     element={<Scan />} />
      <Route path="/diary"    element={<Diary />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/profile"  element={<Profile />} />
      <Route path="*"         element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  )
}
