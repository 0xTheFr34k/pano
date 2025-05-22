import React from 'react'

interface SnookerIconProps {
  className?: string
  size?: number
}

export function SnookerIcon({ className = "", size = 24 }: SnookerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Snooker table */}
      <rect
        x="64"
        y="128"
        width="384"
        height="256"
        rx="32"
        ry="32"
        fill="#2d5016"
        stroke="#1a3009"
        strokeWidth="4"
      />
      
      {/* Table border/cushions */}
      <rect
        x="80"
        y="144"
        width="352"
        height="224"
        rx="16"
        ry="16"
        fill="#4a7c59"
      />
      
      {/* Playing surface */}
      <rect
        x="96"
        y="160"
        width="320"
        height="192"
        rx="8"
        ry="8"
        fill="#0f7b0f"
      />
      
      {/* Pockets */}
      <circle cx="96" cy="160" r="12" fill="#000" />
      <circle cx="256" cy="160" r="10" fill="#000" />
      <circle cx="416" cy="160" r="12" fill="#000" />
      <circle cx="96" cy="352" r="12" fill="#000" />
      <circle cx="256" cy="352" r="10" fill="#000" />
      <circle cx="416" cy="352" r="12" fill="#000" />
      
      {/* Cue stick */}
      <line
        x1="180"
        y1="220"
        x2="380"
        y2="280"
        stroke="#8B4513"
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Cue tip */}
      <circle cx="180" cy="220" r="4" fill="#4169E1" />
      
      {/* Balls */}
      <circle cx="200" cy="240" r="8" fill="#fff" />
      <circle cx="220" cy="250" r="8" fill="#ff0000" />
      <circle cx="240" cy="260" r="8" fill="#ffff00" />
      <circle cx="260" cy="270" r="8" fill="#00ff00" />
      <circle cx="280" cy="280" r="8" fill="#8B4513" />
      <circle cx="300" cy="290" r="8" fill="#0000ff" />
      <circle cx="320" cy="300" r="8" fill="#ff69b4" />
      <circle cx="340" cy="310" r="8" fill="#000" />
      
      {/* Table legs */}
      <rect x="80" y="384" width="16" height="32" fill="#8B4513" />
      <rect x="416" y="384" width="16" height="32" fill="#8B4513" />
      <rect x="80" y="96" width="16" height="32" fill="#8B4513" />
      <rect x="416" y="96" width="16" height="32" fill="#8B4513" />
    </svg>
  )
}
