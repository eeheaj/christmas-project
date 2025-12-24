import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'MISSING')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
)

// Database types
export interface House {
  id: string
  owner_id: string
  name: string
  house_type: string // 'house1' | 'house2' | 'house3' | 'house4' | 'house5' | 'house6'
  timezone: string
  created_at: string
  updated_at: string
}

export type UserRole = 'owner' | 'visitor'

export interface Window {
  id: string
  house_id: string
  character_type: string // 'character1' through 'character21'
  frame_design: string // 'window1', 'window1b', 'window2', 'window2b', 'window3', 'window3b'
  background_color: string // hex color code
  grid_position: number // Sequential position (1, 2, 3, ...) displayed in 3x3 grids (9 per page)
  visitor_name: string // Name of visitor who wrote the letter
  letter_content: string // The letter content
  created_at: string
}

