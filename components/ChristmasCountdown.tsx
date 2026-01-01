'use client'

import { useState, useEffect } from 'react'
import { getTimeUntilChristmas } from '@/lib/auth'

interface ChristmasCountdownProps {
  timezone: string
}

export default function ChristmasCountdown({ timezone }: ChristmasCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilChristmas(timezone))
  const [targetYear, setTargetYear] = useState(new Date().getFullYear())

  useEffect(() => {
    // Calculate which Christmas we're counting down to
    const now = new Date()
    const currentYear = now.getFullYear()
    const christmasThisYear = new Date(`${currentYear}-12-25T23:59:59`)
    
    if (now > christmasThisYear) {
      setTargetYear(currentYear + 1)
    } else {
      setTargetYear(currentYear)
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilChristmas(timezone))
    }, 1000)

    return () => clearInterval(interval)
  }, [timezone])

  if (timeLeft.hasPassed) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{ margin: 0, color: '#d32f2f', fontSize: '1.5rem' }}>🎄 Merry Christmas! 🎄</h3>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.9)',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      marginBottom: '20px',
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>⏰ Time Until Christmas {targetYear}</h3>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        gap: '15px',
        flexWrap: 'wrap',
      }}>
        {/* <div style={{ minWidth: '80px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
            {timeLeft.days}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Days</div>
        </div> */}
        <div style={{ minWidth: '80px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
            {timeLeft.hours}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Hours</div>
        </div>
        <div style={{ minWidth: '80px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
            {timeLeft.minutes}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Minutes</div>
        </div>
        <div style={{ minWidth: '80px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
            {timeLeft.seconds}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Seconds</div>
        </div>
      </div>
      <p style={{ margin: '15px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
        in {timezone}
      </p>
    </div>
  )
}

