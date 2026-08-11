"use client"

import Link from "next/link"
import Image from "next/image"
import { Lock, CheckCircle2, Building2, UserPlus, ArrowRight, ShieldCheck, Sparkles, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PropertyAuthGateProps {
    propertyId: string
}

export function PropertyAuthGate({ propertyId }: PropertyAuthGateProps) {
    const redirectPath = `/properties/${propertyId}`

    return (
        <div className="relative min-h-[80vh] w-full flex items-center justify-center p-4 lg:p-8 overflow-hidden">
            {/* Artistic blurred background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/auth-bg.png"
                    alt="Property Preview"
                    fill
                    className="object-cover blur-sm opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5" />
            </div>

            <Card className="relative z-10 w-full max-w-2xl border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-5 gap-0">
                        {/* Visual Column */}
                        <div className="md:col-span-2 relative hidden md:block bg-primary/5 border-r border-border/50">
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6 text-center">
                                <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
                                    <Lock className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Member Access</p>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                        Join 10,000+ users finding their dream home today.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Column */}
                        <div className="md:col-span-3 p-8 lg:p-12">
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Unlock Full Details</span>
                                    </div>
                                    <h2 className="font-serif text-3xl font-black text-slate-900 mb-4 tracking-tight">
                                        Experience the full details of this property
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                                        For security and exclusivity, we require a quick sign-in to view high-resolution galleries, exact locations, and full owner contact details.
                                    </p>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">High Resolution Photo Gallery</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <MapPin className="h-3 w-3 text-emerald-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">Exact Google Maps Location</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                            </div>
                                            <span className="font-medium text-slate-700">Direct Owner Contact Details</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="flex-1 gap-2 h-12 text-sm font-bold shadow-lg shadow-primary/20" asChild>
                                        <Link href={`/auth/login?redirect=${redirectPath}`}>
                                            <Building2 className="h-4 w-4" />
                                            Sign In
                                            <ArrowRight className="h-4 w-4 ml-auto" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="flex-1 gap-2 h-12 text-sm font-bold" asChild>
                                        <Link href={`/auth/register?redirect=${redirectPath}`}>
                                            <UserPlus className="h-4 w-4" />
                                            Join Free
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
