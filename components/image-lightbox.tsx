"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Move,
    RotateCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageLightboxProps {
    images: string[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
    title?: string
}

export function ImageLightbox({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    title = "Property",
}: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Reset state when image changes
    useEffect(() => {
        setZoom(1)
        setRotation(0)
        setPanOffset({ x: 0, y: 0 })
    }, [currentIndex])

    // Reset to initial index when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
            setZoom(1)
            setRotation(0)
            setPanOffset({ x: 0, y: 0 })
        }
    }, [isOpen, initialIndex])

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    // Keyboard controls
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    onClose()
                    break
                case "ArrowLeft":
                    goToPrev()
                    break
                case "ArrowRight":
                    goToNext()
                    break
                case "+":
                case "=":
                    handleZoomIn()
                    break
                case "-":
                    handleZoomOut()
                    break
                case "r":
                    handleRotate()
                    break
                case "0":
                    handleReset()
                    break
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [isOpen, currentIndex])

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }, [images.length])

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, [images.length])

    const handleZoomIn = () => {
        setZoom((z) => Math.min(z + 0.5, 5))
    }

    const handleZoomOut = () => {
        setZoom((z) => {
            const newZoom = Math.max(z - 0.5, 1)
            if (newZoom === 1) setPanOffset({ x: 0, y: 0 })
            return newZoom
        })
    }

    const handleRotate = () => {
        setRotation((r) => r + 90)
    }

    const handleRotateReverse = () => {
        setRotation((r) => r - 90)
    }

    const handleReset = () => {
        setZoom(1)
        setRotation(0)
        setPanOffset({ x: 0, y: 0 })
    }

    // Mouse wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.3 : 0.3
        setZoom((z) => {
            const newZoom = Math.min(Math.max(z + delta, 1), 5)
            if (newZoom === 1) setPanOffset({ x: 0, y: 0 })
            return newZoom
        })
    }, [])

    // Pan (drag) handlers
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (zoom <= 1) return
            e.preventDefault()
            setIsPanning(true)
            setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
        },
        [zoom, panOffset]
    )

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isPanning) return
            setPanOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            })
        },
        [isPanning, panStart]
    )

    const handleMouseUp = useCallback(() => {
        setIsPanning(false)
    }, [])

    // Touch handlers for mobile pan
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (zoom <= 1 || e.touches.length !== 1) return
            const touch = e.touches[0]
            setIsPanning(true)
            setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y })
        },
        [zoom, panOffset]
    )

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isPanning || e.touches.length !== 1) return
            const touch = e.touches[0]
            setPanOffset({
                x: touch.clientX - panStart.x,
                y: touch.clientY - panStart.y,
            })
        },
        [isPanning, panStart]
    )

    const handleTouchEnd = useCallback(() => {
        setIsPanning(false)
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-md lightbox-fade-in"
                onClick={onClose}
            />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                    <span className="text-white/90 text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </span>
                    <span className="text-white/40">|</span>
                    <span className="text-white/50 text-sm truncate max-w-md">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl lightbox-slide-up">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    title="Zoom Out (-)"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white/60 text-xs font-mono w-12 text-center tabular-nums">
                    {Math.round(zoom * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                    onClick={handleZoomIn}
                    disabled={zoom >= 5}
                    title="Zoom In (+)"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                    onClick={handleRotateReverse}
                    title="Rotate Left"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                    onClick={handleRotate}
                    title="Rotate Right (R)"
                >
                    <RotateCw className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                    onClick={handleReset}
                    title="Reset View (0)"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm border border-white/10"
                        onClick={goToPrev}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm border border-white/10"
                        onClick={goToNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </>
            )}

            {/* Main Image */}
            <div
                ref={containerRef}
                className={cn(
                    "relative z-10 w-full h-full flex items-center justify-center p-16 lightbox-image-enter",
                    zoom > 1 ? "cursor-grab" : "cursor-default",
                    isPanning && "cursor-grabbing"
                )}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="relative transition-transform duration-200 ease-out max-w-full max-h-full"
                    style={{
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transitionDuration: isPanning ? "0ms" : "200ms",
                    }}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        width={1200}
                        height={800}
                        className="max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl select-none pointer-events-none"
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 max-w-[90vw] overflow-x-auto lightbox-slide-up">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={cn(
                                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                                currentIndex === i
                                    ? "border-white scale-105 shadow-lg"
                                    : "border-transparent opacity-50 hover:opacity-80"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
