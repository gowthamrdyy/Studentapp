import React from 'react'
import { Link, useParams } from 'react-router-dom'
import App from '../App.jsx'

export default function Track() {
  const { busId } = useParams()
  return (
    <div>
      <div style={{ padding: '12px 16px' }}>
        <Link to="/" style={{ color: '#93a3b6' }}>&larr; Back</Link>
      </div>
      <App initialBusId={busId} showHelp={false} />
    </div>
  )
}


