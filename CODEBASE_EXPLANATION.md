# Codebase Explanation - Decorate My House

## 📁 Project Structure

```
winter_soph/
├── app/                    # Next.js 14 App Router directory
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Home page (wraps HomeContent in Suspense)
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── AuthModal.tsx      # Login/Signup modal
│   ├── ChristmasCountdown.tsx  # Countdown timer component
│   ├── HomeContent.tsx    # Main page content (orchestrates everything)
│   ├── HouseSetupModal.tsx # House creation/edit modal
│   ├── LetterViewModal.tsx # Modal to view letter content
│   ├── PlacedWindow.tsx   # Individual window component (3:4 ratio)
│   ├── WindowGrid.tsx     # 3x3 grid layout with pagination
│   ├── WindowLetterModal.tsx # Three-step modal: character → frame → letter
│   └── WindowsPalette.tsx # (Legacy - not used)
├── contexts/
│   └── AuthContext.tsx    # Authentication context provider
├── hooks/
│   └── useHouse.ts        # Custom hook for house data management
├── lib/
│   ├── auth.ts            # Christmas date/timezone utilities
│   ├── imageUtils.ts      # Image path helpers (SVG fallback)
│   └── supabase.ts        # Supabase client + TypeScript types
├── public/
│   └── assets/            # SVG assets
│       ├── houses/        # 6 house files (house A1-A3, B1-B3)
│       ├── characters/    # 21 character files (Frame 1-22, Frame 7 missing)
│       └── frames/        # 6 frame files (window1-3, window1b-3b)
└── supabase/
    └── schema.sql         # Database schema definition
```

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Styling**: CSS (globals.css)
- **Assets**: SVG (with PNG fallback)

## 🏗 Architecture Overview

### Core Concept
**Windows = Letters**: Each window on a house IS a letter written by a visitor. The window design (character + frame + background color) is chosen by the visitor, and clicking the window reveals the letter content (after Christmas for the owner).

### Visual Layout
- Windows are **layered on top** of the house image (z-index: 10)
- Windows use a **3:4 ratio** (60px width × 80px height)
- **3x3 grid** = 9 positions per page
- **Pagination arrows** appear when there are more than 9 windows
- Sequential positioning: 1-9 (page 1), 10-18 (page 2), etc.

### Data Model

**Houses Table** (`houses`)
```sql
- id: UUID (primary key)
- owner_id: UUID → references auth.users
- name: TEXT (house name)
- house_type: TEXT ('house1' through 'house6')
- timezone: TEXT (e.g., 'America/New_York')
- created_at, updated_at: TIMESTAMP
```

**Windows Table** (`windows`)
```sql
- id: UUID (primary key)
- house_id: UUID → references houses
- character_type: TEXT ('character1' through 'character22')
- frame_design: TEXT ('window1', 'window1b', 'window2', 'window2b', 'window3', 'window3b')
- background_color: TEXT (hex color)
- grid_position: INTEGER (auto-assigned: 1, 2, 3, ...)
- visitor_name: TEXT (name of letter writer)
- letter_content: TEXT (the letter message)
- created_at: TIMESTAMP
- UNIQUE(house_id, grid_position)
```

### User Roles

**1. Owner** (authenticated user who created the house)
- ✅ Can view/edit house settings
- ✅ Can view letters **after Christmas** (timezone-based)
- ✅ Can delete windows
- ❌ **Cannot create windows** (only visitors can)
- Sees: Christmas countdown, house editor, all windows

**2. Visitor** (anyone accessing via shared link)
- ✅ Can view house and window designs
- ✅ Can create windows by clicking "Write a Letter" button
- ✅ Can choose character, frame, color, and write letter
- ❌ Cannot view letter content (always locked for visitors)
- ❌ Cannot delete windows
- Sees: House with windows, "Write a Letter" button

## 🔄 Complete Data Flow

### Visitor Creates a Window/Letter

