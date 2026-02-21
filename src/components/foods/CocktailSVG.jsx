export function CocktailSVG({ eatenPercent, value }) {
  // Liquid level decreases as consumed
  const liquidLevel = 1 - eatenPercent
  const showOlive = liquidLevel > 0.4
  const showCondensation = liquidLevel > 0.6

  return (
    <>
      <defs>
        <linearGradient id="cocktail-liquid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8A060" opacity="0.9" />
          <stop offset="100%" stopColor="#D4863C" opacity="0.8" />
        </linearGradient>
        <clipPath id="cocktail-glass-clip">
          <polygon points="28,28 72,28 55,68 45,68" />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="92" rx="14" ry="3" fill="rgba(0,0,0,0.1)" />

      {/* Glass base */}
      <ellipse cx="50" cy="90" rx="14" ry="3" fill="#C8D0D8" />
      <ellipse cx="50" cy="89" rx="12" ry="2.5" fill="#D8E0E8" />

      {/* Stem */}
      <rect x="48" y="68" width="4" height="22" rx="2" fill="#D0D8E0" />
      <rect x="49" y="68" width="2" height="22" rx="1" fill="#E0E8F0" />

      {/* Glass bowl - martini/coupe shape */}
      <polygon points="28,28 72,28 55,68 45,68" fill="none" stroke="#C8D0D8" strokeWidth="2" />
      <polygon points="29,29 71,29 54.5,67.5 45.5,67.5" fill="rgba(200,220,240,0.15)" />

      {/* Glass rim highlight */}
      <line x1="29" y1="28" x2="71" y2="28" stroke="#E8F0F8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Liquid inside glass */}
      <g clipPath="url(#cocktail-glass-clip)">
        {liquidLevel > 0.05 && (
          <>
            {/* Liquid body */}
            <polygon
              points={`28,${28 + (1 - liquidLevel) * 40} 72,${28 + (1 - liquidLevel) * 40} 55,68 45,68`}
              fill="url(#cocktail-liquid-grad)"
            />
            {/* Liquid surface shine */}
            <line
              x1={30 + (1 - liquidLevel) * 5}
              y1={28 + (1 - liquidLevel) * 40}
              x2={70 - (1 - liquidLevel) * 5}
              y2={28 + (1 - liquidLevel) * 40}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
          </>
        )}
      </g>

      {/* Condensation dots on glass */}
      {showCondensation && (
        <g opacity="0.3">
          <circle cx="35" cy="38" r="0.8" fill="#B0C8E0" />
          <circle cx="38" cy="45" r="0.6" fill="#B0C8E0" />
          <circle cx="62" cy="40" r="0.7" fill="#B0C8E0" />
          <circle cx="60" cy="48" r="0.6" fill="#B0C8E0" />
          <circle cx="34" cy="50" r="0.5" fill="#B0C8E0" />
          <circle cx="64" cy="35" r="0.6" fill="#B0C8E0" />
        </g>
      )}

      {/* Olive garnish on rim */}
      {showOlive && (
        <g>
          {/* Toothpick */}
          <line x1="58" y1="18" x2="42" y2="34" stroke="#C8A060" strokeWidth="1.2" strokeLinecap="round" />
          {/* Olive */}
          <ellipse cx="58" cy="20" rx="4.5" ry="3.5" fill="#556B2F" />
          <ellipse cx="58" cy="20" rx="3.5" ry="2.5" fill="#6B8E23" />
          {/* Pimento */}
          <ellipse cx="58" cy="20" rx="1.5" ry="1" fill="#CC3333" />
          {/* Olive shine */}
          <ellipse cx="56.5" cy="18.5" rx="1" ry="0.6" fill="rgba(255,255,255,0.3)" />
        </g>
      )}

      {/* Glass shine reflection */}
      <line x1="33" y1="32" x2="46" y2="62" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round" />
    </>
  )
}
