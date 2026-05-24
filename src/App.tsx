import { useEffect, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { useGameStore } from './presentation/store/gameStore'
import { useProfileStore } from './presentation/store/profileStore'
import { useAuthStore } from './presentation/store/authStore'
import { router } from './routes'
import { registerAllRenderers } from './presentation/registry/registerRenderers'
import { isFirebaseConfigured } from './infrastructure/firebase/firebase'
import { onFirebaseAuthChange } from './infrastructure/firebase/authHelpers'

// Register replay renderers once at module load
registerAllRenderers()

function LoadingScreen() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
    }}>
      <h1 style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 900, color: 'var(--color-primary)' }}>
        Slovlingva
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
        Načítavam…
      </p>
    </div>
  )
}

function App() {
  const [ready, setReady] = useState(false)
  const loadData = useGameStore(s => s.loadData)
  const loadProfiles = useProfileStore(s => s.loadProfiles)
  const setAuthState = useAuthStore(s => s.setAuthState)

  useEffect(() => {
    const init = async () => {
      // 1. Load game data (vocabulary, etc.)
      await loadData()

      // 2. Set up Firebase auth listener if configured
      if (isFirebaseConfigured()) {
        onFirebaseAuthChange(async (user) => {
          setAuthState(user?.uid ?? null)
          await loadProfiles()
        })
      } else {
        // No Firebase — mark auth as ready, load local profiles
        setAuthState(null)
        await loadProfiles()
      }

      setReady(true)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return <LoadingScreen />

  return <RouterProvider router={router} />
}

export default App