```
1. Visitor clicks "Write a Letter and Join the House!" button
   ↓
2. WindowLetterModal opens (3 steps):
   
   STEP 1: Pick Character
   - Grid of 21 character options (Frame 1-22 SVGs)
   - Visitor selects one character
   - Click "Next" →
   
   STEP 2: Choose Window
   - Preview of selected character
   - Grid of 6 frame options (window1-3, variants)
   - Color picker (18 presets + custom)
   - Live preview shows character + frame + color
   - Click "Next" →
   
   STEP 3: Write Letter
   - Input: visitor name (max 30 chars)
   - Textarea: letter content (max 500 chars)
   - Shows final design preview
   - Click "Send" →
   
3. handleWindowLetterSave() in HomeContent
   ↓
4. addWindow() in useHouse hook:
   - Calculates next available position (auto-assign)
   - Inserts into windows table via Supabase
   ↓
5. Supabase validates & inserts:
   - Checks character_type constraint
   - Checks frame_design constraint
   - Assigns grid_position sequentially
   ↓
6. Hook updates local state → windows array
   ↓
7. WindowGrid re-renders → New window appears on house
```

### Owner Views Letter (After Christmas)

```
1. Owner clicks on a window in WindowGrid
   ↓
2. handleWindowClick() in HomeContent
   ↓
3. LetterViewModal opens with window data
   ↓
4. Modal checks: isOwner && isChristmasPassed(house.timezone)
   ↓
5a. IF true (after Christmas):
    - Shows window design preview
    - Shows visitor name
    - Shows letter content
    - Shows timestamp
    
5b. IF false (before Christmas):
    - Shows locked message
    - Shows countdown to Christmas
```

## 📦 Key Components Explained

### 1. `HomeContent.tsx` (Main Orchestrator) ⭐

**Purpose**: Primary component that orchestrates entire application

**Key Responsibilities**:
- Determines user role (owner vs visitor)
- Manages all modal states
- Handles house creation/editing
- Coordinates window/letter creation
- Renders different UI based on role

**State Management**:
```typescript
const [showAuthModal, setShowAuthModal] = useState(false)
const [showSetupModal, setShowSetupModal] = useState(false)
const [showWindowLetterModal, setShowWindowLetterModal] = useState(false)
const [showLetterViewModal, setShowLetterViewModal] = useState(false)
const [selectedWindow, setSelectedWindow] = useState<Window | null>(null)
const [shareCopied, setShareCopied] = useState(false)
```

**Key Functions**:
- `handleWriteLetterClick()`: Opens window/letter modal for visitors
- `handleWindowClick(window)`: Opens letter view modal when clicking existing window
- `handleWindowLetterSave()`: Saves new window/letter via useHouse hook
- `handleShare()`: Copies share URL to clipboard

**Conditional Rendering**:
```typescript
// Owner View
- Header with Edit House, Share, Logout buttons
- ChristmasCountdown component
- House with WindowGrid
- Info section about letters

// Visitor View
- Header with Login button (optional)
- House with WindowGrid
- "Write a Letter and Join the House!" button
```

### 2. `useHouse.ts` (Data Management Hook) ⭐

**Purpose**: Centralized hook for all house and window data operations

**State**:
```typescript
const [house, setHouse] = useState<House | null>(null)
const [windows, setWindows] = useState<Window[]>([])
const [loading, setLoading] = useState(true)
const [role, setRole] = useState<UserRole>('visitor')
```

**Key Functions**:

**`loadHouse(houseId)`**
- Fetches house and all windows from Supabase
- Determines if user is owner by comparing `user.id` with `house.owner_id`
- Sets role state ('owner' or 'visitor')

**`createHouse(name, houseType, timezone)`**
- Creates new house (requires authentication)
- Links to current user via `owner_id`
- Returns created house

**`updateHouse(houseId, name, houseType, timezone)`**
- Updates existing house (owner only)
- Updates `updated_at` timestamp

**`addWindow(houseId, characterType, frameDesign, backgroundColor, visitorName, letterContent)`**
- **Auto-assigns next available grid position**
- Calculates next position by finding gaps in existing positions
- Inserts window into database
- Updates local state with sorted windows

**`deleteWindow(windowId)`**
- Deletes window (owner only)
- Updates local state

**Role Detection Logic**:
```typescript
const isOwner = user && house && user.id === house.owner_id
setRole(isOwner ? 'owner' : 'visitor')
```

