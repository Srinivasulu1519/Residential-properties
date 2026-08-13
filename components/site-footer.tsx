import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { PropVistaLogo } from "@/components/propvista-logo"

export function SiteFooter() {
  return (
    <footer className="bg-[#1a2e2a] text-white/90">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="border-b border-white/10 py-16">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <PropVistaLogo size="md" variant="light" />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
                Your trusted partner in finding the perfect property. Premium
                plots, apartments, and villas across India&apos;s finest locations.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:gap-12">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                  Quick Links
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  <li>
                    <Link href="/properties" className="text-sm text-white/60 transition-colors hover:text-white">
                      All Properties
                    </Link>
                  </li>
                  <li>
                    <Link href="/properties?type=plot" className="text-sm text-white/60 transition-colors hover:text-white">
                      Plots
                    </Link>
                  </li>
                  <li>
                    <Link href="/properties?type=apartment" className="text-sm text-white/60 transition-colors hover:text-white">
                      Apartments
                    </Link>
                  </li>
                  <li>
                    <Link href="/properties?type=villa" className="text-sm text-white/60 transition-colors hover:text-white">
                      Villas
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                  Property Status
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  <li>
                    <Link href="/properties?status=available" className="text-sm text-white/60 transition-colors hover:text-white">
                      Available
                    </Link>
                  </li>
                  <li>
                    <Link href="/properties?status=upcoming" className="text-sm text-white/60 transition-colors hover:text-white">
                      Upcoming
                    </Link>
                  </li>
                  <li>
                    <Link href="/properties?status=sold" className="text-sm text-white/60 transition-colors hover:text-white">
                      Sold Out
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                  Contact Us
                </h3>
                <ul className="mt-5 flex flex-col gap-4">
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-white/30" />
                    <span className="text-sm text-white/60">+91 98765 43210</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-white/30" />
                    <span className="text-sm text-white/60">info@propvista.com</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-white/30" />
                    <span className="text-sm text-white/60">123 Real Estate Ave,<br />Bangalore, India</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; 2026 PropVista. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/properties" className="text-xs text-white/30 transition-colors hover:text-white/60">
              Properties
            </Link>
            <Link href="/auth/login" className="text-xs text-white/30 transition-colors hover:text-white/60">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-xs text-white/30 transition-colors hover:text-white/60">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
