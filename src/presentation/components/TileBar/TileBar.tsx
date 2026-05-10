import { useRef, useCallback } from 'react'
import { useFocusRing } from 'react-aria'
import './TileBar.css'
import type { CharacterOption } from '../../../domain/entities/exercise.entity'

const TILES: CharacterOption[] = ['i', 'í', 'y', 'ý']

const TILE_CLASS: Record<CharacterOption, string> = {
  i: 'tile-bar__tile--i',
  í: 'tile-bar__tile--i-long',
  y: 'tile-bar__tile--y',
  ý: 'tile-bar__tile--y-long',
}

const TILE_LABELS: Record<CharacterOption, string> = {
  i: 'Krátke i',
  í: 'Dlhé í',
  y: 'Krátke y',
  ý: 'Dlhé ý',
}

interface TileBarProps {
  onTileClick: (char: CharacterOption) => void
  disabled?: boolean
}

/* ─── Single tile with focus ring ────────────────────────────────────────── */
interface TileProps {
  char: CharacterOption
  index: number
  disabled: boolean
  tileRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
  onTileClick: (char: CharacterOption) => void
}

function Tile({ char, index, disabled, tileRefs, onTileClick }: TileProps) {
  const { isFocusVisible, focusProps } = useFocusRing()

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const len = TILES.length
    let next: number | undefined
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (index + 1) % len
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (index - 1 + len) % len
    }
    if (next !== undefined) {
      e.preventDefault()
      tileRefs.current[next]?.focus()
    }
  }, [index, tileRefs])

  return (
    <button
      ref={el => { tileRefs.current[index] = el }}
      className={[
        'tile-bar__tile',
        TILE_CLASS[char],
        isFocusVisible ? 'tile-bar__tile--focus-visible' : '',
      ].join(' ').trim()}
      disabled={disabled}
      draggable={!disabled}
      aria-label={TILE_LABELS[char]}
      {...focusProps}
      onKeyDown={(e) => {
        focusProps.onKeyDown?.(e)
        handleKeyDown(e)
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData('char', char)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={() => onTileClick(char)}
    >
      {char}
    </button>
  )
}

/* ─── TileBar container ──────────────────────────────────────────────────── */
export function TileBar({ onTileClick, disabled = false }: TileBarProps) {
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])

  return (
    <aside
      className="tile-bar"
      role="toolbar"
      aria-label="Písmená na výber"
      aria-orientation="vertical"
    >
      {TILES.map((char, index) => (
        <Tile
          key={char}
          char={char}
          index={index}
          disabled={disabled}
          tileRefs={tileRefs}
          onTileClick={onTileClick}
        />
      ))}
    </aside>
  )
}
