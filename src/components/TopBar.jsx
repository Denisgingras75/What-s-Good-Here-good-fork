import { NotificationBell } from './NotificationBell'

/**
 * TopBar - Brand anchor with notification bell
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
        {/* Fork-checkmark logo mark - simplified SVG */}
        <svg
          className="top-bar-icon"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Fork tines */}
          <path
            d="M18 4v6c0 1.5-0.5 2.5-1.5 3.5L14 16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M22 4v6c0 1.5-0.5 2.5-1.5 3.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M26 4v6c0 2-1 3.5-3 4.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Handle curving into checkmark */}
          <path
            d="M14 16L8 26"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M4 20l4 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </div>
  )
}
