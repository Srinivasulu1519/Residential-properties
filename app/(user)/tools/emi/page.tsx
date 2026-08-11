import { Metadata } from "next"
import { EMICalculator } from "@/components/emi-calculator"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Calculator, ShieldCheck, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "EMI Calculator - Estimate Your Monthly Property Loan Payments",
  description: "Calculate your home loan EMI (Equated Monthly Installment) quickly and accurately. Use our interactive tool to visualize your repayment schedule and plan your property purchase with confidence.",
}

export default function EMICalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Premium Hero Section */}
        <section className="relative border-b border-border/50 bg-white py-16 px-4 lg:px-8 overflow-hidden">
          <div className="mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">
            <Badge className="mb-4 bg-primary/10 text-primary font-bold border-primary/20 hover:bg-primary/20">
              Personalized Financial Tools
            </Badge>
            <h1 className="font-serif text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
               Home Loan <span className="text-primary italic">EMI Calculator</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
               Plan your finances with precision. Estimate your monthly repayments, visualize your amortization, and find the perfect property within your budget.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-6">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  No login required
               </div>
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  Instant results
               </div>
            </div>
          </div>

          {/* Background Decorative Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-primary/5 rounded-full blur-3xl opacity-50 z-0 pointer-events-none" />
        </section>

        {/* Content Section */}
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
           <div className="grid lg:grid-cols-1 gap-12">
               <div className="space-y-12">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                     <EMICalculator />
                  </div>

                  {/* FAQ/Info Section */}
                  <div className="grid md:grid-cols-3 gap-8 pt-8">
                     <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                           <Calculator className="h-5 w-5 text-orange-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">What is EMI?</h3>
                        <p className="text-xs text-muted-foreground leading-normal">
                          EMI stands for Equated Monthly Installment. It represents a fixed payment amount made by a borrower to a lender at a specified date each month. 
                        </p>
                     </div>
                     <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                           <Calculator className="h-5 w-5 text-sky-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">How it's calculated?</h3>
                        <p className="text-xs text-muted-foreground leading-normal">
                           Our calculator uses the standard formula [P x R x (1+R)^N]/[(1+R)^N-1] to provide accurate mathematical results based on your inputs.
                        </p>
                     </div>
                     <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                           <Calculator className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Maximize your Loan</h3>
                        <p className="text-xs text-muted-foreground leading-normal">
                           Maintain a healthy credit score above 750 and clear existing debts to qualify for the most competitive interest rates in the market.
                        </p>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      </main>
    </div>
  )
}
