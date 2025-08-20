import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { db } from './firebase.js'
import { onValue, ref as dbRef, off } from 'firebase/database'
import busSvg from './assets/bus.svg'

const DEFAULT_POSITION = { lat: 20.5937, lng: 78.9629 }
const STALE_THRESHOLD_MS = 5 * 60 * 1000

// Factory for the bus image icon (uses SVG asset)
function createBusImgIcon(stale = false) {
  return L.icon({
    iconUrl: busSvg,
    iconSize: [40, 40],
    iconAnchor: [20, 28],
    className: stale ? 'bus-img-icon stale' : 'bus-img-icon',
  })
}

function MapFlyTo({ position }) {
  const map = useMap()
  useEffect(() => {
    if (!position) return
    map.flyTo(position, 16, { animate: true, duration: 1.2 })
  }, [position, map])
  return null
}

function useAnimatedPosition(currentPosition, durationMs = 1200, steps = 30) {
  const [animatedPosition, setAnimatedPosition] = useState(currentPosition)
  const animationRef = useRef(null)
  const lastPositionRef = useRef(currentPosition)

  useEffect(() => {
    if (!currentPosition) return
    const start = lastPositionRef.current || currentPosition
    const end = currentPosition
    lastPositionRef.current = currentPosition

    if (!start || (!start.lat && !start.lng)) {
      setAnimatedPosition(end)
      return
    }

    const totalSteps = Math.max(steps, 1)
    const stepDuration = durationMs / totalSteps
    let stepIndex = 0

    if (animationRef.current) {
      window.clearInterval(animationRef.current)
    }

    animationRef.current = window.setInterval(() => {
      stepIndex += 1
      const t = Math.min(1, stepIndex / totalSteps)
      const lat = start.lat + (end.lat - start.lat) * t
      const lng = start.lng + (end.lng - start.lng) * t
      setAnimatedPosition({ lat, lng })
      if (t >= 1) {
        window.clearInterval(animationRef.current)
        animationRef.current = null
      }
    }, stepDuration)

    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
  }, [currentPosition, durationMs, steps])

  return animatedPosition
}

export default function App({ initialBusId = '', showHelp = true }) {
  const [busId, setBusId] = useState('')
  const [activeBusId, setActiveBusId] = useState('')
  const [position, setPosition] = useState(null)
  const [timestamp, setTimestamp] = useState(null)
  const [isStale, setIsStale] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const animatedPosition = useAnimatedPosition(position)

  useEffect(() => {
    if (!timestamp) return
    const checkStale = () => {
      const now = Date.now()
      setIsStale(now - timestamp > STALE_THRESHOLD_MS)
    }
    checkStale()
    const id = setInterval(checkStale, 30 * 1000)
    return () => clearInterval(id)
  }, [timestamp])

  useEffect(() => {
    if (!activeBusId) return
    setLoading(true)
    setError('')
    const r = dbRef(db, `buses/${activeBusId}`)
    const unsubscribe = onValue(
      r,
      (snap) => {
        const val = snap.val()
        if (!val || typeof val.latitude !== 'number' || typeof val.longitude !== 'number') {
          setError('No live location for this Bus ID yet.')
          setPosition(null)
          setTimestamp(null)
          setLoading(false)
          return
        }
        setPosition({ lat: val.latitude, lng: val.longitude })
        setTimestamp(typeof val.timestamp === 'number' ? val.timestamp : null)
        setLoading(false)
      },
      (err) => {
        setError(err?.message || 'Failed to read bus location')
        setLoading(false)
      }
    )
    return () => {
      off(r)
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [activeBusId])

  const handleTrack = (e) => {
    e.preventDefault()
    const id = (busId || '').trim()
    if (!id) {
      setError('Please enter a Bus ID')
      return
    }
    setActiveBusId(id)
  }

  useEffect(() => {
    if (!initialBusId) return
    setBusId(initialBusId.toUpperCase())
    setActiveBusId(initialBusId.toUpperCase())
  }, [initialBusId])

  const lastUpdatedText = useMemo(() => {
    if (!timestamp) return '—'
    try {
      const d = new Date(timestamp)
      return d.toLocaleString()
    } catch {
      return '—'
    }
  }, [timestamp])

  const markerIcon = useMemo(() => createBusImgIcon(isStale), [isStale])

  return (
    <div className="app">
      <h1>Student Bus Tracker</h1>

      <form className="controls" onSubmit={handleTrack}>
        <input
          placeholder="Enter Bus ID (e.g. AA1)"
          value={busId}
          onChange={(e) => setBusId(e.target.value.toUpperCase())}
          aria-label="Bus ID"
        />
        <button type="submit">Track Bus</button>
        {activeBusId ? <span className="active-id">Tracking: {activeBusId}</span> : null}
      </form>

      <div className="status-row">
        <div className="chip">
          Status: {isStale ? 'Offline/Stale' : 'Live'}
        </div>
        <div className="chip">Last updated: {lastUpdatedText}</div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="map-wrap">
        <MapContainer
          center={position || DEFAULT_POSITION}
          zoom={position ? 16 : 5}
          scrollWheelZoom
          className="map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {animatedPosition ? (
            <>
              <MapFlyTo position={animatedPosition} />
              <Marker position={animatedPosition} icon={markerIcon}>
                <Popup>
                  <div>
                    <div><strong>Bus:</strong> {activeBusId || '—'}</div>
                    <div><strong>Lat:</strong> {animatedPosition.lat.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {animatedPosition.lng.toFixed(6)}</div>
                    <div><strong>Updated:</strong> {lastUpdatedText}</div>
                    <div><strong>Status:</strong> {isStale ? 'Stale' : 'Live'}</div>
                  </div>
                </Popup>
              </Marker>
            </>
          ) : null}
        </MapContainer>
        {loading ? <div className="overlay">Loading…</div> : null}
      </div>

      {showHelp ? (
        <div className="help">
          <p>
            Hint: Data is read from Realtime Database at  <code>buses/{'{'}busId{'}'}</code> with fields
            <code>latitude</code>, <code>longitude</code>, and <code>timestamp</code> (Unix ms).
          </p>
          <p>
            Replace Firebase config in <code>src/firebase.js</code> with your project values.
          </p>
        </div>
      ) : null}
    </div>
  )
}


