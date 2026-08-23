export function Logo({ className = "h-9 w-9", showText = false, textClassName = "" }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 140 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          {/* Left Arrow Blue Gradient */}
          <linearGradient id="ifBlueGrad" x1="0" y1="120" x2="70" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A52E2" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#00C3FF" />
          </linearGradient>

          {/* Left Arrow Upper Tip Glow */}
          <linearGradient id="ifBlueTipGrad" x1="40" y1="40" x2="75" y2="5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#00D5FF" />
          </linearGradient>

          {/* Right Teal Ribbon & Fold Gradient */}
          <linearGradient id="ifTealGrad" x1="30" y1="120" x2="135" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A9396" />
            <stop offset="45%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#38E54D" />
          </linearGradient>

          {/* Right Arrow Horizontal Cut Teal Gradient */}
          <linearGradient id="ifTealArrowGrad" x1="50" y1="65" x2="130" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#009688" />
            <stop offset="60%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>

          {/* Shadow Filter for Depth */}
          <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0072FF" floodOpacity="0.2" />
          </filter>
        </defs>

        <g filter="url(#logoGlow)">
          {/* 1. LEFT BLUE SWOOPING RIBBON ("i") */}
          {/* Main Swoop Base */}
          <path
            d="M 5 112 C 30 110, 52 82, 54 48 C 55 35, 48 24, 32 18 C 30 12, 40 8, 52 8 L 74 8 L 56 36 L 46 25 C 49 38, 44 68, 25 96 C 18 106, 10 111, 5 112 Z"
            fill="url(#ifBlueGrad)"
          />
          {/* Top Blue Arrow Head */}
          <path
            d="M 32 18 C 45 10, 58 6, 75 6 L 60 42 L 48 28 Z"
            fill="url(#ifBlueTipGrad)"
          />

          {/* 2. RIGHT TEAL DOCUMENT SWOOP ("F") */}
          {/* Main Stem curving into Paper Header */}
          <path
            d="M 32 112 C 50 110, 68 85, 68 55 C 68 32, 78 8, 108 8 C 122 8, 132 18, 132 36 C 132 46, 122 52, 110 52 C 94 52, 88 40, 88 24 C 78 30, 62 65, 42 110 Z"
            fill="url(#ifTealGrad)"
          />

          {/* Folded Paper Corner (Top Right) */}
          <path
            d="M 112 8 L 132 28 L 112 28 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* 3. MIDDLE TEAL HORIZONTAL ARROW (Crossbar of "F") */}
          {/* Arrow Tail & Head sweeping right */}
          <path
            d="M 52 74 C 68 56, 88 50, 114 50 L 102 34 L 132 54 L 102 74 L 110 60 C 88 60, 70 66, 52 74 Z"
            fill="url(#ifTealArrowGrad)"
          />
        </g>
      </svg>

      {showText && (
        <div className={`flex items-baseline ${textClassName}`}>
          <span className="font-signature text-2xl font-bold bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 bg-clip-text text-transparent transform -rotate-3">
            Invoice
          </span>
          <span className="font-black tracking-wider text-white text-base ml-0.5 uppercase">
            FLOW
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
