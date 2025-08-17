import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase.js'
import { onValue, ref as dbRef } from 'firebase/database'

const STALE_THRESHOLD_MS = 5 * 60 * 1000

export default function Home() {
  const [busId, setBusId] = useState('')
  const [buses, setBuses] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const r = dbRef(db, 'buses')
    const unsub = onValue(r, (snap) => {
      setBuses(snap.val() || {})
    })
    return () => unsub()
  }, [])

  const onlineCount = useMemo(() => {
    const now = Date.now()
    return Object.values(buses).filter((b) => {
      const ts = typeof b?.timestamp === 'number' ? b.timestamp : 0
      return now - ts <= STALE_THRESHOLD_MS
    }).length
  }, [buses])

  const handleTrack = (e) => {
    e.preventDefault()
    const id = (busId || '').trim().toUpperCase()
    if (!id) return
    navigate(`/track/${encodeURIComponent(id)}`)
  }

  const busEntries = Object.entries(buses || {})
  const now = Date.now()

  return (
    <div className="app">
      <h1>Student Bus Tracker</h1>
      <p className="help">Online buses: {onlineCount} / {busEntries.length}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginBottom: 12 }}>
        {busEntries.map(([id, data]) => {
          const ts = typeof data?.timestamp === 'number' ? data.timestamp : 0
          const isOnline = now - ts <= STALE_THRESHOLD_MS
          return (
            <button
              key={id}
              onClick={() => navigate(`/track/${encodeURIComponent(id)}`)}
              style={{
                borderRadius: 12,
                border: '1px solid #263247',
                background: isOnline ? 'linear-gradient(180deg,#0e2b17,#0f241a)' : '#0e1628',
                color: isOnline ? '#bbf7d0' : '#c9d2e3',
                padding: '14px 12px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>{id}</div>
              <div style={{ fontSize: 12, color: isOnline ? '#86efac' : '#93a3b6' }}>{isOnline ? 'Online' : 'Offline'}</div>
            </button>
          )
        })}
      </div>

      <form
        className="controls"
        onSubmit={handleTrack}
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}
      >
        <input
          placeholder="Or type Bus ID (e.g. AA1)"
          value={busId}
          onChange={(e) => setBusId(e.target.value)}
          aria-label="Bus ID"
        />
        <button type="submit" style={{ width: '100%' }}>Track Bus</button>
      </form>
    </div>
  )
}


