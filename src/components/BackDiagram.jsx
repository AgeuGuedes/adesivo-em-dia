import { useState } from 'react'
import { POSITION_DAY, POSITION_LABELS } from '../lib/rotation'

const CIRCLES = {
  ES1: { cx: 75,  cy: 160 }, ES2: { cx: 112, cy: 160 },
  EM1: { cx: 78,  cy: 247 }, EM2: { cx: 115, cy: 247 },
  EI1: { cx: 82,  cy: 328 }, EI2: { cx: 119, cy: 328 },
  DS1: { cx: 188, cy: 160 }, DS2: { cx: 225, cy: 160 },
  DM1: { cx: 185, cy: 247 }, DM2: { cx: 222, cy: 247 },
  DI1: { cx: 181, cy: 328 }, DI2: { cx: 218, cy: 328 },
}

const R = 16

export default function BackDiagram({ activePosition, appliedPosition }) {
  const [tooltip, setTooltip] = useState(null)

  function handleClick(pos, cx, cy) {
    if (pos !== appliedPosition) return
    setTooltip(t => t === pos ? null : pos)
    setTimeout(() => setTooltip(null), 2500)
  }

  const tooltipPos = tooltip ? CIRCLES[tooltip] : null
  const tooltipLabel = tooltip ? POSITION_LABELS[tooltip]?.label : null

  return (
    <svg
      viewBox="0 0 300 430"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[300px] mx-auto"
      aria-label="Diagrama das costas"
    >
      <defs>
        <linearGradient id="bodyFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#dde8f5"/>
          <stop offset="100%" stopColor="#c8d8ee"/>
        </linearGradient>
        <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="bodyShadow" x="-10%" y="-5%" width="120%" height="110%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#a0b4cc" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Head */}
      <ellipse cx="150" cy="50" rx="30" ry="34"
        fill="#dde8f5" stroke="#b0c4de" strokeWidth="1.5" filter="url(#bodyShadow)"/>
      <ellipse cx="120" cy="53" rx="5" ry="9" fill="#ccd8ec" stroke="#b0c4de" strokeWidth="1"/>
      <ellipse cx="180" cy="53" rx="5" ry="9" fill="#ccd8ec" stroke="#b0c4de" strokeWidth="1"/>

      {/* Neck */}
      <path d="M 140 82 C 138 91 136 103 136 111 L 164 111 C 164 103 162 91 160 82 Z"
        fill="#ccd8ec" stroke="#b0c4de" strokeWidth="1"/>

      {/* Torso */}
      <path d="
        M 136 110
        C 108 113, 57 127, 37 155
        C 25 171, 24 192, 24 210
        L 24 227
        C 24 243, 40 252, 62 253
        L 65 253
        L 68 315
        C 68 332, 72 343, 77 349
        L 78 371
        C 78 385, 94 392, 111 392
        L 189 392
        C 206 392, 222 385, 222 371
        L 223 349
        C 228 343, 232 332, 232 315
        L 235 253
        L 238 253
        C 260 252, 276 243, 276 227
        L 276 210
        C 276 192, 275 171, 263 155
        C 243 127, 192 113, 164 110
        Z"
        fill="url(#bodyFill)" stroke="#b0c4de" strokeWidth="1.5" filter="url(#bodyShadow)"/>

      {/* Shoulder blade hints */}
      <ellipse cx="97"  cy="190" rx="26" ry="44" fill="#c4d4e8" opacity="0.45"/>
      <ellipse cx="203" cy="190" rx="26" ry="44" fill="#c4d4e8" opacity="0.45"/>

      {/* Spine */}
      <line x1="150" y1="114" x2="150" y2="386"
        stroke="#9eb4cc" strokeWidth="1.2" strokeDasharray="5,5" opacity="0.6"/>

      {/* Horizontal dividers */}
      {[204, 283].map(y => (
        <line key={y} x1="63" y1={y} x2="237" y2={y}
          stroke="#9eb4cc" strokeWidth="1" strokeDasharray="5,5" opacity="0.5"/>
      ))}

      {/* Row labels */}
      {[
        { x: 150, y: 127, t: 'SUPERIOR' },
        { x: 150, y: 216, t: 'MEIO' },
        { x: 150, y: 295, t: 'INFERIOR' },
      ].map(({ x, y, t }) => (
        <text key={t} x={x} y={y} textAnchor="middle" fontSize="8.5"
          fontFamily="system-ui" letterSpacing="2"
          fill="#8fa8c2" fontWeight="700">{t}</text>
      ))}

      {/* ESQ / DIR */}
      <text x="68"  y="408" textAnchor="middle" fontSize="11"
        fontFamily="system-ui" fill="#7a96b0" letterSpacing="0.5" fontWeight="600">← ESQ</text>
      <text x="232" y="408" textAnchor="middle" fontSize="11"
        fontFamily="system-ui" fill="#7a96b0" letterSpacing="0.5" fontWeight="600">DIR →</text>

      {/* Circles */}
      {Object.entries(CIRCLES).map(([pos, { cx, cy }]) => {
        const isActive   = pos === activePosition
        const isApplied  = pos === appliedPosition
        const day        = POSITION_DAY[pos]

        return (
          <g key={pos} style={{ cursor: isApplied ? 'pointer' : 'default' }}
            onClick={() => handleClick(pos, cx, cy)}>

            {/* Pulse ring */}
            {isActive && (
              <circle cx={cx} cy={cy} r={R + 2} fill="#1d6ed8" opacity="0.4">
                <animate attributeName="r"       values={`${R+2};${R+14};${R+2}`} dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4"              dur="2s" repeatCount="indefinite"/>
              </circle>
            )}
            {isApplied && (
              <circle cx={cx} cy={cy} r={R + 2} fill="#ef4444" opacity="0.35">
                <animate attributeName="r"       values={`${R+2};${R+10};${R+2}`} dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.35;0;0.35"             dur="2.5s" repeatCount="indefinite"/>
              </circle>
            )}

            {/* Circle fill */}
            <circle
              cx={cx} cy={cy} r={R}
              fill={isApplied ? '#ef4444' : isActive ? '#1d6ed8' : '#ffffff'}
              stroke={isApplied ? '#dc2626' : isActive ? '#1558b0' : '#b8cce0'}
              strokeWidth={isApplied || isActive ? 2.5 : 1.5}
              filter={isApplied ? 'url(#glowRed)' : isActive ? 'url(#glowBlue)' : undefined}
            />

            {/* Day number */}
            <text x={cx} y={cy + 6} textAnchor="middle"
              fontSize={isApplied || isActive ? '14' : '13'}
              fontWeight="900" fontFamily="system-ui"
              fill={isApplied || isActive ? '#ffffff' : '#64748b'}>
              {day}
            </text>

            {/* Position code */}
            <text x={cx} y={cy + R + 12} textAnchor="middle"
              fontSize="7" fontWeight="600" fontFamily="system-ui"
              fill={isApplied ? '#ef4444' : isActive ? '#1d6ed8' : '#94a3b8'}>
              {pos}
            </text>
          </g>
        )
      })}

      {/* Tooltip balloon */}
      {tooltipPos && tooltipLabel && (() => {
        const { cx, cy } = tooltipPos
        const above = cy > 200
        const ty  = above ? cy - R - 42 : cy + R + 14
        const arr = above ? cy - R - 6  : cy + R + 2
        const tw  = Math.min(tooltipLabel.length * 8 + 20, 130)
        return (
          <g>
            <rect x={cx - tw/2} y={ty} width={tw} height={26}
              rx="7" fill="#1e293b" opacity="0.92"/>
            <polygon
              points={`${cx-6},${arr} ${cx+6},${arr} ${cx},${above ? arr+8 : arr-8}`}
              fill="#1e293b" opacity="0.92"/>
            <text x={cx} y={ty + 17} textAnchor="middle"
              fontSize="10" fontWeight="700" fontFamily="system-ui" fill="#ffffff">
              ✓ {tooltipLabel}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}
