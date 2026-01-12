import { useState, useEffect, useRef } from 'react'
import { playBiteSound } from '../lib/sounds'

// Food SVG components
import { PizzaSVG } from './foods/PizzaSVG'
import { BurgerSVG } from './foods/BurgerSVG'
import { SandwichSVG } from './foods/SandwichSVG'
import { BreakfastSandwichSVG } from './foods/BreakfastSandwichSVG'
import { PastaSVG } from './foods/PastaSVG'
import { SushiSVG } from './foods/SushiSVG'
import { PokeBowlSVG } from './foods/PokeBowlSVG'
import { TacoSVG } from './foods/TacoSVG'
import { WingsSVG } from './foods/WingsSVG'
import { TendysSVG } from './foods/TendysSVG'
import { LobsterRollSVG } from './foods/LobsterRollSVG'
import { FriesSVG } from './foods/FriesSVG'
import { SeafoodSVG } from './foods/SeafoodSVG'
import { ChowderSVG } from './foods/ChowderSVG'
import { SoupSVG } from './foods/SoupSVG'
import { BreakfastSVG } from './foods/BreakfastSVG'
import { SaladSVG } from './foods/SaladSVG'
import { AppsSVG } from './foods/AppsSVG'
import { FriedChickenSVG } from './foods/FriedChickenSVG'
import { EntreeSVG } from './foods/EntreeSVG'

