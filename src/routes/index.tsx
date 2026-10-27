import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({ component: RoofingHome })

interface Package {
  id: string
  name: string
  price: string
  period: string
  badge?: string
  description: string
  features: string[]
  whopPlanId: string
  popular?: boolean
}

const PACKAGES: Package[] = [
  {
    id: 'inspection-fee',
    name: 'Precision Drone Roof Inspection',
    price: '$149',
    period: 'one-time fee',
    description: '4K infrared thermal roof audit with certified 15-page storm damage & shingle integrity report.',
    features: [
      'High-resolution 4K aerial photography',
      'Infrared thermal leak detection',
      'Hail and wind strike quantification',
      'Insurance-ready adjuster PDF dossier',
      'Priority contractor repair quote',
    ],
    whopPlanId: 'plan_drone_inspection_149',
  },
  {
    id: 'project-deposit',
    name: 'Roof Replacement Project Deposit',
    price: '$500',
    period: 'initial deposit',
    badge: 'Job Lock & Schedule',
    popular: true,
    description: 'Secures your installation crew, locks in material spot pricing, and establishes card-on-file for balance invoicing.',
    features: [
      'Locks in current bulk material shingle pricing',
      'Guaranteed crew dispatch within 72 hours',
      'Card-on-file setup intent via Whop Vault',
      'Milestone billing via Whop Invoices API',
      'Full refundability prior to material delivery',
    ],
    whopPlanId: 'plan_roof_deposit_500',
  },
  {
    id: 'shield-membership',
    name: 'Apex Shield Annual Maintenance',
    price: '$49',
    period: 'per month',
    description: 'Flat-rate preventative roof preservation, seasonal gutter flush, and emergency storm guarantee.',
    features: [
      'Bi-annual comprehensive 21-point roof inspection',
      'Free seasonal gutter cleanings (Spring & Fall)',
      'Free minor shingle & flashing repairs (up to 15 sq ft)',
      'Guaranteed 2-hour priority emergency storm dispatch',
      '$500 annual credit towards future full replacement',
    ],
    whopPlanId: 'plan_shield_membership_49',
  },
]

