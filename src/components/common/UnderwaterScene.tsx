import React, { useEffect, useRef } from 'react';
import { OceanCanvas3D } from './OceanCanvas3D';

interface FishSpec {
  id: string;
  species: 'tuna' | 'bream' | 'angel' | 'bass' | 'school';
  direction: 'ltr' | 'rtl';
  top: string;
  scale: number;
  duration: string;
  delay: string;
  opacity: number;
  layer: 'fg' | 'mg' | 'bg';
  wagDuration: string;
  palette: {
    bodyTop: string;
    bodyBottom: string;
    fin: string;
    accent: string;
  };
}

const FISH_SWARM: FishSpec[] = [
  {
    id: 'f-1',
    species: 'tuna',
    direction: 'ltr',
    top: '18%',
    scale: 1.18,
    duration: '26s',
    delay: '-9s',
    opacity: 0.94,
    layer: 'fg',
    wagDuration: '0.56s',
    palette: { bodyTop: '#0A4565', bodyBottom: '#7DDCEB', fin: '#16C5C0', accent: '#F8FAFC' },
  },
  {
    id: 'f-2',
    species: 'bream',
    direction: 'rtl',
    top: '68%',
    scale: 1.08,
    duration: '29s',
    delay: '-14s',
    opacity: 0.9,
    layer: 'fg',
    wagDuration: '0.62s',
    palette: { bodyTop: '#16C5C0', bodyBottom: '#E0F7FA', fin: '#7DDCEB', accent: '#FBBF24' },
  },
  {
    id: 'f-3',
    species: 'angel',
    direction: 'ltr',
    top: '79%',
    scale: 0.9,
    duration: '24s',
    delay: '-4s',
    opacity: 0.88,
    layer: 'fg',
    wagDuration: '0.52s',
    palette: { bodyTop: '#14B8A6', bodyBottom: '#7DDCEB', fin: '#F59E0B', accent: '#062B45' },
  },
  {
    id: 'f-4',
    species: 'bass',
    direction: 'rtl',
    top: '14%',
    scale: 0.84,
    duration: '33s',
    delay: '-6s',
    opacity: 0.72,
    layer: 'mg',
    wagDuration: '0.7s',
    palette: { bodyTop: '#0E5A7E', bodyBottom: '#99E6F2', fin: '#16C5C0', accent: '#F8FAFC' },
  },
  {
    id: 'f-6',
    species: 'bream',
    direction: 'ltr',
    top: '55%',
    scale: 0.78,
    duration: '27s',
    delay: '-18s',
    opacity: 0.74,
    layer: 'mg',
    wagDuration: '0.6s',
    palette: { bodyTop: '#0EA5E9', bodyBottom: '#BAE6FD', fin: '#16C5C0', accent: '#38BDF8' },
  },
  {
    id: 's-1',
    species: 'school',
    direction: 'ltr',
    top: '28%',
    scale: 0.88,
    duration: '36s',
    delay: '-15s',
    opacity: 0.65,
    layer: 'mg',
    wagDuration: '0.45s',
    palette: { bodyTop: '#7DDCEB', bodyBottom: '#F8FAFC', fin: '#16C5C0', accent: '#0A4565' },
  },
];

const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  id: `b-${i}`,
  left: `${5 + ((i * 5.8) % 90)}%`,
  size: 5 + (i % 4) * 3.5,
  duration: `${10 + (i % 6) * 2.1}s`,
  delay: `${-(i * 1.5)}s`,
  opacity: 0.2 + (i % 4) * 0.08,
}));

const SEAWEED_FRONDS = [
  { left: '2%', height: 180, color: '#0A4565', duration: '6.5s', delay: '0s' },
  { left: '5%', height: 230, color: '#16C5C0', duration: '7.8s', delay: '-2s' },
  { left: '9%', height: 145, color: '#083B57', duration: '5.9s', delay: '-1s' },
  { left: '86%', height: 170, color: '#083B57', duration: '7.1s', delay: '-3s' },
  { left: '90%', height: 240, color: '#16C5C0', duration: '6.8s', delay: '-0.8s' },
  { left: '94%', height: 160, color: '#0A4565', duration: '6.2s', delay: '-2.4s' },
];

