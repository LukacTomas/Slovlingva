import { useGameStore } from '../store/gameStore'

export function useGame() {
  const store = useGameStore()
  const currentExercise = store.gameState
    ? (store.exercises[store.gameState.currentExerciseIndex] ?? null)
    : null

  return { ...store, currentExercise }
}