### 3. `WindowGrid.tsx` (3x3 Grid with Pagination) ⭐

**Purpose**: Renders windows in a 3x3 grid with pagination support

**Grid System**:
```typescript
// 3 columns × 3 rows = 9 positions per page
const WINDOWS_PER_PAGE = 9

// Position to coordinates calculation:
const cols = 3
const rows = 3
const row = Math.floor((positionInPage - 1) / cols)
const col = (positionInPage - 1) % cols

// Example positions:
// Page 1: 1  2  3
//         4  5  6
//         7  8  9
// 
// Page 2: 10 11 12
//         13 14 15
//         16 17 18
```

**Pagination Logic**:
- Calculates total pages based on highest grid_position
- Shows arrows (‹ ›) when totalPages > 1
- Filters windows for current page
- Centers windows in cells (60×80 windows in calculated cell size)

**Features**:
- Responsive positioning based on container size
- Click handler for existing windows → opens LetterViewModal
- Smooth transitions between pages
- Page indicator shows "1 / 3" format

### 4. `WindowLetterModal.tsx` (3-Step Creation Flow) ⭐

**Purpose**: Visitor creates window design and writes letter

**Step State Management**:
```typescript
const [step, setStep] = useState<'character' | 'frame' | 'letter'>('character')
const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
const [visitorName, setVisitorName] = useState('')
const [letterContent, setLetterContent] = useState('')
```

**Step 1: Character Selection**
- Displays 21 characters in scrollable grid (3 columns)
- Character files: "Frame 1.svg" through "Frame 22.svg" (Frame 7 missing)
- Selected character highlighted with border
- "Next" button disabled until selection made

**Step 2: Frame & Color Selection**
- Large preview showing selected character
- 6 frame options in grid
- Color picker section:
  - 18 preset colors
  - Custom color picker
  - Hex input field
- Live preview updates as user changes selections

**Step 3: Letter Writing**
- Name input field (required, max 30 chars)
- Letter textarea (required, max 500 chars)
- Design preview shows final window appearance
- "Send" button submits all data

**Data Transformation**:
```typescript
// Convert display name to database format
"Frame 10" → "character10"

// Submit data structure:
{
  character: 'character10',
  frame: 'window1',
  backgroundColor: '#FFE4E1',
  visitorName: 'Jane',
  letterContent: 'Merry Christmas!'
}
```

### 5. `PlacedWindow.tsx` (Individual Window)

**Purpose**: Renders a single window with 3:4 ratio

**Structure**:
```html
<div className="window-placed" style={{ left: x, top: y }}>
  <div className="window-content" style={{ 
    backgroundColor: backgroundColor,
    width: '60px',
    height: '80px'
  }}>
    <!-- Character Layer (z-index: 1) -->
    <img src="/assets/characters/Frame 10.svg" />
    
    <!-- Frame Layer (z-index: 2) -->
    <img src="/assets/frames/window1.svg" />
  </div>
</div>
```

**Visual Features**:
- 3:4 aspect ratio (60×80 pixels)
- Background color fills entire window
- Character image centered (object-fit: contain)
- Frame overlays character (object-fit: cover)
- Hover effect: scales to 1.1x with enhanced shadow
- Border glow on hover

### 6. `LetterViewModal.tsx` (Letter Display)

**Purpose**: Shows letter content when window is clicked

**Visibility Logic**:
```typescript
const canViewLetter = isOwner && isChristmasPassed(houseTimezone)
```

**Display Modes**:

**IF canViewLetter (Owner + After Christmas)**:
- Window design preview (60×80 with character + frame + color)
- Visitor name header
- Letter content in styled box
- Timestamp showing when letter was sent

**IF NOT canViewLetter**:
- Window design preview
- Locked message: "This letter is locked until Christmas"
- Different message for owner vs non-owner visitors

### 7. `HouseSetupModal.tsx` (House Creation/Edit)

**Purpose**: Create new house or edit existing house settings

**Fields**:
- House name input (max 50 chars)
- Timezone selector (11 common timezones)
- House selection grid (6 house options)

