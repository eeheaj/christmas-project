'use client'

import { useMemo, useState, useEffect } from 'react'
import { Window } from '@/lib/supabase'
import PlacedWindow from '@/components/PlacedWindow'

interface WindowGridProps {
  windows: Window[]
  onWindowClick: (window: Window) => void
  houseType: string
  currentPage?: number
  onPageChange?: (page: number) => void
  stageRef?: React.RefObject<HTMLDivElement>
  houseImageRef?: React.RefObject<HTMLImageElement>
}

// House container dimensions (house body area within the SVG)
const HOUSE_A_DIMENSIONS = { width: 340, height: 672 }
const HOUSE_B_DIMENSIONS = { width: 300, height: 561 }

// House container offset from top-left of image (where house body starts in SVG)
// These are used to position windows relative to the actual house asset location
const HOUSE_A_OFFSET = { left: 29, top: 96 }
const HOUSE_B_OFFSET = { left: 48, top: 219 }

// Global nudge to adjust window positions (x = right, y = up when negative)
const HOUSE_NUDGE = {
  house1: { x: 5, y: -25 },
  house2: { x: 5, y: -25 },
  house3: { x: 5, y: -25 },
  house4: { x: -3, y: -15},
  house5: { x: -3, y: -15},
  house6: { x: -3, y: -15 },
} as const

function getNudge(houseType: string) {
  return HOUSE_NUDGE[houseType as keyof typeof HOUSE_NUDGE] ?? { x: 0, y: 0 }
}

// Relative positions for windows on House A (house1, house2, house3)
// Main house body is w-[340px] h-[672px] at offset left-29px, top-96px from image origin
// Window positions are relative to the house body container area, centered horizontally
// Original size: 76x102 (3:4 ratio)
// Centered: 3 windows (76px each) with spacing, centered in 340px container
// Total width: 76*3 = 228px, with gaps of ~50px between windows
// To center: (340 - 228 - 50 - 50) / 2 = 6px offset, but using 32px for visual centering
const houseAWindowPositions = [
  // Row 1 (top) - centered horizontally
  { left: 32, top: 100, width: 76, height: 102 },
  { left: 132, top: 100, width: 76, height: 102 },
  { left: 232, top: 100, width: 76, height: 102 },
  // Row 2 (middle) - centered horizontally, increased gap
  { left: 32, top: 240, width: 76, height: 102 },
  { left: 132, top: 240, width: 76, height: 102 },
  { left: 232, top: 240, width: 76, height: 102 },
  // Row 3 (bottom) - centered horizontally, increased gap
  { left: 32, top: 380, width: 76, height: 102 },
  { left: 132, top: 380, width: 76, height: 102 },
  { left: 232, top: 380, width: 76, height: 102 },
]

// Relative positions for windows on House B (house4, house5, house6)
// Main house body is w-[300px] h-[561px] at offset left-48px, top-219px from image origin
// Window positions are relative to the house body container area, centered horizontally
// Original size: 70x95 (3:4 ratio)
// Centered: 3 windows (70px each) with spacing, centered in 300px container
// Total width: 70*3 = 210px, with gaps of ~50px between windows
// To center: (300 - 210 - 50 - 50) / 2 = -5px, but using 15px for visual centering
const houseBWindowPositions = [
  // Row 1 (top) - centered horizontally
  { left: 15, top: 40, width: 70, height: 95 },
  { left: 115, top: 40, width: 70, height: 95 },
  { left: 215, top: 40, width: 70, height: 95 },
  // Row 2 (middle) - centered horizontally, increased gap
  { left: 15, top: 170, width: 70, height: 95 },
  { left: 115, top: 170, width: 70, height: 95 },
  { left: 215, top: 170, width: 70, height: 95 },
  // Row 3 (bottom) - centered horizontally, increased gap
  { left: 15, top: 300, width: 70, height: 95 },
  { left: 115, top: 300, width: 70, height: 95 },
  { left: 215, top: 300, width: 70, height: 95 },
]

// Get house configuration based on house type
function getHouseConfig(houseType: string) {
  // House A types (house1, house2, house3)
  if (houseType === 'house1' || houseType === 'house2' || houseType === 'house3') {
    return {
      dimensions: HOUSE_A_DIMENSIONS,
      offset: HOUSE_A_OFFSET,
      positions: houseAWindowPositions,
    }
  }
  // House B types (house4, house5, house6)
  if (houseType === 'house4' || houseType === 'house5' || houseType === 'house6') {
    return {
      dimensions: HOUSE_B_DIMENSIONS,
      offset: HOUSE_B_OFFSET,
      positions: houseBWindowPositions,
    }
  }
  // Default to House A if unknown
  return {
    dimensions: HOUSE_A_DIMENSIONS,
    offset: HOUSE_A_OFFSET,
    positions: houseAWindowPositions,
  }
}

// Get position for a window based on its grid_position (1-9 for first page)
function getWindowPosition(houseType: string, gridPosition: number) {
  const config = getHouseConfig(houseType)
  const positions = config.positions
  
  // For pagination: positions repeat for every 9 windows
  // Position 1-9 use indices 0-8, position 10-18 use indices 0-8, etc.
  const positionIndex = (gridPosition - 1) % 9
  
  if (positionIndex < 0 || positionIndex >= positions.length) {
    return null
  }
  
  const relativePosition = positions[positionIndex]
  
  // Window positions are relative to the house body container area
  // Add the house container offset to position windows relative to the actual house asset location in the image
  const nudge = getNudge(houseType)
  
  return {
    ...relativePosition,
    left: relativePosition.left + config.offset.left + nudge.x,
    top: relativePosition.top + config.offset.top + nudge.y,
  }
}

