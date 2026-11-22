import React from 'react';
import { FishIllustration } from './UnderwaterScene';

const AMBIENT_FISH = [
  {
    id: 'amb-1',
    species: 'tuna' as const,
    direction: 'ltr' as const,
    top: '22%',
    scale: 0.72,
    duration: '42s',
    delay: '-12s',
    opacity: 0.16,
    layer: 'bg' as const,
    wagDuration: '0.8s',
    palette: { bodyTop: '#0A4565', bodyBottom: '#7DDCEB', fin: '#16C5C0', accent: '#F8FAFC' },
  },
  {
    id: 'amb-2',
    species: 'bream' as const,
    direction: 'rtl' as const,
    top: '68%',
    scale: 0.65,
    duration: '48s',
    delay: '-26s',
    opacity: 0.14,
    layer: 'bg' as const,
    wagDuration: '0.85s',
    palette: { bodyTop: '#16C5C0', bodyBottom: '#BAE6FD', fin: '#7DDCEB', accent: '#0A4565' },
  },
  {
    id: 'amb-3',
    species: 'school' as const,
    direction: 'ltr' as const,
    top: '44%',
    scale: 0.62,
    duration: '54s',
    delay: '-18s',
    opacity: 0.13,
    layer: 'bg' as const,
    wagDuration: '0.6s',
    palette: { bodyTop: '#16C5C0', bodyBottom: '#7DDCEB', fin: '#0A4565', accent: '#F8FAFC' },
  },
];

const AMBIENT_BUBBLES = Array.from({ length: 10 }, (_, i) => ({
  id: `wb-${i}`,
  left: `${8 + i * 9.2}%`,
  size: 4 + (i % 3) * 3,
  duration: `${16 + (i % 4) * 3}s`,
  delay: `${-(i * 2.1)}s`,
  opacity: 0.18,
}));

const DUST_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: `dp-${i}`,
  left: `${(i * 8.5 + 4) % 95}%`,
  top: `${(i * 13 + 10) % 85}%`,
  duration: `${8 + (i % 5) * 2}s`,
  delay: `${-(i * 1.1)}s`,
}));

export const WorkspaceOceanBackdrop: React.FC = () => {
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
            'radial-gradient(ellipse 55% 40% at 22% 14%, rgba(22, 197, 192, 0.2), transparent 70%), radial-gradient(ellipse 48% 36% at 82% 76%, rgba(125, 220, 235, 0.22), transparent 70%)',
        }}
      />

      {/* Subtle Overhead Sunlight Beams */}
      <div className="hidden md:block absolute -top-24 left-[20%] w-48 h-[130%] bg-gradient-to-b from-[#16C5C0]/10 dark:from-[#7DDCEB]/10 via-transparent to-transparent blur-3xl light-ray" />
      <div
        className="hidden md:block absolute -top-24 left-[64%] w-56 h-[130%] bg-gradient-to-b from-[#7DDCEB]/12 dark:from-[#16C5C0]/10 via-transparent to-transparent blur-3xl light-ray"
        style={{ animationDelay: '-4.5s' }}
      />

      {/* Slowly Swaying Seabed Seaweed in Corners */}
      <svg
        width="64"
        height="170"
        viewBox="0 0 64 200"
        fill="none"
        className="hidden sm:block absolute bottom-0 left-3 seaweed-sway opacity-15 dark:opacity-30"
      >
        <path
          d="M32 200 C18 165, 44 130, 26 92 C12 62, 42 30, 28 4 C40 34, 24 72, 38 104 C50 136, 26 168, 38 200 Z"
          fill="#16C5C0"
        />
      </svg>
      <svg
        width="68"
        height="190"
        viewBox="0 0 64 200"
        fill="none"
        className="hidden sm:block absolute bottom-0 right-4 seaweed-sway opacity-15 dark:opacity-30"
        style={{ ['--sway-duration' as string]: '7.5s', ['--sway-delay' as string]: '-2.2s' }}
      >
        <path
          d="M32 200 C18 165, 44 130, 26 92 C12 62, 42 30, 28 4 C40 34, 24 72, 38 104 C50 136, 26 168, 38 200 Z"
          fill="#0A4565"
        />
      </svg>

      {/* Ambient Floating Marine Dust (Desktop/Tablet only for mobile efficiency) */}
      {DUST_PARTICLES.map((d) => (
        <span
          key={d.id}
          className="hidden md:block absolute w-1 h-1 rounded-full bg-[#16C5C0]/45 dark:bg-[#7DDCEB]/45 marine-dust"
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
          } absolute bottom-0 rounded-full border border-[#16C5C0]/35 dark:border-[#7DDCEB]/35 bg-[#7DDCEB]/10 bubble-rise`}
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

      {/* Serene Background Fish Silhouettes */}
      {AMBIENT_FISH.map((fish, idx) => (
        <div
          key={fish.id}
          className={`${idx > 0 ? 'hidden sm:block' : ''} absolute left-0 ${
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
  );
};
