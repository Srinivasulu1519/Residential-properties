"use client"

import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left - width / 2
    const y = e.clientY - rect.top - height / 2

    // Calculate rotation (-15 to 15 degrees)
    const rotateY = (x / width) * 30
    const rotateX = -(y / height) * 30

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("transition-all duration-200 ease-out", className)}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div 
        style={{ transform: "translateZ(30px)" }} 
        className="h-full w-full relative transition-transform duration-200"
      >
        {children}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-2xl opacity-50"
            style={{
               background: `radial-gradient(circle at ${rotation.y + 50}% ${-rotation.x + 50}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
            }}
          />
        )}
      </div>
    </div>
  )
}
