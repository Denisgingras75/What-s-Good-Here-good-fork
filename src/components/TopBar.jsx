import { NotificationBell } from './NotificationBell'

/**
 * TopBar - Brand anchor with WGH lettermark and notification bell
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
        {/* Spacer for symmetry */}
        <div style={{ width: '28px' }} />

        {/* WGH lettermark — centered */}
        <img
          src="/logo-wgh.svg"
          alt="What's Good Here"
          className="top-bar-icon"
          style={{ height: '22px', width: 'auto', opacity: 0.9 }}
        />

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </div>
  )
}
