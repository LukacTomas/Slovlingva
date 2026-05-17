import { useEffect, useState } from 'react'
import { useGame } from './presentation/hooks/useGame'
import { useProfile } from './presentation/hooks/useProfile'
import { ProfileSelectPage } from './presentation/pages/ProfileSelectPage/ProfileSelectPage'
import { CreateProfilePage } from './presentation/pages/CreateProfilePage/CreateProfilePage'
import { SubjectSelectPage } from './presentation/pages/SubjectSelectPage/SubjectSelectPage'
import { GameSetupPage } from './presentation/pages/GameSetupPage/GameSetupPage'
import { GamePage } from './presentation/pages/GamePage/GamePage'
import { RoundEndPage } from './presentation/pages/RoundEndPage/RoundEndPage'
import { SkillsPage } from './presentation/pages/SkillsPage/SkillsPage'
import { MathSetupPage } from './presentation/pages/MathSetupPage/MathSetupPage'
import { MathGamePage } from './presentation/pages/MathGamePage/MathGamePage'
import { ReplayPage } from './presentation/pages/ReplayPage/ReplayPage'
import { registerAllRenderers } from './presentation/registry/registerRenderers'

// Register replay renderers once at module load
registerAllRenderers()

export type AppPage =
  | 'loading'
  | 'profile-select'
  | 'create-profile'
  | 'subject-select'
  | 'game-setup'
  | 'game'
  | 'round-end'
  | 'replay'
  | 'skills'
  | 'math-setup'
  | 'math-game'

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
  const [page, setPage] = useState<AppPage>('loading')
  const { loadData } = useGame()
  const { loadProfiles } = useProfile()

  useEffect(() => {
    loadProfiles()
    loadData().then(() => setPage('profile-select'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  switch (page) {
    case 'loading':
      return <LoadingScreen />
    case 'profile-select':
      return <ProfileSelectPage onNavigate={setPage} />
    case 'create-profile':
      return <CreateProfilePage onNavigate={setPage} />
    case 'subject-select':
      return <SubjectSelectPage onNavigate={setPage} />
    case 'game-setup':
      return <GameSetupPage onNavigate={setPage} />
    case 'game':
      return <GamePage onNavigate={setPage} />
    case 'round-end':
      return <RoundEndPage onNavigate={setPage} />
    case 'replay':
      return <ReplayPage onNavigate={setPage} />
    case 'skills':
      return <SkillsPage onNavigate={setPage} />
    case 'math-setup':
      return <MathSetupPage onNavigate={setPage} />
    case 'math-game':
      return <MathGamePage onNavigate={setPage} />
  }
}

export default App
