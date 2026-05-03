import type { Player } from '../supabase'

interface Props {
  players: Player[]
  playersById: Map<string, Player>
}

export function Leaderboard({ players, playersById }: Props) {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.name.localeCompare(b.name)
  })

  if (sorted.length === 0) {
    return (
      <div className="leaderboard-empty">
        No players yet. Add one below!
      </div>
    )
  }

  return (
    <ol className="leaderboard">
      {sorted.map((player, index) => {
        const eliminator = player.eliminated_by ? playersById.get(player.eliminated_by) : null
        return (
          <li
            key={player.id}
            className={`leaderboard-row ${player.eliminated ? 'eliminated' : 'active'}`}
          >
            <span className="rank">#{index + 1}</span>
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              {player.eliminated && (
                <span className="eliminated-label">
                  Eliminated{eliminator ? ` by ${eliminator.name}` : ''}
                </span>
              )}
            </div>
            <span className="player-score">{player.score}</span>
          </li>
        )
      })}
    </ol>
  )
}
