import { useState } from 'react'
import { supabase } from '../supabase'
import type { Player } from '../supabase'
import { PlayerSelect } from './PlayerSelect'

interface Props {
  players: Player[]
  onJoinClick: () => void
}

export function EliminationForm({ players, onJoinClick }: Props) {
  const [killer, setKiller] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const activePlayers = players.filter(p => !p.eliminated)
  const targetOptions = activePlayers.filter(p => p.id !== killer)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!killer || !target) return
    if (killer === target) {
      setError('Killer and target must be different players.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const killerPlayer = activePlayers.find(p => p.id === killer)
    const targetPlayer = activePlayers.find(p => p.id === target)

    if (!killerPlayer || !targetPlayer) {
      setError('Invalid selection. The leaderboard may have updated — try again.')
      setLoading(false)
      return
    }

    if (killerPlayer.eliminated) {
      setError(`${killerPlayer.name} has already been eliminated and cannot record a kill.`)
      setLoading(false)
      return
    }

    if (targetPlayer.eliminated) {
      setError(`${targetPlayer.name} is already eliminated.`)
      setLoading(false)
      return
    }

    const [scoreResult, eliminateResult] = await Promise.all([
      supabase
        .from('players')
        .update({ score: killerPlayer.score + 1 })
        .eq('id', killer),
      supabase
        .from('players')
        .update({ eliminated: true, eliminated_by: killer })
        .eq('id', target),
    ])

    setLoading(false)

    if (scoreResult.error || eliminateResult.error) {
      setError('Something went wrong. Try again.')
      return
    }

    setSuccess(`${killerPlayer.name} eliminated ${targetPlayer.name}!`)
    setKiller('')
    setTarget('')
  }

  if (players.length === 0) {
    return (
      <div className="leaderboard-empty">
        No players yet.{' '}
        <button className="link-btn" onClick={onJoinClick}>Join Game!</button>
      </div>
    )
  }

  if (activePlayers.length < 2) {
    return null
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Record Elimination</h2>
      <PlayerSelect
        label="Killer"
        players={activePlayers}
        value={killer}
        onChange={id => { setKiller(id); setTarget('') }}
        placeholder="Search for killer…"
        disabled={loading}
      />
      <PlayerSelect
        label="Target"
        players={targetOptions}
        value={target}
        onChange={setTarget}
        placeholder={killer ? 'Search for target…' : 'Select a killer first'}
        disabled={loading || !killer}
      />
      <button
        type="submit"
        className="btn-danger"
        disabled={loading || !killer || !target}
      >
        {loading ? 'Recording…' : 'Record Elimination'}
      </button>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
    </form>
  )
}
