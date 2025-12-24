'use client'

import { useState, useEffect } from 'react'
import { supabase, House, Window, UserRole } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { isChristmasPassed } from '@/lib/auth'

interface UseHouseProps {
  houseId?: string // If provided, load this specific house (for visitors)
}

export function useHouse(houseId?: string) {
  const { user } = useAuth()
  const [house, setHouse] = useState<House | null>(null)
  const [windows, setWindows] = useState<Window[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('visitor')

  const loadHouse = async () => {
    try {
      let houseData: House | null = null

      if (houseId) {
        // Load specific house (visitor viewing someone's house)
        const { data, error } = await supabase
          .from('houses')
          .select('*')
          .eq('id', houseId)
          .single()

        if (error) throw error
        houseData = data

        // Determine role
        if (user && houseData && houseData.owner_id === user.id) {
          setRole('owner')
        } else {
          setRole('visitor')
        }
      } else if (user) {
        // Load user's own house (owner)
        const { data, error } = await supabase
          .from('houses')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading house:', error)
          throw error
        }
        
        houseData = data || null

        if (houseData) {
          setRole('owner')
        } else {
          // No house found for this user
          setRole('owner') // Still an owner, just hasn't created house yet
        }
      } else {
        setLoading(false)
        return
      }

      if (houseData) {
        setHouse(houseData)

        // Load windows
        const { data: windowsData, error: windowsError } = await supabase
          .from('windows')
          .select('*')
          .eq('house_id', houseData.id)
          .order('created_at', { ascending: true })

        if (windowsError) throw windowsError
        setWindows(windowsData || [])
      } else {
        // Clear windows if no house
        setWindows([])
      }
    } catch (error) {
      console.error('Error loading house:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user || houseId) {
      loadHouse()
    } else {
      // Clear house data when user logs out
      setHouse(null)
      setWindows([])
      setRole('visitor')
      setLoading(false)
    }
  }, [user, houseId])

  const createHouse = async (name: string, houseType: string, timezone: string) => {
    if (!user) throw new Error('Must be authenticated to create a house')

    try {
      const { data, error } = await supabase
        .from('houses')
        .insert([{ name, house_type: houseType, timezone, owner_id: user.id }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setHouse(data)
        setRole('owner')
        setWindows([]) // Initialize empty windows array for new house
        return data
      }
    } catch (error) {
      console.error('Error creating house:', error)
      throw error
    }
  }

  const updateHouse = async (id: string, name: string, houseType: string, timezone: string) => {
    if (role !== 'owner') throw new Error('Only owners can update houses')

    try {
      const { data, error } = await supabase
        .from('houses')
        .update({ name, house_type: houseType, timezone, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('owner_id', user?.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setHouse(data)
        return data
      }
    } catch (error) {
      console.error('Error updating house:', error)
      throw error
    }
  }

  const addWindow = async (
    houseId: string,
    characterType: string,
    frameDesign: string,
    backgroundColor: string,
    visitorName: string,
    letterContent: string
  ) => {
    // Anyone can add windows (visitors create windows with letters)
    // Auto-assign next available position
    try {
      // Get all existing windows to find next position
      const existingPositions = windows.map(w => w.grid_position).sort((a, b) => a - b)
      
      // Find next available position (sequential: 1, 2, 3, ...)
      let nextPosition = 1
      for (const pos of existingPositions) {
        if (pos === nextPosition) {
          nextPosition++
        } else {
          break
        }
      }

      const { data, error } = await supabase
        .from('windows')
        .insert([{
          house_id: houseId,
          grid_position: nextPosition,
          character_type: characterType,
          frame_design: frameDesign,
          background_color: backgroundColor,
          visitor_name: visitorName,
          letter_content: letterContent,
        }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setWindows([...windows, data].sort((a, b) => a.grid_position - b.grid_position))
        return data
      }
    } catch (error) {
      console.error('Error adding window:', error)
      throw error
    }
  }

  const deleteWindow = async (id: string) => {
    if (role !== 'owner') throw new Error('Only owners can delete windows')

    try {
      const { error } = await supabase
        .from('windows')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWindows(windows.filter(w => w.id !== id))
    } catch (error) {
      console.error('Error deleting window:', error)
      throw error
    }
  }

  return {
    house,
    windows,
    loading,
    role,
    createHouse,
    updateHouse,
    addWindow,
    deleteWindow,
    reload: loadHouse,
  }
}
