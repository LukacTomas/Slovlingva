import type { ComponentType } from 'react'

/**
 * Props passed to every replay exercise renderer.
 * Each subject provides a component that implements this interface.
 */
export interface ExerciseRendererProps {
  /** The exercise object (IExercise, IMathExercise, etc.) */
  exercise: unknown
  /** Called when the player answers correctly. */
  onCorrect: () => void
  /** Called when the player answers incorrectly. */
  onWrong: () => void
}

const registry = new Map<string, ComponentType<ExerciseRendererProps>>()

/** Register a replay renderer component for a subject. */
export function registerRenderer(key: string, component: ComponentType<ExerciseRendererProps>) {
  registry.set(key, component)
}

/** Get a registered replay renderer by key. Returns null if not found. */
export function getRenderer(key: string): ComponentType<ExerciseRendererProps> | null {
  return registry.get(key) ?? null
}
