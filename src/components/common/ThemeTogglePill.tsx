import React from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeTogglePillProps {
  compact?: boolean;
  onDarkSurface?: boolean;
}

export const ThemeTogglePill: React.FC<ThemeTogglePillProps> = ({
  compact = false,
  onDarkSurface = false,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const containerBg = onDarkSurface
    ? 'bg-[#072B44]/85 border-[#7DDCEB]/30 text-[#F8FAFC]'
    : 'bg-white/85 dark:bg-[#052034]/85 border-[#0A4565]/15 dark:border-[#7DDCEB]/22 text-[#062B45] dark:text-[#F8FAFC]';

  return (
    <div
      role="group"
      aria-label="Sélecteur de thème clair ou sombre"
      className={`inline-flex items-center p-1 rounded-xl border shadow-sm transition-colors ${containerBg}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
        aria-label="Activer le mode clair"
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
          !isDark
            ? 'text-[#062B45]'
            : onDarkSurface
            ? 'text-[#F8FAFC]/75 hover:text-[#F8FAFC]'
            : 'text-[#0A4565]/70 dark:text-[#7DDCEB]/75 hover:text-[#16C5C0]'
        }`}
      >
        {!isDark && (
          <motion.span
            layoutId="bahripay-theme-indicator"
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="absolute inset-0 rounded-lg bg-[#16C5C0] shadow-sm shadow-[#16C5C0]/30"
          />
        )}
        <Sun className="w-3.5 h-3.5 relative z-10 shrink-0" />
        {!compact && <span className="relative z-10 hidden sm:inline">Clair</span>}
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
        aria-label="Activer le mode sombre"
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
          isDark
            ? 'text-[#062B45]'
            : onDarkSurface
            ? 'text-[#F8FAFC]/75 hover:text-[#F8FAFC]'
            : 'text-[#0A4565]/70 dark:text-[#7DDCEB]/75 hover:text-[#16C5C0]'
        }`}
      >
        {isDark && (
          <motion.span
            layoutId="bahripay-theme-indicator"
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="absolute inset-0 rounded-lg bg-[#7DDCEB] shadow-sm shadow-[#7DDCEB]/30"
          />
        )}
        <Moon className="w-3.5 h-3.5 relative z-10 shrink-0" />
        {!compact && <span className="relative z-10 hidden sm:inline">Sombre</span>}
      </button>
    </div>
  );
};
