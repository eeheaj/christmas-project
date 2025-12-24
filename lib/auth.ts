import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  user: User | null
  loading: boolean
}

// Check if Christmas has passed in the given timezone
export function isChristmasPassed(timezone: string): boolean {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // Create a date for Christmas at midnight in the given timezone
  const christmasDate = new Date(`${currentYear}-12-25T00:00:00`)
  
  // Convert to the user's timezone for comparison
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  
  // Get current date/time in the timezone
  const nowInTimezone = new Date(formatter.format(now))
  const christmasInTimezone = new Date(formatter.format(christmasDate))
  
  // If we're past December 25th in that timezone, Christmas has passed
  return nowInTimezone >= christmasInTimezone
}

// Get time until Christmas in the given timezone
export function getTimeUntilChristmas(timezone: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  hasPassed: boolean
} {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // Create Christmas date for current year
  let christmasDate = new Date(`${currentYear}-12-25T00:00:00`)
  
  // If Christmas has passed this year, use next year
  if (isChristmasPassed(timezone)) {
    christmasDate = new Date(`${currentYear + 1}-12-25T00:00:00`)
  }
  
  // Convert to milliseconds in UTC, then adjust for timezone
  const nowMs = now.getTime()
  const christmasMs = christmasDate.getTime()
  
  // Calculate difference in milliseconds
  const diffMs = christmasMs - nowMs
  
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasPassed: true }
  }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, hasPassed: false }
}

