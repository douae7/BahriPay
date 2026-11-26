import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Anchor,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ChevronDown,
  Compass,
  Menu,
  ShieldCheck,
  Ship,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useMaritime } from '../../context/MaritimeContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../common/BrandLogo';
import { SafeImage } from '../common/SafeImage';
import { ForegroundOceanSwimmers, UnderwaterScene } from '../common/UnderwaterScene';
import { AnimatedNumber, FloatingGlassCard, MagneticButton } from '../common/OceanMotion';
import { ThemeTogglePill } from '../common/ThemeTogglePill';

gsap.registerPlugin(ScrollTrigger);

const HERO_CIRCULAR_STATS = [
  { label: 'Active Crew Tracked', target: 142, suffix: '', sub: 'Sailors & officers', pct: 88, delay: '0s' },
  { label: 'Connected Fleet', target: 18, suffix: '', sub: 'Trawlers & gillnetters', pct: 92, delay: '0.6s' },
  { label: 'Catches Analyzed', target: 486, suffix: ' T', sub: 'Annual auction volume', pct: 79, delay: '1.2s' },
  { label: 'Transparent Shares', target: 100, suffix: '%', sub: 'Automated calculation', pct: 100, delay: '1.8s' },
];

export const LandingPage: React.FC = () => {
  const { setRoute, loginAsRole } = useMaritime();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.landing-bento-card', {
        y: 34,
        opacity: 0,
        duration: 0.78,
        stagger: 0.11,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '#fonctionnalites',
          start: 'top 78%',
          once: true,
        },
      });

      gsap.from('.landing-arch-item', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.14,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '#architecture',
          start: 'top 80%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleExplorePlatform = () => {
    loginAsRole('ARMATEUR');
  };

  return (
    <div
      id="top"
      ref={rootRef}
      className="min-h-screen bg-[#F2FAFD] dark:bg-[#031624] text-[#062B45] dark:text-[#F8FAFC] transition-colors duration-300 overflow-x-hidden"
    >
      {/* ============================================================
          SECTION 1: CINEMATIC 3D & SVG UNDERWATER HERO (DUAL THEME)
      ============================================================ */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#D9F4FA] text-[#062B45] dark:bg-[#041e32] dark:text-[#F8FAFC] transition-colors duration-500">
        {/* Three.js 3D Ocean + Seaweed + Caustics + Background SVG Swimmers */}
        <UnderwaterScene theme={theme} />

        {/* Foreground SVG Swimmers (z-40) passing gracefully in front of logo & hero headline */}
        <ForegroundOceanSwimmers theme={theme} />

        {/* Transparent 3-Zone Top Navigation (no backdrop-blur over WebGL) */}
        <header className="relative z-30 w-full max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="#top"
            className="whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16C5C0] rounded-lg"
          >
            <BrandLogo lightText={theme === 'dark'} size="md" />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#062B45]/85 dark:text-[#F8FAFC]/85">
            <a
              href="#fonctionnalites"
              className="hover:text-[#16C5C0] dark:hover:text-[#7DDCEB] transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#flotte-operations"
              className="hover:text-[#16C5C0] dark:hover:text-[#7DDCEB] transition-colors whitespace-nowrap shrink-0"
            >
              Fleet &amp; Trips
            </a>
            <a
              href="#ocean-ai"
              className="hover:text-[#16C5C0] dark:hover:text-[#7DDCEB] transition-colors whitespace-nowrap shrink-0"
            >
              Ocean AI
            </a>
            <a
              href="#architecture"
              className="hover:text-[#16C5C0] dark:hover:text-[#7DDCEB] transition-colors whitespace-nowrap shrink-0"
            >
              Roles &amp; Access
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <ThemeTogglePill onDarkSurface={theme === 'dark'} />

            <MagneticButton
              type="button"
              onClick={() => setRoute('auth')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C5C0] hover:bg-[#19d6d1] text-[#062B45] font-semibold text-sm transition-colors shadow-lg shadow-[#16C5C0]/30 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </MagneticButton>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Navigation menu"
              className="md:hidden p-2.5 rounded-xl bg-white/85 dark:bg-[#072B44]/85 border border-[#0A4565]/15 dark:border-[#7DDCEB]/30 text-[#062B45] dark:text-[#F8FAFC] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden relative z-30 mx-5 mb-4 p-4 rounded-2xl bg-white/95 dark:bg-[#05243A]/95 border border-[#0A4565]/15 dark:border-[#7DDCEB]/25 flex flex-col gap-3 shadow-xl">
            <a
              href="#fonctionnalites"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#16C5C0]/10"
            >
              Features
            </a>
            <a
              href="#flotte-operations"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#16C5C0]/10"
            >
              Fleet &amp; Trips
            </a>
            <a
              href="#ocean-ai"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#16C5C0]/10"
            >
              Ocean AI
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setRoute('auth');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm text-center cursor-pointer"
            >
              Sign in to Bahripay
            </button>
          </div>
        )}

        {/* Center Hero Content */}
        <div className="relative z-20 max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 text-xs sm:text-sm font-semibold tracking-wide text-[#0A4565] dark:text-[#7DDCEB] flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#0A4565] dark:text-[#16C5C0]" />
            <span>Bahripay · Maritime ecosystem, crew operations, fish auctions &amp; predictive insights</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold tracking-tight text-balance text-[clamp(2.15rem,4.7vw,4rem)] leading-[1.07] text-[#042338] dark:text-[#F8FAFC] max-w-4xl drop-shadow-[0_4px_24px_rgba(255,255,255,0.65)] dark:drop-shadow-[0_8px_30px_rgba(3,21,36,0.75)]"
          >
            Welcome to the world of intelligent maritime management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg md:text-xl text-[#0A4565]/90 dark:text-[#F8FAFC]/88 max-w-2xl leading-relaxed drop-shadow-[0_2px_12px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_4px_16px_rgba(3,21,36,0.65)]"
          >
            A next-generation solution to manage, analyze, and optimize your maritime fishing operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              type="button"
              onClick={handleExplorePlatform}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#062B45] dark:bg-[#16C5C0] hover:bg-[#0A4565] dark:hover:bg-[#1ad6d1] text-[#F8FAFC] dark:text-[#062B45] font-semibold text-sm sm:text-base shadow-xl shadow-[#062B45]/20 dark:shadow-[#16C5C0]/35 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>

            <a
              href="#fonctionnalites"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/85 dark:bg-[#072B44]/80 hover:bg-white dark:hover:bg-[#0A4565]/90 text-[#062B45] dark:text-[#F8FAFC] border border-[#0A4565]/18 dark:border-[#7DDCEB]/35 font-semibold text-sm sm:text-base shadow-lg shadow-[#062B45]/8 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              Discover Features
            </a>
          </motion.div>

          {/* Floating Circular Ocean Statistics (solid/alpha cards without blur over WebGL) */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
          >
            {HERO_CIRCULAR_STATS.map((st) => {
              const r = 24;
              const circ = 2 * Math.PI * r;
              const offset = circ - (st.pct / 100) * circ;
              return (
                <div
                  key={st.label}
                  className="float-gentle p-4 rounded-2xl bg-white/88 dark:bg-[#05243A]/82 border border-[#0A4565]/12 dark:border-[#7DDCEB]/25 shadow-xl shadow-[#062B45]/10 dark:shadow-2xl flex items-center gap-3.5 text-left transition-colors"
                  style={{ ['--float-delay' as string]: st.delay }}
                >
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 60 60" className="w-14 h-14 -rotate-90">
                      <circle
                        cx="30"
                        cy="30"
                        r={r}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.14"
                        strokeWidth="4.5"
                      />
                      <motion.circle
                        cx="30"
                        cy="30"
                        r={r}
                        fill="none"
                        stroke="#16C5C0"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                    <span className="absolute font-mono text-[11px] font-bold text-[#0A4565] dark:text-[#7DDCEB]">
                      {st.pct}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[#0A4565]/75 dark:text-[#7DDCEB]/90 truncate">
                      {st.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#062B45] dark:text-[#F8FAFC] leading-tight">
                      <AnimatedNumber value={st.target} suffix={st.suffix} />
                    </div>
                    <div className="text-[11px] text-[#0A4565]/65 dark:text-[#F8FAFC]/65 truncate">
                      {st.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Animated Scroll Down Indicator */}
        <div className="relative z-30 pb-10 flex flex-col items-center justify-center">
          <a
            href="#fonctionnalites"
            className="flex flex-col items-center gap-1.5 text-xs font-semibold text-[#062B45]/80 dark:text-[#7DDCEB]/90 hover:text-[#16C5C0] dark:hover:text-[#F8FAFC] transition-colors"
          >
            <span>Scroll to explore</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-5 h-5 text-[#0A4565] dark:text-[#16C5C0]" />
            </motion.span>
          </a>
        </div>

        {/* Animated Ocean Wave Divider */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 z-30 overflow-hidden leading-none" aria-hidden="true">
          <svg
            viewBox="0 0 1440 84"
            preserveAspectRatio="none"
            className="w-[112%] h-10 sm:h-14 ocean-wave"
          >
            <path
              d="M0,42 C240,78 480,10 720,42 C960,74 1200,12 1440,42 L1440,84 L0,84 Z"
              className="fill-[#F2FAFD] dark:fill-[#031624] transition-colors duration-300"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: FLOATING GLASS BENTO CAPABILITIES
      ============================================================ */}
      <section id="fonctionnalites" className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-12"
        >
          <p className="text-sm font-semibold text-[#16C5C0] mb-2">
            Bahripay Command Platform
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance text-[#062B45] dark:text-[#F8FAFC]">
            Built for the realities of the harbor, deck, and fish auction
          </h2>
          <p className="mt-3 text-base text-[#0A4565]/80 dark:text-[#7DDCEB]/80 leading-relaxed">
            Centralize crew administration, track every fishing trip by species, and automate transparent crew share settlements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature 01 - Wide Floating Card */}
          <FloatingGlassCard className="landing-bento-card lg:col-span-2 overflow-hidden flex flex-col md:flex-row p-0">
            <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#16C5C0] mb-3">
                  <Ship className="w-4 h-4" />
                  <span>01. Fleet &amp; Sea Trips</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-[#062B45] dark:text-[#F8FAFC]">
                  End-to-end traceability of trips and catches
                </h3>
                <p className="mt-3 text-sm sm:text-base text-[#0A4565]/80 dark:text-[#F8FAFC]/75 leading-relaxed">
                  Log departures, assign crew members by grade, record catches species by species, and instantly estimate gross auction revenue.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/15 flex flex-wrap items-center gap-4 text-xs text-[#0A4565]/75 dark:text-[#7DDCEB]/80">
                <span>Home-port tracking</span>
                <span aria-hidden="true">·</span>
                <span>Hold capacity &amp; maintenance</span>
                <span aria-hidden="true">·</span>
                <span>Automated sales calculation</span>
              </div>
            </div>
            <div className="md:w-72 lg:w-80 h-56 md:h-auto shrink-0 overflow-hidden">
              <SafeImage
                src="/src/assets/images/vessel_trawler_hero_1795370246302.jpg"
                alt="Fishing trawler at sea at sunrise"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </FloatingGlassCard>

          {/* Feature 02 */}
          <FloatingGlassCard delay={0.08} className="landing-bento-card p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#16C5C0]/15 text-[#16C5C0] flex items-center justify-center mb-5 float-gentle">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-[#16C5C0] mb-1.5">
                02. Crew Administration
              </div>
              <h3 className="font-display font-bold text-xl text-[#062B45] dark:text-[#F8FAFC]">
                Registries, grades &amp; maritime certificates
              </h3>
              <p className="mt-3 text-sm text-[#0A4565]/80 dark:text-[#F8FAFC]/75 leading-relaxed">
                Track share or permanent contracts, manage compensatory rest, and receive alerts before medical fitness or STCW certificates expire.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loginAsRole('ARMATEUR')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0A4565] dark:text-[#7DDCEB] hover:text-[#16C5C0] transition-colors cursor-pointer"
            >
              <span>Open crew registry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </FloatingGlassCard>

          {/* Feature 03 */}
          <FloatingGlassCard delay={0.12} className="landing-bento-card p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#0A4565]/10 dark:bg-[#7DDCEB]/15 text-[#0A4565] dark:text-[#7DDCEB] flex items-center justify-center mb-5 float-gentle">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-[#16C5C0] mb-1.5">
                03. Finance &amp; Share Splits
              </div>
              <h3 className="font-display font-bold text-xl text-[#062B45] dark:text-[#F8FAFC]">
                Automated crew share calculations
              </h3>
              <p className="mt-3 text-sm text-[#0A4565]/80 dark:text-[#F8FAFC]/75 leading-relaxed">
                Deduct common trip expenses (fuel, ice, provisions), apply Shipowner / Crew split rules, and generate payment slips in one click.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/15 flex items-center justify-between text-xs font-mono tabular-nums text-[#0A4565]/70 dark:text-[#7DDCEB]/80">
              <span>Shipowner 45%</span>
              <span>Crew 55%</span>
            </div>
          </FloatingGlassCard>

          {/* Feature 04 - Ocean AI */}
          <FloatingGlassCard
            delay={0.16}
            className="landing-bento-card lg:col-span-2 overflow-hidden !bg-gradient-to-br !from-[#062B45] !via-[#0A4565] !to-[#083B57] text-[#F8FAFC] !border-[#16C5C0]/35 flex flex-col md:flex-row p-0"
          >
            <div id="ocean-ai" className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#7DDCEB] mb-3">
                  <BrainCircuit className="w-4 h-4 text-[#16C5C0]" />
                  <span>04. Ocean AI Module</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-[#F8FAFC]">
                  Decision intelligence &amp; profitability forecasting
                </h3>
                <p className="mt-3 text-sm sm:text-base text-[#F8FAFC]/80 leading-relaxed">
                  Query your operational history in natural language: identify your most profitable vessel, anticipate seasonal catch peaks, and control fuel expenses.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <MagneticButton
                  type="button"
                  onClick={handleExplorePlatform}
                  className="px-5 py-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#19d6d1] text-[#062B45] font-semibold text-sm transition-colors cursor-pointer"
                >
                  Try Ocean AI Live
                </MagneticButton>
                <span className="text-xs text-[#7DDCEB]/80">
                  Live fleet intelligence · Real-time operational insights
                </span>
              </div>
            </div>
            <div className="md:w-72 lg:w-80 h-56 md:h-auto shrink-0 overflow-hidden relative">
              <SafeImage
                src="/src/assets/images/maritime_port_ops_1795370246156.jpg"
                alt="Modern fishing harbor at sunrise"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#062B45]/60 via-transparent to-transparent" />
            </div>
          </FloatingGlassCard>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: ROLES & OPERATIONAL ACCESS
      ============================================================ */}
      <section
        id="flotte-operations"
        className="border-y border-[#0A4565]/10 dark:border-[#7DDCEB]/10 bg-white/75 dark:bg-[#062439]/55 backdrop-blur-lg py-16 sm:py-20"
      >
        <div id="architecture" className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="landing-arch-item lg:col-span-6">
            <p className="text-sm font-semibold text-[#16C5C0] mb-2">
              Roles &amp; Security
            </p>
            <h2 className="font-display font-bold text-3xl tracking-tight text-[#062B45] dark:text-[#F8FAFC]">
              A responsive workspace tailored to every maritime role
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#0A4565]/80 dark:text-[#F8FAFC]/75 leading-relaxed">
              Bahripay organizes crew administration, fleet tracking, and financial settlements with dedicated views and permissions for each operational profile.
            </p>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingGlassCard className="p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                  <ShieldCheck className="w-4 h-4 text-[#16C5C0]" />
                  <span>Role-Based Access Control</span>
                </div>
                <p className="mt-1.5 text-xs text-[#0A4565]/75 dark:text-[#7DDCEB]/75">
                  Tailored permissions by profile: Shipowner, Captain, Finance Manager, and Observer.
                </p>
              </FloatingGlassCard>
              <FloatingGlassCard className="p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                  <BarChart3 className="w-4 h-4 text-[#16C5C0]" />
                  <span>PDF &amp; Excel Reports</span>
                </div>
                <p className="mt-1.5 text-xs text-[#0A4565]/75 dark:text-[#7DDCEB]/75">
                  Instant accounting exports and printable maritime crew payment slips.
                </p>
              </FloatingGlassCard>
            </div>
          </div>

          <FloatingGlassCard className="landing-arch-item lg:col-span-6 p-6 sm:p-8 !bg-[#062B45] text-[#F8FAFC] !border-[#16C5C0]/30">
            <h3 className="font-display font-semibold text-lg text-[#7DDCEB] mb-2">
              Direct access by role
            </h3>
            <p className="text-sm text-[#F8FAFC]/75 mb-6">
              Select a profile to launch the Bahripay command center right away:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { role: 'ARMATEUR' as const, label: 'Shipowner / Management', desc: 'Full fleet, crew & finance control' },
                { role: 'CAPITAINE' as const, label: 'Vessel Captain', desc: 'Trips, crew & catch declarations' },
                { role: 'FINANCIER' as const, label: 'Finance Manager', desc: 'Auctions, expenses & payroll' },
                { role: 'OBSERVATEUR' as const, label: 'Audit & Reporting', desc: 'Read-only & PDF/CSV exports' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => loginAsRole(item.role)}
                  className="text-left p-4 rounded-2xl bg-[#0A4565]/65 hover:bg-[#16C5C0]/20 border border-[#7DDCEB]/20 hover:border-[#16C5C0] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#F8FAFC]">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-[#16C5C0] transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-xs text-[#7DDCEB]/80 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </FloatingGlassCard>
        </div>
      </section>

      {/* Quiet Maritime Footer */}
      <footer className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/75">
        <div className="flex items-center gap-3">
          <Anchor className="w-4 h-4 text-[#16C5C0]" />
          <span className="font-semibold text-[#062B45] dark:text-[#F8FAFC]">Bahripay</span>
          <span aria-hidden="true">·</span>
          <span>Maritime &amp; fishing fleet management</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <button
            type="button"
            onClick={() => setRoute('auth')}
            className="hover:text-[#16C5C0] transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={handleExplorePlatform}
            className="hover:text-[#16C5C0] transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <span>© 2026 Bahripay Maritime</span>
        </div>
      </footer>
    </div>
  );
};
