import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  DEMO_USERS,
  HISTORICAL_MONTHLY_SERIES,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_SAILORS,
  INITIAL_SALES,
  INITIAL_SHARE_RULE,
  INITIAL_TRIPS,
  INITIAL_VESSELS,
} from '../data/demoData';
import {
  AppNotification,
  AppRoute,
  ExpenseRecord,
  FishingTrip,
  MonthlyPerformancePoint,
  PaymentRecord,
  Sailor,
  SailorAbsence,
  SailorDocument,
  SaleRecord,
  ShareRuleConfig,
  UserAccount,
  UserRole,
  Vessel,
} from '../types/maritime';

interface MaritimeContextValue {
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
  currentUser: UserAccount;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole, customEmail?: string, customName?: string) => void;
  logout: () => void;

  sailors: Sailor[];
  addSailor: (sailor: Omit<Sailor, 'id'>) => void;
  updateSailor: (sailor: Sailor) => void;
  deleteSailor: (id: string) => void;
  addSailorAbsence: (sailorId: string, absence: Omit<SailorAbsence, 'id'>) => void;
  updateSailorDocStatus: (sailorId: string, docId: string, status: SailorDocument['status']) => void;

  vessels: Vessel[];
  addVessel: (vessel: Omit<Vessel, 'id'>) => void;
  updateVessel: (vessel: Vessel) => void;

  trips: FishingTrip[];
  addTrip: (trip: Omit<FishingTrip, 'id' | 'code'>) => void;
  updateTripStatus: (tripId: string, status: FishingTrip['status']) => void;

  sales: SaleRecord[];
  addSale: (sale: Omit<SaleRecord, 'id' | 'totalAmount'>) => void;

  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;

  shareRule: ShareRuleConfig;
  setShareRule: (rule: ShareRuleConfig) => void;

  payments: PaymentRecord[];
  markPaymentPaid: (paymentId: string) => void;
  generateTripPayments: (tripId: string) => void;

  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  kpis: {
    totalSailors: number;
    totalVessels: number;
    totalTrips: number;
    totalCatchKg: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPaymentsAmount: number;
    pendingPaymentsCount: number;
  };
  monthlySeries: MonthlyPerformancePoint[];
  resetDemoData: () => void;
}

const MaritimeContext = createContext<MaritimeContextValue | undefined>(undefined);

