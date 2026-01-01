import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  user: User | null
  loading: boolean
}

// Check if it's exactly Christmas Day (12/25) in the given timezone
export function isChristmasDay(timezone: string): boolean {
  const now = new Date()
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const parts = formatter.format(now).split('/')
  const month = parseInt(parts[0])
  const day = parseInt(parts[1])
  
  return month === 12 && day === 25
}

// Check if Christmas has passed for the year the house was created
export function isChristmasPassed(timezone: string, houseCreatedAt: string): boolean {
  const now = new Date()
  const createdDate = new Date(houseCreatedAt)
  const houseYear = createdDate.getFullYear()
  
  // Christmas of the year the house was created
  const christmasDate = new Date(`${houseYear}-12-25T23:59:59`)
  
  return now > christmasDate
}

// Get time until the NEXT Christmas in the given timezone
export function getTimeUntilChristmas(timezone: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  hasPassed: boolean
} {
  // Check if today is Christmas Day
  if (isChristmasDay(timezone)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasPassed: true }
  }
  
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // Create Christmas date for current year
  let christmasDate = new Date(`${currentYear}-12-25T00:00:00`)
  
  // If we've already passed Christmas this year, target next year's Christmas
  const nowMs = now.getTime()
  const christmasMs = christmasDate.getTime()
  
  if (nowMs > christmasMs) {
    christmasDate = new Date(`${currentYear + 1}-12-25T00:00:00`)
  }
  
  // Calculate difference in milliseconds
  const diffMs = christmasDate.getTime() - nowMs
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, hasPassed: false }
}

