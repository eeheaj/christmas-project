# Decorate My House

A Next.js application where users can select a house, decorate it with windows, and receive letters from visitors. Built with React, Next.js, and Supabase.

## Features

- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 👥 **Role-Based Access**: Two user roles:
  - **Owner**: Creates and decorates their house, can view letters after Christmas
  - **Visitor**: Can view houses and leave letters (letters hidden until Christmas)
- 🏠 **House Selection**: Choose from 6 different house designs
- 🪟 **Window Decoration**: Create custom windows by combining:
  - 21 different characters
  - 6 frame designs
  - Custom background colors
- ✉️ **Visitor Letters**: Visitors can leave letters with character messages
- 🎄 **Christmas Countdown**: Real-time countdown to Christmas based on house timezone
- 🌍 **Timezone Support**: Set your timezone for proper timestamp and countdown display
- 📤 **Share Functionality**: Share your house with a unique link
- 💾 **Supabase Integration**: All data persisted in Supabase database

## Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works great!)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase/schema.sql` (see below) to create the necessary tables

#### Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create houses table
CREATE TABLE IF NOT EXISTS houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  house_type TEXT NOT NULL CHECK (house_type IN ('house1', 'house2', 'house3', 'house4', 'house5', 'house6')),
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create windows table
CREATE TABLE IF NOT EXISTS windows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  character_type TEXT NOT NULL CHECK (character_type IN ('character1', 'character2', 'character3', 'character4', 'character5', 'character6', 'character7', 'character8', 'character9', 'character10', 'character11', 'character12', 'character13', 'character14', 'character15', 'character16', 'character17', 'character18', 'character19', 'character20', 'character21')),
  frame_design TEXT NOT NULL CHECK (frame_design IN ('frame1', 'frame2', 'frame3', 'frame4', 'frame5', 'frame6')),
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_windows_house_id ON windows(house_id);
CREATE INDEX IF NOT EXISTS idx_letters_house_id ON letters(house_id);
CREATE INDEX IF NOT EXISTS idx_letters_created_at ON letters(created_at DESC);

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing public read/write - adjust based on your needs)
CREATE POLICY "Allow public read access" ON houses FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON houses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON houses FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON windows FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON windows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON windows FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON windows FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON letters FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON letters FOR INSERT WITH CHECK (true);
```

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project settings
   - Navigate to API settings
   - Copy your Project URL and `anon` public key

3. Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Add Your Assets

Place your custom assets in the `public/assets/` directory:

```
public/
  assets/
    houses/
      house1.png through house6.png
    characters/
      character1.png through character21.png
    frames/
      frame1.png through frame6.png
```

See `public/assets/README.md` for detailed asset requirements.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── HouseSetupModal.tsx      # House setup/edit modal
│   ├── WindowCreationModal.tsx  # Window creation modal (character, frame, color)
│   ├── PlacedWindow.tsx         # Window component with drag functionality
│   ├── WindowsPalette.tsx       # Window palette with add button
│   └── LettersSection.tsx       # Letters display and input
├── hooks/
│   └── useHouse.ts              # Custom hook for house data management
├── lib/
│   └── supabase.ts              # Supabase client configuration
└── public/
    └── assets/                  # Your custom assets go here
        ├── houses/
        ├── characters/
        └── frames/
```

## Usage

### For House Owners:

1. **Create Account & House**:
   - Sign up or login with your email
   - Create your house by entering:
     - House name
     - Timezone (for Christmas countdown)
     - House design (1 of 6 options)

2. **Decorate Your House**:
   - Click "Add Window" button to open the window creation modal
   - Select a character (21 options)
   - Choose a frame design (6 options)
   - Pick a background color (preset colors or custom)
   - Click on your house to place the window at that location
   - Move windows by dragging them
   - Delete windows by hovering and clicking the × button

3. **Share Your House**:
   - Click "Share Your House" to copy the link
   - Share the link with visitors so they can leave letters

4. **View Letters**:
   - Letters from visitors are hidden until Christmas in your timezone
   - A countdown timer shows time remaining until letters become visible
   - After Christmas, all letters will be displayed

### For Visitors:

1. **Visit a House**:
   - Click on a shared house link
   - View the decorated house

2. **Leave a Letter**:
   - Enter your name
   - Write a letter message (up to 500 characters)
   - Submit your letter (it will be hidden until Christmas)
   - Create your own house by logging in!

4. **Edit Your House**:
   - Click "Edit House" to change the name, timezone, or house design

## Technologies Used

- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Supabase** - Backend as a service (database)
- **CSS3** - Styling with modern CSS features

## Deployment

You can deploy this app to Vercel (recommended for Next.js):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy!

Make sure to add your environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in your deployment platform's environment settings.

## License

MIT

# christmas-project
