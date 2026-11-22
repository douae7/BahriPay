import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/* ============================================================
   1. AnimatedNumber — Smooth numerical counter
============================================================ */
interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(endVal);
      prevValueRef.current = endVal;
      return;
    }

    const duration = 650;
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = endVal;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  const formatted =
    decimals > 0
      ? displayValue.toLocaleString('fr-FR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(displayValue).toLocaleString('fr-FR');

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

/* ============================================================
   2. FloatingGlassCard — Ocean glassmorphism + subtle 3D tilt
============================================================ */
interface FloatingGlassCardProps {
  children: React.ReactNode;
  className?: string;
  tiltEnabled?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const FloatingGlassCard: React.FC<FloatingGlassCardProps> = ({
  children,
  className = '',
  tiltEnabled = true,
  onClick,
  delay = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled || e.pointerType === 'touch') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(950px) rotateX(${-py * 4.5}deg) rotateY(${px * 5.5}deg) translateY(-2px)`;
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(950px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`rounded-2xl bg-white/82 dark:bg-[#07263C]/78 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18 shadow-[0_8px_32px_rgba(6,43,69,0.06)] dark:shadow-[0_12px_36px_rgba(2,18,30,0.45)] hover:border-[#16C5C0]/55 hover:shadow-[0_12px_36px_rgba(22,197,192,0.14)] transition-[transform,border-color,box-shadow] duration-200 will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ============================================================
   3. MagneticButton — Tactile magnetic attraction button
============================================================ */
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  strength = 0.22,
  ...props
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setOffset({
      x: Math.max(-7, Math.min(7, dx)),
      y: Math.max(-5, Math.min(5, dy)),
    });
  };

  return (
    <motion.button
      ref={btnRef}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 320, damping: 20, mass: 0.4 }}
      onPointerMove={handleMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      whileTap={{ scale: 0.97 }}
      className={className}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
};

/* ============================================================
   4. FloatingCircularStat — Circular animated ocean gauge
============================================================ */
interface FloatingCircularStatProps {
  label: string;
  valueText: string;
  percent: number;
  sublabel: string;
  floatDelay?: string;
}

export const FloatingCircularStat: React.FC<FloatingCircularStatProps> = ({
  label,
  valueText,
  percent,
  sublabel,
  floatDelay = '0s',
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="float-gentle p-4 rounded-2xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/20 shadow-[0_10px_28px_rgba(6,43,69,0.08)] dark:shadow-[0_10px_28px_rgba(2,18,30,0.45)] flex items-center gap-4"
      style={{ ['--float-delay' as string]: floatDelay }}
    >
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="6"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#16C5C0"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span className="absolute font-mono tabular-nums text-xs font-bold text-[#062B45] dark:text-[#F8FAFC]">
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-[#0A4565]/70 dark:text-[#7DDCEB]/80 truncate">
          {label}
        </div>
        <div className="font-mono tabular-nums font-bold text-lg text-[#062B45] dark:text-[#F8FAFC] mt-0.5">
          {valueText}
        </div>
        <div className="text-[11px] text-[#0A4565]/65 dark:text-[#F8FAFC]/65 truncate">
          {sublabel}
        </div>
      </div>
    </div>
  );
};
