'use client'

import { useState } from 'react'

interface WindowLetterModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { character: string; frame: string; backgroundColor: string; visitorName: string; letterContent: string }) => void
}

// Get character names from actual SVG files in assets
// Files are: Frame 1.svg, Frame 2.svg, ..., Frame 22.svg (Frame 7 is missing)
const CHARACTER_NUMBERS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
const CHARACTERS = CHARACTER_NUMBERS.map(num => `Frame ${num}`)

const FRAMES = ['window1', 'window1b', 'window2', 'window2b', 'window3', 'window3b']

const PRESET_COLORS = [
  '#FFFFFF', '#FFE4E1', '#FFF0F5', '#E6E6FA', '#F0F8FF', '#E0F6FF',
  '#F0FFF0', '#FFFACD', '#FFE4B5', '#FFDAB9', '#FFC0CB', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#AED6F1', '#A3E4D7', '#F8C471', '#F1948A',
]

export default function WindowLetterModal({ isOpen, onClose, onSave }: WindowLetterModalProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [customColor, setCustomColor] = useState('#FFFFFF')
  const [visitorName, setVisitorName] = useState('')
  const [letterContent, setLetterContent] = useState('')
  const [step, setStep] = useState<'character' | 'frame' | 'letter'>('character')

  if (!isOpen) return null

  const handleColorSelect = (color: string) => {
    setBackgroundColor(color)
    setCustomColor(color)
  }

  const handleCharacterNext = () => {
    if (selectedCharacter) {
      setStep('frame')
    }
  }

  const handleFrameNext = () => {
    if (selectedFrame) {
      setStep('letter')
    }
  }

  const handleBack = () => {
    if (step === 'frame') {
      setStep('character')
    } else if (step === 'letter') {
      setStep('frame')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (visitorName.trim() && letterContent.trim() && selectedCharacter && selectedFrame) {
      // Convert character name to format used in database
      // "Frame 1" -> "character1", "Frame 22" -> "character22"
      const frameNumber = selectedCharacter.replace('Frame ', '')
      const characterType = `character${frameNumber}`
      onSave({
        character: characterType,
        frame: selectedFrame,
        backgroundColor: backgroundColor,
        visitorName: visitorName.trim(),
        letterContent: letterContent.trim(),
      })
      // Reset form
      setStep('character')
      setSelectedCharacter(null)
      setSelectedFrame(null)
      setVisitorName('')
      setLetterContent('')
      setBackgroundColor('#FFFFFF')
      onClose()
    }
  }

  // Step 1: Pick Character
  if (step === 'character') {
    return (
      <div className="modal" onClick={onClose}>
        <div className="modal-content window-creation-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Pick Your Character</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>
          </div>
          
          <div className="character-selection-grid">
            {CHARACTERS.map((character) => {
              // File names have spaces: "Frame 1.svg" -> encode as "Frame%201.svg"
              const fileName = encodeURIComponent(character)
              return (
                <div
                  key={character}
                  className={`character-selection-item ${selectedCharacter === character ? 'selected' : ''}`}
                  onClick={() => setSelectedCharacter(character)}
                >
                  <img
                    src={`/assets/characters/${fileName}.svg`}
                    alt={character}
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
              )
            })}
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={handleCharacterNext}
              disabled={!selectedCharacter}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Choose Window/Frame
  if (step === 'frame') {
    return (
      <div className="modal" onClick={onClose}>
        <div className="modal-content window-creation-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Choose Window</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>
          </div>

          {/* Preview Area */}
          <div className="form-group">
            <label>Preview</label>
            <div className="window-preview-large" style={{ backgroundColor: backgroundColor }}>
              {selectedCharacter && (
                <img
                  src={`/assets/characters/${encodeURIComponent(selectedCharacter)}.svg`}
                  alt={selectedCharacter}
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
              )}
              {selectedFrame && (
                <img
                  src={`/assets/frames/${selectedFrame}.svg`}
                  alt={selectedFrame}
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
              )}
            </div>
          </div>

          {/* Color Options */}
          <div className="form-group">
            <label>Color Version</label>
            <div className="preset-colors">
              {PRESET_COLORS.map((color) => (
                <div
                  key={color}
                  className={`color-swatch ${backgroundColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="custom-color">
              <label htmlFor="customColor">Custom Color:</label>
              <input
                type="color"
                id="customColor"
                value={customColor}
                onChange={(e) => handleColorSelect(e.target.value)}
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    handleColorSelect(e.target.value)
                  }
                }}
                placeholder="#FFFFFF"
                maxLength={7}
              />
            </div>
          </div>

          {/* Window Design Options */}
          <div className="form-group">
            <label>Window Designs</label>
            <div className="frame-selection-grid">
              {FRAMES.map((frame) => (
                <div
                  key={frame}
                  className={`frame-selection-item ${selectedFrame === frame ? 'selected' : ''}`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  <img
                    src={`/assets/frames/${frame}.svg`}
                    alt={frame}
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
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={handleFrameNext}
              disabled={!selectedFrame}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Write Letter
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content window-creation-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Write Your Letter</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="visitorName">From:</label>
            <input
              type="text"
              id="visitorName"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Your name..."
              maxLength={30}
              required
              style={{
                backgroundColor: backgroundColor,
                fontSize: '22px'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="letterContent">Message</label>
            <textarea
              id="letterContent"
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              placeholder=" Write your letter..."
              maxLength={500}
              required
              style={{ 
                height: '300px',
                minHeight: '300px',
                maxHeight: '300px',
                fontFamily: 'inherit',
                fontSize: '22px',
                backgroundColor: backgroundColor,
                overflowY: 'auto',
                resize: 'none'
              }}
            />
          </div>

          {/* Show design preview */}
          {selectedCharacter && selectedFrame && (
            <div className="form-group">
              <label>Your Window Design</label>
              <div className="window-preview" style={{ backgroundColor: backgroundColor }}>
                <img
                  src={`/assets/characters/${encodeURIComponent(selectedCharacter)}.svg`}
                  alt={selectedCharacter}
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
                  src={`/assets/frames/${selectedFrame}.svg`}
                  alt={selectedFrame}
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
          )}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={handleBack}>
              Back
            </button>
            <button type="submit" className="primary-btn">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
