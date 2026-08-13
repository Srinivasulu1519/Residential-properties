"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PropVistaLogo } from "@/components/propvista-logo"
import { toast } from "sonner"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    
    const router = useRouter()

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex justify-center">
                        <PropVistaLogo size="md" />
                    </div>
                    <Card className="border-border/40 text-center">
                        <CardContent className="p-8 space-y-4">
                            <CardTitle className="font-serif text-xl">Invalid or Missing Token</CardTitle>
                            <p className="text-muted-foreground text-sm">You must use a valid password reset link from your email.</p>
                            <Link href="/auth/forgot-password">
                                <Button className="w-full h-12 rounded-lg mt-4">Request New Link</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!")
            return
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })
            const data = await res.json()

            if (data.success) {
                setIsSuccess(true)
                toast.success("Password Updated!", {
                    description: "You successfully changed your password."
                })
                setTimeout(() => router.push("/auth/login"), 2500)
            } else {
                toast.error("Reset Failed", { description: data.message })
            }
        } catch {
            toast.error("An error occurred. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex justify-center">
                    <PropVistaLogo size="md" />
                </div>

                <Card className="border-border/40">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="font-serif text-2xl">Set New Password</CardTitle>
                        <CardDescription className="mt-1.5">
                            Please enter your new password below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password (min 6 chars)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 pl-11 pr-11 bg-secondary/30 border-border/40 focus:bg-background"
                                            disabled={isLoading}
                                            required
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground/50"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12 pl-11 bg-secondary/30 border-border/40 focus:bg-background"
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 rounded-lg mt-1" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4 py-6">
                                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-serif text-lg font-medium text-foreground">Password Updated</h3>
                                <p className="text-sm text-muted-foreground">
                                    You will be redirected to the login page momentarily.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
