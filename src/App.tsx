import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Player } from './supabase'
import { Leaderboard } from './components/Leaderboard'
import { AddPlayerForm } from './components/AddPlayerForm'
import { EliminationForm } from './components/EliminationForm'
import './App.css'

export default function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const playersById = new Map(players.map(p => [p.id, p]))

  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('score', { ascending: false })

      if (error) {
        setFetchError('Could not load players. Check your connection.')
      } else {
        setPlayers(data as Player[])
      }
      setLoading(false)
    }

    fetchPlayers()

    const channel = supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
          fetchPlayers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <p className="header-sub">Aiden &amp; Dayna's Wedding</p>
          <h1>Assassins</h1>
        </div>
      </header>

      <main className="app-main">
        {fetchError && (
          <div className="banner-error">{fetchError}</div>
        )}

        <section>
          <AddPlayerForm />
        </section>

        <section>
          <EliminationForm players={players} />
        </section>

        <section>
          <h2 className="section-title">Leaderboard</h2>
          {loading ? (
            <div className="loading">Loading players…</div>
          ) : (
            <Leaderboard players={players} playersById={playersById} />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Camp Fircom · 2025</p>
      </footer>
    </div>
  )
}
