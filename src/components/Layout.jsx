import { BottomNav } from './BottomNav'
import { WelcomeModal } from './Auth/WelcomeModal'
import { WelcomeSplash } from './WelcomeSplash'
import { TopBar } from './TopBar'

export function Layout({ children }) {
  return (
    <div
      className="bg-stone-50"
      style={{
        minHeight: '100dvh',
        // 64px nav + safe area inset for devices with home indicator
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 16px))',
      }}
    >
      <WelcomeSplash />
      <TopBar />
      {children}
      <BottomNav />
      <WelcomeModal />
    </div>
  )
}
