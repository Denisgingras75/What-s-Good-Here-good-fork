import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { prefetchRoutes } from '../App'
import { AddDishFlow } from './AddDishFlow'

export function BottomNav() {
  const [addDishOpen, setAddDishOpen] = useState(false)

  const tabs = [
    {
      to: '/',
      label: 'Home',
      prefetch: prefetchRoutes.home,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      to: '/restaurants',
      label: 'Market',
      prefetch: prefetchRoutes.restaurants,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
        </svg>
      ),
    },
    {
      to: '/discover',
      label: 'Favorites',
      prefetch: prefetchRoutes.discover,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ),
    },
    {
      to: '/profile',
      label: 'Profile',
      prefetch: prefetchRoutes.profile,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--color-bg)',
        borderTop: '2px solid var(--color-card-border, #1A1A1A)',
      }}
    >
      <div className="flex justify-around items-center h-16 pb-safe">
        {tabs.map((tab, i) => (
          <React.Fragment key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              onMouseEnter={() => tab.prefetch?.()}
              onFocus={() => tab.prefetch?.()}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-150 active:scale-95 active:opacity-80 ${
                  isActive
                    ? ''
                    : 'hover:opacity-80'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)'
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 150ms ease' }}>
                    {tab.icon}
                  </span>
                  <span className="text-xs font-semibold mt-0.5">{tab.label}</span>
                </>
              )}
            </NavLink>
            {/* Add button after Market (index 1) */}
            {i === 1 && (
              <button
                onClick={() => setAddDishOpen(true)}
                aria-label="Add a dish"
                className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-150 active:scale-90"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center -mt-1"
                  style={{
                    background: 'var(--color-primary)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Add</span>
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <AddDishFlow
        isOpen={addDishOpen}
        onClose={() => setAddDishOpen(false)}
      />
    </nav>
  )
}
