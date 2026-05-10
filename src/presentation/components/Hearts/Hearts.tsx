import './Hearts.css'

interface HeartsProps {
  hearts: number
  max: number
}

export function Hearts({ hearts, max }: HeartsProps) {
  return (
    <div className="hearts" aria-label={`${hearts} of ${max} hearts remaining`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`hearts__heart${i < hearts ? '' : ' hearts__heart--empty'}`}
          aria-hidden="true"
        >
          ♥
        </span>
      ))}
    </div>
  )
}