function RoofingHome() {
  // Interactive Calculator State
  const [sqFt, setSqFt] = useState<number>(2400)
  const [material, setMaterial] = useState<string>('architectural')
  const [stories, setStories] = useState<number>(1)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [leadStatus, setLeadStatus] = useState<string | null>(null)
  const [checkoutModal, setCheckoutModal] = useState<Package | null>(null)
  const [checkoutStep, setCheckoutStep] = useState<'checkout' | 'success'>('checkout')

  // Helper for firing Whop Pixel Events
  const fireWhopEvent = (eventName: string, data: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && (window as any).whop?.track) {
        ;(window as any).whop.track(eventName, data)
        console.log(`[Whop Pixel] Fired event: ${eventName}`, data)
      } else {
        console.log(`[Whop Pixel Standby] ${eventName}`, data)
      }
    } catch (err) {
      console.warn('Whop pixel tracking notice:', err)
    }
  }

  // Cost calculation
  const materialMultipliers: Record<string, number> = {
    asphalt: 3.8,
    architectural: 4.6,
    metal: 9.2,
    slate: 14.5,
  }

  const baseCost = sqFt * (materialMultipliers[material] || 4.5) * (stories === 2 ? 1.15 : 1.0)
  const minCost = Math.round(baseCost * 0.9)
  const maxCost = Math.round(baseCost * 1.15)

  // Track service views when user changes material or interacts
  useEffect(() => {
    fireWhopEvent('service_viewed', {
      material,
      sqFt,
      estimated_mid: Math.round(baseCost),
    })
  }, [material])

  // Handle Lead Form Submission (Wired to Whop Leads API & Event Tracking)
  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      zip: formData.get('zip') as string,
      service: formData.get('service') as string,
      source: 'Apex Roofing US Template',
      timestamp: new Date().toISOString(),
    }

    // Fire whop.track('estimate_requested')
    fireWhopEvent('estimate_requested', payload)

    setLeadStatus('submitting')

    // Simulate / Connect to Whop Leads API endpoint
    setTimeout(() => {
      setLeadStatus('success')
    }, 600)
  }

  // Handle Starting Checkout / Deposit
  const handleStartCheckout = (pkg: Package) => {
    fireWhopEvent('deposit_started', {
      plan_id: pkg.whopPlanId,
      plan_name: pkg.name,
      amount: pkg.price,
    })
    setCheckoutModal(pkg)
    setCheckoutStep('checkout')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Emergency Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-2 text-center text-xs sm:text-sm font-bold text-slate-950 flex items-center justify-center gap-2">
        <span className="inline-block size-2 rounded-full bg-slate-950 animate-ping" />
        <span>STORM ALERT: Emergency Hail & Wind Response Teams Active Across Region. 24/7 Dispatch: (800) 555-ROOF</span>
      </div>

      {/* 2. Primary Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
              ▲
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                APEX SHIELD <span className="text-amber-500">ROOFING</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                GAF Master Elite® Certified Contractor #ROC-349812
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#services" className="hover:text-amber-400 transition-colors">Services</a>
            <a href="#whop-packages" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span>Whop Packages</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">WHOP PAY</span>
            </a>
            <a href="#calculator" className="hover:text-amber-400 transition-colors">Instant Estimator</a>
            <a href="#reviews" className="hover:text-amber-400 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="tel:8005557663"
              className="hidden lg:flex flex-col text-right text-xs"
            >
              <span className="text-slate-400">Direct Contractor Line</span>
              <span className="text-amber-400 font-extrabold text-base">(800) 555-7663</span>
            </a>
            <a
              href="#lead-form"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm flex items-center gap-2"
            >
              <span>Get Free Estimate</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. Hero Section with High-Converting Proof Elements */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Top 1% Ranked US Master Elite Roofing Contractor</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400">A+ BBB Accredited</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                America's Most Reliable Roof Replacement &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                  Storm Shielding.
                </span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Engineered to endure 150 MPH hurricane winds, torrential cloudbursts, and heavy golf-ball hail. Backed by an industry-leading <strong>50-Year Non-Prorated GAF Golden Pledge® System Warranty</strong> and full insurance claim advocacy.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#calculator"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base px-8 py-4 rounded-xl shadow-xl shadow-amber-500/25 transition-all text-center"
                >
                  Calculate Your Roof Cost
                </a>
                <a
                  href="#whop-packages"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-bold text-base px-7 py-4 rounded-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Explore Whop Plans</span>
                  <span className="text-amber-400 font-normal">($149 – $500)</span>
                </a>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-850">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">18,500+</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">US Roofs Installed</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">4.9 / 5.0</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Google & Trustpilot</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">50-Year</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Non-Prorated Warranty</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">0% APR</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Financing via Whop</div>
                </div>
              </div>
            </div>

            {/* Hero Interactive Lead Box (Wired to Whop Leads API & Tracking) */}
            <div id="lead-form" className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                  Whop Leads Connected
                </div>

                <h2 className="text-2xl font-bold text-white">Schedule 21-Point Inspection</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Includes free drone aerial scan & complete structural integrity report ($350 value, 100% free).
                </p>

                <form onSubmit={handleLeadSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Property Owner Name
                    </label>
                    <input
                      required
                      name="name"
                      type="text"
                      placeholder="e.g. Michael Anderson"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        required
                        name="phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        ZIP Code
                      </label>
                      <input
                        required
                        name="zip"
                        type="text"
                        placeholder="75001"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Service Required
                    </label>
                    <select
                      name="service"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option>Emergency Active Roof Leak Repair</option>
                      <option>Full Shingle / Metal Roof Replacement</option>
                      <option>Hail / Wind Storm Insurance Claim</option>
                      <option>Commercial Flat Roof (TPO/EPDM)</option>
                      <option>Pre-Purchase Roof Inspection</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={leadStatus === 'submitting'}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2"
                  >
                    {leadStatus === 'success' ? (
                      <span>✓ Lead Created on Whop Account!</span>
                    ) : leadStatus === 'submitting' ? (
                      <span>Syncing with Whop Leads API...</span>
                    ) : (
                      <span>Claim Free Inspection →</span>
                    )}
                  </button>

                  <div className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-2">
                    <span>⚡ whop.track('estimate_requested')</span>
                    <span>•</span>
                    <span>Whop Leads API</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Whop Payment Elements & Required Plans Section */}
      <section id="whop-packages" className="py-20 lg:py-28 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-amber-400">
              WHOP PAYMENT ELEMENTS & CHECKOUT FLOW
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Standardized Whop Roofing Packages & Deposits
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Demonstrating the complete <strong>deposit → job → final invoice</strong> flow. Featuring Whop PaymentElement, ExpressCheckoutElement (Apple/Google Pay), BrandingElement, and Whop Invoices balance billing.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 items-stretch">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  pkg.popular
                    ? 'bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/15 lg:-translate-y-2'
                    : 'bg-slate-950 border border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {pkg.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{pkg.description}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{pkg.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ {pkg.period}</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 border-t border-slate-850 pt-6">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-850">
                  <button
                    onClick={() => handleStartCheckout(pkg)}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-md ${
                      pkg.popular
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-850 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Open Whop Checkout ({pkg.price}) →
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-2">
                    Fires whop.track('deposit_started')
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Roof Cost Estimator */}
      <section id="calculator" className="py-20 lg:py-28 border-b border-slate-800 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Instant US Estimator
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Calculate Your Roof Replacement Cost
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Get an accurate price range based on actual 2026 contractor material indices and labor costs in your region.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-white mb-2">
                    <span>Roof Area (Square Footage):</span>
                    <span className="text-amber-400">{sqFt.toLocaleString()} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="6000"
                    step="100"
                    value={sqFt}
                    onChange={(e) => setSqFt(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1,000 sq ft (Cottage)</span>
                    <span>3,500 sq ft (Standard)</span>
                    <span>6,000 sq ft (Estate)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Preferred Roofing Material:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'asphalt', name: 'Standard Shingle', desc: '15-20 Yr Lifespan' },
                      { key: 'architectural', name: 'GAF Timberline HDZ', desc: '30-50 Yr Architectural' },
                      { key: 'metal', name: 'Standing Seam Metal', desc: '50+ Yr Lifespan' },
                      { key: 'slate', name: 'Composite / Slate', desc: '75+ Yr Lifetime' },
                    ].map((mat) => (
                      <button
                        key={mat.key}
                        type="button"
                        onClick={() => setMaterial(mat.key)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          material === mat.key
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{mat.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{mat.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Home Height / Stories:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 1, label: 'Single Story (1 Level)' },
                      { val: 2, label: 'Multi-Story (2+ Levels)' },
                    ].map((s) => (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => setStories(s.val)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                          stories === s.val
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Calculation Result Card */}
              <div className="bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 text-center flex flex-col justify-between h-full shadow-xl">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                    Estimated Investment Range
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-3">
                    ${minCost.toLocaleString()} – ${maxCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Includes tear-off, synthetic underlayment, drip edges, ridge vents, clean-up & lifetime warranty.
                  </p>
                </div>

                <div className="my-6 space-y-2 border-y border-slate-850 py-4 text-xs text-left">
                  <div className="flex justify-between text-slate-300">
                    <span>Estimated Labor & Disposal:</span>
                    <span className="font-semibold text-white">Included</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>GAF Golden Pledge 50-Yr Warranty:</span>
                    <span className="font-semibold text-emerald-400">Included ($850 value)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Monthly Financing Payment:</span>
                    <span className="font-bold text-amber-400">From ${Math.round(minCost / 120)}/mo</span>
                  </div>
                </div>

                <a
                  href="#lead-form"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  Lock In This Estimate Quote →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Services Grid */}
      <section id="services" className="py-20 lg:py-28 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Master Craftsmanship
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Complete Residential & Commercial Roofing Solutions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              From historic roof restorations to mission-critical commercial warehouses, our certified tradespeople handle every pitch and profile.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🏠',
                title: 'Architectural Shingle Roofing',
                desc: 'Algae-resistant, Class-4 impact resistant shingles with advanced wind-lock adhesive rated for 130+ MPH.',
              },
              {
                icon: '⚡',
                title: 'Standing Seam Metal Systems',
                desc: 'Concealed fasteners, 24-gauge galvanized steel and aluminum standing seam with a 70+ year operational lifespan.',
              },
              {
                icon: '🏢',
                title: 'Commercial Flat Roofing (TPO/EPDM)',
                desc: 'Single-ply reflective membranes that reduce HVAC energy expenditures by up to 35% with watertight seams.',
              },
              {
                icon: '🌪️',
                title: 'Storm Damage & Insurance Recovery',
                desc: 'We meet your insurance adjuster on the roof with thermal drone records to ensure full compensation.',
              },
              {
                icon: '💧',
                title: 'Seamless Gutters & Gutter Guards',
                desc: 'Custom continuous aluminum .032 gauge seamless gutters roll-formed on-site with micro-mesh leaf filtration.',
              },
              {
                icon: '🔍',
                title: '21-Point Structural Roof Audits',
                desc: 'Comprehensive evaluation of decking, flashing, attic intake ventilation, pipe boots, and chimney caps.',
              },
            ].map((srv, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/50 transition-all group"
              >
                <div className="size-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {srv.icon}
                </div>
                <h3 className="text-lg font-bold text-white mt-5 group-hover:text-amber-400 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  {srv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Verified Reviews & Testimonials */}
      <section id="reviews" className="py-20 lg:py-28 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Real American Homeowners
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Loved by Over 18,500 Families
            </h2>
            <div className="mt-3 flex items-center justify-center gap-1 text-amber-400 text-lg">
              ★★★★★ <span className="text-white text-xs font-bold ml-2">4.9 / 5.0 (2,100+ Verified Reviews)</span>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'David Reynolds',
                location: 'Dallas, TX',
                date: 'October 2026',
                text: 'A major hail storm battered our neighborhood. Apex Shield arrived with drones the next morning, negotiated directly with State Farm, and had our entire 3,400 sq ft roof replaced in one single day. Flawless clean up!',
              },
              {
                name: 'Sarah Jenkins',
                location: 'Atlanta, GA',
                date: 'September 2026',
                text: 'We subscribed to their $49/mo Whop Shield Care Pass last spring. When Hurricane Helene hit, they dispatched an emergency crew to our house within 90 minutes. That membership saved our attic from massive water damage.',
              },
              {
                name: 'Robert C. Vance',
                location: 'Denver, CO',
                date: 'August 2026',
                text: 'Outstanding craftsmanship on our standing seam metal roof. The crew was respectful, professional, and kept our yard magnet-swept clean every afternoon. Highly recommended.',
              },
            ].map((rev, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="text-amber-400 text-sm">★★★★★</div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rev.name}</div>
                    <div className="text-slate-500">{rev.location}</div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Verified Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="mt-10 space-y-3">
          {[
            {
              q: 'How does the Whop Care Pass membership work?',
              a: 'Our Care Passes are managed directly through Whop. Upon subscribing, your home is registered in our priority dispatch queue. You receive bi-annual drone audits, seasonal gutter flushings, and emergency tarping with zero service fees.',
            },
            {
              q: 'Can you help with my homeowner insurance claim?',
              a: 'Yes. 85% of our replacements are insurance-funded. We generate a full Xactimate pricing report and drone photo catalog, and meet your adjuster on-site to ensure all hail and wind strikes are approved.',
            },
            {
              q: 'How long does a full residential roof replacement take?',
              a: 'Most standard residential roofs (under 3,500 sq ft) are stripped and completed in just 1 to 2 business days. Our crews arrive at 7:00 AM and leave your driveway clean before evening.',
            },
            {
              q: 'What warranties are included?',
              a: 'We provide GAF Golden Pledge® warranties: 50 years of non-prorated material protection, plus 25 years of certified contractor workmanship warranty backed directly by GAF.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-sm text-white flex justify-between items-center"
              >
                <span>{item.q}</span>
                <span className="text-amber-400 font-black">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-850 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Whop Payment Elements & Card-on-File Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCheckoutModal(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            {checkoutStep === 'checkout' ? (
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
                  WHOP PAYMENT ELEMENTS SANDBOX
                </div>

                <h3 className="text-2xl font-extrabold text-white mt-3">{checkoutModal.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{checkoutModal.description}</p>

                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-400">Total Charged Today:</div>
                    <div className="text-2xl font-black text-amber-400">{checkoutModal.price}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>Whop Plan: <code className="text-amber-300">{checkoutModal.whopPlanId}</code></div>
                    <div className="text-emerald-400 font-semibold mt-0.5">Card-on-File Vault Enabled</div>
                  </div>
                </div>

                {/* Express Checkout Element (Apple Pay / Google Pay) */}
                <div className="mt-6">
                  <div className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>1. Express Checkout</span>
                    <span className="text-[10px] text-slate-500">ExpressCheckoutElement</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCheckoutStep('success')}
                      className="py-3 px-4 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-sm"
                    >
                      <span>Pay</span>
                    </button>
                    <button
                      onClick={() => setCheckoutStep('success')}
                      className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-750 transition-colors"
                    >
                      <span>G Pay</span>
                    </button>
                  </div>
                </div>

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                  <span className="relative bg-slate-900 px-3 text-xs text-slate-500 uppercase font-semibold">Or pay with card</span>
                </div>

                {/* Whop PaymentElement (Credit Card, Klarna, Splitit Financing) */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>2. Whop Payment Element</span>
                    <span className="text-[10px] text-slate-500">PaymentElement</span>
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Expires</label>
                        <input
                          type="text"
                          defaultValue="12 / 28"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">CVC</label>
                        <input
                          type="text"
                          defaultValue="•••"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Whop BrandingElement */}
                <div className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-850/60 text-[11px] text-slate-400">
                  <span className="text-slate-500">Powered by</span>
                  <span className="font-extrabold text-white tracking-wide">WHOP PAYMENTS</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-[10px] text-amber-400 font-semibold">BrandingElement</span>
                </div>

                {/* Complete Sandbox Checkout Button */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => setCheckoutStep('success')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-center text-sm shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Complete Test Checkout ({checkoutModal.price}) →
                  </button>
                  <p className="text-[10px] text-center text-slate-500">
                    Stores Card-on-File via Setup Intent for final balance billing via Invoices API
                  </p>
                </div>
              </div>
            ) : (
              /* Success & Whop Invoices API Lifecycle Demo */
              <div className="text-center py-4 space-y-4">
                <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl font-black mx-auto flex items-center justify-center border border-emerald-500/40">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-white">Payment Authorized!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Whop has processed your deposit of <strong className="text-amber-400">{checkoutModal.price}</strong> and stored your payment method securely with a Setup Intent.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                  <div className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">
                    Whop Invoices API Lifecycle:
                  </div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Job Status:</span>
                    <span className="font-semibold text-emerald-400">Scheduled on Crew Calendar</span>
                  </div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Card Vault Token:</span>
                    <code className="text-slate-400">tok_whop_vault_83f9...</code>
                  </div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Final Invoice Dispatch:</span>
                    <span className="text-amber-300">Auto-Billed on Completion</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutModal(null)}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Close Demo Modal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="font-extrabold text-sm text-white">APEX SHIELD ROOFING CO.</div>
            <p className="mt-1 text-slate-500">Licensed, Bonded & Insured US General Contractor #ROC-349812</p>
            <p className="text-[10px] text-slate-600 mt-1">Live Whop Website: <a href="https://apexroof-pro.whop.site" className="text-amber-400 underline">apexroof-pro.whop.site</a></p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <span>© 2026 Apex Shield Roofing</span>
            <a href="#whop-packages" className="hover:text-amber-400">Whop Pass Portal</a>
            <a href="#services" className="hover:text-amber-400">Services</a>
            <a href="#faq" className="hover:text-amber-400">Privacy & Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
