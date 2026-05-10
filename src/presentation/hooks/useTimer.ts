import { useEffect } from 'react'

interface UseTimerParams {
  active: boolean
  secondsLeft: number
  onTick: () => void
  onExpire: () => void
}

export function useTimer({ active, secondsLeft, onTick, onExpire }: UseTimerParams): void {
  useEffect(() => {
    if (!active) return

    if (secondsLeft <= 0) {
      onExpire()
      return
    }

    const id = setInterval(onTick, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, secondsLeft])
}
