'use client'

import { useState, useEffect } from 'react'

interface HouseSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; timezone: string; houseType: string }) => void
}

// House types map to actual file names: "house A1.svg", "house A2.svg", etc.
const HOUSE_TYPES = [
  { value: 'house1', file: 'house A1' },
  { value: 'house2', file: 'house A2' },
  { value: 'house3', file: 'house A3' },
  { value: 'house4', file: 'house B1' },
  { value: 'house5', file: 'house B2' },
  { value: 'house6', file: 'house B3' },
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'UTC', label: 'UTC' },
]

export default function HouseSetupModal({ isOpen, onClose, onSave }: HouseSetupModalProps) {
  const [houseName, setHouseName] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [selectedHouse, setSelectedHouse] = useState('house1')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (houseName.trim()) {
      onSave({ name: houseName.trim(), timezone, houseType: selectedHouse })
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Set Up Your House</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="houseName">House Name</label>
            <input
              type="text"
              id="houseName"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="Enter your house name..."
              maxLength={50}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timezone">Time Zone</label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Your House</label>
            <div className="house-selection-grid">
              {HOUSE_TYPES.map((houseType) => (
                <div
                  key={houseType.value}
                  className={`house-option ${selectedHouse === houseType.value ? 'selected' : ''}`}
                  onClick={() => setSelectedHouse(houseType.value)}
                >
                  <img
                    src={`/assets/houses/${encodeURIComponent(houseType.file)}.svg`}
                    alt={houseType.value}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      // Try PNG fallback
                      if (target.src.endsWith('.svg')) {
                        target.src = target.src.replace('.svg', '.png')
                      } else {
                        target.style.display = 'none'
                      }
                    }}
                  />
                  <span>{houseType.value.charAt(0).toUpperCase() + houseType.value.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="primary-btn">
            Create House
          </button>
        </form>
      </div>
    </div>
  )
}

