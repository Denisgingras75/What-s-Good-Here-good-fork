import { useNavigate } from 'react-router-dom'

/**
 * Adaptive influence/impact metrics card.
 * Shows 2-4 cells based on available data — never shows zeros.
 * Only rendered when totalVotes >= 5.
 */
export function ImpactCard({ ratingIdentity, followCounts, stats }) {
  const navigate = useNavigate()

  if (!stats || stats.totalVotes < 5) return null

  // Build cells adaptively — only include metrics with real data
  const cells = []

  // Dishes helped discover
  if (ratingIdentity?.dishesHelpedEstablish > 0) {
    cells.push({
      value: ratingIdentity.dishesHelpedEstablish,
      label: `dish${ratingIdentity.dishesHelpedEstablish === 1 ? '' : 'es'} you helped discover`,
      icon: '\uD83C\uDFAF',
    })
  }

  // Followers
  if ((followCounts?.followers || 0) > 0) {
    cells.push({
      value: followCounts.followers,
      label: `${followCounts.followers === 1 ? 'person follows' : 'people follow'} your taste`,
      icon: '\uD83D\uDC65',
    })
  } else if (stats.totalVotes >= 10) {
    // Soft CTA for users with enough votes but no followers
    cells.push({
      value: null,
      label: 'Invite friends to follow your taste',
      icon: '\uD83D\uDC8C',
      isCta: true,
    })
  }

  // Votes pending consensus
  if (ratingIdentity?.votesPending > 0) {
    cells.push({
      value: ratingIdentity.votesPending,
      label: `vote${ratingIdentity.votesPending === 1 ? '' : 's'} waiting to shape rankings`,
      icon: '\u23F3',
    })
  }

  // Rating personality
  if (ratingIdentity?.biasLabel && ratingIdentity.biasLabel !== 'New Voter') {
    cells.push({
      value: null,
      label: ratingIdentity.biasLabel,
      icon: getBiasIcon(ratingIdentity.biasLabel),
      isPersonality: true,
    })
  }

  if (cells.length === 0) return null

  return (
    <button
      onClick={() => navigate('/badges')}
      className="w-full text-left rounded-xl p-4 transition-all hover:opacity-90 active:scale-[0.99]"
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-divider)',
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-3"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Your Impact
      </p>

      <div className={`grid gap-3 ${cells.length <= 2 ? 'grid-cols-2' : cells.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${cells.length === 4 ? '' : ''}`}
            style={{ background: 'var(--color-bg)' }}
          >
            <span className="text-lg">{cell.icon}</span>
            {cell.value !== null && (
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                {cell.value}
              </p>
            )}
            <p
              className="text-xs mt-0.5 leading-snug"
              style={{
                color: cell.isCta ? 'var(--color-primary)' : cell.isPersonality ? 'var(--color-accent-gold)' : 'var(--color-text-tertiary)',
                fontWeight: cell.isPersonality ? 600 : 400,
              }}
            >
              {cell.label}
            </p>
          </div>
        ))}
      </div>
    </button>
  )
}

function getBiasIcon(biasLabel) {
  switch (biasLabel) {
    case 'Tough Critic': return '\uD83E\uDDD0'
    case 'Fair Judge': return '\u2696\uFE0F'
    case 'Generous Rater': return '\uD83D\uDE0A'
    case 'Loves Everything': return '\uD83E\uDD70'
    default: return '\u2B50'
  }
}
