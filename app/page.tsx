'use client'

import { Suspense } from 'react'
import HomeContent from '@/components/HomeContent'

export default function Home() {
  return (
    <Suspense fallback={
      <div className="container" style={{ textAlign: 'center', color: 'white', padding: '100px 20px' }}>
        <h1>Loading...</h1>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