export const MaritimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEMO_USERS.ARMATEUR);

  const [sailors, setSailors] = useState<Sailor[]>(INITIAL_SAILORS);
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [trips, setTrips] = useState<FishingTrip[]>(INITIAL_TRIPS);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [shareRule, setShareRule] = useState<ShareRuleConfig>(INITIAL_SHARE_RULE);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const loginAsRole = (role: UserRole, customEmail?: string, customName?: string) => {
    const base = DEMO_USERS[role];
    setCurrentUser({
      ...base,
      email: customEmail || base.email,
      fullName: customName || base.fullName,
      avatarInitials: customName
        ? customName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : base.avatarInitials,
    });
    setIsAuthenticated(true);
    setRoute('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRoute('landing');
  };

  const addSailor = (sailorData: Omit<Sailor, 'id'>) => {
    const newSailor: Sailor = {
      ...sailorData,
      id: `sai-${Date.now()}`,
    };
    setSailors((prev) => [newSailor, ...prev]);
  };

  const updateSailor = (updated: Sailor) => {
    setSailors((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSailor = (id: string) => {
    setSailors((prev) => prev.filter((s) => s.id !== id));
  };

  const addSailorAbsence = (sailorId: string, absence: Omit<SailorAbsence, 'id'>) => {
    setSailors((prev) =>
      prev.map((s) =>
        s.id === sailorId
          ? { ...s, absences: [{ ...absence, id: `abs-${Date.now()}` }, ...s.absences] }
          : s
      )
    );
  };

  const updateSailorDocStatus = (
    sailorId: string,
    docId: string,
    status: SailorDocument['status']
  ) => {
    setSailors((prev) =>
      prev.map((s) =>
        s.id === sailorId
          ? {
              ...s,
              documents: s.documents.map((d) => (d.id === docId ? { ...d, status } : d)),
            }
          : s
      )
    );
  };

  const addVessel = (vesselData: Omit<Vessel, 'id'>) => {
    const newVessel: Vessel = {
      ...vesselData,
      id: `ves-${Date.now()}`,
      imageUrl: '/src/assets/images/vessel_trawler_hero_1795370246302.jpg',
    };
    setVessels((prev) => [newVessel, ...prev]);
  };

  const updateVessel = (updated: Vessel) => {
    setVessels((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const addTrip = (tripData: Omit<FishingTrip, 'id' | 'code'>) => {
    const nextNum = 114 + trips.length;
    const newTripId = `trp-${Date.now()}`;
    const newTrip: FishingTrip = {
      ...tripData,
      id: newTripId,
      code: `MAR-2026-${nextNum}`,
    };
    setTrips((prev) => [newTrip, ...prev]);

    // Auto-create sales entries if catches exist and trip is completed
    if (tripData.status === 'Terminée' && tripData.catches.length > 0) {
      const autoSales: SaleRecord[] = tripData.catches.map((c, idx) => ({
        id: `sal-${Date.now()}-${idx}`,
        tripId: newTripId,
        vesselId: tripData.vesselId,
        date: tripData.returnDate.slice(0, 10),
        species: c.species,
        buyer: 'Criée portuaire directe',
        quantityKg: c.quantityKg,
        pricePerKg: c.pricePerKg,
        totalAmount: c.totalValue,
      }));
      setSales((prev) => [...autoSales, ...prev]);
    }

    const vessel = vessels.find((v) => v.id === tripData.vesselId);
    setNotifications((prev) => [
      {
        id: `not-${Date.now()}`,
        title: `Nouvelle sortie ${newTrip.code} enregistrée`,
        message: `${vessel?.name || 'Navire'} — ${tripData.totalCatchKg.toLocaleString('fr-FR')} kg déclarés (${tripData.estimatedRevenue.toLocaleString('fr-FR')} €).`,
        category: 'sortie',
        severity: 'info',
        createdAt: 'À l’instant',
        read: false,
        targetPage: 'fleet',
      },
      ...prev,
    ]);
  };

  const updateTripStatus = (tripId: string, status: FishingTrip['status']) => {
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status } : t)));
  };

  const addSale = (saleData: Omit<SaleRecord, 'id' | 'totalAmount'>) => {
    const totalAmount = Math.round(saleData.quantityKg * saleData.pricePerKg * 100) / 100;
    const newSale: SaleRecord = {
      ...saleData,
      id: `sal-${Date.now()}`,
      totalAmount,
    };
    setSales((prev) => [newSale, ...prev]);
  };

  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const markPaymentPaid = (paymentId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'Payé', paidAt: today } : p))
    );
  };

  const generateTripPayments = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    // Avoid duplicates for the same trip
    const alreadyExists = payments.some((p) => p.tripId === tripId);
    if (alreadyExists) return;

    const tripSales = sales
      .filter((s) => s.tripId === tripId)
      .reduce((acc, s) => acc + s.totalAmount, 0);
    const grossRevenue = tripSales > 0 ? tripSales : trip.estimatedRevenue;
    const tripExpenses = expenses
      .filter((e) => e.tripId === tripId)
      .reduce((acc, e) => acc + e.amount, 0);

    const netDistributable = shareRule.deductCommonExpensesBeforeSplit
      ? Math.max(0, grossRevenue - tripExpenses)
      : grossRevenue;

    const crewPool = netDistributable * (shareRule.crewSharePercent / 100);
    const crewMembers = sailors.filter((s) => trip.crewIds.includes(s.id));
    const totalWeights = crewMembers.reduce((sum, m) => sum + m.shareWeight, 0) || 1;

    const created: PaymentRecord[] = crewMembers.map((member, idx) => ({
      id: `pay-${Date.now()}-${idx}`,
      sailorId: member.id,
      tripId: trip.id,
      periodLabel: `Marée ${trip.code}`,
      grossTripRevenue: grossRevenue,
      commonExpenses: tripExpenses,
      netDistributable,
      crewPoolAmount: Math.round(crewPool * 100) / 100,
      sailorWeight: member.shareWeight,
      totalCrewWeights: totalWeights,
      amountDue: Math.round((crewPool * (member.shareWeight / totalWeights)) * 100) / 100,
      status: 'En attente',
    }));

    setPayments((prev) => [...created, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    setSailors(INITIAL_SAILORS);
    setVessels(INITIAL_VESSELS);
    setTrips(INITIAL_TRIPS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setShareRule(INITIAL_SHARE_RULE);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const kpis = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalCatchKg = trips.reduce((acc, t) => acc + t.totalCatchKg, 0);
    const pendingPayments = payments.filter((p) => p.status === 'En attente');
    const pendingPaymentsAmount = pendingPayments.reduce((acc, p) => acc + p.amountDue, 0);

    return {
      totalSailors: sailors.length,
      totalVessels: vessels.length,
      totalTrips: trips.length,
      totalCatchKg,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingPaymentsAmount,
      pendingPaymentsCount: pendingPayments.length,
    };
  }, [sailors, vessels, trips, sales, expenses, payments]);

  const monthlySeries = useMemo<MonthlyPerformancePoint[]>(() => {
    const currentMonth: MonthlyPerformancePoint = {
      month: 'Nov',
      recettes: Math.round(kpis.totalRevenue),
      depenses: Math.round(kpis.totalExpenses),
      benefice: Math.round(kpis.netProfit),
      captureKg: Math.round(kpis.totalCatchKg),
    };
    return [...HISTORICAL_MONTHLY_SERIES, currentMonth];
  }, [kpis]);

  return (
    <MaritimeContext.Provider
      value={{
        route,
        setRoute,
        currentUser,
        isAuthenticated,
        loginAsRole,
        logout,
        sailors,
        addSailor,
        updateSailor,
        deleteSailor,
        addSailorAbsence,
        updateSailorDocStatus,
        vessels,
        addVessel,
        updateVessel,
        trips,
        addTrip,
        updateTripStatus,
        sales,
        addSale,
        expenses,
        addExpense,
        shareRule,
        setShareRule,
        payments,
        markPaymentPaid,
        generateTripPayments,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        kpis,
        monthlySeries,
        resetDemoData,
      }}
    >
      {children}
    </MaritimeContext.Provider>
  );
};

export function useMaritime(): MaritimeContextValue {
  const ctx = useContext(MaritimeContext);
  if (!ctx) {
    throw new Error('useMaritime doit être utilisé dans un MaritimeProvider');
  }
  return ctx;
};