**House Type Mapping**:
```typescript
const HOUSE_TYPES = [
  { value: 'house1', file: 'house A1' },
  { value: 'house2', file: 'house A2' },
  { value: 'house3', file: 'house A3' },
  { value: 'house4', file: 'house B1' },
  { value: 'house5', file: 'house B2' },
  { value: 'house6', file: 'house B3' },
]
```

**Usage**:
- Create mode: Shows "Create House" button
- Edit mode: Pre-fills with existing house data, shows "Update House" button

### 8. `AuthContext.tsx` (Authentication Provider)

**Purpose**: Global authentication state management

**Provides**:
```typescript
{
  user: User | null,           // Current authenticated user
  loading: boolean,            // Auth initialization loading
  signOut: () => Promise<void> // Logout function
}
```

**Real-time Auth**:
- Subscribes to Supabase auth state changes
- Auto-updates when user logs in/out
- Persists across page refreshes

**Usage**:
```typescript
const { user, loading, signOut } = useAuth()

// Check if authenticated
if (user) { /* show owner features */ }

// Logout
await signOut()
```

### 9. `lib/auth.ts` (Christmas Date Logic) ⭐

**Purpose**: Timezone-aware Christmas date calculations

**Key Functions**:

**`isChristmasPassed(timezone: string): boolean`**
- Checks if current date is after December 25 in given timezone
- Uses `Intl.DateTimeFormat` for timezone conversion
- Returns true if Christmas has passed, false otherwise

**`getTimeUntilChristmas(timezone: string)`**
- Calculates days, hours, minutes, seconds until Christmas
- If current year's Christmas passed, calculates for next year
- Used by ChristmasCountdown component

**Example**:
```typescript
// House in New York timezone
isChristmasPassed('America/New_York') 
// Returns true after 12:00 AM EST on Dec 25

// House in Tokyo timezone
isChristmasPassed('Asia/Tokyo')
// Returns true after 12:00 AM JST on Dec 25 (16 hours earlier than NY)
```

### 10. `lib/imageUtils.ts` (Image Loading Helpers)

**Purpose**: Helper functions for SVG/PNG image loading

**Functions**:

**`getImagePath(basePath, type, extension)`**
- Constructs image path
- Defaults to '.svg' extension

**`handleImageError(e, fallbackExtension)`**
- Tries PNG if SVG fails
- Hides image if both fail
- Optionally shows alt text

**Usage**:
```typescript
<img 
  src={getImagePath('/assets/characters', 'Frame 1', 'svg')}
  onError={handleImageError}
/>
```

## 🔐 Security & Permissions

### Row Level Security (RLS) Policies

**Houses Table**:
```sql
-- Anyone can view houses
CREATE POLICY "Allow public read access" ON houses 
  FOR SELECT USING (true);

-- Only authenticated users can create (as owner)
CREATE POLICY "Allow authenticated users to create houses" ON houses 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Only owner can update their house
CREATE POLICY "Allow owners to update their houses" ON houses 
  FOR UPDATE USING (auth.uid() = owner_id);
```

**Windows Table**:
```sql
-- Anyone can view windows
CREATE POLICY "Allow public read access" ON windows 
  FOR SELECT USING (true);

-- Anyone can create windows (visitors add letters)
CREATE POLICY "Allow public to create windows" ON windows 
  FOR INSERT WITH CHECK (true);

-- Only house owner can delete windows
CREATE POLICY "Allow owners to delete windows" ON windows 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM houses 
      WHERE houses.id = windows.house_id 
      AND houses.owner_id = auth.uid()
    )
  );
```

### Application-Level Security

**Letter Content Visibility**:
- Controlled in `LetterViewModal.tsx`
- Check: `isOwner && isChristmasPassed(timezone)`
- Visitors can never view letter content
- Owners see "locked" message before Christmas

**House Management**:
- Create house requires authentication
- Role detection in `useHouse` hook
- UI conditionally renders based on role

## 🎨 Asset System

### File Structure & Naming

**Houses** (6 files):
```
public/assets/houses/
├── house A1.svg   → database: 'house1'
├── house A2.svg   → database: 'house2'
├── house A3.svg   → database: 'house3'
├── house B1.svg   → database: 'house4'
├── house B2.svg   → database: 'house5'
└── house B3.svg   → database: 'house6'
```

