"use client"

import { useState } from "react"
import { 
    X, 
    CreditCard, 
    ShieldCheck, 
    Zap, 
    Check, 
    Lock,
    Smartphone,
    Building,
    ArrowRight,
    Loader2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

type PaymentMethod = "card" | "upi" | "netbanking"

import { useAdminAuth } from "@/lib/admin-auth"

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
    const { authenticatedFetch, user } = useAdminAuth()
    const [step, setStep] = useState<"method" | "details" | "processing">("method")
    const [method, setMethod] = useState<PaymentMethod>("card")
    const [loading, setLoading] = useState(false)

    const handleProcessPayment = async () => {
        setLoading(true)
        try {
            // 1. Create order on server
            const orderRes = await authenticatedFetch("/api/razorpay/order", {
                method: "POST"
            })
            const orderData = await orderRes.json()

            if (!orderData.success) {
                toast.error(orderData.message || "Failed to initialize payment")
                setLoading(false)
                return
            }

            // 2. Load Razorpay script dynamically
            const loadScript = () => {
                return new Promise((resolve) => {
                    const script = document.createElement("script")
                    script.src = "https://checkout.razorpay.com/v1/checkout.js"
                    script.onload = () => resolve(true)
                    script.onerror = () => resolve(false)
                    document.body.appendChild(script)
                })
            }

            const isLoaded = await loadScript()
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Are you online?")
                setLoading(false)
                return
            }

            // 3. Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "PropVista Premium",
                description: "Upgrade to Premium Plan",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // 4. Verify payment on server
                    setStep("processing")
                    try {
                        const verifyRes = await authenticatedFetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            })
                        })
                        const verifyData = await verifyRes.json()

                        if (verifyData.success) {
                            toast.success("Payment Verified! Welcome to Premium.")
                            onSuccess()
                            onClose()
                        } else {
                            toast.error(verifyData.message || "Verification failed")
                            setStep("details")
                        }
                    } catch (err) {
                        toast.error("An error occurred during verification")
                        setStep("details")
                    } finally {
                        setLoading(false)
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#d97706" // Emerald-600
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false)
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error("An error occurred during payment setup")
            setLoading(false)
        }
    }

    const reset = () => {
        setStep("method")
        setMethod("card")
        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); reset(); } }}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-8 text-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                    
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <Badge className="bg-primary/20 text-emerald-100 border-primary/50/30 mb-4 px-3 py-1">
                        <Zap className="h-3 w-3 mr-1.5 fill-current" />
                        Premium Plan Upgrade
                    </Badge>
                    <DialogTitle className="text-3xl font-serif font-bold mb-2">Complete Payment</DialogTitle>
                    <DialogDescription className="text-white/60 text-base leading-relaxed">
                        Unlock unlimited property postings and contact views for just <span className="text-white font-bold">₹499/month</span>.
                    </DialogDescription>
                </div>

                <div className="p-8 bg-white">
                    {step === "method" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Payment Method</Label>
                            <div className="grid gap-3">
                                <button
                                    onClick={() => setMethod("card")}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                                        method === "card" ? "border-primary/50 bg-primary/5/50 shadow-sm" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                                        method === "card" ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    )}>
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">Credit / Debit Card</p>
                                        <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                                    </div>
                                    {method === "card" && <Check className="h-5 w-5 text-primary" />}
                                </button>

                                <button
                                    onClick={() => setMethod("upi")}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                                        method === "upi" ? "border-primary/50 bg-primary/5/50 shadow-sm" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                                        method === "upi" ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    )}>
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">UPI / Google Pay</p>
                                        <p className="text-xs text-slate-500">Instant payment via PhonePe, GPay</p>
                                    </div>
                                    {method === "upi" && <Check className="h-5 w-5 text-primary" />}
                                </button>

                                <button
                                    onClick={() => setMethod("netbanking")}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                                        method === "netbanking" ? "border-primary/50 bg-primary/5/50 shadow-sm" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                                        method === "netbanking" ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    )}>
                                        <Building className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">Net Banking</p>
                                        <p className="text-xs text-slate-500">All major Indian banks supported</p>
                                    </div>
                                    {method === "netbanking" && <Check className="h-5 w-5 text-primary" />}
                                </button>
                            </div>
                            <Button 
                                onClick={() => setStep("details")}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-indigo-600/20 group"
                            >
                                Continue to Pay
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {step === "details" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <Button variant="ghost" size="sm" onClick={() => setStep("method")} className="h-8 w-8 p-0 rounded-full">
                                    <X className="h-4 w-4 rotate-45" />
                                </Button>
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment Details</Label>
                            </div>

                            {method === "card" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="card-number">Card Number</Label>
                                        <div className="relative">
                                            <Input id="card-number" placeholder="4242 4242 4242 4242" className="pl-10 h-11" />
                                            <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry">Expiry Date</Label>
                                            <Input id="expiry" placeholder="MM / YY" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input id="cvv" placeholder="123" type="password" className="h-11" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {method === "upi" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="upi-id">UPI ID</Label>
                                        <Input id="upi-id" placeholder="username@okaxis" className="h-11 border-primary/10 focus:border-primary/50" />
                                        <p className="text-[10px] text-slate-400 italic">A payment request will be sent to your UPI app.</p>
                                    </div>
                                </div>
                            )}

                            {method === "netbanking" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Bank</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["SBI", "HDFC", "ICICI", "Axis", "KOTAK", "BOB"].map(bank => (
                                                <Button key={bank} variant="outline" className="h-11 justify-start font-medium">{bank}</Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Premium Subscription</span>
                                    <span className="font-medium">₹499.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">GST (18%)</span>
                                    <span className="font-medium">₹89.82</span>
                                </div>
                                <Separator className="my-2 bg-slate-200" />
                                <div className="flex justify-between font-bold text-lg text-slate-900">
                                    <span>Total Payable</span>
                                    <span>₹588.82</span>
                                </div>
                            </div>

                            <Button 
                                onClick={handleProcessPayment}
                                disabled={loading}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-indigo-600/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Securing Payment...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Pay ₹588.82 Now
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="py-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                            <div className="relative mb-6">
                                <div className="h-24 w-24 rounded-full border-4 border-primary/10 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Processing Payment</h3>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                                Please do not close this window or refresh the page. We are securely connecting with your bank...
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <Lock className="h-3 w-3" />
                        256-Bit SSL Secure Encryption
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
