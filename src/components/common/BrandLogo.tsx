import React from 'react';
import { motion } from 'motion/react';

interface BrandLogoProps {
  className?: string;
  lightText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  lightText = false,
  size = 'md',
  animated = true,
}) => {
  const iconDim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl';

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group ${className}`}>
      <motion.span
        whileHover={animated ? { rotate: [0, -6, 4, 0], scale: 1.06 } : undefined}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative inline-flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconDim} shrink-0 drop-shadow-[0_4px_12px_rgba(22,197,192,0.35)]`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bahripay-logo-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#16C5C0" />
              <stop offset="55%" stopColor="#0A4565" />
              <stop offset="100%" stopColor="#062B45" />
            </linearGradient>
            <linearGradient id="bahripay-sail-grad" x1="20" y1="8" x2="20" y2="23" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#7DDCEB" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="12" fill="url(#bahripay-logo-grad)" />
          <rect
            x="0.75"
            y="0.75"
            width="38.5"
            height="38.5"
            rx="11.25"
            stroke="#7DDCEB"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          {/* Stylized Sail / Compass Peak */}
          <path
            d="M20 7.5L28 21.5H12L20 7.5Z"
            fill="url(#bahripay-sail-grad)"
            fillOpacity="0.28"
            stroke="#F8FAFC"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          {/* Ocean Wave Crest */}
          <path
            d="M7.5 26C11.2 22.8 15.2 29.2 20 26C24.8 22.8 28.8 29.2 32.5 26"
            stroke="#7DDCEB"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M10.5 31C13.8 28.8 17 33 20 31C23 28.8 26.2 33 29.5 31"
            stroke="#16C5C0"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="20" cy="15.5" r="1.7" fill="#F8FAFC" />
        </svg>
      </motion.span>
      <span
        className={`font-display font-bold tracking-tight ${textSize} ${
          lightText ? 'text-[#F8FAFC]' : 'text-[#062B45] dark:text-[#F8FAFC]'
        }`}
      >
        Bahri<span className="text-[#16C5C0]">pay</span>
      </span>
    </span>
  );
};
