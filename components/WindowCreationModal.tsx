'use client'

import { useState } from 'react'

interface WindowCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { character: string; frame: string; backgroundColor: string }) => void
}

const CHARACTERS = Array.from({ length: 21 }, (_, i) => `character${i + 1}`)
const FRAMES = Array.from({ length: 6 }, (_, i) => `frame${i + 1}`)

const PRESET_COLORS = [
  '#FFFFFF', '#FFE4E1', '#FFF0F5', '#E6E6FA', '#F0F8FF', '#E0F6FF',
  '#F0FFF0', '#FFFACD', '#FFE4B5', '#FFDAB9', '#FFC0CB', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#AED6F1', '#A3E4D7', '#F8C471', '#F1948A',
]

export default function WindowCreationModal({ isOpen, onClose, onSave }: WindowCreationModalProps) {
  const [selectedCharacter, setSelectedCharacter] = useState('character1')
  const [selectedFrame, setSelectedFrame] = useState('frame1')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [customColor, setCustomColor] = useState('#FFFFFF')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      character: selectedCharacter,
      frame: selectedFrame,
      backgroundColor: backgroundColor,
    })
    onClose()
  }

  const handleColorSelect = (color: string) => {
    setBackgroundColor(color)
    setCustomColor(color)
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content window-creation-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Window</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Character Selection */}
          <div className="form-group">
            <label>Character ({CHARACTERS.length} options)</label>
            <div className="selection-grid character-grid">
              {CHARACTERS.map((character) => (
                <div
                  key={character}
                  className={`selection-item character-item ${selectedCharacter === character ? 'selected' : ''}`}
                  onClick={() => setSelectedCharacter(character)}
                >
                  <img
                    src={`/assets/characters/${character}.svg`}
                    alt={character}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      // Try PNG fallback
                      if (target.src.endsWith('.svg')) {
                        target.src = target.src.replace('.svg', '.png')
                      } else {
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<span>${character.replace('character', 'C')}</span>`
                        }
                      }
                    }}
                  />
                  <span>{character.replace('character', 'C')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Frame Selection */}
          <div className="form-group">
            <label>Frame Design ({FRAMES.length} options)</label>
            <div className="selection-grid frame-grid">
              {FRAMES.map((frame) => (
                <div
                  key={frame}
                  className={`selection-item frame-item ${selectedFrame === frame ? 'selected' : ''}`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  <img
                    src={`/assets/frames/${frame}.svg`}
                    alt={frame}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      // Try PNG fallback
                      if (target.src.endsWith('.svg')) {
                        target.src = target.src.replace('.svg', '.png')
                      } else {
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<span>${frame.replace('frame', 'F')}</span>`
                        }
                      }
                    }}
                  />
                  <span>{frame.replace('frame', 'F')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Background Color Selection */}
          <div className="form-group">
            <label>Background Color</label>
            <div className="color-selection">
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
              <div
                className="color-preview"
                style={{ backgroundColor: backgroundColor }}
              >
                Preview
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="form-group">
            <label>Preview</label>
            <div className="window-preview" style={{ backgroundColor: backgroundColor }}>
              <img
                src={`/assets/characters/${selectedCharacter}.svg`}
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

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Add Window
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

