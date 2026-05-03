import { useState } from 'react'
import { supabase } from '../supabase'

export function AddPlayerForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('players')
      .insert({ name: trimmed, score: 0, eliminated: false, eliminated_by: null })

    setLoading(false)

    if (insertError) {
      if (insertError.code === '23505') {
        setError(`"${trimmed}" is already in the game.`)
      } else {
        setError('Something went wrong. Try again.')
      }
      return
    }

    setName('')
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Join the Game</h2>
      <div className="form-row">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Adding…' : 'Join'}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}