export default function WindowGrid({ 
  windows, 
  onWindowClick, 
  houseType, 
  currentPage,
  onPageChange,
  stageRef,
  houseImageRef 
}: WindowGridProps) {
  const WINDOWS_PER_PAGE = 9
  const [internalPage, setInternalPage] = useState(1)
  const [imageOffset, setImageOffset] = useState({ left: 0, top: 0 })
  const [scaleFactor, setScaleFactor] = useState(1)
  
  // Use external page control if provided, otherwise use internal state
  const page = currentPage !== undefined ? currentPage : internalPage
  const setPage = onPageChange || setInternalPage

  // Calculate the actual position of the house image within the container AND scale factor
  useEffect(() => {
    const calculateImageOffset = () => {
      if (stageRef?.current && houseImageRef?.current) {
        const containerRect = stageRef.current.getBoundingClientRect()
        const imageRect = houseImageRef.current.getBoundingClientRect()
        
        setImageOffset({
          left: imageRect.left - containerRect.left,
          top: imageRect.top - containerRect.top,
        })

        // Calculate scale factor based on actual rendered image size vs natural size
        const config = getHouseConfig(houseType)
        const img = houseImageRef.current
        
        // Use the natural/intrinsic dimensions of the SVG
        // House A SVGs are approximately 398px wide, House B are approximately 396px wide
        const naturalWidth = houseType.startsWith('house1') || houseType.startsWith('house2') || houseType.startsWith('house3') 
          ? 398 
          : 396
        
        const actualWidth = imageRect.width
        
        // Scale factor = actual rendered size / natural size
        let scale = actualWidth / naturalWidth
        
        // Apply mobile multiplier to make windows smaller on mobile devices
        const isMobile = window.innerWidth <= 768
        if (isMobile) {
          scale = scale * 0.35 // Make windows 65% of calculated size on mobile
        }
        
        setScaleFactor(scale)
        
        console.log('Scale factor:', scale, 'Mobile:', isMobile, 'Actual width:', actualWidth, 'Natural width:', naturalWidth)
      }
    }

    // Calculate on mount and when window resizes
    calculateImageOffset()
    window.addEventListener('resize', calculateImageOffset)
    
    // Also recalculate when image loads
    const img = houseImageRef?.current
    if (img) {
      img.addEventListener('load', calculateImageOffset)
    }

    return () => {
      window.removeEventListener('resize', calculateImageOffset)
      if (img) {
        img.removeEventListener('load', calculateImageOffset)
      }
    }
  }, [stageRef, houseImageRef, houseType])

  // Sort windows by grid_position
  const sortedWindows = useMemo(() => {
    return [...windows].sort((a, b) => a.grid_position - b.grid_position)
  }, [windows])

  // Calculate pagination
  const totalPages = Math.ceil(sortedWindows.length / WINDOWS_PER_PAGE)
  
  // Show windows for current page (9 windows per page)
  const visibleWindows = useMemo(() => {
    const startIndex = (page - 1) * WINDOWS_PER_PAGE
    const endIndex = startIndex + WINDOWS_PER_PAGE
    return sortedWindows.slice(startIndex, endIndex)
  }, [sortedWindows, page])

  const hasPreviousPage = page > 1
  const hasNextPage = page < totalPages

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1)
    }
  }

  // Reset to page 1 if current page is beyond available pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
  }, [totalPages, page, setPage])

  return (
    <div className="window-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {totalPages > 1 && (
        <div className="window-grid-navigation" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 100, pointerEvents: 'auto' }}>
          <button
            className="window-nav-arrow"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="window-page-indicator">
            {page} / {totalPages}
          </span>
          <button
            className="window-nav-arrow"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
      
      {/* Render visible windows at exact positions, overlaid on house */}
      {visibleWindows.map((window) => {
        const position = getWindowPosition(houseType, window.grid_position)
        
        if (!position) return null

        // Scale positions and sizes based on actual house image size
        const scaledLeft = position.left * scaleFactor
        const scaledTop = position.top * scaleFactor
        const scaledWidth = position.width * scaleFactor
        const scaledHeight = position.height * scaleFactor

        // Apply the measured image offset to align windows with actual house position
        const adjustedLeft = scaledLeft + imageOffset.left
        const adjustedTop = scaledTop + imageOffset.top

        return (
          <div
            key={window.id}
            onClick={() => onWindowClick(window)}
            style={{ 
              cursor: 'pointer',
              position: 'absolute',
              left: `${adjustedLeft}px`,
              top: `${adjustedTop}px`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              zIndex: 10,
              pointerEvents: 'auto',
            }}
          >
            <PlacedWindow
              id={window.id}
              characterType={window.character_type}
              frameDesign={window.frame_design}
              backgroundColor={window.background_color}
              x={0}
              y={0}
              width={scaledWidth}
              height={scaledHeight}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
          </div>
        )
      })}
    </div>
  )
}