export const FishIllustration: React.FC<{ spec: FishSpec }> = ({ spec }) => {
  const { species, palette, wagDuration } = spec;

  if (species === 'school') {
    const offsets = [
      { x: 0, y: 12, s: 1 },
      { x: 26, y: 2, s: 0.85 },
      { x: 30, y: 24, s: 0.9 },
      { x: 56, y: 11, s: 0.78 },
      { x: 64, y: 28, s: 0.72 },
      { x: 84, y: 17, s: 0.68 },
    ];
    return (
      <svg width="160" height="58" viewBox="0 0 160 58" fill="none" className="overflow-visible">
        {offsets.map((o, idx) => (
          <g key={idx} transform={`translate(${o.x}, ${o.y}) scale(${o.s})`}>
            <g className="fish-tail" style={{ ['--wag-duration' as string]: `${0.42 + idx * 0.04}s` }}>
              <path d="M12 10 L2 4 L5 10 L2 16 Z" fill={palette.fin} fillOpacity="0.85" />
            </g>
            <path d="M11 10 C18 3, 34 3, 44 10 C34 17, 18 17, 11 10 Z" fill={palette.bodyTop} />
            <path
              d="M13 10 C20 14, 33 15, 43 10 C33 11, 20 11, 13 10 Z"
              fill={palette.bodyBottom}
              fillOpacity="0.85"
            />
            <circle cx="38" cy="8.8" r="1.3" fill={palette.accent} />
          </g>
        ))}
      </svg>
    );
  }

  if (species === 'angel') {
    return (
      <svg width="96" height="72" viewBox="0 0 96 72" fill="none" className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${spec.id}`} x1="0" y1="0" x2="96" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.bodyTop} />
            <stop offset="100%" stopColor={palette.bodyBottom} />
          </linearGradient>
        </defs>
        <g className="fish-body-bob">
          <g className="fish-tail" style={{ ['--wag-duration' as string]: wagDuration }}>
            <path d="M24 36 L4 20 L10 36 L4 52 Z" fill={palette.fin} fillOpacity="0.88" />
          </g>
          <path d="M36 22 C44 4, 56 6, 52 24 Z" fill={palette.fin} fillOpacity="0.85" />
          <path d="M38 48 C46 66, 58 64, 52 46 Z" fill={palette.fin} fillOpacity="0.85" />
          <path
            d="M22 36 C30 14, 62 12, 78 36 C62 60, 30 58, 22 36 Z"
            fill={`url(#grad-${spec.id})`}
          />
          <path d="M44 19 C41 30, 41 42, 44 53" stroke={palette.accent} strokeWidth="3.5" strokeOpacity="0.55" strokeLinecap="round" />
          <path d="M56 21 C54 31, 54 41, 56 51" stroke={palette.accent} strokeWidth="2.8" strokeOpacity="0.45" strokeLinecap="round" />
          <g className="fish-fin">
            <path d="M52 38 C46 42, 42 46, 48 48 C54 46, 56 41, 52 38 Z" fill={palette.bodyBottom} fillOpacity="0.85" />
          </g>
          <circle cx="67" cy="33" r="3.2" fill="#F8FAFC" />
          <circle cx="68" cy="33" r="1.6" fill="#062B45" />
        </g>
      </svg>
    );
  }

  if (species === 'bream') {
    return (
      <svg width="118" height="68" viewBox="0 0 118 68" fill="none" className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${spec.id}`} x1="0" y1="8" x2="100" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.bodyTop} />
            <stop offset="55%" stopColor={palette.fin} />
            <stop offset="100%" stopColor={palette.bodyBottom} />
          </linearGradient>
        </defs>
        <g className="fish-body-bob">
          <g className="fish-tail" style={{ ['--wag-duration' as string]: wagDuration }}>
            <path d="M26 34 L3 17 L12 34 L3 51 Z" fill={palette.fin} fillOpacity="0.9" />
          </g>
          <path d="M36 22 C48 9, 68 10, 74 22 Z" fill={palette.fin} fillOpacity="0.82" />
          <path
            d="M23 34 C34 15, 78 14, 102 34 C78 55, 34 53, 23 34 Z"
            fill={`url(#grad-${spec.id})`}
          />
          <path d="M77 24 C73 31, 73 39, 77 45" stroke="#062B45" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
          <path d="M88 26 C86 28, 86 30, 89 31" stroke={palette.accent} strokeWidth="2.5" strokeLinecap="round" />
          <g className="fish-fin">
            <path d="M68 37 C58 41, 55 47, 63 48 C70 46, 72 40, 68 37 Z" fill={palette.bodyBottom} fillOpacity="0.85" />
          </g>
          <circle cx="89" cy="31" r="3.4" fill="#F8FAFC" />
          <circle cx="90.2" cy="31" r="1.7" fill="#062B45" />
        </g>
      </svg>
    );
  }

  return (
    <svg width="144" height="66" viewBox="0 0 144 66" fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${spec.id}`} x1="25" y1="12" x2="128" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.bodyTop} />
          <stop offset="55%" stopColor={palette.fin} />
          <stop offset="100%" stopColor={palette.bodyBottom} />
        </linearGradient>
      </defs>
      <g className="fish-body-bob">
        <g className="fish-tail" style={{ ['--wag-duration' as string]: wagDuration }}>
          <path d="M28 33 L4 11 L15 33 L4 55 L28 33 Z" fill={palette.fin} fillOpacity="0.92" />
        </g>
        <path d="M56 18 L66 5 L78 18 Z" fill={palette.bodyTop} fillOpacity="0.9" />
        <path d="M48 45 L56 56 L66 45 Z" fill={palette.fin} fillOpacity="0.78" />
        <path
          d="M25 33 C42 15, 92 12, 128 33 C92 54, 42 51, 25 33 Z"
          fill={`url(#grad-${spec.id})`}
        />
        <path
          d="M38 33 C62 28, 92 29, 118 33"
          stroke={palette.accent}
          strokeOpacity="0.5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M38 38 C64 47, 94 46, 120 36 C94 41, 64 42, 38 38 Z"
          fill={palette.bodyBottom}
          fillOpacity="0.55"
        />
        <path d="M98 23 C94 31, 94 38, 98 44" stroke="#062B45" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
        <g className="fish-fin">
          <path d="M88 36 C74 41, 68 47, 77 48 C85 46, 90 40, 88 36 Z" fill={palette.fin} fillOpacity="0.88" />
        </g>
        <circle cx="113" cy="30" r="3.5" fill="#F8FAFC" />
        <circle cx="114.2" cy="30" r="1.8" fill="#062B45" />
      </g>
    </svg>
  );
};

export const UnderwaterScene: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  const parallaxLayerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    const el = parallaxLayerRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 18;
      const ny = (e.clientY / window.innerHeight - 0.5) * 12;
      el.style.transform = `translate3d(${-nx}px, ${-ny}px, 0)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* Real Three.js 3D WebGL Ocean (3D swimming fish, 3D school, bubbles, plankton dust) */}
      <OceanCanvas3D theme={theme} />

      {/* Soft Water Caustic Distortion Overlay */}
      <div
        className={`absolute -inset-12 water-caustic ${isLight ? 'opacity-55' : 'opacity-40'}`}
        style={{
          background: isLight
            ? 'radial-gradient(ellipse 65% 40% at 30% 18%, rgba(255,255,255,0.55), transparent 70%), radial-gradient(ellipse 55% 35% at 72% 24%, rgba(22,197,192,0.22), transparent 70%)'
            : 'radial-gradient(ellipse 65% 40% at 30% 18%, rgba(125,220,235,0.22), transparent 70%), radial-gradient(ellipse 55% 35% at 72% 24%, rgba(22,197,192,0.18), transparent 70%)',
        }}
      />

      {/* Volumetric Diagonal Sunlight Rays */}
      <div
        className={`absolute -top-24 left-[8%] w-40 h-[135%] bg-gradient-to-b ${
          isLight
            ? 'from-white/55 via-[#7DDCEB]/25'
            : 'from-[#7DDCEB]/22 via-[#16C5C0]/8'
        } to-transparent blur-2xl light-ray`}
      />
      <div
        className={`absolute -top-28 left-[36%] w-56 h-[140%] bg-gradient-to-b ${
          isLight
            ? 'from-white/60 via-[#16C5C0]/16'
            : 'from-[#F8FAFC]/16 via-[#7DDCEB]/8'
        } to-transparent blur-3xl light-ray`}
        style={{ animationDelay: '-3.5s' }}
      />
      <div
        className={`absolute -top-24 left-[68%] w-44 h-[135%] bg-gradient-to-b ${
          isLight
            ? 'from-white/50 via-[#7DDCEB]/20'
            : 'from-[#16C5C0]/18 via-[#7DDCEB]/8'
        } to-transparent blur-2xl light-ray`}
        style={{ animationDelay: '-6.5s' }}
      />

      {/* Undulating Surface & Abyssal Wave Currents */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className={`absolute top-0 left-0 w-[115%] h-40 ocean-wave ${
          isLight ? 'opacity-45' : 'opacity-25'
        }`}
      >
        <path
          fill={isLight ? '#FFFFFF' : '#7DDCEB'}
          fillOpacity={isLight ? '0.38' : '0.22'}
          d="M0,96L60,112C120,128,240,160,360,154.7C480,149,600,107,720,96C840,85,960,107,1080,122.7C1200,139,1320,149,1380,154.7L1440,160L1440,0L0,0Z"
        />
      </svg>

      {/* Swaying Underwater Seaweed & Kelp Silhouettes */}
      <div
        className={`absolute inset-x-0 bottom-0 h-60 overflow-hidden ${
          isLight ? 'opacity-45' : 'opacity-60'
        }`}
      >
        {SEAWEED_FRONDS.map((f, idx) => (
          <svg
            key={idx}
            width="54"
            height={f.height}
            viewBox="0 0 54 200"
            fill="none"
            className="absolute bottom-0 seaweed-sway"
            style={{
              left: f.left,
              ['--sway-duration' as string]: f.duration,
              ['--sway-delay' as string]: f.delay,
            }}
          >
            <path
              d="M27 200 C16 165, 38 135, 22 98 C10 68, 36 38, 25 4 C34 38, 22 72, 33 102 C44 134, 24 166, 33 200 Z"
              fill={f.color}
              fillOpacity={isLight ? '0.42' : '0.55'}
            />
          </svg>
        ))}
      </div>

      {/* Parallax Foreground SVG Swimmers & Bubbles */}
      <div
        ref={parallaxLayerRef}
        className="absolute inset-0 transition-transform duration-200 ease-out"
      >
        {BUBBLES.map((b) => (
          <span
            key={b.id}
            className={`hidden sm:block absolute bottom-0 rounded-full border bubble-rise ${
              isLight
                ? 'border-white/80 bg-gradient-to-tr from-[#16C5C0]/25 to-white/60'
                : 'border-[#7DDCEB]/55 bg-gradient-to-tr from-[#16C5C0]/15 to-[#F8FAFC]/35'
            }`}
            style={{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              ['--bubble-duration' as string]: b.duration,
              ['--bubble-delay' as string]: b.delay,
              ['--bubble-opacity' as string]: b.opacity,
            }}
          />
        ))}

        {FISH_SWARM.filter((fish) => fish.layer !== 'fg').map((fish) => (
          <div
            key={fish.id}
            className={`hidden md:block absolute left-0 z-10 opacity-85 ${
              fish.direction === 'ltr' ? 'fish-swim-ltr' : 'fish-swim-rtl'
            }`}
            style={{
              top: fish.top,
              ['--swim-duration' as string]: fish.duration,
              ['--swim-delay' as string]: fish.delay,
              ['--fish-opacity' as string]: fish.opacity,
            }}
          >
            <div style={{ transform: `scale(${fish.scale})` }}>
              <FishIllustration spec={fish} />
            </div>
          </div>
        ))}
      </div>

      {/* Soft depth vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(14, 116, 144, 0.16) 100%)'
            : 'radial-gradient(circle at 50% 45%, transparent 38%, rgba(3, 21, 36, 0.52) 100%)',
        }}
      />
    </div>
  );
};

/* ============================================================
   Foreground Swimmers (z-40) — Glide gracefully IN FRONT OF logo & headline
============================================================ */
export const ForegroundOceanSwimmers: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const fgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fgRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 28;
      const ny = (e.clientY / window.innerHeight - 0.5) * 18;
      el.style.transform = `translate3d(${-nx}px, ${-ny}px, 0)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div
      ref={fgRef}
      className="pointer-events-none absolute inset-0 z-40 overflow-hidden select-none transition-transform duration-200 ease-out"
      aria-hidden="true"
    >
      {FISH_SWARM.filter((fish) => fish.layer === 'fg').map((fish, idx) => (
        <div
          key={fish.id}
          className={`${idx === 2 ? 'hidden sm:block' : ''} absolute left-0 ${
            isLight
              ? 'drop-shadow-[0_12px_20px_rgba(6,43,69,0.22)]'
              : 'drop-shadow-[0_12px_24px_rgba(2,14,24,0.55)]'
          } ${fish.direction === 'ltr' ? 'fish-swim-ltr' : 'fish-swim-rtl'}`}
          style={{
            top: fish.top,
            ['--swim-duration' as string]: fish.duration,
            ['--swim-delay' as string]: fish.delay,
            ['--fish-opacity' as string]: fish.opacity,
          }}
        >
          <div style={{ transform: `scale(${fish.scale})` }}>
            <FishIllustration spec={fish} />
          </div>
        </div>
      ))}
    </div>
  );
};
