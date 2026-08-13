"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PropVistaLogo } from "@/components/propvista-logo"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()

            if (data.success) {
                setIsSubmitted(true)
                toast.success("Reset link sent!", {
                    description: "Check your email for the password reset link."
                })
            } else {
                toast.error("Failed to send reset link", {
                    description: data.message
                })
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
                        <CardTitle className="font-serif text-2xl">Forgot Password</CardTitle>
                        <CardDescription className="mt-1.5">
                            Enter your email to receive a secure reset link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                                            required
                                            autoFocus
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-lg" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending Link...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4 py-6">
                                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-serif text-lg font-medium text-foreground">Check your email</h3>
                                <p className="text-sm text-muted-foreground">
                                    We sent a password reset link to <strong className="text-foreground">{email}</strong>
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-border/40 p-4">
                        <Link href="/auth/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
