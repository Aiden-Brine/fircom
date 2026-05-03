import { useState, useId } from 'react'
import { supabase } from '../supabase'
import type { Player } from '../supabase'

interface Props {
  players: Player[]
}

export function EliminationForm({ players }: Props) {
  const killerId = useId()
  const targetId = useId()

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

  if (activePlayers.length < 2) {
    return null
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Record Elimination</h2>
      <div className="form-group">
        <label htmlFor={killerId}>Killer</label>
        <select
          id={killerId}
          value={killer}
          onChange={e => { setKiller(e.target.value); setTarget('') }}
          disabled={loading}
        >
          <option value="">— Select killer —</option>
          {activePlayers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={targetId}>Target</label>
        <select
          id={targetId}
          value={target}
          onChange={e => setTarget(e.target.value)}
          disabled={loading || !killer}
        >
          <option value="">— Select target —</option>
          {targetOptions.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
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