**Characters** (21 files - Frame 7 missing):
```
public/assets/characters/
├── Frame 1.svg    → database: 'character1'
├── Frame 2.svg    → database: 'character2'
...
├── Frame 8.svg    → database: 'character8'  (Frame 7 missing)
...
└── Frame 22.svg   → database: 'character22'
```

**Frames** (6 files):
```
public/assets/frames/
├── window1.svg    → database: 'window1'
├── window1b.svg   → database: 'window1b'
├── window2.svg    → database: 'window2'
├── window2b.svg   → database: 'window2b'
├── window3.svg    → database: 'window3'
└── window3b.svg   → database: 'window3b'
```

### File Name Encoding

**Problem**: File names contain spaces ("Frame 1.svg", "house A1.svg")

**Solution**: `encodeURIComponent()` for URL encoding
```typescript
// Character
`/assets/characters/${encodeURIComponent('Frame 1')}.svg`
// → /assets/characters/Frame%201.svg

// House
const mapping = { 'house1': 'house A1' }
`/assets/houses/${encodeURIComponent(mapping[houseType])}.svg`
// → /assets/houses/house%20A1.svg
```

### Layering System

**Window Composition** (3 layers):
1. **Background**: Solid color (`backgroundColor`)
2. **Character** (z-index: 1): SVG with `object-fit: contain`
3. **Frame** (z-index: 2): SVG with `object-fit: cover`

**Result**: Character visible through transparent parts of frame

**House + Windows Layering**:
- House image: `z-index: 1`
- Window grid container: `z-index: 10`
- Individual windows: `z-index: 10` (hover: `z-index: 100`)

## 🔄 State Management Strategy

### React State (Local Component State)
- Modal visibility states
- Form inputs (name, letter content, selections)
- UI states (hover, loading, page numbers)
- Ephemeral data that doesn't need persistence

### Supabase (Server State - Source of Truth)
- Houses data
- Windows/letters data
- User authentication
- All persistent data

### Context (Global State)
- **AuthContext**: User authentication status
- No global state library (Redux, Zustand) needed
- Props drilling minimized by using hooks

### Data Flow Pattern
```
Component → Hook → Supabase → Database
                     ↓
             Update local state
                     ↓
             Trigger re-render
```

## 📍 Routing & Navigation

### URL Structure

**Owner View**: `/`
- Redirects to house creation if not logged in or no house
- Loads owner's house if authenticated and house exists

**Visitor View**: `/?house={houseId}`
- Loads specific house by ID from URL param
- Works for anyone (no auth required)
- Shows visitor UI with "Write a Letter" button

### Share URL Generation

```typescript
const shareUrl = `${window.location.origin}?house=${house.id}`
// Example: https://myapp.com?house=59524d91-7d5f-4c87-9fec-d239ab2a2c75
```

### Next.js App Router Details

**`app/page.tsx`**:
```typescript
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
```
*Suspense required because `HomeContent` uses `useSearchParams()`*

**`app/layout.tsx`**:
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```
*AuthProvider wraps entire app for auth state*

## 🎯 Key Features Deep Dive

### 1. Auto-Position Assignment

**Problem**: Visitors shouldn't manually select positions

**Solution**: Sequential auto-assignment in `addWindow()`
```typescript
// Get existing positions
const existingPositions = windows.map(w => w.grid_position).sort((a, b) => a - b)

// Find next available position
let nextPosition = 1
for (const pos of existingPositions) {
  if (pos === nextPosition) {
    nextPosition++
  } else {
    break  // Found a gap
  }
}

// Use nextPosition for new window
```

**Example**:
- Existing: [1, 2, 3, 5] → Next: 4 (fills gap)
- Existing: [1, 2, 3, 4] → Next: 5 (sequential)

### 2. Pagination System

**Trigger**: When windows.length > 9

**Page Calculation**:
```typescript
const totalPages = Math.ceil(maxPosition / WINDOWS_PER_PAGE)
const pageStart = currentPage * WINDOWS_PER_PAGE + 1
const pageEnd = (currentPage + 1) * WINDOWS_PER_PAGE

