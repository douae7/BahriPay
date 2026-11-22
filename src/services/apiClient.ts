import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AppNotification,
  ContractType,
  ExpenseCategory,
  ExpenseRecord,
  FishSpecies,
  FishingTrip,
  MonthlyPerformancePoint,
  NotificationCategory,
  PaymentRecord,
  Sailor,
  SailorAbsence,
  SailorDocument,
  SailorGrade,
  SailorStatus,
  SaleRecord,
  ShareRuleConfig,
  TripStatus,
  UserAccount,
  UserRole,
  Vessel,
  VesselStatus,
} from '../types/maritime';

const ACCESS_TOKEN_KEY = 'bahripay_jwt_token';
const REFRESH_TOKEN_KEY = 'bahripay_refresh_token';

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
};

export interface AuthResponseDTO {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number | string;
    fullName: string;
    email: string;
    role: string;
    portAttache: string;
    avatarInitials: string;
    enabled: boolean;
  };
}

export interface DashboardSummaryDTO {
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
    activeTripsCount: number;
    vesselsAtSeaCount: number;
  };
  monthlySeries: MonthlyPerformancePoint[];
  vesselProfitability: {
    vesselId: number | string;
    vesselName: string;
    registration: string;
    homePort: string;
    status: string;
    revenue: number;
    expenses: number;
    netProfit: number;
    marginPercent: number;
    tripsCount: number;
  }[];
  speciesPerformance: {
    species: string;
    totalKg: number;
    totalRevenue: number;
  }[];
}

export interface AiAnalysisDTO {
  sufficientData: boolean;
  statusMessage: string;
  historicalTripsCount: number;
  historicalSalesCount: number;
  predictedNextMonthCatchKg: number | null;
  predictedNextMonthRevenue: number | null;
  actualTotalRevenue: number;
  actualNetProfit: number;
  vesselProfitability: DashboardSummaryDTO['vesselProfitability'];
  forecastSeries: {
    month: string;
    historique: number | null;
    prevision: number | null;
    isPrediction: boolean;
  }[];
  recommendations: {
    title: string;
    detail: string;
    basedOnActualData: boolean;
  }[];
  geminiIntegrationStatus: string;
}

export interface AiAskResponseDTO {
  answer: string;
  isPrediction: boolean;
  sufficientData: boolean;
  historicalTripsCount: number;
  sourceMode: string;
  timestamp: string;
  highlights?: { label: string; value: string }[];
}

export interface PaymentSlipDTO {
  id: number | string;
  referenceNumber: string;
  paymentId: number | string;
  sailorName: string;
  sailorRegistrationNumber: string;
  periodLabel: string;
  boatSharePercentSnapshot: number;
  crewSharePercentSnapshot: number;
  expensesDeducted: boolean;
  grossTripRevenue: number;
  commonExpenses: number;
  netDistributable: number;
  crewPoolAmount: number;
  sailorWeight: number;
  totalCrewWeights: number;
  amountDue: number;
  status: 'Payé' | 'En attente';
  paidAt?: string;
  generatedAt?: string;
  issuerName?: string;
  remarks?: string;
}

interface BackendErrorPayload {
  message?: string;
  error?: string;
  validationErrors?: Record<string, string>;
}

export function extractApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<BackendErrorPayload>;
    if (!axiosErr.response) {
      return 'Serveur Spring Boot injoignable (vérifiez que le backend tourne sur port 8080).';
    }
    const data = axiosErr.response.data;
    if (data?.validationErrors) {
      const firstErr = Object.values(data.validationErrors)[0];
      if (firstErr) return firstErr;
    }
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return `Erreur serveur (${axiosErr.response.status})`;
  }
  if (err instanceof Error) return err.message;
  return 'Une erreur inattendue est survenue.';
}

