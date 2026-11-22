import React, { useEffect, useRef } from 'react';
import { FishIllustration } from './UnderwaterScene';

const AMBIENT_FISH = [
  {
    id: 'amb-1',
    species: 'tuna' as const,
    direction: 'ltr' as const,
    top: '18%',
    scale: 0.78,
    duration: '38s',
    delay: '-12s',
    opacity: 0.28,
    layer: 'bg' as const,
    wagDuration: '0.75s',
    palette: { bodyTop: '#0A4565', bodyBottom: '#7DDCEB', fin: '#16C5C0', accent: '#F8FAFC' },
  },
  {
    id: 'amb-2',
    species: 'bream' as const,
    direction: 'rtl' as const,
    top: '70%',
    scale: 0.72,
    duration: '44s',
    delay: '-24s',
    opacity: 0.26,
    layer: 'bg' as const,
    wagDuration: '0.8s',
    palette: { bodyTop: '#16C5C0', bodyBottom: '#BAE6FD', fin: '#7DDCEB', accent: '#0A4565' },
  },
  {
    id: 'amb-3',
    species: 'school' as const,
    direction: 'ltr' as const,
    top: '46%',
    scale: 0.7,
    duration: '50s',
    delay: '-18s',
    opacity: 0.24,
    layer: 'bg' as const,
    wagDuration: '0.55s',
    palette: { bodyTop: '#16C5C0', bodyBottom: '#7DDCEB', fin: '#0A4565', accent: '#F8FAFC' },
  },
  {
    id: 'amb-4',
    species: 'angel' as const,
    direction: 'rtl' as const,
    top: '32%',
    scale: 0.64,
    duration: '41s',
    delay: '-7s',
    opacity: 0.22,
    layer: 'bg' as const,
    wagDuration: '0.68s',
    palette: { bodyTop: '#14B8A6', bodyBottom: '#7DDCEB', fin: '#F59E0B', accent: '#062B45' },
  },
];

const AMBIENT_BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: `wb-${i}`,
  left: `${6 + i * 8.1}%`,
  size: 4 + (i % 4) * 3,
  duration: `${15 + (i % 4) * 3}s`,
  delay: `${-(i * 2.1)}s`,
  opacity: 0.24,
}));

const DUST_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: `dp-${i}`,
  left: `${(i * 7.5 + 4) % 95}%`,
  top: `${(i * 13 + 10) % 85}%`,
  duration: `${8 + (i % 5) * 2}s`,
  delay: `${-(i * 1.1)}s`,
}));

export const WorkspaceOceanBackdrop: React.FC = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 14;
      const ny = (e.clientY / window.innerHeight - 0.5) * 10;
      el.style.transform = `translate3d(${-nx}px, ${-ny}px, 0)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div
      className="no-print pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Theme-Adaptive Ocean Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F2FAFD] via-[#E1F4FA] to-[#CBEAF6] dark:from-[#02111D] dark:via-[#041F33] dark:to-[#072E48] transition-colors duration-500" />

      {/* Water Caustics & Soft Turquoise Glow */}
      <div
        className="absolute -inset-16 water-caustic opacity-60 dark:opacity-65"
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 22% 14%, rgba(22, 197, 192, 0.22), transparent 70%), radial-gradient(ellipse 48% 36% at 82% 76%, rgba(125, 220, 235, 0.22), transparent 70%)',
        }}
      />

      {/* Subtle Ocean Current Ribbons */}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="hidden md:block absolute top-[24%] left-0 w-[115%] h-32 opacity-20 dark:opacity-25 ocean-wave"
      >
        <path
          d="M0,90 C320,30 620,150 960,90 C1180,50 1320,110 1440,80"
          stroke="#16C5C0"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,130 C360,80 680,175 1040,120 C1240,85 1360,135 1440,115"
          stroke="#7DDCEB"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Subtle Overhead Sunlight Beams */}
      <div className="hidden md:block absolute -top-24 left-[20%] w-48 h-[130%] bg-gradient-to-b from-[#16C5C0]/12 dark:from-[#7DDCEB]/12 via-transparent to-transparent blur-3xl light-ray" />
      <div
        className="hidden md:block absolute -top-24 left-[64%] w-56 h-[130%] bg-gradient-to-b from-[#7DDCEB]/14 dark:from-[#16C5C0]/12 via-transparent to-transparent blur-3xl light-ray"
        style={{ animationDelay: '-4.5s' }}
      />

      {/* Slowly Swaying Seabed Seaweed in Corners */}
      <svg
        width="68"
        height="185"
        viewBox="0 0 64 200"
        fill="none"
        className="hidden sm:block absolute bottom-0 left-3 seaweed-sway opacity-25 dark:opacity-35"
      >
        <path
          d="M32 200 C18 165, 44 130, 26 92 C12 62, 42 30, 28 4 C40 34, 24 72, 38 104 C50 136, 26 168, 38 200 Z"
          fill="#16C5C0"
        />
      </svg>
      <svg
        width="72"
        height="205"
        viewBox="0 0 64 200"
        fill="none"
        className="hidden sm:block absolute bottom-0 right-4 seaweed-sway opacity-22 dark:opacity-35"
        style={{ ['--sway-duration' as string]: '7.5s', ['--sway-delay' as string]: '-2.2s' }}
      >
        <path
          d="M32 200 C18 165, 44 130, 26 92 C12 62, 42 30, 28 4 C40 34, 24 72, 38 104 C50 136, 26 168, 38 200 Z"
          fill="#0A4565"
        />
      </svg>

      {/* Cursor-Parallax Layer for Marine Dust, Bubbles & Swimming Fish */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 transition-transform duration-200 ease-out"
      >
        {/* Ambient Floating Marine Dust (Desktop/Tablet only for mobile efficiency) */}
        {DUST_PARTICLES.map((d) => (
          <span
            key={d.id}
            className="hidden md:block absolute w-1 h-1 rounded-full bg-[#16C5C0]/55 dark:bg-[#7DDCEB]/55 marine-dust"
            style={{
              left: d.left,
              top: d.top,
              ['--dust-duration' as string]: d.duration,
              ['--dust-delay' as string]: d.delay,
            }}
          />
        ))}

        {/* Gentle Rising Bubbles (reduced on mobile) */}
        {AMBIENT_BUBBLES.map((b, idx) => (
          <span
            key={b.id}
            className={`${
              idx % 2 === 0 ? 'block' : 'hidden md:block'
            } absolute bottom-0 rounded-full border border-[#16C5C0]/40 dark:border-[#7DDCEB]/40 bg-[#7DDCEB]/15 bubble-rise`}
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

        {/* Serene Background Fish & School */}
        {AMBIENT_FISH.map((fish, idx) => (
          <div
            key={fish.id}
            className={`${idx > 1 ? 'hidden md:block' : ''} absolute left-0 ${
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
    </div>
  );
};
