export function CoffeeSVG({ eatenPercent, value }) {
  // Coffee level decreases as consumed
  const coffeeLevel = 1 - eatenPercent
  const showSteam = coffeeLevel > 0.3
  const showLatteArt = coffeeLevel > 0.5

  return (
    <>
      <defs>
        <linearGradient id="coffee-liquid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A2C17" />
          <stop offset="100%" stopColor="#2C1810" />
        </linearGradient>
        <clipPath id="coffee-mug-clip">
          <rect x="22" y="30" width="42" height="40" rx="4" />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx="46" cy="88" rx="34" ry="5" fill="rgba(0,0,0,0.1)" />

      {/* Saucer */}
      <ellipse cx="46" cy="82" rx="38" ry="8" fill="#D0D0D0" />
      <ellipse cx="46" cy="81" rx="36" ry="7" fill="#E8E8E8" />
      <ellipse cx="46" cy="80" rx="32" ry="5" fill="#F0F0F0" />

      {/* Mug body */}
      <rect x="22" y="30" width="42" height="48" rx="6" fill="#F5F5F5" />
      <rect x="24" y="32" width="38" height="44" rx="4" fill="#FFFFFF" />

      {/* Mug rim */}
      <ellipse cx="43" cy="30" rx="21" ry="5" fill="#F5F5F5" />
      <ellipse cx="43" cy="30" rx="19" ry="4" fill="#E8E8E8" />

      {/* Handle */}
      <path
        d="M 64 42 Q 80 42 80 55 Q 80 68 64 68"
        fill="none"
        stroke="#E0E0E0"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 64 42 Q 78 42 78 55 Q 78 68 64 68"
        fill="none"
        stroke="#F0F0F0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Coffee liquid inside mug */}
      <g clipPath="url(#coffee-mug-clip)">
        <rect
          x="22"
          y={30 + (1 - coffeeLevel) * 40}
          width="42"
          height={coffeeLevel * 40}
          fill="url(#coffee-liquid-grad)"
        />

        {/* Coffee surface */}
        {coffeeLevel > 0.1 && (
          <ellipse
            cx="43"
            cy={30 + (1 - coffeeLevel) * 40}
            rx="19"
            ry="3"
            fill="#5C3A1E"
          />
        )}

        {/* Latte art swirl on surface */}
        {showLatteArt && (
          <g opacity={0.7}>
            <path
              d={`M 36 ${29 + (1 - coffeeLevel) * 40} Q 43 ${26 + (1 - coffeeLevel) * 40} 50 ${29 + (1 - coffeeLevel) * 40}`}
              fill="none"
              stroke="#D4B896"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx="43"
              cy={29 + (1 - coffeeLevel) * 40}
              r="3"
              fill="none"
              stroke="#D4B896"
              strokeWidth="1"
              opacity="0.6"
            />
            <circle
              cx="43"
              cy={29 + (1 - coffeeLevel) * 40}
              r="1.5"
              fill="#D4B896"
              opacity="0.5"
            />
          </g>
        )}
      </g>

      {/* Inner mug rim highlight */}
      <ellipse cx="43" cy="30" rx="17" ry="3" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />

      {/* Steam wisps */}
      {showSteam && (
        <g opacity={0.2 + coffeeLevel * 0.3}>
          <path
            d="M 35 24 Q 33 18 37 14 Q 33 10 35 4"
            fill="none"
            stroke="#FFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 43 22 Q 45 16 41 12 Q 45 8 43 2"
            fill="none"
            stroke="#FFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 51 24 Q 53 18 49 14 Q 53 10 51 4"
            fill="none"
            stroke="#FFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>
      )}
    </>
  )
}
