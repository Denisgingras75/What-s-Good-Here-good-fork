/**
 * SectionHeader — consistent section heading across all pages.
 *
 * Props:
 *   title    - heading text (required)
 *   subtitle - optional secondary text
 *   action   - optional right-side element (link, button, TownPicker, etc.)
 *   level    - 'h2' | 'h3' (default: 'h2')
 */
export function SectionHeader({ title, subtitle, action, level = 'h2' }) {
  var Tag = level

  return (
    <div className="flex items-center justify-between">
      <div>
        <div
          style={{
            width: '40px',
            height: '2px',
            background: 'var(--color-primary)',
            opacity: 0.3,
            marginBottom: '8px',
          }}
        />
        <Tag
          className="font-bold"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Tag>
        {subtitle && (
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export default SectionHeader
