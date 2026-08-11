import Link from "next/link"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">PropVista</span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              Your trusted partner in finding the perfect property. We offer
              premium plots, apartments, and villas across India.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm opacity-70">
              <li>
                <Link href="/properties" className="transition-opacity hover:opacity-100">
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/tools/emi" className="transition-opacity hover:opacity-100 font-medium text-primary-foreground/90">
                  EMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/properties?type=plot" className="transition-opacity hover:opacity-100">
                  Plots
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=apartment"
                  className="transition-opacity hover:opacity-100"
                >
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="/properties?type=villa" className="transition-opacity hover:opacity-100">
                  Villas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Property Status</h3>
            <ul className="flex flex-col gap-2.5 text-sm opacity-70">
              <li>
                <Link
                  href="/properties?status=available"
                  className="transition-opacity hover:opacity-100"
                >
                  Available
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?status=upcoming"
                  className="transition-opacity hover:opacity-100"
                >
                  Upcoming
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?status=sold"
                  className="transition-opacity hover:opacity-100"
                >
                  Sold Out
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contact Us</h3>
            <ul className="flex flex-col gap-3 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@propvista.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>123 Real Estate Ave, Bangalore, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-background/20 pt-6 text-center text-xs opacity-50">
          <p>2026 PropVista. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
