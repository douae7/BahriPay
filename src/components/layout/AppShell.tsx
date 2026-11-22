import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BrainCircuit,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Ship,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useMaritime } from '../../context/MaritimeContext';
import { AppRoute, UserRole } from '../../types/maritime';
import { BrandLogo } from '../common/BrandLogo';
import { WorkspaceOceanBackdrop } from '../common/WorkspaceOceanBackdrop';
import { ThemeTogglePill } from '../common/ThemeTogglePill';

interface NavItem {
  id: AppRoute;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', shortLabel: 'Accueil', icon: LayoutDashboard },
  { id: 'sailors', label: 'Marins & Contrats', shortLabel: 'Marins', icon: Users },
  { id: 'fleet', label: 'Bateaux & Sorties', shortLabel: 'Flotte', icon: Ship },
  { id: 'finances', label: 'Finances & Parts', shortLabel: 'Finances', icon: Wallet },
  { id: 'ocean-ai', label: 'Ocean AI', shortLabel: 'Ocean AI', icon: BrainCircuit },
  { id: 'reports', label: 'Rapports & Exports', shortLabel: 'Rapports', icon: FileSpreadsheet },
  { id: 'notifications', label: 'Notifications', shortLabel: 'Alertes', icon: Bell },
];

const ROLE_LABELS: Record<UserRole, string> = {
  ARMATEUR: 'Armateur',
  CAPITAINE: 'Capitaine',
  FINANCIER: 'Financier',
  OBSERVATEUR: 'Observateur',
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    route,
    setRoute,
    currentUser,
    loginAsRole,
    logout,
    notifications,
    markNotificationRead,
    resetDemoData,
  } = useMaritime();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeNav = NAV_ITEMS.find((n) => n.id === route) || NAV_ITEMS[0];

  const handleNavigate = (target: AppRoute) => {
    setRoute(target);
    setMobileDrawerOpen(false);
    setNotifOpen(false);
  };

  return (
    <div className="relative min-h-screen text-[#062B45] dark:text-[#F8FAFC] flex transition-colors duration-300 overflow-x-hidden">
      {/* Living Ocean Underwater Environment behind the entire Workspace */}
      <WorkspaceOceanBackdrop />

      {/* ============================================================
          FLOATING GLASS SIDEBAR (DESKTOP & TABLET)
      ============================================================ */}
      <aside className="no-print relative z-30 hidden md:flex p-3 lg:p-4 shrink-0 h-screen sticky top-0">
        <div className="flex flex-col justify-between md:w-[68px] lg:w-[248px] rounded-3xl bg-white/78 dark:bg-[#062439]/78 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18 shadow-[0_12px_40px_rgba(6,43,69,0.08)] dark:shadow-[0_16px_44px_rgba(2,18,30,0.5)] transition-all">
          <div className="p-3 lg:p-5">
            {/* Logo Header */}
            <div className="flex items-center justify-center lg:justify-between mb-7 px-1">
              <button
                type="button"
                onClick={() => handleNavigate('dashboard')}
                className="cursor-pointer focus:outline-none"
              >
                <span className="lg:hidden">
                  <BrandLogo size="sm" className="[&>span:last-child]:hidden" />
                </span>
                <span className="hidden lg:inline-flex">
                  <BrandLogo size="md" />
                </span>
              </button>
            </div>

            {/* Animated Primary Navigation with gliding active indicator */}
            <nav className="space-y-1.5" aria-label="Navigation principale">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    title={item.label}
                    className={`relative w-full flex items-center justify-center lg:justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#062B45] font-semibold'
                        : 'text-[#0A4565]/80 dark:text-[#F8FAFC]/75 hover:bg-[#16C5C0]/10 hover:text-[#062B45] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="bahripay-active-nav"
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-[#16C5C0] shadow-md shadow-[#16C5C0]/25"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3 min-w-0">
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="hidden lg:inline truncate">{item.label}</span>
                    </span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span
                        className={`relative z-10 hidden lg:inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[11px] font-mono font-bold ${
                          isActive
                            ? 'bg-[#062B45] text-[#F8FAFC]'
                            : 'bg-[#16C5C0]/20 text-[#062B45] dark:text-[#7DDCEB]'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Actions */}
          <div className="p-3 lg:p-5 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 space-y-2">
            <button
              type="button"
              onClick={() => setRoute('landing')}
              title="Page d'accueil immersive"
              className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#0A4565]/80 dark:text-[#7DDCEB]/85 hover:bg-[#16C5C0]/10 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline truncate">Univers océan</span>
            </button>

            <button
              type="button"
              onClick={resetDemoData}
              title="Réinitialiser les données de démonstration"
              className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#0A4565]/75 dark:text-[#F8FAFC]/65 hover:bg-[#16C5C0]/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline truncate">Réinitialiser démo</span>
            </button>

            <div className="hidden lg:flex items-center justify-between gap-2 pt-3 mt-2 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#16C5C0] to-[#0A4565] text-[#F8FAFC] text-xs font-mono font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.avatarInitials}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{currentUser.fullName}</div>
                  <div className="text-[11px] text-[#0A4565]/70 dark:text-[#7DDCEB]/75 truncate">
                    {ROLE_LABELS[currentUser.role]} · {currentUser.portAttache}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Déconnexion"
                className="p-2 rounded-lg text-[#0A4565]/70 dark:text-[#7DDCEB]/70 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================
          MOBILE DRAWER OVERLAY
      ============================================================ */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white/95 dark:bg-[#062439]/95 backdrop-blur-xl h-full p-5 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <BrandLogo size="md" />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Fermer le menu"
                  className="p-2 rounded-xl hover:bg-[#0A4565]/10 dark:hover:bg-[#7DDCEB]/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = route === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium cursor-pointer ${
                        isActive
                          ? 'bg-[#16C5C0] text-[#062B45] font-semibold'
                          : 'text-[#0A4565] dark:text-[#F8FAFC]/80 hover:bg-[#0A4565]/10 dark:hover:bg-[#7DDCEB]/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.id === 'notifications' && unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-[#062B45] text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="pt-4 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setRoute('landing');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#0A4565] dark:text-[#7DDCEB] hover:bg-[#0A4565]/10 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Univers océan</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MAIN FLOATING WORKSPACE AREA
      ============================================================ */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Floating Top Workspace Header */}
        <header className="no-print sticky top-3 z-20 mx-3 sm:mx-6 lg:mx-8 mt-3 h-14 px-4 sm:px-6 rounded-2xl bg-white/78 dark:bg-[#062439]/78 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18 shadow-[0_8px_28px_rgba(6,43,69,0.06)] dark:shadow-[0_10px_32px_rgba(2,18,30,0.45)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              className="md:hidden p-2 rounded-xl hover:bg-[#0A4565]/10 dark:hover:bg-[#7DDCEB]/10 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="hidden sm:inline font-semibold text-[#16C5C0]">
                Bahripay
              </span>
              <span className="hidden sm:inline text-[#0A4565]/40 dark:text-[#7DDCEB]/40">/</span>
              <span className="font-display font-semibold text-[#062B45] dark:text-[#F8FAFC] truncate">
                {activeNav.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Role Quick Switcher */}
            <select
              aria-label="Changer de rôle utilisateur"
              value={currentUser.role}
              onChange={(e) => loginAsRole(e.target.value as UserRole)}
              className="hidden sm:block text-xs font-medium px-3 py-2 rounded-xl bg-white/70 dark:bg-[#041826]/70 border border-[#0A4565]/12 dark:border-[#7DDCEB]/20 text-[#062B45] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#16C5C0] cursor-pointer"
            >
              <option value="ARMATEUR">Rôle : Armateur</option>
              <option value="CAPITAINE">Rôle : Capitaine</option>
              <option value="FINANCIER">Rôle : Financier</option>
              <option value="OBSERVATEUR">Rôle : Observateur</option>
            </select>

            {/* Floating Notification Bubble Trigger */}
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Centre de notifications"
                className="relative p-2.5 rounded-xl bg-white/70 dark:bg-[#041826]/70 hover:bg-[#16C5C0]/15 border border-[#0A4565]/10 dark:border-[#7DDCEB]/18 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#16C5C0] text-[#062B45] text-[10px] font-mono font-bold flex items-center justify-center shadow-md shadow-[#16C5C0]/40"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-[#072B44]/95 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/25 shadow-2xl p-4 z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/10">
                    <span className="font-display font-semibold text-sm">Alertes récentes</span>
                    <button
                      type="button"
                      onClick={() => handleNavigate('notifications')}
                      className="text-xs font-semibold text-[#16C5C0] hover:underline cursor-pointer"
                    >
                      Tout voir
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                    {notifications.slice(0, 4).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.targetPage) handleNavigate(n.targetPage);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors cursor-pointer ${
                          n.read
                            ? 'opacity-70 hover:bg-[#0A4565]/5 dark:hover:bg-[#7DDCEB]/10'
                            : 'bg-[#16C5C0]/12 hover:bg-[#16C5C0]/20'
                        }`}
                      >
                        <div className="text-xs font-semibold">{n.title}</div>
                        <div className="text-[11px] opacity-80 mt-0.5 line-clamp-2">{n.message}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Clair / Sombre Segmented Switch */}
            <ThemeTogglePill />
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Quick Navigation */}
        <nav
          aria-label="Navigation rapide mobile"
          className="no-print md:hidden fixed bottom-0 inset-x-0 h-14 bg-white/90 dark:bg-[#062439]/92 backdrop-blur-xl border-t border-[#0A4565]/12 dark:border-[#7DDCEB]/18 flex items-center justify-around px-2 z-30"
        >
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = route === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium cursor-pointer ${
                  active ? 'text-[#16C5C0]' : 'text-[#0A4565]/70 dark:text-[#F8FAFC]/65'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate max-w-[56px]">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