export function FoodRatingSlider({ value, onChange, min = 0, max = 10, step = 0.1, category }) {
  const [crumbs, setCrumbs] = useState([])
  const lastValue = useRef(value)
  const crumbIdRef = useRef(0)

  // Calculate how much food is eaten (0 = full, 1 = fully eaten)
  const eatenPercent = (value - min) / (max - min)

  // Track last bite sound time to throttle
  const lastBiteSoundTime = useRef(0)

  // Generate crumbs and play bite sound when slider moves up (more eating)
  useEffect(() => {
    if (value > lastValue.current) {
      const valueDiff = value - lastValue.current
      const numCrumbs = Math.ceil(valueDiff * 2.5)
      const newCrumbs = []

      for (let i = 0; i < numCrumbs; i++) {
        newCrumbs.push({
          id: crumbIdRef.current++,
          x: 40 + Math.random() * 20,
          y: 30 + Math.random() * 20,
          size: 2 + Math.random() * 3,
          rotation: Math.random() * 360,
          fallDirection: Math.random() > 0.5 ? 1 : -1,
          delay: i * 50,
        })
      }

      setCrumbs(prev => [...prev, ...newCrumbs])

      setTimeout(() => {
        setCrumbs(prev => prev.filter(c => !newCrumbs.find(nc => nc.id === c.id)))
      }, 1000)

      // Play bite sound (throttled to avoid too many sounds)
      const now = Date.now()
      if (now - lastBiteSoundTime.current > 80 && valueDiff > 0.3) {
        playBiteSound(category)
        lastBiteSoundTime.current = now
      }
    }
    lastValue.current = value
  }, [value, min, max, category])

  // Get the right food SVG based on category
  const FoodComponent = getFoodComponent(category)
  const crumbColor = getCrumbColor(category)
  const isPlatedFood = hasPlate(category)

  return (
    <div className="space-y-4">
      {/* Food visualization */}
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
            // Plated foods don't shrink - the plate stays, only food disappears
            transform: isPlatedFood
              ? 'scale(1)'
              : `scale(${value >= 10 ? 0 : 1 - eatenPercent * 0.3})`,
            opacity: isPlatedFood ? 1 : (value >= 10 ? 0 : 1)
          }}
        >
          {/* Render the food SVG */}
          <FoodComponent eatenPercent={eatenPercent} value={value} />

          {/* Falling crumbs */}
          {crumbs.map(crumb => (
            <circle
              key={crumb.id}
              cx={crumb.x}
              cy={crumb.y}
              r={crumb.size}
              fill={crumbColor}
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
          {getRatingLabel(value, category)}
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
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-xl
            [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:bg-orange-600
            [&::-webkit-slider-thumb]:active:scale-95
            [&::-moz-range-thumb]:w-9 [&::-moz-range-thumb]:h-9 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:shadow-xl [&::-moz-range-thumb]:border-4
            [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
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

// Map category to food component
function getFoodComponent(category) {
  const foodMap = {
    'burger': BurgerSVG,
    'pizza': PizzaSVG,
    'sandwich': SandwichSVG,
    'breakfast sandwich': BreakfastSandwichSVG,
    'pasta': PastaSVG,
    'sushi': SushiSVG,
    'pokebowl': PokeBowlSVG,
    'taco': TacoSVG,
    'wings': WingsSVG,
    'tendys': TendysSVG,
    'lobster roll': LobsterRollSVG,
    'fries': FriesSVG,
    'seafood': SeafoodSVG,
    'chowder': ChowderSVG,
    'soup': SoupSVG,
    'breakfast': BreakfastSVG,
    'salad': SaladSVG,
    'apps': AppsSVG,
    'fried chicken': FriedChickenSVG,
    'entree': EntreeSVG,
  }

  return foodMap[category] || PizzaSVG // Default to pizza for now
}

// Check if food is served on a plate (doesn't shrink, plate stays)
function hasPlate(category) {
  const platedFoods = ['pasta', 'salad', 'breakfast', 'entree', 'apps', 'seafood', 'fried chicken', 'sushi', 'pokebowl', 'wings', 'tendys', 'fries', 'chowder', 'soup']
  return platedFoods.includes(category)
}

// Get crumb color based on food type
function getCrumbColor(category) {
  const colorMap = {
    'burger': '#8B4513', // Brown for burger bun
    'pizza': '#D97706', // Orange-brown for pizza crust
    'sandwich': '#D4A574', // Tan for bread
    'breakfast sandwich': '#D4A056', // Bagel color
    'pasta': '#E8D5B7', // Pasta color
    'fries': '#F4D03F', // Golden for fries
    'tendys': '#D4A574', // Breading color
    'wings': '#8B4513', // Brown
    'seafood': '#FA8072', // Salmon pink
    'chowder': '#F5E6C8', // Cream color
    'soup': '#E07020', // Tomato soup color
    'breakfast': '#FFD700', // Egg yolk
    'salad': '#228B22', // Green
    'apps': '#D4AA4A', // Breading color
    'fried chicken': '#8B4513', // Brown
    'entree': '#8B4513', // Steak brown
    'lobster roll': '#FFA07A', // Lobster meat color
    'taco': '#E8C060', // Tortilla color
  }

  return colorMap[category] || '#D97706'
}

function getRatingLabel(value, category) {
  if (value >= 10) return "🏆 PERFECT! Ate every bite!"
  if (value >= 9.5) return "🏆 The absolute BEST!"
  if (value >= 9) return "⭐ Exceptional - almost perfect!"
  if (value >= 8) return "🔥 Really great!"
  if (value >= 7) return "👍 Pretty good!"
  if (value >= 6) return "😐 It's okay"
  if (value >= 5) return "🤷 Meh..."
  if (value >= 3) return "😕 Not great"
  if (value >= 1) return "❌ Skip this one"

  // Category-specific "slide to rate" messages
  const categoryEmojis = {
    'burger': '🍔',
    'pizza': '🍕',
    'sandwich': '🥪',
    'breakfast sandwich': '🥪',
    'pasta': '🍝',
    'sushi': '🍣',
    'pokebowl': '🥗',
    'taco': '🌮',
    'wings': '🍗',
    'tendys': '🍗',
    'lobster roll': '🦞',
    'seafood': '🦐',
    'chowder': '🍲',
    'soup': '🍜',
    'breakfast': '🍳',
    'salad': '🥗',
    'fries': '🍟',
    'apps': '🍽️',
    'fried chicken': '🍗',
    'entree': '🍽️',
  }

  const emoji = categoryEmojis[category] || '🍽️'
  return `${emoji} Slide to rate!`
}
