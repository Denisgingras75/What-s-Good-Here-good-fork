import { useState, useEffect, useRef } from 'react'

export function PizzaRatingSlider({ value, onChange, min = 1, max = 10, step = 0.1 }) {
  const [crumbs, setCrumbs] = useState([])
  const lastValue = useRef(value)
  const crumbIdRef = useRef(0)

  // Calculate how much pizza is eaten (0 = full slice, 1 = fully eaten)
  const eatenPercent = (value - min) / (max - min)

  // Generate crumbs when slider moves up (more eating)
  useEffect(() => {
    if (value > lastValue.current) {
      const numCrumbs = Math.ceil((value - lastValue.current) * 2)
      const newCrumbs = []

      for (let i = 0; i < numCrumbs; i++) {
        newCrumbs.push({
          id: crumbIdRef.current++,
          x: 45 + Math.random() * 10, // Near the bite area
          y: 30 + Math.random() * 20,
          size: 2 + Math.random() * 3,
          rotation: Math.random() * 360,
          fallDirection: Math.random() > 0.5 ? 1 : -1,
          delay: i * 50,
        })
      }

      setCrumbs(prev => [...prev, ...newCrumbs])

      // Clean up old crumbs after animation
      setTimeout(() => {
        setCrumbs(prev => prev.filter(c => !newCrumbs.find(nc => nc.id === c.id)))
      }, 1000)
    }
    lastValue.current = value
  }, [value, min, max])

  // Pizza slice path - triangular slice shape
  // The slice points up, tip at top
  const slicePath = `
    M 50 10
    L 20 85
    Q 50 95 80 85
    Z
  `

  // Crust arc at the bottom
  const crustPath = `
    M 20 85
    Q 50 95 80 85
  `

  // Calculate clip path to show eaten portion
  // As eatenPercent increases, we hide more from the tip down
  // At 10, clipY goes past the crust to hide everything
  const clipY = 10 + (eatenPercent * 90) // From tip (10) to below crust (100)

  return (
    <div className="space-y-4">
      {/* Pizza visualization */}
      <div className="relative flex justify-center items-center h-40">
        {/* Perfect 10 - Clean plate celebration */}
        {value >= 10 && (
          <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
            <div className="text-6xl animate-bounce">🍽️</div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl animate-pulse">✨</div>
            <div className="absolute top-6 left-1/4 text-xl animate-pulse" style={{ animationDelay: '0.2s' }}>✨</div>
            <div className="absolute top-6 right-1/4 text-xl animate-pulse" style={{ animationDelay: '0.4s' }}>✨</div>
          </div>
        )}
        <svg
          viewBox="0 0 100 100"
          className="w-32 h-32 drop-shadow-lg transition-all duration-300"
          style={{
            transform: `scale(${value >= 10 ? 0 : 1 - eatenPercent * 0.3})`,
            opacity: value >= 10 ? 0 : 1
          }}
        >
          <defs>
            {/* Clip path that hides the eaten portion */}
            <clipPath id="eaten-clip">
              <rect x="0" y={clipY} width="100" height={100 - clipY} />
            </clipPath>

            {/* Pizza cheese gradient */}
            <linearGradient id="cheese-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Crust gradient */}
            <linearGradient id="crust-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>

          {/* Shadow under pizza */}
          <ellipse
            cx="50"
            cy="92"
            rx={25 - eatenPercent * 10}
            ry={5 - eatenPercent * 2}
            fill="rgba(0,0,0,0.1)"
            className="transition-all duration-200"
          />

          {/* Main pizza slice with clip */}
          <g clipPath="url(#eaten-clip)">
            {/* Pizza base (cheese) */}
            <path
              d={slicePath}
              fill="url(#cheese-gradient)"
              stroke="#D97706"
              strokeWidth="1"
            />

            {/* Pepperoni toppings */}
            <circle cx="40" cy="45" r="6" fill="#DC2626" opacity={clipY < 45 ? 1 : 0} className="transition-opacity duration-200" />
            <circle cx="58" cy="50" r="5" fill="#DC2626" opacity={clipY < 50 ? 1 : 0} className="transition-opacity duration-200" />
            <circle cx="45" cy="65" r="6" fill="#DC2626" opacity={clipY < 65 ? 1 : 0} className="transition-opacity duration-200" />
            <circle cx="60" cy="70" r="4" fill="#DC2626" opacity={clipY < 70 ? 1 : 0} className="transition-opacity duration-200" />
            <circle cx="35" cy="72" r="5" fill="#DC2626" opacity={clipY < 72 ? 1 : 0} className="transition-opacity duration-200" />

            {/* Melted cheese strings effect */}
            <ellipse cx="48" cy="55" rx="8" ry="3" fill="#FDE68A" opacity="0.6" />
            <ellipse cx="55" cy="68" rx="6" ry="2" fill="#FDE68A" opacity="0.6" />
          </g>

          {/* Crust (fades out as we approach 10) */}
          <path
            d={crustPath}
            fill="none"
            stroke="url(#crust-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity={value >= 10 ? 0 : eatenPercent < 0.9 ? 1 : 1 - ((eatenPercent - 0.9) * 10)}
            className="transition-opacity duration-200"
          />

          {/* Bite mark effect at the eating edge */}
          {eatenPercent > 0.05 && eatenPercent < 0.9 && (
            <g>
              <circle cx={35 + eatenPercent * 15} cy={clipY + 2} r="3" fill="#FCD34D" />
              <circle cx={50} cy={clipY + 1} r="4" fill="#FCD34D" />
              <circle cx={62 - eatenPercent * 10} cy={clipY + 2} r="3" fill="#FCD34D" />
            </g>
          )}

          {/* Falling crumbs */}
          {crumbs.map(crumb => (
            <circle
              key={crumb.id}
              cx={crumb.x}
              cy={crumb.y}
              r={crumb.size}
              fill="#D97706"
              className="animate-crumb-fall"
              style={{
                '--fall-direction': crumb.fallDirection,
                '--fall-delay': `${crumb.delay}ms`,
                animationDelay: `${crumb.delay}ms`,
              }}
            />
          ))}
        </svg>

        {/* Rating display overlaid */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-4xl font-bold text-neutral-900">{value.toFixed(1)}</span>
          <span className="text-xl text-neutral-400">/10</span>
        </div>
      </div>

      {/* Label based on rating */}
      <div className="text-center">
        <span className="text-sm font-medium text-neutral-500">
          {getRatingLabel(value)}
        </span>
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-emerald-400 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400 [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-orange-400 [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-2 px-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )
}

function getRatingLabel(value) {
  if (value >= 10) return "🏆 PERFECT! Ate every bite!"
  if (value >= 9.5) return "🏆 The absolute BEST!"
  if (value >= 9) return "⭐ Exceptional - almost perfect!"
  if (value >= 8) return "🔥 Really great!"
  if (value >= 7) return "👍 Pretty good!"
  if (value >= 6) return "😐 It's okay"
  if (value >= 5) return "🤷 Meh..."
  if (value >= 3) return "😕 Not great"
  if (value >= 1) return "❌ Skip this one"
  return "🍕 Slide to rate!"
}
