"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Lock, Eye, EyeOff, Mail, User, Loader2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PropVistaLogo } from "@/components/propvista-logo"
import { useAdminAuth } from "@/lib/admin-auth"
import { toast } from "sonner"

export default function UserRegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { isAuthenticated, user, register } = useAdminAuth()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === "admin") {
                router.push("/admin/dashboard")
            } else {
                router.push("/dashboard")
            }
        }
    }, [isAuthenticated, user, router])

    if (isAuthenticated && user) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const result = await register(name, email, password, phone)
            if (result.success) {
                toast.success("Account created successfully!")
            } else {
                setError(result.message)
            }
        } catch {
            setError("Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left — Brand panel (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#1a2e2a] overflow-hidden">
                <Image
                    src="/images/hero-bg.jpg"
                    alt=""
                    fill
                    className="object-cover opacity-20"
                />
                <div className="relative z-10 max-w-md px-12 text-center">
                    <PropVistaLogo size="lg" variant="light" />
                    <p className="mt-6 text-sm leading-relaxed text-white/50">
                        Join thousands of users discovering premium properties. Start your property journey today.
                    </p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8 lg:hidden">
                        <PropVistaLogo size="md" />
                    </div>

                    <div className="mb-8">
                        <h1 className="font-serif text-2xl font-bold text-foreground">Create Account</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Sign up to browse and save your favorite properties.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 pl-11 bg-secondary/30 border-border/40 focus:bg-background"
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-11 bg-secondary/30 border-border/40 focus:bg-background"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-12 pl-11 bg-secondary/30 border-border/40 focus:bg-background"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-11 pr-11 bg-secondary/30 border-border/40 focus:bg-background"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground/50"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full h-12 rounded-lg mt-1" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
