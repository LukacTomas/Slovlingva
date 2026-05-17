import { useMathGameStore } from '../store/mathGameStore'

export function useMathGame() {
  const store = useMathGameStore()
  const currentExercise = store.gameState
    ? (store.exercises[store.gameState.currentExerciseIndex] ?? null)
    : null

  return { ...store, currentExercise }
}
