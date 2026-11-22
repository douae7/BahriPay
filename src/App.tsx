/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { MaritimeProvider, useMaritime } from './context/MaritimeContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPages } from './components/auth/AuthPages';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { SailorsView } from './components/sailors/SailorsView';
import { FleetAndTripsView } from './components/fleet/FleetAndTripsView';
import { FinancesView } from './components/finances/FinancesView';
import { OceanAIView } from './components/ai/OceanAIView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';

const MaritimeRouter: React.FC = () => {
  const { route } = useMaritime();

  if (route === 'landing') {
    return <LandingPage />;
  }

  if (route === 'auth') {
    return <AuthPages />;
  }

  const renderWorkspacePage = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardView />;
      case 'sailors':
        return <SailorsView />;
      case 'fleet':
        return <FleetAndTripsView />;
      case 'finances':
        return <FinancesView />;
      case 'ocean-ai':
        return <OceanAIView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderWorkspacePage()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MaritimeProvider>
        <MaritimeRouter />
      </MaritimeProvider>
    </ThemeProvider>
  );
}
