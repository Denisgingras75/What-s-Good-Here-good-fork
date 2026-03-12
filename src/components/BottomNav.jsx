import { NavLink } from 'react-router-dom'
import { Storefront, HouseLine, UserCircle } from '@phosphor-icons/react'
import { prefetchRoutes } from '../App'

export function BottomNav() {
  const tabs = [
    {
      to: '/restaurants',
      label: 'Restaurants',
      prefetch: prefetchRoutes.restaurants,
      icon: (isActive) => <Storefront size={24} weight={isActive ? 'fill' : 'duotone'} />,
    },
    {
      to: '/',
      label: 'Home',
      prefetch: prefetchRoutes.map,
      icon: (isActive) => <HouseLine size={24} weight={isActive ? 'fill' : 'duotone'} />,
    },
    {
      to: '/profile',
      label: 'You',
      prefetch: prefetchRoutes.profile,
      icon: (isActive) => <UserCircle size={24} weight={isActive ? 'fill' : 'duotone'} />,
    },
  ]

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--color-surface-elevated)',
        borderTop: '1px solid var(--color-divider)',
      }}
    >
      <div className="flex justify-around items-center h-16 pb-safe">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            onMouseEnter={() => tab.prefetch?.()}
            onFocus={() => tab.prefetch?.()}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-150 active:scale-95 active:opacity-80 ${
                isActive
                  ? ''
                  : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              fontWeight: isActive ? 700 : 500,
            })}
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span className="text-[11px] mt-1" style={{ fontWeight: 'inherit' }}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
