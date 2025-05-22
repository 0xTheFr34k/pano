import React from 'react'

interface EightBallIconProps {
  className?: string
  size?: number
}

export function EightBallIcon({ className = "", size = 24 }: EightBallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main ball circle */}
      <circle
        cx="256"
        cy="256"
        r="200"
        fill="#000"
        stroke="#333"
        strokeWidth="4"
      />
      
      {/* White circle for number */}
      <circle
        cx="256"
        cy="256"
        r="80"
        fill="#fff"
        stroke="#ddd"
        strokeWidth="2"
      />
      
      {/* Number 8 */}
      <path
        d="M 230 220 
           C 230 200, 250 180, 280 180
           C 310 180, 330 200, 330 220
           C 330 235, 320 245, 305 250
           C 320 255, 330 265, 330 280
           C 330 300, 310 320, 280 320
           C 250 320, 230 300, 230 280
           C 230 265, 240 255, 255 250
           C 240 245, 230 235, 230 220 Z
           
           M 250 220
           C 250 210, 260 200, 280 200
           C 300 200, 310 210, 310 220
           C 310 230, 300 240, 280 240
           C 260 240, 250 230, 250 220 Z
           
           M 250 280
           C 250 270, 260 260, 280 260
           C 300 260, 310 270, 310 280
           C 310 290, 300 300, 280 300
           C 260 300, 250 290, 250 280 Z"
        fill="#000"
      />
      
      {/* Highlight/shine effect */}
      <ellipse
        cx="200"
        cy="180"
        rx="40"
        ry="60"
        fill="#333"
        opacity="0.3"
      />
      
      {/* Small highlight */}
      <circle
        cx="180"
        cy="160"
        r="20"
        fill="#555"
        opacity="0.5"
      />
    </svg>
  )
}
