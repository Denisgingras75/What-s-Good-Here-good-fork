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
      title: "Nothing good here yet",
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
      className="rounded-2xl border p-8 text-center"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      <div className="text-4xl mb-3">
        {renderIcon()}
      </div>
      <h3 className="font-semibold text-[color:var(--color-text-primary)]">{title}</h3>
      <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">{description}</p>
      {ctaText && ctaLink && (
        <Link
          to={ctaLink}
          className="inline-block mt-4 px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          {ctaText}
        </Link>
      )}
    </div>
  )
}

export default EmptyState
