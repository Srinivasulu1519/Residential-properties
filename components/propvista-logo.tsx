"use client"

import { cn } from "@/lib/utils"

interface PropVistaLogoProps {
    size?: "sm" | "md" | "lg"
    variant?: "light" | "dark" | "auto"
    showText?: boolean
    className?: string
}

export function PropVistaLogo({
    size = "md",
    variant = "auto",
    showText = true,
    className,
}: PropVistaLogoProps) {
    const sizes = {
        sm: { icon: "h-8 w-8", text: "text-lg", sub: "text-[8px]", gap: "gap-2" },
        md: { icon: "h-10 w-10", text: "text-xl", sub: "text-[10px]", gap: "gap-3" },
        lg: { icon: "h-14 w-14", text: "text-2xl", sub: "text-[11px]", gap: "gap-4" },
    }

    const s = sizes[size]

    return (
        <div className={cn("flex items-center", s.gap, className)}>
            {/* Dynamic animated SVG logo */}
            <div className={cn("relative group", s.icon)}>
                <div className="absolute inset-0 rounded-xl bg-primary opacity-90 group-hover:opacity-100 transition-opacity duration-300 shadow-lg group-hover:shadow-primary/25" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent" />
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="relative z-10 w-full h-full p-2 drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Building pillars */}
                    <rect x="6" y="14" width="5" height="20" rx="1" fill="white" opacity="0.9">
                        <animate attributeName="height" values="0;20" dur="0.6s" fill="freeze" />
                        <animate attributeName="y" values="34;14" dur="0.6s" fill="freeze" />
                    </rect>
                    <rect x="13.5" y="8" width="5" height="26" rx="1" fill="white">
                        <animate attributeName="height" values="0;26" dur="0.7s" fill="freeze" />
                        <animate attributeName="y" values="34;8" dur="0.7s" fill="freeze" />
                    </rect>
                    <rect x="21" y="12" width="5" height="22" rx="1" fill="white" opacity="0.9">
                        <animate attributeName="height" values="0;22" dur="0.65s" fill="freeze" />
                        <animate attributeName="y" values="34;12" dur="0.65s" fill="freeze" />
                    </rect>
                    <rect x="28.5" y="16" width="5" height="18" rx="1" fill="white" opacity="0.8">
                        <animate attributeName="height" values="0;18" dur="0.55s" fill="freeze" />
                        <animate attributeName="y" values="34;16" dur="0.55s" fill="freeze" />
                    </rect>
                    {/* Roof line */}
                    <path
                        d="M4 34.5h32"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.6"
                    />
                    {/* Accent triangle / roof peak */}
                    <path
                        d="M16 4L20 8L13 8Z"
                        fill="white"
                        opacity="0.7"
                    >
                        <animate attributeName="opacity" values="0;0.7" dur="0.8s" fill="freeze" />
                    </path>
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className={cn(
                        "font-serif font-bold tracking-tight leading-none",
                        s.text,
                        variant === "light" ? "text-white" : variant === "dark" ? "text-foreground" : "text-foreground"
                    )}>
                        PropVista
                    </span>
                    <span className={cn(
                        "font-bold uppercase tracking-[0.2em] mt-0.5",
                        s.sub,
                        variant === "light" ? "text-white/50" : "text-muted-foreground/60"
                    )}>
                        Premium Living
                    </span>
                </div>
            )}
        </div>
    )
}
