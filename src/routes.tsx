/**
 * TanStack Router — code-based route tree.
 *
 * Route structure:
 *   /                              → redirect to /login
 *   /login                         → ProfileSelectPage (local profiles)
 *   /register                      → CreateProfilePage (local profile wizard)
 *   /auth/login                    → AuthLoginPage (Firebase username+password)
 *   /auth/register                 → AuthRegisterPage (Firebase account creation)
 *   /auth/reset-password           → ResetPasswordPage
 *   /_auth                         → pathless layout with auth guard (beforeLoad)
 *   /_auth/dashboard               → SubjectSelectPage
 *   /_auth/skills                  → SkillsPage
 *   /_auth/auth/upgrade             → UpgradeProfilePage
 *   /_auth/game/slovencina/setup   → GameSetupPage
 *   /_auth/game/slovencina/play    → GamePage
 *   /_auth/game/slovencina/replay  → ReplayPage
 *   /_auth/game/matematika/setup   → MathSetupPage
 *   /_auth/game/matematika/play    → MathGamePage
 *   /_auth/game/matematika/replay  → ReplayPage
 *   /_auth/game/round-end          → RoundEndPage
 */

import { lazy, Suspense } from 'react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router'

import { useProfileStore } from './presentation/store/profileStore'
import { ProfileSelectPage } from './presentation/pages/ProfileSelectPage/ProfileSelectPage'
import { CreateProfilePage } from './presentation/pages/CreateProfilePage/CreateProfilePage'
import { SubjectSelectPage } from './presentation/pages/SubjectSelectPage/SubjectSelectPage'
import { SkillsPage } from './presentation/pages/SkillsPage/SkillsPage'
import { GameSetupPage } from './presentation/pages/GameSetupPage/GameSetupPage'
import { GamePage } from './presentation/pages/GamePage/GamePage'
import { MathSetupPage } from './presentation/pages/MathSetupPage/MathSetupPage'
import { MathGamePage } from './presentation/pages/MathGamePage/MathGamePage'
import { ReplayPage } from './presentation/pages/ReplayPage/ReplayPage'
import { RoundEndPage } from './presentation/pages/RoundEndPage/RoundEndPage'

// Lazy-loaded Firebase auth pages (split into firebase chunk)
const AuthLoginPage = lazy(() => import('./presentation/pages/AuthLoginPage/AuthLoginPage').then(m => ({ default: m.AuthLoginPage })))
const AuthRegisterPage = lazy(() => import('./presentation/pages/AuthRegisterPage/AuthRegisterPage').then(m => ({ default: m.AuthRegisterPage })))
const ResetPasswordPage = lazy(() => import('./presentation/pages/ResetPasswordPage/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const UpgradeProfilePage = lazy(() => import('./presentation/pages/UpgradeProfilePage/UpgradeProfilePage').then(m => ({ default: m.UpgradeProfilePage })))

// ─── Root route ─────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  ),
})

// ─── Public routes ──────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    await useProfileStore.getState().logout()
  },
  component: ProfileSelectPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: CreateProfilePage,
})

// ─── Firebase auth routes ───────────────────────────────────────────────────

const authLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: AuthLoginPage,
})

const authRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/register',
  component: AuthRegisterPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: ResetPasswordPage,
})

const upgradeProfileRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/auth/upgrade',
  component: UpgradeProfilePage,
})

// ─── Authenticated layout (pathless) ────────────────────────────────────────

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  beforeLoad: () => {
    const { activeProfile } = useProfileStore.getState()
    if (!activeProfile) {
      throw redirect({ to: '/login' })
    }
  },
  component: Outlet,
})

// ─── Auth-guarded routes ────────────────────────────────────────────────────

const dashboardRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/dashboard',
  component: SubjectSelectPage,
})

const skillsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/skills',
  component: SkillsPage,
})

// ── Slovenčina ──

const slovencinaSetupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/slovencina/setup',
  component: GameSetupPage,
  validateSearch: (search: Record<string, unknown>): {
    mode?: string
    difficulty?: number
    timer?: boolean
    group?: string
  } => ({
    mode: (search['mode'] as string) || undefined,
    difficulty: search['difficulty'] ? Number(search['difficulty']) : undefined,
    timer: search['timer'] === 'true' ? true : search['timer'] === 'false' ? false : undefined,
    group: (search['group'] as string) || undefined,
  }),
})

const slovencinaPlayRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/slovencina/play',
  component: GamePage,
})

const slovencinaReplayRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/slovencina/replay',
  component: ReplayPage,
})

// ── Matematika ──

const matematikaSetupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/matematika/setup',
  component: MathSetupPage,
  validateSearch: (search: Record<string, unknown>): {
    category?: string
    nasobilkaMode?: string
    answerMode?: string
    timer?: boolean
  } => ({
    category: (search['category'] as string) || undefined,
    nasobilkaMode: (search['nasobilkaMode'] as string) || undefined,
    answerMode: (search['answerMode'] as string) || undefined,
    timer: search['timer'] === 'true' ? true : search['timer'] === 'false' ? false : undefined,
  }),
})

const matematikaPlayRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/matematika/play',
  component: MathGamePage,
})

const matematikaReplayRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/matematika/replay',
  component: ReplayPage,
})

// ── Shared game routes ──

const roundEndRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/game/round-end',
  component: RoundEndPage,
})

// ─── Route tree ─────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  authLoginRoute,
  authRegisterRoute,
  resetPasswordRoute,
  authLayoutRoute.addChildren([
    dashboardRoute,
    skillsRoute,
    upgradeProfileRoute,
    slovencinaSetupRoute,
    slovencinaPlayRoute,
    slovencinaReplayRoute,
    matematikaSetupRoute,
    matematikaPlayRoute,
    matematikaReplayRoute,
    roundEndRoute,
  ]),
])

// ─── Router instance ────────────────────────────────────────────────────────

export const router = createRouter({ routeTree })

// Type-safe route declarations
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
