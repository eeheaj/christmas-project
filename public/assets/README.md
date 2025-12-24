# Assets Directory

Place your custom assets here:

## Houses
Place 6 house SVG files in `houses/` directory:
- `house1.svg`
- `house2.svg`
- `house3.svg`
- `house4.svg`
- `house5.svg`
- `house6.svg`

## Characters
Place character SVG files in `characters/` directory:
- Files are named: `Frame 1.svg`, `Frame 2.svg`, etc. (up to Frame 22)
- Note: Frame 7.svg is missing in the current set

## Frames
Place 6 frame design SVG files in `frames/` directory:
- `window1.svg`
- `window1b.svg`
- `window2.svg`
- `window2b.svg`
- `window3.svg`
- `window3b.svg`

**All assets should be in SVG format** (PNG fallback is supported but SVG is preferred).

Recommended sizes:
- Houses: 600-800px wide (height will scale proportionally)
- Characters: Will be displayed at 80x80px, so design for that size
- Frames: Should be 80x80px to overlay properly on the character and background

**Window Layout:**
- Windows are arranged in 3x3 grids (9 positions per page)
- Positions are auto-assigned sequentially (1, 2, 3, ...)
- Grid displays 3 columns × 3 rows per page
- Navigation arrows appear when there are more than 9 windows (multiple pages)
- Visitors don't choose positions - they're automatically assigned
- Windows use a 3:4 ratio (60px × 80px)

Note: Windows are created by combining a character (background color + character image) with a frame overlay. The frame image should have transparency where the character shows through.