export function isNetworkUnreachableError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  return !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        tokenStorage.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken) => {
            if (!newToken) return reject(error);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<AuthResponseDTO>(`${API_CONFIG.baseUrl}/auth/refresh`, {
          refreshToken,
        });
        tokenStorage.setTokens(res.data.token, res.data.refreshToken);
        pendingQueue.forEach((cb) => cb(res.data.token));
        pendingQueue = [];
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        tokenStorage.clear();
        pendingQueue.forEach((cb) => cb(null));
        pendingQueue = [];
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const tokenStorage = {
  getToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ============================================================================
// DTO -> Frontend Mappers (normalize Long IDs to string for strict UI lookups)
// ============================================================================

function normalizeRole(role: string): UserRole {
  const upper = (role || 'ARMATEUR').toUpperCase();
  if (upper === 'ADMIN' || upper === 'ARMATEUR') return 'ARMATEUR';
  if (upper === 'CAPITAINE') return 'CAPITAINE';
  if (upper === 'FINANCIER') return 'FINANCIER';
  if (upper === 'OBSERVATEUR') return 'OBSERVATEUR';
  return 'ARMATEUR';
}

export function mapBackendUser(u: AuthResponseDTO['user']): UserAccount {
  return {
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    role: normalizeRole(u.role),
    portAttache: u.portAttache || 'Concarneau',
    avatarInitials: u.avatarInitials || 'BP',
  };
}

export function mapBackendSailor(raw: any): Sailor {
  return {
    id: String(raw.id),
    registrationNumber: raw.registrationNumber,
    firstName: raw.firstName,
    lastName: raw.lastName,
    phone: raw.phone,
    email: raw.email,
    grade: (raw.grade || 'Matelot') as SailorGrade,
    shareWeight: Number(raw.shareWeight ?? 1),
    status: (raw.status || 'Actif') as SailorStatus,
    contractType: (raw.contractType || 'À la part') as ContractType,
    contractStart: raw.contractStart || new Date().toISOString().slice(0, 10),
    contractEnd: raw.contractEnd || undefined,
    vesselId: raw.vesselId != null ? String(raw.vesselId) : undefined,
    portAttache: raw.portAttache || 'Concarneau',
    yearsExperience: Number(raw.yearsExperience ?? 1),
    documents: Array.isArray(raw.documents)
      ? raw.documents.map((d: any): SailorDocument => ({
          id: String(d.id),
          name: d.name,
          status: (d.status || 'Valide') as SailorDocument['status'],
          expiryDate: d.expiryDate || undefined,
        }))
      : [],
    absences: Array.isArray(raw.absences)
      ? raw.absences.map((a: any): SailorAbsence => ({
          id: String(a.id),
          type: a.type as SailorAbsence['type'],
          startDate: a.startDate,
          endDate: a.endDate,
          days: Number(a.days ?? 1),
          note: a.note || undefined,
        }))
      : [],
  };
}

export function mapBackendVessel(raw: any): Vessel {
  return {
    id: String(raw.id),
    name: raw.name,
    registration: raw.registration,
    type: raw.type,
    capacityKg: Number(raw.capacityKg ?? 0),
    enginePowerHp: Number(raw.enginePowerHp ?? 0),
    lengthMeters: Number(raw.lengthMeters ?? 0),
    homePort: raw.homePort,
    status: (raw.status || 'Disponible') as VesselStatus,
    captainId: raw.captainId != null ? String(raw.captainId) : undefined,
    lastMaintenanceDate: raw.lastMaintenanceDate || new Date().toISOString().slice(0, 10),
    imageUrl: raw.imageUrl || '/src/assets/images/vessel_trawler_hero_1795370246302.jpg',
  };
}

export function mapBackendTrip(raw: any): FishingTrip {
  return {
    id: String(raw.id),
    code: raw.code,
    vesselId: String(raw.vesselId),
    crewIds: Array.isArray(raw.crewIds) ? raw.crewIds.map((id: any) => String(id)) : [],
    departureDate: String(raw.departureDate || '').slice(0, 16),
    returnDate: String(raw.returnDate || raw.departureDate || '').slice(0, 16),
    zone: raw.zone,
    status: (raw.status || 'Planifiée') as TripStatus,
    catches: Array.isArray(raw.catches)
      ? raw.catches.map((c: any) => ({
          id: String(c.id),
          species: c.species as FishSpecies,
          quantityKg: Number(c.quantityKg ?? 0),
          pricePerKg: Number(c.pricePerKg ?? 0),
          totalValue: Number(c.totalValue ?? 0),
        }))
      : [],
    totalCatchKg: Number(raw.totalCatchKg ?? 0),
    estimatedRevenue: Number(raw.estimatedRevenue ?? 0),
    notes: raw.notes || undefined,
  };
}

export function mapBackendSale(raw: any): SaleRecord {
  return {
    id: String(raw.id),
    tripId: raw.tripId != null ? String(raw.tripId) : '',
    vesselId: String(raw.vesselId),
    date: raw.date,
    species: raw.species as FishSpecies,
    buyer: raw.buyer,
    quantityKg: Number(raw.quantityKg ?? 0),
    pricePerKg: Number(raw.pricePerKg ?? 0),
    totalAmount: Number(raw.totalAmount ?? 0),
  };
}

export function mapBackendExpense(raw: any): ExpenseRecord {
  return {
    id: String(raw.id),
    tripId: raw.tripId != null ? String(raw.tripId) : undefined,
    vesselId: String(raw.vesselId),
    date: raw.date,
    category: raw.category as ExpenseCategory,
    description: raw.description,
    amount: Number(raw.amount ?? 0),
  };
}

export function mapBackendPayment(raw: any): PaymentRecord {
  return {
    id: String(raw.id),
    sailorId: String(raw.sailorId),
    tripId: String(raw.tripId),
    periodLabel: raw.periodLabel,
    grossTripRevenue: Number(raw.grossTripRevenue ?? 0),
    commonExpenses: Number(raw.commonExpenses ?? 0),
    netDistributable: Number(raw.netDistributable ?? 0),
    crewPoolAmount: Number(raw.crewPoolAmount ?? 0),
    sailorWeight: Number(raw.sailorWeight ?? 1),
    totalCrewWeights: Number(raw.totalCrewWeights ?? 1),
    amountDue: Number(raw.amountDue ?? 0),
    status: (raw.status || 'En attente') as PaymentRecord['status'],
    paidAt: raw.paidAt || undefined,
  };
}

export function mapBackendShareRule(raw: any): ShareRuleConfig {
  return {
    boatSharePercent: Number(raw.boatSharePercent ?? 45),
    crewSharePercent: Number(raw.crewSharePercent ?? 55),
    deductCommonExpensesBeforeSplit: Boolean(raw.deductCommonExpensesBeforeSplit),
  };
}

export function mapBackendNotification(raw: any): AppNotification {
  return {
    id: String(raw.id),
    title: raw.title,
    message: raw.message,
    category: (String(raw.category || 'ia').toLowerCase()) as NotificationCategory,
    severity: (String(raw.severity || 'info').toLowerCase() === 'urgent'
      ? 'urgent'
      : String(raw.severity || 'info').toLowerCase() === 'warning'
      ? 'warning'
      : 'info') as AppNotification['severity'],
    createdAt: raw.createdAt || 'À l’instant',
    read: Boolean(raw.read),
    targetPage: raw.targetPage || undefined,
  };
}

// ============================================================================
// Axios REST API Modules matching Spring Boot Controllers
// ============================================================================

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await axiosInstance.post<AuthResponseDTO>('/auth/login', { email, password });
    return data;
  },
  register: async (payload: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    portAttache?: string;
  }) => {
    const { data } = await axiosInstance.post<AuthResponseDTO>('/auth/register', payload);
    return data;
  },
  demoLogin: async (payload: { role: string }) => {
    const { data } = await axiosInstance.post<AuthResponseDTO>('/auth/demo-login', {
      role: payload.role,
    });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },
  logout: async () => {
    await axiosInstance.post('/auth/logout');
  },
  me: async () => {
    const { data } = await axiosInstance.get<AuthResponseDTO['user']>('/auth/me');
    return mapBackendUser(data);
  },
};

