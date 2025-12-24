-- Decorate My House Database Schema
-- Run this in your Supabase SQL Editor

-- Note: Supabase Auth handles the auth.users table automatically
-- We link houses to auth.users via owner_id

-- Create houses table
CREATE TABLE IF NOT EXISTS houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  house_type TEXT NOT NULL CHECK (house_type IN ('house1', 'house2', 'house3', 'house4', 'house5', 'house6')),
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create windows table (windows ARE the letters)
-- grid_position: Auto-assigned sequential position (1, 2, 3, ...)
-- Windows are displayed in 3x3 grids (9 positions per page)
-- Position mapping for 3x3: row = floor((grid_position - 1) / 3), col = (grid_position - 1) % 3
-- Each window contains a letter written by a visitor
-- Positions are auto-assigned (visitors don't choose)
CREATE TABLE IF NOT EXISTS windows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  character_type TEXT NOT NULL CHECK (character_type IN ('character1', 'character2', 'character3', 'character4', 'character5', 'character6', 'character7', 'character8', 'character9', 'character10', 'character11', 'character12', 'character13', 'character14', 'character15', 'character16', 'character17', 'character18', 'character19', 'character20', 'character21', 'character22')),
  frame_design TEXT NOT NULL CHECK (frame_design IN ('window1', 'window1b', 'window2', 'window2b', 'window3', 'window3b')),
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  grid_position INTEGER NOT NULL,
  visitor_name TEXT NOT NULL,
  letter_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(house_id, grid_position)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_houses_owner_id ON houses(owner_id);
CREATE INDEX IF NOT EXISTS idx_windows_house_id ON windows(house_id);
CREATE INDEX IF NOT EXISTS idx_windows_created_at ON windows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE windows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for houses
-- Anyone can read houses (to view them)
CREATE POLICY "Allow public read access" ON houses FOR SELECT USING (true);
-- Only authenticated users can create houses (they become owners)
CREATE POLICY "Allow authenticated users to create houses" ON houses FOR INSERT WITH CHECK (auth.uid() = owner_id);
-- Only owners can update their houses
CREATE POLICY "Allow owners to update their houses" ON houses FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for windows
-- Anyone can read windows (to view them) - but letter content visibility is controlled by app logic
CREATE POLICY "Allow public read access" ON windows FOR SELECT USING (true);
-- Anyone can create windows (visitors write letters by creating windows)
CREATE POLICY "Allow public to create windows" ON windows FOR INSERT WITH CHECK (true);
-- Only owners can delete windows
CREATE POLICY "Allow owners to delete windows" ON windows FOR DELETE USING (
  EXISTS (SELECT 1 FROM houses WHERE houses.id = windows.house_id AND houses.owner_id = auth.uid())
);

