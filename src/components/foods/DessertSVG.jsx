export function DessertSVG({ eatenPercent, value }) {
  // Cake eaten from left (tip) to right (back)
  const showStrawberry = eatenPercent < 0.15
  const showWhippedCream = eatenPercent < 0.25
  const showFrosting = eatenPercent < 0.7

  // The left edge of the remaining cake moves rightward as you eat
  // Cake spans x=25 (tip) to x=70 (back). Eating moves left edge right.
  const cakeLeft = 25 + eatenPercent * 45

  // Generate jagged bite clip path - the actual edge of the remaining cake
  const generateBiteClip = (x) => {
    if (eatenPercent < 0.02) {
      // No bites yet - simple rectangle
      return `M 20 10 L 75 10 L 75 90 L 20 90 Z`
    }

    // Jagged teeth marks along the bite edge
    const teeth = [
      { y: 29, depth: 4 + Math.sin(x * 0.8) * 2 },
      { y: 33, depth: 6 + Math.cos(x * 0.5) * 3 },
      { y: 37, depth: 3 + Math.sin(x * 0.6) * 2 },
      { y: 41, depth: 7 + Math.cos(x * 0.4) * 2 },
      { y: 45, depth: 4 + Math.sin(x * 0.7) * 3 },
      { y: 49, depth: 6 + Math.cos(x * 0.3) * 2 },
      { y: 53, depth: 3 + Math.sin(x * 0.9) * 3 },
      { y: 57, depth: 7 + Math.cos(x * 0.6) * 2 },
      { y: 61, depth: 4 + Math.sin(x * 0.4) * 2 },
      { y: 65, depth: 6 + Math.cos(x * 0.7) * 3 },
      { y: 69, depth: 3 + Math.sin(x * 0.5) * 2 },
      { y: 73, depth: 0 },
    ]

    let path = `M ${x} 27`
    teeth.forEach((tooth, i) => {
      const nextTooth = teeth[i + 1]
      if (!nextTooth) return
      // Scallop inward (left) then back out for bite mark
      const midY = (tooth.y + nextTooth.y) / 2
      path += ` Q ${x - tooth.depth} ${midY}, ${x} ${nextTooth.y}`
    })

    // Close the clip: go right, down, left, up
    path += ` L 75 73 L 75 10 L ${x} 10 Z`
    return path
  }

  return (
    <>
      <defs>
        <linearGradient id="dessert-cake-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F4A0A0" />
          <stop offset="100%" stopColor="#E07878" />
        </linearGradient>
        <linearGradient id="dessert-frosting-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE4E8" />
          <stop offset="100%" stopColor="#F8C8D0" />
        </linearGradient>
        <linearGradient id="dessert-plate-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#D8D8D8" />
        </linearGradient>

        {/* Bite-shaped clip with jagged teeth marks */}
        <clipPath id="dessert-bite-clip">
          <path d={generateBiteClip(cakeLeft)} />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="88" rx="38" ry="5" fill="rgba(0,0,0,0.1)" />

      {/* Plate */}
      <ellipse cx="50" cy="78" rx="42" ry="10" fill="#C8C8C8" />
      <ellipse cx="50" cy="76" rx="42" ry="10" fill="url(#dessert-plate-grad)" />
      <ellipse cx="50" cy="76" rx="36" ry="7" fill="#EBEBEB" />

      {/* Cake slice - clipped with bite marks */}
      <g clipPath="url(#dessert-bite-clip)">
        {/* Cake body */}
        <path
          d="M 25 72 L 25 32 L 70 32 L 70 72 Z"
          fill="url(#dessert-cake-grad)"
        />

        {/* Bottom layer */}
        <rect x="25" y="60" width="45" height="12" fill="#E07878" />

        {/* Middle cream filling */}
        <rect x="25" y="57" width="45" height="3" fill="#FFF0F2" opacity="0.9" />

        {/* Middle layer */}
        <rect x="25" y="45" width="45" height="12" fill="#F4A0A0" />

        {/* Top cream filling */}
        <rect x="25" y="43" width="45" height="3" fill="#FFF0F2" opacity="0.9" />

        {/* Top layer */}
        <rect x="25" y="32" width="45" height="11" fill="#E88C8C" />

        {/* Cake texture - sponge dots */}
        <circle cx="35" cy="65" r="1" fill="#D08080" opacity="0.4" />
        <circle cx="50" cy="67" r="1" fill="#D08080" opacity="0.3" />
        <circle cx="60" cy="64" r="0.8" fill="#D08080" opacity="0.4" />
        <circle cx="40" cy="50" r="1" fill="#D08080" opacity="0.3" />
        <circle cx="55" cy="52" r="0.8" fill="#D08080" opacity="0.4" />
        <circle cx="32" cy="38" r="1" fill="#D08080" opacity="0.3" />
        <circle cx="48" cy="40" r="0.8" fill="#D08080" opacity="0.4" />
        <circle cx="63" cy="37" r="1" fill="#D08080" opacity="0.3" />

        {/* Exposed inner cake at bite edge - darker shade to show depth */}
        {eatenPercent > 0.02 && eatenPercent < 0.95 && (
          <rect x={cakeLeft - 3} y="32" width="4" height="40" fill="#CC7070" opacity="0.5" />
        )}
      </g>

      {/* Bite edge shadow - gives depth to the bite */}
      {eatenPercent > 0.02 && eatenPercent < 0.95 && (
        <g clipPath="url(#dessert-bite-clip)">
          <rect x={cakeLeft - 1} y="32" width="2" height="40" fill="#B06060" opacity="0.3" />
        </g>
      )}

      {/* Cream layers visible at bite edge */}
      {eatenPercent > 0.02 && eatenPercent < 0.95 && (
        <g>
          <circle cx={cakeLeft} cy="44" r="1.5" fill="#FFF8F0" opacity="0.9" />
          <circle cx={cakeLeft} cy="58" r="1.5" fill="#FFF8F0" opacity="0.9" />
        </g>
      )}

      {/* Frosting on top - also clipped by bite */}
      {showFrosting && (
        <g clipPath="url(#dessert-bite-clip)">
          <rect x="24" y="29" width="47" height="5" rx="2" fill="url(#dessert-frosting-grad)" />
          {/* Frosting drip on right side */}
          <path
            d="M 70 30 Q 73 36 71 42"
            fill="none"
            stroke="#F8C8D0"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      )}

      {/* Whipped cream dollop */}
      {showWhippedCream && (
        <g>
          <ellipse cx="62" cy="25" rx="8" ry="5" fill="#FFFAF5" />
          <ellipse cx="62" cy="23" rx="6" ry="4" fill="#FFFFFF" />
          <ellipse cx="64" cy="21" rx="4" ry="3" fill="#FFFAF5" />
          <ellipse cx="60" cy="22" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.8" />
        </g>
      )}

      {/* Strawberry on top */}
      {showStrawberry && (
        <g>
          <ellipse cx="42" cy="22" rx="7" ry="8" fill="#DC3545" />
          <ellipse cx="42" cy="21" rx="6" ry="7" fill="#E04050" />
          {/* Seeds */}
          <ellipse cx="40" cy="19" rx="0.8" ry="1" fill="#FFD700" opacity="0.7" />
          <ellipse cx="44" cy="21" rx="0.8" ry="1" fill="#FFD700" opacity="0.7" />
          <ellipse cx="41" cy="25" rx="0.8" ry="1" fill="#FFD700" opacity="0.7" />
          <ellipse cx="45" cy="17" rx="0.8" ry="1" fill="#FFD700" opacity="0.6" />
          {/* Highlight */}
          <ellipse cx="40" cy="18" rx="2" ry="2.5" fill="#FF6B7A" opacity="0.5" />
          {/* Stem/leaves */}
          <path d="M 41 14 Q 43 12 45 13" fill="#228B22" />
          <path d="M 41 14 Q 39 12 37 13" fill="#2E8B2E" />
          <rect x="41" y="11" width="1.5" height="4" rx="0.5" fill="#228B22" />
        </g>
      )}

      {/* Crumbs on plate */}
      {eatenPercent > 0.15 && (
        <g opacity={Math.min(eatenPercent, 0.8)}>
          <circle cx="28" cy="74" r="1.5" fill="#E8A0A0" />
          <circle cx="35" cy="76" r="1" fill="#F0B0B0" />
          <circle cx="24" cy="75" r="1.2" fill="#E8A0A0" />
          {eatenPercent > 0.4 && (
            <>
              <circle cx="40" cy="75" r="1" fill="#E8A0A0" />
              <circle cx="32" cy="73" r="1.3" fill="#F0B0B0" />
              <rect x="36" y="74" width="2" height="1.5" rx="0.5" fill="#FFF0F2" />
            </>
          )}
          {eatenPercent > 0.7 && (
            <>
              <circle cx="50" cy="74" r="1" fill="#F0B0B0" />
              <circle cx="45" cy="76" r="0.8" fill="#E8A0A0" />
              <circle cx="55" cy="75" r="1.2" fill="#E8A0A0" />
            </>
          )}
        </g>
      )}

      {/* Fork on the eaten side */}
      {eatenPercent > 0.1 && eatenPercent < 0.95 && (
        <g transform="translate(15, 50) rotate(-15)">
          <rect x="-1" y="0" width="2" height="22" rx="1" fill="#C0C0C0" />
          <rect x="-4" y="-8" width="2" height="8" rx="0.5" fill="#C0C0C0" />
          <rect x="-1" y="-8" width="2" height="8" rx="0.5" fill="#C0C0C0" />
          <rect x="2" y="-8" width="2" height="8" rx="0.5" fill="#C0C0C0" />
        </g>
      )}
    </>
  )
}