export const marinsApi = {
  list: async (params?: { search?: string; grade?: string; status?: string }) => {
    const { data } = await axiosInstance.get('/marins', { params });
    return (data as any[]).map(mapBackendSailor);
  },
  create: async (sailor: Omit<Sailor, 'id'>) => {
    const payload = {
      registrationNumber: sailor.registrationNumber,
      firstName: sailor.firstName,
      lastName: sailor.lastName,
      phone: sailor.phone,
      email: sailor.email,
      grade: sailor.grade,
      shareWeight: sailor.shareWeight,
      status: sailor.status,
      contractType: sailor.contractType,
      contractStart: sailor.contractStart,
      contractEnd: sailor.contractEnd || null,
      vesselId: sailor.vesselId && /^\d+$/.test(sailor.vesselId) ? Number(sailor.vesselId) : null,
      portAttache: sailor.portAttache,
      yearsExperience: sailor.yearsExperience,
    };
    const { data } = await axiosInstance.post('/marins', payload);
    return mapBackendSailor(data);
  },
  update: async (sailor: Sailor) => {
    const payload = {
      registrationNumber: sailor.registrationNumber,
      firstName: sailor.firstName,
      lastName: sailor.lastName,
      phone: sailor.phone,
      email: sailor.email,
      grade: sailor.grade,
      shareWeight: sailor.shareWeight,
      status: sailor.status,
      contractType: sailor.contractType,
      contractStart: sailor.contractStart,
      contractEnd: sailor.contractEnd || null,
      vesselId: sailor.vesselId && /^\d+$/.test(sailor.vesselId) ? Number(sailor.vesselId) : null,
      portAttache: sailor.portAttache,
      yearsExperience: sailor.yearsExperience,
    };
    const { data } = await axiosInstance.put(`/marins/${sailor.id}`, payload);
    return mapBackendSailor(data);
  },
  delete: async (id: string) => {
    await axiosInstance.delete(`/marins/${id}`);
  },
  createAbsence: async (sailorId: string, absence: Omit<SailorAbsence, 'id'>) => {
    const { data } = await axiosInstance.post('/absences', {
      marinId: Number(sailorId),
      type: absence.type,
      startDate: absence.startDate,
      endDate: absence.endDate,
      days: absence.days,
      note: absence.note || null,
    });
    return {
      id: String(data.id),
      type: data.type as SailorAbsence['type'],
      startDate: data.startDate,
      endDate: data.endDate,
      days: Number(data.days),
      note: data.note || undefined,
    };
  },
  updateDocumentStatus: async (docId: string, status: SailorDocument['status']) => {
    const { data } = await axiosInstance.patch(`/documents/${docId}/status`, { status });
    return {
      id: String(data.id),
      name: data.name as string,
      status: data.status as SailorDocument['status'],
      expiryDate: data.expiryDate || undefined,
    };
  },
  uploadDocument: async (sailorId: string, file: File, name?: string, expiryDate?: string) => {
    const form = new FormData();
    form.append('marinId', sailorId);
    if (name) form.append('name', name);
    if (expiryDate) form.append('expiryDate', expiryDate);
    form.append('file', file);
    const { data } = await axiosInstance.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const flotteApi = {
  listVessels: async () => {
    const { data } = await axiosInstance.get('/bateaux');
    return (data as any[]).map(mapBackendVessel);
  },
  createVessel: async (vessel: Omit<Vessel, 'id'>) => {
    const payload = {
      name: vessel.name,
      registration: vessel.registration,
      type: vessel.type,
      capacityKg: vessel.capacityKg,
      enginePowerHp: vessel.enginePowerHp,
      lengthMeters: vessel.lengthMeters,
      homePort: vessel.homePort,
      status: vessel.status,
      captainId: vessel.captainId && /^\d+$/.test(vessel.captainId) ? Number(vessel.captainId) : null,
      lastMaintenanceDate: vessel.lastMaintenanceDate,
      imageUrl: vessel.imageUrl || null,
    };
    const { data } = await axiosInstance.post('/bateaux', payload);
    return mapBackendVessel(data);
  },
  updateVessel: async (vessel: Vessel) => {
    const payload = {
      name: vessel.name,
      registration: vessel.registration,
      type: vessel.type,
      capacityKg: vessel.capacityKg,
      enginePowerHp: vessel.enginePowerHp,
      lengthMeters: vessel.lengthMeters,
      homePort: vessel.homePort,
      status: vessel.status,
      captainId: vessel.captainId && /^\d+$/.test(vessel.captainId) ? Number(vessel.captainId) : null,
      lastMaintenanceDate: vessel.lastMaintenanceDate,
      imageUrl: vessel.imageUrl || null,
    };
    const { data } = await axiosInstance.put(`/bateaux/${vessel.id}`, payload);
    return mapBackendVessel(data);
  },
  listTrips: async (status?: string) => {
    const { data } = await axiosInstance.get('/sorties', {
      params: status && status !== 'ALL' ? { status } : undefined,
    });
    return (data as any[]).map(mapBackendTrip);
  },
  createTrip: async (trip: Omit<FishingTrip, 'id' | 'code'>) => {
    const normalizeDateTime = (val: string) =>
      val && val.length === 16 ? `${val}:00` : val;

    const payload = {
      vesselId: Number(trip.vesselId),
      crewIds: trip.crewIds.filter((id) => /^\d+$/.test(id)).map((id) => Number(id)),
      departureDate: normalizeDateTime(trip.departureDate),
      returnDate: trip.returnDate ? normalizeDateTime(trip.returnDate) : null,
      zone: trip.zone,
      status: trip.status,
      catches: trip.catches.map((c) => ({
        species: c.species,
        quantityKg: c.quantityKg,
        pricePerKg: c.pricePerKg,
      })),
      notes: trip.notes || null,
    };
    const { data } = await axiosInstance.post('/sorties', payload);
    return mapBackendTrip(data);
  },
  updateTripStatus: async (tripId: string, status: TripStatus) => {
    const { data } = await axiosInstance.patch(`/sorties/${tripId}/status`, { status });
    return mapBackendTrip(data);
  },
};

export const financesApi = {
  listSales: async () => {
    const { data } = await axiosInstance.get('/ventes');
    return (data as any[]).map(mapBackendSale);
  },
  createSale: async (sale: Omit<SaleRecord, 'id' | 'totalAmount'>) => {
    const payload = {
      tripId: sale.tripId && /^\d+$/.test(sale.tripId) ? Number(sale.tripId) : null,
      vesselId: Number(sale.vesselId),
      date: sale.date,
      species: sale.species,
      buyer: sale.buyer,
      quantityKg: sale.quantityKg,
      pricePerKg: sale.pricePerKg,
    };
    const { data } = await axiosInstance.post('/ventes', payload);
    return mapBackendSale(data);
  },
  listExpenses: async () => {
    const { data } = await axiosInstance.get('/depenses');
    return (data as any[]).map(mapBackendExpense);
  },
  createExpense: async (expense: Omit<ExpenseRecord, 'id'>) => {
    const payload = {
      tripId: expense.tripId && /^\d+$/.test(expense.tripId) ? Number(expense.tripId) : null,
      vesselId: Number(expense.vesselId),
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
    };
    const { data } = await axiosInstance.post('/depenses', payload);
    return mapBackendExpense(data);
  },
  getShareRule: async () => {
    const { data } = await axiosInstance.get('/paiements/regle-repartition');
    return mapBackendShareRule(data);
  },
  updateShareRule: async (rule: ShareRuleConfig) => {
    const { data } = await axiosInstance.put('/paiements/regle-repartition', {
      ruleName: 'Règle Armement Active',
      boatSharePercent: rule.boatSharePercent,
      crewSharePercent: rule.crewSharePercent,
      deductCommonExpensesBeforeSplit: rule.deductCommonExpensesBeforeSplit,
    });
    return mapBackendShareRule(data);
  },
  listPayments: async () => {
    const { data } = await axiosInstance.get('/paiements');
    return (data as any[]).map(mapBackendPayment);
  },
  generateTripPayments: async (tripId: string) => {
    const { data } = await axiosInstance.post(`/paiements/generer/${tripId}`);
    return (data as any[]).map(mapBackendPayment);
  },
  markPaymentPaid: async (paymentId: string) => {
    const { data } = await axiosInstance.patch(`/paiements/${paymentId}/payer`);
    return mapBackendPayment(data);
  },
  getPaymentSlip: async (paymentId: string) => {
    const { data } = await axiosInstance.get<PaymentSlipDTO>(`/paiements/${paymentId}/fiche`);
    return data;
  },
};

export const dashboardApi = {
  getSummary: async () => {
    const { data } = await axiosInstance.get<DashboardSummaryDTO>('/dashboard/summary');
    return data;
  },
};

export const notificationsApi = {
  list: async () => {
    const { data } = await axiosInstance.get('/notifications');
    return (data as any[]).map(mapBackendNotification);
  },
  markRead: async (id: string) => {
    const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
    return mapBackendNotification(data);
  },
  markAllRead: async () => {
    const { data } = await axiosInstance.patch('/notifications/read-all');
    return (data as any[]).map(mapBackendNotification);
  },
};

export const aiApi = {
  analyse: async () => {
    const { data } = await axiosInstance.get<AiAnalysisDTO>('/ai/analyse');
    return data;
  },
  ask: async (question: string) => {
    const { data } = await axiosInstance.post<AiAskResponseDTO>('/ai/ask', { question });
    return data;
  },
  history: async () => {
    const { data } = await axiosInstance.get('/ai/history');
    return data;
  },
};
