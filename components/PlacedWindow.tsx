'use client'

interface PlacedWindowProps {
  id: string
  characterType: string
  frameDesign: string
  backgroundColor: string
  x: number
  y: number
  width?: number
  height?: number
  onUpdate: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
}

export default function PlacedWindow({
  id,
  characterType,
  frameDesign,
  backgroundColor,
  x,
  y,
  width = 102,
  height = 136,
  onUpdate,
  onDelete,
}: PlacedWindowProps) {
  // Windows are now fixed to absolute positions based on house type
  
  return (
    <div
      className="window-placed"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div
        className="window-content"
        style={{
          backgroundColor: backgroundColor,
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Character Layer */}
        <img
          src={`/assets/characters/${encodeURIComponent(characterType.replace('character', 'Frame '))}.svg`}
          alt={characterType}
          className="window-character"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 1,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          draggable={false}
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
        {/* Frame Layer (overlay) */}
        <img
          src={`/assets/frames/${frameDesign}.svg`}
          alt={frameDesign}
          className="window-frame"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            pointerEvents: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          draggable={false}
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
      </div>
    </div>
  )
}
