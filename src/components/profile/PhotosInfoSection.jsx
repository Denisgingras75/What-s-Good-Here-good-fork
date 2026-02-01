import { useState } from 'react'
import { PHOTO_TIERS_LIST } from '../../constants/photoQuality'

/**
 * Photos info section with expandable details
 * Explains how photo tiers work in the app
 */
export function PhotosInfoSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors"
      >
        <span className="font-medium text-[color:var(--color-text-primary)]">How Photos Work</span>
        <svg
          className={`w-5 h-5 text-[color:var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            When you add a photo, we score it for clarity and show it in the community gallery for that dish. Higher-quality photos appear first.
          </p>

          <div className="space-y-2">
            {PHOTO_TIERS_LIST.map((tier) => (
              <div
                key={tier.label}
                className="flex items-center gap-3 p-2 rounded-lg bg-[color:var(--color-surface-elevated)]"
              >
                <span className="text-xl">{tier.icon}</span>
                <div className="flex-1">
                  <span className="font-semibold text-[color:var(--color-text-primary)]">{tier.label}</span>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-[color:var(--color-text-secondary)] mt-4">
            If a photo is too dark, too bright, or too small, we'll ask you to try again with a clearer shot.
          </p>

          <p className="text-xs text-[color:var(--color-text-tertiary)] mt-3 text-center">
            This keeps the app trustworthy and makes dishes easier to recognize.
          </p>
        </div>
      )}
    </div>
  )
}

export default PhotosInfoSection
