import { registerRenderer } from './exerciseRenderers'
import { SlovencinaReplayExercise } from '../components/SlovencinaReplayExercise/SlovencinaReplayExercise'
import { MathReplayExercise } from '../components/MathReplayExercise/MathReplayExercise'

/** Register all subject replay renderers. Call once at app startup. */
export function registerAllRenderers() {
  registerRenderer('slovencina', SlovencinaReplayExercise)
  registerRenderer('matematika', MathReplayExercise)
}
