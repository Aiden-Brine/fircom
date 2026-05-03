import { useState } from 'react'
import { supabase } from '../supabase'
import type { Player } from '../supabase'

interface Props {
  players: Player[]
  playersById: Map<string, Player>
  onJoinClick: () => void
}

export function Leaderboard({ players, playersById, onJoinClick }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [undoing, setUndoing] = useState<string | null>(null)

  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.name.localeCompare(b.name)
  })

  async function handleUndo(target: Player) {
    if (!target.eliminated_by) return
    const killer = playersById.get(target.eliminated_by)
    if (!killer) return

    setUndoing(target.id)
    setConfirmingId(null)

    await Promise.all([
      supabase
        .from('players')
        .update({ score: Math.max(0, killer.score - 1) })
        .eq('id', killer.id),
      supabase
        .from('players')
        .update({ eliminated: false, eliminated_by: null })
        .eq('id', target.id),
    ])

    setUndoing(null)
  }

  if (sorted.length === 0) {
    return (
      <div className="leaderboard-empty">
        No players yet.{' '}
        <button className="link-btn" onClick={onJoinClick}>Join Game!</button>
      </div>
    )
  }

  return (
    <ol className="leaderboard">
      {sorted.map((player, index) => {
        const eliminator = player.eliminated_by ? playersById.get(player.eliminated_by) : null
        const isConfirming = confirmingId === player.id
        const isUndoing = undoing === player.id

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
            <div className="player-actions">
              <span className="player-score">{player.score}</span>
              {player.eliminated && (
                isConfirming ? (
                  <div className="undo-confirm">
                    <span className="undo-confirm-text">Undo?</span>
                    <button
                      className="btn-undo-yes"
                      onClick={() => handleUndo(player)}
                      disabled={isUndoing}
                    >
                      Yes
                    </button>
                    <button
                      className="btn-undo-no"
                      onClick={() => setConfirmingId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-undo"
                    onClick={() => setConfirmingId(player.id)}
                    disabled={isUndoing}
                  >
                    {isUndoing ? '…' : 'Undo'}
                  </button>
                )
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
