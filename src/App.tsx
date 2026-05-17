import { useEffect, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { useGameStore } from './presentation/store/gameStore'
import { useProfileStore } from './presentation/store/profileStore'
import { router } from './routes'
import { registerAllRenderers } from './presentation/registry/registerRenderers'

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
        Načítavam slovnú zásobu…
      </p>
    </div>
  )
}

function App() {
  const [ready, setReady] = useState(false)
  const loadData = useGameStore(s => s.loadData)
  const loadProfiles = useProfileStore(s => s.loadProfiles)

  useEffect(() => {
    Promise.all([loadProfiles(), loadData()]).then(() => setReady(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return <LoadingScreen />

  return <RouterProvider router={router} />
}

export default App
