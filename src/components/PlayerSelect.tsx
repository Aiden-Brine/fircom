import { useState, useRef, useEffect, useId } from 'react'
import type { Player } from '../supabase'

interface Props {
  label: string
  players: Player[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
}

export function PlayerSelect({ label, players, value, onChange, placeholder = '— Select —', disabled = false }: Props) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = players.find(p => p.id === value)

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(player: Player) {
    onChange(player.id)
    setQuery('')
    setOpen(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange('')
  }

  function handleFocus() {
    setQuery('')
    setOpen(true)
  }

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = open ? query : (selected?.name ?? '')

  return (
    <div className="form-group" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <div className="player-select">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
        />
        {open && filtered.length > 0 && (
          <ul className="player-select-dropdown" role="listbox">
            {filtered.map(p => (
              <li
                key={p.id}
                role="option"
                aria-selected={p.id === value}
                className={p.id === value ? 'selected' : ''}
                onMouseDown={() => handleSelect(p)}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}
        {open && filtered.length === 0 && (
          <ul className="player-select-dropdown">
            <li className="no-results">No players found</li>
          </ul>
        )}
      </div>
    </div>
  )
}
