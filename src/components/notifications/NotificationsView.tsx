import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BrainCircuit,
  CheckCheck,
  FileWarning,
  Ship,
  Wallet,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMaritime } from '../../context/MaritimeContext';
import { NotificationCategory } from '../../types/maritime';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

const CATEGORY_LABELS: Record<'ALL' | NotificationCategory, string> = {
  ALL: 'All',
  payment: 'Payments',
  trip: 'Trips',
  contract: 'Contracts',
  document: 'Documents',
  finance: 'Finances',
  ai: 'Ocean AI',
};

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setRoute } = useMaritime();
  const [filter, setFilter] = useState<'ALL' | NotificationCategory>('ALL');

  const filtered = useMemo(() => {
    return notifications.filter((n) => filter === 'ALL' || n.category === filter);
  }, [notifications, filter]);

  const getIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'payment':
      case 'finance':
        return Wallet;
      case 'trip':
        return Ship;
      case 'document':
        return FileWarning;
      case 'ai':
        return BrainCircuit;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight flex items-center gap-2.5 text-[#062B45] dark:text-[#F8FAFC]">
            <Bell className="w-6 h-6 text-[#16C5C0]" />
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Administrative alerts, contract expirations, pending crew payments, and Ocean AI insights.
          </p>
        </div>

        <MagneticButton
          type="button"
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-xs sm:text-sm font-semibold hover:border-[#16C5C0] cursor-pointer self-start sm:self-auto transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-[#16C5C0]" />
          <span>Mark all as read</span>
        </MagneticButton>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Array<'ALL' | NotificationCategory>).map((cat) => {
          const active = filter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? 'text-[#062B45]'
                  : 'bg-white/75 dark:bg-[#07263C]/75 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18 text-[#0A4565]/80 dark:text-[#7DDCEB]/80 hover:border-[#16C5C0]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bahripay-notif-filter"
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-[#16C5C0] shadow-md shadow-[#16C5C0]/25"
                />
              )}
              <span className="relative z-10">{CATEGORY_LABELS[cat]}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Notification Bubbles */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((n, index) => {
            const Icon = getIcon(n.category);
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
              >
                <FloatingGlassCard
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    n.read
                      ? 'opacity-75'
                      : 'border-[#16C5C0]/55 shadow-[0_10px_32px_rgba(22,197,192,0.12)]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`relative p-2.5 rounded-xl shrink-0 ${
                        n.severity === 'urgent'
                          ? 'bg-red-500/15 text-red-500'
                          : n.severity === 'warning'
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'bg-[#16C5C0]/15 text-[#16C5C0]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {!n.read && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#16C5C0] shadow-[0_0_8px_rgba(22,197,192,0.85)]" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span>{n.title}</span>
                        {!n.read && (
                          <span className="text-[11px] font-semibold text-[#16C5C0]">· New</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#0A4565]/80 dark:text-[#F8FAFC]/75 mt-1">
                        {n.message}
                      </p>
                      <div className="text-[11px] opacity-60 mt-1.5">
                        {CATEGORY_LABELS[n.category]} · {n.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-[#F1F6FA]/90 dark:bg-[#041826]/85 hover:text-[#16C5C0] cursor-pointer transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                    {n.targetPage && (
                      <MagneticButton
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          setRoute(n.targetPage!);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16C5C0] hover:bg-[#19d8d2] text-[#062B45] text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </MagneticButton>
                    )}
                  </div>
                </FloatingGlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <FloatingGlassCard tiltEnabled={false} className="p-10 text-center text-sm opacity-75">
            No notifications in this category.
          </FloatingGlassCard>
        )}
      </div>
    </div>
  );
};
