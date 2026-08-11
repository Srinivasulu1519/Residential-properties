"use client"

import { useState, useMemo, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Info, Calculator, TrendingUp, Calendar } from "lucide-react"

interface EMICalculatorProps {
  initialAmount?: number
  compact?: boolean
}

export function EMICalculator({ initialAmount = 5000000, compact = false }: EMICalculatorProps) {
  const [amount, setAmount] = useState(initialAmount)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)

  // Recalculate if initialAmount changes (e.g. navigation between properties)
  useEffect(() => {
    if (initialAmount) setAmount(initialAmount)
  }, [initialAmount])

  const { emi, totalInterest, totalPayment, chartData } = useMemo(() => {
    const p = amount
    const r = interestRate / 12 / 100
    const n = tenure * 12

    const emiValue = n > 0 
      ? Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
      : p

    const totalPaymentValue = emiValue * n
    const totalInterestValue = totalPaymentValue - p

    return {
      emi: emiValue,
      totalInterest: totalInterestValue,
      totalPayment: totalPaymentValue,
      chartData: [
        { name: "Principal", value: p, color: "#10b981" }, // Emerald-500
        { name: "Total Interest", value: totalInterestValue, color: "#6366f1" }, // Indigo-500
      ],
    }
  }, [amount, interestRate, tenure])

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <div className={compact ? "w-full" : "mx-auto max-w-5xl space-y-8"}>
      <div className={compact ? "grid gap-6" : "grid gap-8 lg:grid-cols-2"}>
        {/* Input Region */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Loan Amount</Label>
              <span className="text-lg font-bold text-primary font-mono">{formatCurrency(amount)}</span>
            </div>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="font-mono"
            />
            <Slider
              value={[amount]}
              min={100000}
              max={50000000}
              step={100000}
              onValueChange={([val]) => setAmount(val)}
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="interest" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Interest Rate (p.a %)</Label>
              <span className="text-lg font-bold text-primary font-mono">{interestRate}%</span>
            </div>
            <Slider
              value={[interestRate]}
              min={1}
              max={20}
              step={0.1}
              onValueChange={([val]) => setInterestRate(val)}
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="tenure" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tenure (Years)</Label>
              <span className="text-lg font-bold text-primary font-mono">{tenure} Yrs</span>
            </div>
            <Slider
              value={[tenure]}
              min={1}
              max={30}
              step={1}
              onValueChange={([val]) => setTenure(val)}
              className="py-4"
            />
          </div>

          {/* Result Highlights (Compact mode) */}
          {compact && (
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-secondary/30 p-4 border border-border">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Monthly EMI</p>
                <p className="text-lg font-black text-primary font-mono">{formatCurrency(emi)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Interest</p>
                <p className="text-lg font-black text-indigo-600 font-mono">{formatCurrency(totalInterest)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Output/Visualization Region */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-border bg-gradient-to-br from-background to-secondary/20 shadow-xl">
            <CardHeader className="pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="font-serif text-xl">Payment Breakup</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: number) => formatCurrency(val)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-end border-b border-border/50 pb-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Equated Monthly Installment</p>
                    <p className="text-3xl font-black text-primary font-mono">{formatCurrency(emi)}</p>
                  </div>
                  {!compact && (
                    <Badge variant="secondary" className="mb-1 text-[10px] font-bold bg-primary/10 text-primary uppercase border-primary/20">Monthly</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Total Principal</p>
                    <p className="text-sm font-bold font-mono">{formatCurrency(amount)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Total Interest</p>
                    <p className="text-sm font-bold text-indigo-600 font-mono">{formatCurrency(totalInterest)}</p>
                  </div>
                </div>

                <Separator className="my-2 bg-border/50" />
                
                <div className="flex justify-between items-center py-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Total Payable Amount</p>
                  <p className="text-lg font-black text-slate-800 font-mono">{formatCurrency(totalPayment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!compact && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-4 items-start">
               <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-primary">Financial Tip</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By making part-prepayments once a year, you can save up to <span className="font-bold text-foreground">30% on total interest</span> and reduce your tenure significantly.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
