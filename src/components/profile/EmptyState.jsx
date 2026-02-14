import { Link } from 'react-router-dom'
import { ThumbsUpIcon } from '../ThumbsUpIcon'
import { ThumbsDownIcon } from '../ThumbsDownIcon'
import { HearingIcon } from '../HearingIcon'
import { CameraIcon } from '../CameraIcon'
import { ReviewsIcon } from '../ReviewsIcon'

/**
 * Empty state component for profile tabs
 * Shows appropriate icon and message based on tab type
 *
 * Props:
 * - tab: 'unrated' | 'worth-it' | 'avoid' | 'saved' | 'reviews'
 */
export function EmptyState({ tab }) {
  const content = {
    'unrated': {
      icon: 'camera',
      title: 'No photos yet',
      description: 'Add photos of dishes you try - rate them now or later!',
      ctaText: 'Browse Dishes',
      ctaLink: '/browse',
    },
    'worth-it': {
      icon: 'thumbsUp',
      title: "Start voting to build your list",
      description: "Dishes you'd order again will appear here",
      ctaText: 'Find Something Good',
      ctaLink: '/browse',
    },
    'avoid': {
      icon: 'thumbsDown',
      title: "Nothing to skip yet",
      description: "Dishes that weren't good will appear here",
      ctaText: 'Browse Dishes',
      ctaLink: '/browse',
    },
    'saved': {
      icon: 'hearing',
      title: "No dishes saved yet",
      description: 'Save dishes you heard were good to try later',
      ctaText: 'Discover Dishes',
      ctaLink: '/browse',
    },
    'reviews': {
      icon: 'reviews',
      title: 'No reviews yet',
      description: 'Share your thoughts when you rate a dish',
      ctaText: 'Start Rating',
      ctaLink: '/browse',
    },
  }

  const { icon, title, description, ctaText, ctaLink } = content[tab] || content['worth-it']

  const renderIcon = () => {
    switch (icon) {
      case 'thumbsUp':
        return <ThumbsUpIcon size={52} />
      case 'thumbsDown':
        return <ThumbsDownIcon size={52} />
      case 'hearing':
        return <HearingIcon size={64} />
      case 'camera':
        return <CameraIcon size={64} />
      case 'reviews':
        return <ReviewsIcon size={64} />
      default:
        return null
    }
  }

  return (
    <div
      className="rounded-2xl border p-10 text-center"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232, 102, 60, 0.04) 0%, transparent 70%),
          var(--color-card)
        `,
        borderColor: 'var(--color-divider)',
        boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="text-4xl mb-4">
        {renderIcon()}
      </div>
      <h3
        className="font-bold"
        style={{
          color: 'var(--color-text-primary)',
          fontSize: '16px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p
        className="mt-1.5 font-medium"
        style={{
          color: 'var(--color-text-tertiary)',
          fontSize: '13px',
        }}
      >
        {description}
      </p>
      {ctaText && ctaLink && (
        <Link
          to={ctaLink}
          className="inline-block mt-5 px-7 py-2.5 rounded-full font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
            fontSize: '13px',
            boxShadow: '0 2px 12px -4px rgba(232, 102, 60, 0.3)',
          }}
        >
          {ctaText}
        </Link>
      )}
    </div>
  )
}

export default EmptyState