// Filter windows for current page
const currentPageWindows = windows.filter(
  w => w.grid_position >= pageStart && w.grid_position <= pageEnd
)
```

**Navigation**:
- Previous arrow (‹): Disabled on first page
- Next arrow (›): Disabled on last page
- Page indicator: "2 / 5" format

### 3. Timezone-Based Christmas Logic

**Goal**: Each house has its own Christmas based on selected timezone

**Implementation**:
```typescript
// Convert current date to house's timezone
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const parts = formatter.formatToParts(new Date())
const month = parseInt(parts.find(p => p.type === 'month').value)
const day = parseInt(parts.find(p => p.type === 'day').value)

// Check if after Dec 25
return (month === 12 && day >= 25) || month > 12
```

**Result**: Letters unlock at different times for different houses

### 4. 3:4 Window Ratio

**Design Requirement**: Windows should be taller than wide

**Implementation**:
- Width: 60px
- Height: 80px
- Ratio: 60:80 = 3:4

**CSS**:
```css
.window-content {
  width: 60px;
  height: 80px;
  position: relative;
  border-radius: 4px;
}
```

**Grid Positioning**: Centers 60×80 windows in calculated cell sizes

## 🐛 Error Handling

### Database Constraint Errors

**Unique Position Constraint**:
```sql
UNIQUE(house_id, grid_position)
```
If violated, Supabase returns error code 23505

**Character Type Constraint**:
```sql
CHECK (character_type IN ('character1', ...))
```
Returns error if invalid character submitted

**Frame Design Constraint**:
```sql
CHECK (frame_design IN ('window1', 'window1b', ...))
```
Returns 400 error if invalid frame name

### Image Loading Fallbacks

**SVG → PNG → Hide**:
```typescript
onError={(e) => {
  const target = e.target as HTMLImageElement
  if (target.src.endsWith('.svg')) {
    target.src = target.src.replace('.svg', '.png')
  } else {
    target.style.display = 'none'
  }
}}
```

### Authentication Errors

**Not Logged In**:
- Creating house → Shows AuthModal
- Accessing owner features → Prompts login

**Not Owner**:
- Trying to edit house → Blocked by UI role check
- Trying to delete window → Blocked by RLS policy

## 🎨 Styling Architecture

### Global Styles (`app/globals.css`)

**Component Patterns**:
- Modal overlays with backdrop
- Grid layouts for selections
- Hover effects and transitions
- Responsive design for mobile

**Key CSS Classes**:
```css
.house-container          /* Container for house + windows */
.house-image             /* House SVG (z-index: 1) */
.window-grid-container   /* Grid overlay (z-index: 10) */
.window-placed           /* Individual window positioning */
.window-content          /* 60×80 window with layers */
.window-nav-arrow        /* Pagination arrows */
.modal                   /* Modal backdrop */
.modal-content           /* Modal card */
```

**Z-Index Hierarchy**:
```
1   - House image
10  - Window grid container
10  - Individual windows
100 - Hovered window
999 - Modal backdrop
1000 - Modal content
```

## 📝 Database Schema Details

### Indexes for Performance

```sql
CREATE INDEX idx_houses_owner_id ON houses(owner_id);
CREATE INDEX idx_windows_house_id ON windows(house_id);
CREATE INDEX idx_windows_created_at ON windows(created_at DESC);
```

**Purpose**:
- `idx_houses_owner_id`: Fast owner lookup
- `idx_windows_house_id`: Fast window queries by house
- `idx_windows_created_at`: Ordered window display

### Constraints & Validation

**Houses**:
- `house_type` must be one of 6 valid values
- `owner_id` must reference existing user

**Windows**:
- `character_type` must be 'character1' through 'character22'
- `frame_design` must be one of 6 window types
- `background_color` must be valid hex color (app-level validation)
- `(house_id, grid_position)` must be unique
- `visitor_name` max 30 characters
- `letter_content` max 500 characters

### Cascade Deletes

```sql
owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
house_id UUID REFERENCES houses(id) ON DELETE CASCADE
```

**Behavior**:
- Delete user → Delete their houses → Delete all windows
- Delete house → Delete all its windows

## 🚀 Key Workflows

### New User Creates House

```
1. Visit / (not logged in)
   ↓
