/**
 * Hero Identity Card for the Profile page
 * Shows user avatar, name, follow stats, and simple stats line
 */
export function HeroIdentityCard({
  user,
  profile,
  stats,
  followCounts,
  editingName,
  newName,
  nameStatus,
  setEditingName,
  setNewName,
  setNameStatus,
  handleSaveName,
  setFollowListModal,
}) {
  return (
    <div
      className="relative px-4 pt-8 pb-6 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 90% 50% at 20% 0%, rgba(232, 102, 60, 0.03) 0%, transparent 70%),
          radial-gradient(ellipse 70% 60% at 80% 100%, rgba(0, 0, 0, 0.02) 0%, transparent 70%),
          var(--color-bg)
        `,
      }}
    >
      {/* Bottom divider */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: '90%',
          background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
        }}
      />

      {/* Avatar + Name row */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-text-on-primary)',
              boxShadow: '0 4px 20px -4px rgba(232, 102, 60, 0.4), 0 0 0 3px rgba(232, 102, 60, 0.2)',
            }}
          >
            {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Display Name */}
          {editingName ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-3 py-1.5 border rounded-lg text-lg font-bold focus:outline-none pr-8"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      borderColor: nameStatus === 'taken' ? 'var(--color-red)' : nameStatus === 'available' ? 'var(--color-emerald)' : 'var(--color-divider)',
                      color: 'var(--color-text-primary)'
                    }}
                    autoFocus
                    maxLength={30}
                  />
                  {nameStatus && nameStatus !== 'same' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
                      {nameStatus === 'checking' && '\u23F3'}
                      {nameStatus === 'available' && '\u2713'}
                      {nameStatus === 'taken' && '\u2717'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={nameStatus === 'taken' || nameStatus === 'checking'}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(profile?.display_name || '')
                    setNameStatus(null)
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
              {nameStatus === 'taken' && (
                <p className="text-xs" style={{ color: 'var(--color-red)' }}>This username is already taken</p>
              )}
              {nameStatus === 'available' && (
                <p className="text-xs" style={{ color: 'var(--color-emerald)' }}>Username available!</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="font-bold transition-colors flex items-center gap-2"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '22px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              {profile?.display_name || 'Set your name'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 text-[color:var(--color-text-tertiary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          )}

          {/* Follow Stats */}
          <div className="flex items-center gap-2 mt-1.5" style={{ fontSize: '13px' }}>
            <button
              onClick={() => setFollowListModal('followers')}
              className="hover:underline transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.followers}
              </span> followers
            </button>
            <span style={{ color: 'var(--color-text-tertiary)' }}>&middot;</span>
            <button
              onClick={() => setFollowListModal('following')}
              className="hover:underline transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.following}
              </span> following
            </button>
          </div>
        </div>
      </div>

      {/* Stats Line */}
      {stats.totalVotes > 0 && (
        <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {stats.totalVotes} {stats.totalVotes === 1 ? 'dish' : 'dishes'}{stats.uniqueRestaurants > 0 ? ` \u00B7 ${stats.uniqueRestaurants} restaurants` : ''}
        </p>
      )}
    </div>
  )
}

export default HeroIdentityCard
