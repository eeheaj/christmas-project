'use client'

import { Window } from '@/lib/supabase'
import { isChristmasPassed } from '@/lib/auth'

interface LetterViewModalProps {
  isOpen: boolean
  onClose: () => void
  window: Window | null
  houseTimezone: string
  isOwner: boolean
}

export default function LetterViewModal({ isOpen, onClose, window, houseTimezone, isOwner }: LetterViewModalProps) {
  if (!isOpen || !window) return null

  const canViewLetter = isOwner && isChristmasPassed(houseTimezone)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content letter-view-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Window #{window.grid_position}</h2>
        
        <div className="letter-view-window-preview">
          <div
            className="window-preview-large"
            style={{ backgroundColor: window.background_color }}
          >
            <img
              src={`/assets/characters/${encodeURIComponent(window.character_type.replace('character', 'Frame '))}.svg`}
              alt={window.character_type}
              className="preview-character"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src.endsWith('.svg')) {
                  target.src = target.src.replace('.svg', '.png')
                } else {
                  target.style.display = 'none'
                }
              }}
            />
            <img
              src={`/assets/frames/${window.frame_design}.svg`}
              alt={window.frame_design}
              className="preview-frame"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src.endsWith('.svg')) {
                  target.src = target.src.replace('.svg', '.png')
                } else {
                  target.style.display = 'none'
                }
              }}
            />
          </div>
        </div>

        {canViewLetter ? (
          <div className="letter-view-content">
            <div className="letter-author">
              From: <strong>{window.visitor_name}</strong>
            </div>
            <div className="letter-text">
              {window.letter_content}
            </div>
            <div className="letter-date">
              {formatDate(window.created_at)}
            </div>
          </div>
        ) : (
          <div className="letter-view-locked">
            <p>📬 This letter will be visible after Christmas!</p>
            {isOwner && (
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                Letters become visible after Christmas in {houseTimezone}
              </p>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="primary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