2. See "Create Your House" prompt
   ↓
3. Click "Create House" → AuthModal opens
   ↓
4. Sign up with email/password
   ↓
5. AuthContext updates with new user
   ↓
6. HouseSetupModal automatically opens
   ↓
7. Enter name, select timezone, pick house
   ↓
8. Click "Create House"
   ↓
9. useHouse.createHouse() → Supabase insert
   ↓
10. House appears, owner view enabled
```

### Visitor Leaves Letter

```
1. Receive share link: /?house={id}
   ↓
2. Load house in visitor mode
   ↓
3. Click "Write a Letter and Join the House!"
   ↓
4. WindowLetterModal opens
   ↓
5. STEP 1: Select character from grid
   ↓
6. STEP 2: Select frame + color, see preview
   ↓
7. STEP 3: Write name + letter
   ↓
8. Click "Send"
   ↓
9. useHouse.addWindow() with auto-assigned position
   ↓
10. Window appears on house immediately
   ↓
11. Modal closes, success message shown
```

### Owner Reads Letter After Christmas

```
1. Owner visits their house
   ↓
2. ChristmasCountdown shows "Christmas has passed!"
   ↓
3. Owner clicks window on house
   ↓
4. LetterViewModal opens
   ↓
5. Modal checks: isOwner ✓ && isChristmasPassed() ✓
   ↓
6. Letter content revealed
   ↓
7. Shows: visitor name, message, timestamp
```

## 🔍 Debugging Tips

### Check Database State
```sql
-- View all houses
SELECT * FROM houses;

-- View windows for specific house
SELECT * FROM windows WHERE house_id = 'xxx' ORDER BY grid_position;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('houses', 'windows');
```

### Common Issues

**"Error adding window" (400)**:
- Check character_type value (must be 'character1'-'character22')
- Check frame_design value (must be 'window1', 'window1b', etc.)
- Check unique constraint on (house_id, grid_position)

**Images not loading**:
- Verify file names match (case-sensitive)
- Check for spaces in filenames (use encodeURIComponent)
- Ensure SVG files are in correct directory

**Letters not visible to owner**:
- Check timezone setting for house
- Verify isChristmasPassed() logic
- Ensure Christmas date has passed in house's timezone

## 📚 Important Files to Understand

**Start with these in order**:

1. **`supabase/schema.sql`** - Database structure
2. **`lib/supabase.ts`** - TypeScript types
3. **`components/HomeContent.tsx`** - Main app flow
4. **`hooks/useHouse.ts`** - Data operations
5. **`components/WindowGrid.tsx`** - Grid system
6. **`components/WindowLetterModal.tsx`** - Creation flow
7. **`lib/auth.ts`** - Christmas logic

## 🎓 Design Decisions

### Why Windows = Letters?
- Simplifies data model (no separate tables)
- Natural metaphor (letter inside window)
- Reduces database queries

### Why Auto-Position?
- Prevents position conflicts
- Simpler visitor experience
- Ensures sequential filling

### Why 3x3 Grid with Pagination?
- Clean layout that works on all screen sizes
- Easy to navigate with arrows
- Prevents cluttered UI

### Why 3-Step Modal?
- Breaks complex task into manageable steps
- Allows focusing on one decision at a time
- Provides clear progress indication

### Why Timezone-Based Christmas?
- Fair for international users
- Owner chooses their own timezone
- Consistent experience for all visitors

## 🌟 Summary

This codebase implements a **house decoration + letter collection** system where:

- **Owners** create houses and receive letters after Christmas
- **Visitors** write letters by creating decorative windows
- **Windows** are arranged in a 3×3 grid with pagination
- **Letters** are locked until Christmas (timezone-aware)
- **Everything** is backed by Supabase with RLS security

The architecture is **component-based** with clear separation between UI, data management, and business logic. The grid system is **responsive and paginated**, and the window creation process is **guided through 3 clear steps**.

All assets are **SVG-based** with PNG fallbacks, and the entire system works **without authentication required for visitors** while providing **secure owner-only features** for authenticated users.
