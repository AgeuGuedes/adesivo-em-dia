import { useState } from 'react'
import { POSITION_DAY, POSITION_LABELS } from '../lib/rotation'

// Columns moved inward (78/118/182/222) so all circles stay inside the body.
// Lower torso path widened (+20 px each side from y=253 down) to accommodate.
const CIRCLES = {
  ES1: { cx: 78,  cy: 163 }, ES2: { cx: 118, cy: 163 },
  EM1: { cx: 78,  cy: 251 }, EM2: { cx: 118, cy: 251 },
  EI1: { cx: 78,  cy: 333 }, EI2: { cx: 118, cy: 333 },
  DS1: { cx: 182, cy: 163 }, DS2: { cx: 222, cy: 163 },
  DM1: { cx: 182, cy: 251 }, DM2: { cx: 222, cy: 251 },
  DI1: { cx: 182, cy: 333 }, DI2: { cx: 222, cy: 333 },
}

const R = 18

export default function BackDiagram({ activePosition, appliedPosition }) {
  const [tooltip, setTooltip] = useState(null)

  function handleClick(pos) {
    if (pos !== appliedPosition) return
    setTooltip(t => t === pos ? null : pos)
    setTimeout(() => setTooltip(null), 2500)
  }

  const tooltipPos   = tooltip ? CIRCLES[tooltip] : null
  const tooltipLabel = tooltip ? POSITION_LABELS[tooltip]?.label : null

  return (
    <svg
      viewBox="0 0 300 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[340px] mx-auto"
      aria-label="Diagrama das costas"
    >
      <defs>
        <linearGradient id="bodyFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ede9fb"/>
          <stop offset="100%" stopColor="#ddd3f7"/>
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
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#9a8dc8" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Head */}
      <ellipse cx="150" cy="50" rx="30" ry="34"
        fill="#ede9fb" stroke="#c4b4e8" strokeWidth="1.5" filter="url(#bodyShadow)"/>
      <ellipse cx="120" cy="53" rx="5" ry="9" fill="#d8cef2" stroke="#c4b4e8" strokeWidth="1"/>
      <ellipse cx="180" cy="53" rx="5" ry="9" fill="#d8cef2" stroke="#c4b4e8" strokeWidth="1"/>

      {/* Neck */}
      <path d="M 140 82 C 138 91 136 103 136 111 L 164 111 C 164 103 162 91 160 82 Z"
        fill="#d8cef2" stroke="#c4b4e8" strokeWidth="1"/>

      {/* Torso — lower section widened 20 px per side so all circles stay inside */}
      <path d="
        M 136 110
        C 108 113, 57 127, 37 155
        C 25 171, 24 192, 24 210
        L 24 227
        C 24 243, 30 252, 46 253
        L 48 253
        L 50 315
        C 50 332, 55 343, 60 349
        L 61 371
        C 61 385, 77 392, 94 392
        L 206 392
        C 223 392, 239 385, 239 371
        L 240 349
        C 245 343, 250 332, 250 315
        L 252 253
        L 254 253
        C 270 252, 276 243, 276 227
        L 276 210
        C 276 192, 275 171, 263 155
        C 243 127, 192 113, 164 110
        Z"
        fill="url(#bodyFill)" stroke="#c4b4e8" strokeWidth="1.5" filter="url(#bodyShadow)"/>

      {/* Shoulder blade hints */}
      <ellipse cx="97"  cy="190" rx="26" ry="44" fill="#d4c8f0" opacity="0.45"/>
      <ellipse cx="203" cy="190" rx="26" ry="44" fill="#d4c8f0" opacity="0.45"/>

      {/* Spine */}
      <line x1="150" y1="114" x2="150" y2="386"
        stroke="#b4a8d8" strokeWidth="1.2" strokeDasharray="5,5" opacity="0.6"/>

      {/* Horizontal dividers */}
      {[207, 287].map(y => (
        <line key={y} x1="50" y1={y} x2="250" y2={y}
          stroke="#b4a8d8" strokeWidth="1" strokeDasharray="5,5" opacity="0.5"/>
      ))}

      {/* Row labels */}
      {[
        { x: 150, y: 128, t: 'SUPERIOR' },
        { x: 150, y: 220, t: 'MEIO' },
        { x: 150, y: 300, t: 'INFERIOR' },
      ].map(({ x, y, t }) => (
        <text key={t} x={x} y={y} textAnchor="middle" fontSize="10"
          fontFamily="system-ui" letterSpacing="2"
          fill="#9a8dc8" fontWeight="700">{t}</text>
      ))}

      {/* ESQ / DIR */}
      <text x="78"  y="420" textAnchor="middle" fontSize="13"
        fontFamily="system-ui" fill="#8878c0" letterSpacing="0.5" fontWeight="700">← ESQ</text>
      <text x="222" y="420" textAnchor="middle" fontSize="13"
        fontFamily="system-ui" fill="#8878c0" letterSpacing="0.5" fontWeight="700">DIR →</text>

      {/* Circles */}
      {Object.entries(CIRCLES).map(([pos, { cx, cy }]) => {
        const isActive  = pos === activePosition
        const isApplied = pos === appliedPosition
        const day       = POSITION_DAY[pos]

        return (
          <g key={pos} style={{ cursor: isApplied ? 'pointer' : 'default' }}
            onClick={() => handleClick(pos)}>

            {isActive && (
              <circle cx={cx} cy={cy} r={R + 2} fill="#8C67D9" opacity="0.4">
                <animate attributeName="r"       values={`${R+2};${R+10};${R+2}`} dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4"               dur="2s" repeatCount="indefinite"/>
              </circle>
            )}
            {isApplied && (
              <circle cx={cx} cy={cy} r={R + 2} fill="#ef4444" opacity="0.35">
                <animate attributeName="r"       values={`${R+2};${R+10};${R+2}`} dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.35;0;0.35"              dur="2.5s" repeatCount="indefinite"/>
              </circle>
            )}

            <circle
              cx={cx} cy={cy} r={R}
              fill={isApplied ? '#ef4444' : isActive ? '#8C67D9' : '#ffffff'}
              stroke={isApplied ? '#dc2626' : isActive ? '#7355b5' : '#c4b4e8'}
              strokeWidth={isApplied || isActive ? 2.5 : 1.5}
              filter={isApplied ? 'url(#glowRed)' : isActive ? 'url(#glowBlue)' : undefined}
            />

            <text x={cx} y={cy + 6} textAnchor="middle"
              fontSize={isApplied || isActive ? '15' : '14'}
              fontWeight="900" fontFamily="system-ui"
              fill={isApplied || isActive ? '#ffffff' : '#4a6080'}>
              {day}
            </text>

            <text x={cx} y={cy + R + 14} textAnchor="middle"
              fontSize="9.5" fontWeight="700" fontFamily="system-ui"
              fill={isApplied ? '#ef4444' : isActive ? '#8C67D9' : '#8878c0'}>
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
