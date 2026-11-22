import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  authApi,
  dashboardApi,
  DashboardSummaryDTO,
  extractApiErrorMessage,
  financesApi,
  flotteApi,
  isNetworkUnreachableError,
  mapBackendUser,
  marinsApi,
  notificationsApi,
  tokenStorage,
} from '../services/apiClient';
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
  backendConnected: boolean;
  isLoading: boolean;
  apiError: string | null;
  apiSuccess: string | null;
  clearApiFeedback: () => void;

  loginWithCredentials: (email: string, password: string, fallbackRole?: UserRole) => Promise<void>;
  registerAccount: (fullName: string, email: string, password: string, role: UserRole) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  loginAsRole: (role: UserRole, customEmail?: string, customName?: string) => void;
  logout: () => void;
  refreshWorkspaceData: () => Promise<void>;

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
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEMO_USERS.ARMATEUR);

  const [sailors, setSailors] = useState<Sailor[]>(INITIAL_SAILORS);
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [trips, setTrips] = useState<FishingTrip[]>(INITIAL_TRIPS);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [shareRule, setShareRuleState] = useState<ShareRuleConfig>(INITIAL_SHARE_RULE);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryDTO | null>(null);

  const shareRuleTimerRef = useRef<number | null>(null);

  const clearApiFeedback = useCallback(() => {
    setApiError(null);
    setApiSuccess(null);
  }, []);

  const showSuccess = useCallback((msg: string) => {
    setApiError(null);
    setApiSuccess(msg);
    window.setTimeout(() => {
      setApiSuccess((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  const refreshWorkspaceData = useCallback(async () => {
    if (!tokenStorage.getToken()) return;
    setIsLoading(true);
    try {
      const [
        sailorsRes,
        vesselsRes,
        tripsRes,
        salesRes,
        expensesRes,
        ruleRes,
        paymentsRes,
        notifsRes,
        summaryRes,
      ] = await Promise.all([
        marinsApi.list(),
        flotteApi.listVessels(),
        flotteApi.listTrips(),
        financesApi.listSales(),
        financesApi.listExpenses(),
        financesApi.getShareRule(),
        financesApi.listPayments(),
        notificationsApi.list(),
        dashboardApi.getSummary(),
      ]);

      setSailors(sailorsRes);
      setVessels(vesselsRes);
      setTrips(tripsRes);
      setSales(salesRes);
      setExpenses(expensesRes);
      setShareRuleState(ruleRes);
      setPayments(paymentsRes);
      setNotifications(notifsRes);
      setDashboardSummary(summaryRes);
      setBackendConnected(true);
      setApiError(null);
    } catch (err) {
      if (isNetworkUnreachableError(err)) {
        setBackendConnected(false);
      } else {
        setApiError(extractApiErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore active JWT session on mount if token exists
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const user = await authApi.me();
        if (!active) return;
        setCurrentUser(user);
        setIsAuthenticated(true);
        await refreshWorkspaceData();
      } catch {
        tokenStorage.clear();
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshWorkspaceData]);

  const loginWithCredentials = async (email: string, password: string, fallbackRole: UserRole = 'ARMATEUR') => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await authApi.login(email, password);
      tokenStorage.setTokens(res.token, res.refreshToken);
      setCurrentUser(mapBackendUser(res.user));
      setIsAuthenticated(true);
      setBackendConnected(true);
      await refreshWorkspaceData();
      setRoute('dashboard');
    } catch (err) {
      if (isNetworkUnreachableError(err)) {
        // Backend Spring Boot non démarré dans cet environnement : bascule gracieuse en aperçu local tout en signalant l'état
        const base = DEMO_USERS[fallbackRole];
        setCurrentUser({ ...base, email: email || base.email });
        setIsAuthenticated(true);
        setBackendConnected(false);
        setApiError('API Spring Boot non détectée sur localhost:8080 — session ouverte en mode aperçu local.');
        setRoute('dashboard');
        return;
      }
      const message = extractApiErrorMessage(err);
      setApiError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerAccount = async (fullName: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await authApi.register({ fullName, email, password, role });
      tokenStorage.setTokens(res.token, res.refreshToken);
      setCurrentUser(mapBackendUser(res.user));
      setIsAuthenticated(true);
      setBackendConnected(true);
      await refreshWorkspaceData();
      setRoute('dashboard');
      showSuccess('Compte créé et enregistré dans MySQL.');
    } catch (err) {
      if (isNetworkUnreachableError(err)) {
        const base = DEMO_USERS[role];
        setCurrentUser({
          ...base,
          fullName,
          email,
          avatarInitials: fullName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        });
        setIsAuthenticated(true);
        setBackendConnected(false);
        setApiError('API Spring Boot non détectée sur localhost:8080 — compte simulé localement.');
        setRoute('dashboard');
        return;
      }
      const message = extractApiErrorMessage(err);
      setApiError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<string> => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await authApi.forgotPassword(email);
      return res.message;
    } catch (err) {
      if (isNetworkUnreachableError(err)) {
        return `Un lien de réinitialisation sécurisé vient d’être préparé pour ${email} (mode aperçu hors-ligne).`;
      }
      const message = extractApiErrorMessage(err);
      setApiError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsRole = (role: UserRole, customEmail?: string, customName?: string) => {
    const base = DEMO_USERS[role];
    const applyLocalFallback = () => {
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

    void (async () => {
      setIsLoading(true);
      try {
        const res = await authApi.demoLogin({ role });
        tokenStorage.setTokens(res.token, res.refreshToken);
        setCurrentUser(mapBackendUser(res.user));
        setIsAuthenticated(true);
        setBackendConnected(true);
        await refreshWorkspaceData();
        setRoute('dashboard');
      } catch {
        setBackendConnected(false);
        applyLocalFallback();
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const logout = () => {
    const token = tokenStorage.getToken();
    if (token) {
      void authApi.logout().catch(() => {});
    }
    tokenStorage.clear();
    setBackendConnected(false);
    setIsAuthenticated(false);
    setDashboardSummary(null);
    setApiError(null);
    setApiSuccess(null);
    setRoute('landing');
  };

  const syncDashboardSummary = useCallback(async () => {
    if (!tokenStorage.getToken()) return;
    try {
      const summary = await dashboardApi.getSummary();
      setDashboardSummary(summary);
    } catch {
      // Fallback to computed local summary when unreachable
    }
  }, []);

  const addSailor = (sailorData: Omit<Sailor, 'id'>) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const created = await marinsApi.create(sailorData);
          setSailors((prev) => [created, ...prev]);
          await syncDashboardSummary();
          showSuccess(`Marin ${created.firstName} ${created.lastName} enregistré en base MySQL.`);
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const newSailor: Sailor = {
      ...sailorData,
      id: `sai-${Date.now()}`,
    };
    setSailors((prev) => [newSailor, ...prev]);
  };

  const updateSailor = (updated: Sailor) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const saved = await marinsApi.update(updated);
          setSailors((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
          showSuccess(`Fiche de ${saved.firstName} ${saved.lastName} mise à jour.`);
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    setSailors((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSailor = (id: string) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          await marinsApi.delete(id);
          setSailors((prev) => prev.filter((s) => s.id !== id));
          await syncDashboardSummary();
          showSuccess('Marin supprimé de la base de données.');
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    setSailors((prev) => prev.filter((s) => s.id !== id));
  };

  const addSailorAbsence = (sailorId: string, absence: Omit<SailorAbsence, 'id'>) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const created = await marinsApi.createAbsence(sailorId, absence);
          setSailors((prev) =>
            prev.map((s) =>
              s.id === sailorId ? { ...s, absences: [created, ...s.absences] } : s
            )
          );
          showSuccess('Absence enregistrée.');
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

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
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        try {
          const updatedDoc = await marinsApi.updateDocumentStatus(docId, status);
          setSailors((prev) =>
            prev.map((s) =>
              s.id === sailorId
                ? {
                    ...s,
                    documents: s.documents.map((d) =>
                      d.id === docId ? { ...d, status: updatedDoc.status } : d
                    ),
                  }
                : s
            )
          );
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        }
      })();
      return;
    }

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
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const created = await flotteApi.createVessel({
            ...vesselData,
            imageUrl: '/src/assets/images/vessel_trawler_hero_1795370246302.jpg',
          });
          setVessels((prev) => [created, ...prev]);
          await syncDashboardSummary();
          showSuccess(`Navire ${created.name} ajouté à la flotte.`);
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const newVessel: Vessel = {
      ...vesselData,
      id: `ves-${Date.now()}`,
      imageUrl: '/src/assets/images/vessel_trawler_hero_1795370246302.jpg',
    };
    setVessels((prev) => [newVessel, ...prev]);
  };

  const updateVessel = (updated: Vessel) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        try {
          const saved = await flotteApi.updateVessel(updated);
          setVessels((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
          await syncDashboardSummary();
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        }
      })();
      return;
    }

    setVessels((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const addTrip = (tripData: Omit<FishingTrip, 'id' | 'code'>) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          await flotteApi.createTrip(tripData);
          await refreshWorkspaceData();
          showSuccess('Sortie de pêche enregistrée et synchronisée.');
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const nextNum = 114 + trips.length;
    const newTripId = `trp-${Date.now()}`;
    const newTrip: FishingTrip = {
      ...tripData,
      id: newTripId,
      code: `MAR-2026-${nextNum}`,
    };
    setTrips((prev) => [newTrip, ...prev]);

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
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        try {
          const updated = await flotteApi.updateTripStatus(tripId, status);
          setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
          await syncDashboardSummary();
          showSuccess(`Statut de la sortie ${updated.code} mis à jour.`);
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        }
      })();
      return;
    }

    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status } : t)));
  };

  const addSale = (saleData: Omit<SaleRecord, 'id' | 'totalAmount'>) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const created = await financesApi.createSale(saleData);
          setSales((prev) => [created, ...prev]);
          await syncDashboardSummary();
          showSuccess('Vente enregistrée en base MySQL.');
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const totalAmount = Math.round(saleData.quantityKg * saleData.pricePerKg * 100) / 100;
    const newSale: SaleRecord = {
      ...saleData,
      id: `sal-${Date.now()}`,
      totalAmount,
    };
    setSales((prev) => [newSale, ...prev]);
  };

  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const created = await financesApi.createExpense(expenseData);
          setExpenses((prev) => [created, ...prev]);
          await syncDashboardSummary();
          showSuccess('Dépense enregistrée en base MySQL.');
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const setShareRule = (rule: ShareRuleConfig) => {
    setShareRuleState(rule);
    if (backendConnected && tokenStorage.getToken()) {
      if (shareRuleTimerRef.current) {
        window.clearTimeout(shareRuleTimerRef.current);
      }
      shareRuleTimerRef.current = window.setTimeout(() => {
        if (Math.round(rule.boatSharePercent + rule.crewSharePercent) !== 100) return;
        void (async () => {
          try {
            const saved = await financesApi.updateShareRule(rule);
            setShareRuleState(saved);
            showSuccess('Règle de répartition sauvegardée en base MySQL.');
          } catch (err) {
            setApiError(extractApiErrorMessage(err));
          }
        })();
      }, 350);
    }
  };

  const markPaymentPaid = (paymentId: string) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const updated = await financesApi.markPaymentPaid(paymentId);
          setPayments((prev) => prev.map((p) => (p.id === paymentId ? updated : p)));
          await syncDashboardSummary();
          showSuccess('Paiement validé et marqué comme réglé.');
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'Payé', paidAt: today } : p))
    );
  };

  const generateTripPayments = (tripId: string) => {
    if (backendConnected && tokenStorage.getToken()) {
      void (async () => {
        setIsLoading(true);
        try {
          const createdList = await financesApi.generateTripPayments(tripId);
          setPayments((prev) => [...createdList, ...prev]);
          await syncDashboardSummary();
          showSuccess(`${createdList.length} fiches de paie générées depuis la règle MySQL.`);
        } catch (err) {
          setApiError(extractApiErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
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
    if (backendConnected && tokenStorage.getToken()) {
      void notificationsApi.markRead(id).catch(() => {});
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    if (backendConnected && tokenStorage.getToken()) {
      void notificationsApi.markAllRead().catch(() => {});
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    if (backendConnected && tokenStorage.getToken()) {
      void refreshWorkspaceData();
      showSuccess('Données actualisées depuis le backend Spring Boot.');
      return;
    }
    setSailors(INITIAL_SAILORS);
    setVessels(INITIAL_VESSELS);
    setTrips(INITIAL_TRIPS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setShareRuleState(INITIAL_SHARE_RULE);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const kpis = useMemo(() => {
    if (backendConnected && dashboardSummary?.kpis) {
      return {
        totalSailors: dashboardSummary.kpis.totalSailors,
        totalVessels: dashboardSummary.kpis.totalVessels,
        totalTrips: dashboardSummary.kpis.totalTrips,
        totalCatchKg: Number(dashboardSummary.kpis.totalCatchKg),
        totalRevenue: Number(dashboardSummary.kpis.totalRevenue),
        totalExpenses: Number(dashboardSummary.kpis.totalExpenses),
        netProfit: Number(dashboardSummary.kpis.netProfit),
        pendingPaymentsAmount: Number(dashboardSummary.kpis.pendingPaymentsAmount),
        pendingPaymentsCount: dashboardSummary.kpis.pendingPaymentsCount,
      };
    }

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
  }, [backendConnected, dashboardSummary, sailors, vessels, trips, sales, expenses, payments]);

  const monthlySeries = useMemo<MonthlyPerformancePoint[]>(() => {
    if (backendConnected && dashboardSummary?.monthlySeries?.length) {
      return dashboardSummary.monthlySeries.map((pt) => ({
        month: pt.month,
        recettes: Number(pt.recettes),
        depenses: Number(pt.depenses),
        benefice: Number(pt.benefice),
        captureKg: Number(pt.captureKg),
      }));
    }

    const currentMonth: MonthlyPerformancePoint = {
      month: 'Nov',
      recettes: Math.round(kpis.totalRevenue),
      depenses: Math.round(kpis.totalExpenses),
      benefice: Math.round(kpis.netProfit),
      captureKg: Math.round(kpis.totalCatchKg),
    };
    return [...HISTORICAL_MONTHLY_SERIES, currentMonth];
  }, [backendConnected, dashboardSummary, kpis]);

  return (
    <MaritimeContext.Provider
      value={{
        route,
        setRoute,
        currentUser,
        isAuthenticated,
        backendConnected,
        isLoading,
        apiError,
        apiSuccess,
        clearApiFeedback,
        loginWithCredentials,
        registerAccount,
        requestPasswordReset,
        loginAsRole,
        logout,
        refreshWorkspaceData,
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
}
