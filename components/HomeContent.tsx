'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import HouseSetupModal from '@/components/HouseSetupModal'
import WindowGrid from '@/components/WindowGrid'
import WindowLetterModal from '@/components/WindowLetterModal'
import LetterViewModal from '@/components/LetterViewModal'
import AuthModal from '@/components/AuthModal'
import ChristmasCountdown from '@/components/ChristmasCountdown'
import { useHouse } from '@/hooks/useHouse'
import { useAuth } from '@/contexts/AuthContext'
import { Window } from '@/lib/supabase'
import { isChristmasPassed } from '@/lib/auth'

// Map house type values to actual file names
function getHouseFileName(houseType: string): string {
  const mapping: Record<string, string> = {
    'house1': 'house A1',
    'house2': 'house A2',
    'house3': 'house A3',
    'house4': 'house B1',
    'house5': 'house B2',
    'house6': 'house B3',
  }
  return encodeURIComponent(mapping[houseType] || houseType)
}

export default function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signOut } = useAuth()
  
  // Get house ID from URL if visiting someone's house
  const houseIdParam = searchParams?.get('house')

  // Handle logout
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  
  const {
    house,
    windows,
    loading: houseLoading,
    role,
    createHouse,
    updateHouse,
    addWindow,
    deleteWindow,
    reload,
  } = useHouse(houseIdParam || undefined)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showWindowLetterModal, setShowWindowLetterModal] = useState(false)
  const [showLetterViewModal, setShowLetterViewModal] = useState(false)
  const [selectedWindow, setSelectedWindow] = useState<Window | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const handleSaveSetup = async (data: { name: string; timezone: string; houseType: string }) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      // Creating new house only (no editing allowed)
      await createHouse(data.name, data.houseType, data.timezone)
      setShowSetupModal(false)
      // Reload house data to ensure it's reflected in UI
      if (reload) {
        await reload()
      }
    } catch (error: any) {
      console.error('Error creating house:', error)
      if (error.message?.includes('authenticated')) {
        setShowAuthModal(true)
      } else {
        alert('Error creating house. Please try again.')
      }
    }
  }

  const handleWindowClick = (window: Window) => {
    // Clicked on existing window - show letter
    setSelectedWindow(window)
    setShowLetterViewModal(true)
  }

  const handleWriteLetterClick = () => {
    // Visitor clicks "write a letter" button
    if (role === 'owner') {
      alert('Only visitors can write letters!')
      return
    }
    setShowWindowLetterModal(true)
  }

  const handleWindowLetterSave = async (data: {
    character: string
    frame: string
    backgroundColor: string
    visitorName: string
    letterContent: string
  }) => {
    if (!house) return

    try {
      await addWindow(
        house.id,
        data.character,
        data.frame,
        data.backgroundColor,
        data.visitorName,
        data.letterContent
      )
      setShowWindowLetterModal(false)
      alert('Your letter has been sent! It will be visible to the house owner after Christmas.')
    } catch (error: any) {
      console.error('Error adding window/letter:', error)
      alert('Error sending letter. Please try again.')
    }
  }

  const handleShare = () => {
    if (!house) return
    
    const shareUrl = `${window.location.origin}?house=${house.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }).catch(() => {
      alert('Failed to copy link. Please copy manually: ' + shareUrl)
    })
  }

  const handleCreateHouse = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowSetupModal(true)
    }
  }

  // Debug: Log the state to understand what's happening
  console.log('HomeContent state:', { 
    authLoading, 
    houseLoading, 
    hasUser: !!user, 
    hasHouse: !!house, 
    houseIdParam, 
    role 
  })

  // If no user and no house (not logged in), show login prompt
  if (!authLoading && !houseLoading && !user && !house && !houseIdParam) {
    return (
      <div className="container">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => {
            setShowAuthModal(false)
            // After login, if still no house, show setup modal
            if (!house) {
              setShowSetupModal(true)
            }
          }}
        />

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '80vh',
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#eee' }}>🏠 Welcome to Decorate My House!</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', maxWidth: '600px' }}>
            Log in to create your own house and let visitors leave you letters this Christmas season.
          </p>
          <button 
            className="primary-btn" 
            onClick={() => setShowAuthModal(true)}
            style={{ fontSize: '1.2rem', padding: '16px 32px' }}
          >
            Log In to Get Started
          </button>
        </div>
      </div>
    )
  }

  // If logged in but no house and not viewing someone else's house, show create button
  if (!authLoading && !houseLoading && user && !house && !houseIdParam) {
    console.log('Showing welcome screen')
    return (
      <div className="container">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />

        <HouseSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onSave={handleSaveSetup}
        />

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '80vh',
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#333' }}>🏠 Welcome to Decorate My House!</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', maxWidth: '600px' }}>
            Create your own house and let visitors leave you letters this Christmas season.
          </p>
          <button 
            className="primary-btn" 
            onClick={handleCreateHouse}
            style={{ fontSize: '1.2rem', padding: '16px 32px' }}
          >
            Create Your House
          </button>
        </div>
      </div>
    )
  }

  const loading = authLoading || houseLoading

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', color: 'white', padding: '100px 20px' }}>
        <h1>Loading...</h1>
      </div>
    )
  }

  // If visitor viewing someone's house - centered layout like owner
  if (houseIdParam && house && role === 'visitor') {
    return (
      <div className="container">
        <header>
          <div className="header-info">
            <h1>🏠 <span>{house.name}</span></h1>
            <p className="subtitle">Leave a letter for the house owner!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!user && (
              <button className="edit-btn" onClick={() => setShowAuthModal(true)}>
                Login to Create Your Own
              </button>
            )}
            {user && (
              <button className="edit-btn" onClick={() => router.push('/')}>
                Go to My House
              </button>
            )}
          </div>
        </header>

        <main className="desktop-layout">
          {/* Left side - House (centered) */}
          <div className="house-side">
            <div className="house-container" style={{ position: 'relative' }}>
              <img
                src={`/assets/houses/${getHouseFileName(house.house_type)}.svg`}
                alt={house.house_type}
                className="house-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (target.src.endsWith('.svg')) {
                    target.src = target.src.replace('.svg', '.png')
                  }
                }}
              />
              <WindowGrid 
                windows={windows} 
                onWindowClick={handleWindowClick}
                houseType={house.house_type}
              />
            </div>
          </div>
          
          {/* Right side - Letter Sending */}
          <div className="info-side">
            {/* Write Letter Card */}
            <div className="info-card">
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>✉️ Send a Letter</h3>
              <p style={{ color: '#666', margin: '10px 0 20px 0', fontSize: '0.95rem' }}>
                Write a heartfelt message for the house owner. They'll be able to read it after Christmas!
              </p>
              <button
                className="primary-btn"
                onClick={handleWriteLetterClick}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                Write Your Letter
              </button>
            </div>

            {/* Letters Count */}
            <div className="info-card">
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Letters on House</h3>
              <p style={{ color: '#666', margin: '5px 0' }}>
                {windows.length} letter{windows.length !== 1 ? 's' : ''} sent
              </p>
              <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '10px' }}>
                Click on windows to view letter designs
              </p>
            </div>
          </div>
        </main>

        <WindowLetterModal
          isOpen={showWindowLetterModal}
          onClose={() => setShowWindowLetterModal(false)}
          onSave={handleWindowLetterSave}
        />

        <LetterViewModal
          isOpen={showLetterViewModal}
          onClose={() => {
            setShowLetterViewModal(false)
            setSelectedWindow(null)
          }}
          window={selectedWindow}
          houseTimezone={house.timezone}
          isOwner={false}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  // Owner view or creating new house
  return (
    <div className="container">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false)
          // Don't auto-open setup modal - let the welcome screen handle it
        }}
      />

      <HouseSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSave={handleSaveSetup}
      />

      <WindowLetterModal
        isOpen={showWindowLetterModal}
        onClose={() => setShowWindowLetterModal(false)}
        onSave={handleWindowLetterSave}
      />

      <LetterViewModal
        isOpen={showLetterViewModal}
        onClose={() => {
          setShowLetterViewModal(false)
          setSelectedWindow(null)
        }}
        window={selectedWindow}
        houseTimezone={house?.timezone || 'America/New_York'}
        isOwner={role === 'owner'}
      />

      <header>
        <div className="header-info">
          <h1>🏠 <span>{house?.name || 'My House'}</span></h1>
          <p className="subtitle">
            {role === 'owner' 
              ? 'View letters from visitors after Christmas!'
              : 'Decorate windows with letters!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {house && (
            <button className="edit-btn" onClick={handleShare}>
              {shareCopied ? '✓ Link Copied!' : '📤 Share Your House'}
            </button>
          )}
          {user && (
            <button className="edit-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
          {!user && !houseIdParam && (
            <button className="edit-btn" onClick={() => setShowAuthModal(true)}>
              Login
            </button>
          )}
        </div>
      </header>

      {house && (
        <>
          <main className="desktop-layout">
            {/* Left side - House */}
            <div className="house-side">
              <div className="house-container">
                <img
                  src={`/assets/houses/${getHouseFileName(house.house_type)}.svg`}
                  alt={house.house_type}
                  className="house-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target.src.endsWith('.svg')) {
                      target.src = target.src.replace('.svg', '.png')
                    }
                  }}
                />
                <WindowGrid 
                  windows={windows} 
                  onWindowClick={handleWindowClick}
                  houseType={house.house_type}
                />
              </div>
            </div>

            {/* Right side - Controls & Info */}
            <div className="info-side">
              {/* Countdown (Owner only) */}
              {role === 'owner' && (
                <div className="info-card">
                  <ChristmasCountdown timezone={house.timezone} />
                </div>
              )}

              {/* Letters Info (Owner only) */}
              {role === 'owner' && (
                <div className="info-card">
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Letters Received</h3>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    {windows.length} window{windows.length !== 1 ? 's' : ''} with letters
                  </p>
                  <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '10px' }}>
                    Click on windows to view letters
                  </p>
                </div>
              )}

              {/* Share Section (Owner only) */}
              {role === 'owner' && (
                <div className="info-card">
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>Share</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      className="share-btn"
                      onClick={handleShare}
                      style={{ flex: 1 }}
                    >
                      {shareCopied ? '✓ Copied!' : '🔗 Copy Link'}
                    </button>
                    <button 
                      className="share-btn"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}?house=${house.id}`
                        window.open(`sms:&body=${encodeURIComponent('Check out my Christmas house: ' + shareUrl)}`, '_blank')
                      }}
                      style={{ minWidth: '80px' }}
                    >
                      💬 iMsg
                    </button>
                  </div>
                </div>
              )}

              {/* Write Letter Button (Visitor only) */}
              {role === 'visitor' && (
                <div className="info-card">
                  <button
                    className="primary-btn"
                    onClick={handleWriteLetterClick}
                    style={{
                      width: '100%',
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                    }}
                  >
                    Write a Letter and Join the House!
                  </button>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {!house && !houseIdParam && (
        <div style={{ textAlign: 'center', color: 'white', padding: '100px 20px' }}>
          <h2 style={{ marginBottom: '30px' }}>Welcome to Decorate My House!</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}>
            Create your own house and receive letters from visitors!
          </p>
          <button className="primary-btn" onClick={handleCreateHouse} style={{ maxWidth: '300px' }}>
            Create Your House
          </button>
        </div>
      )}
    </div>
  )
}
