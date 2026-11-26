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

const ACCESS_TOKEN_KEY = 'bahripay_auth_token';
const REFRESH_TOKEN_KEY = 'bahripay_refresh_token';

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
};

// ============================================================================
// Bidirectional Enum & Label Mappers (keeps full compatibility with backend)
// ============================================================================

const GRADE_TO_EN: Record<string, SailorGrade> = {
  Capitaine: 'Captain',
  Second: 'First Mate',
  Mécanicien: 'Engineer',
  Matelot: 'Deckhand',
  Mousse: 'Apprentice',
  Captain: 'Captain',
  'First Mate': 'First Mate',
  Engineer: 'Engineer',
  Deckhand: 'Deckhand',
  Apprentice: 'Apprentice',
};
const GRADE_TO_BE: Record<SailorGrade, string> = {
  Captain: 'Capitaine',
  'First Mate': 'Second',
  Engineer: 'Mécanicien',
  Deckhand: 'Matelot',
  Apprentice: 'Mousse',
};

const SAILOR_STATUS_TO_EN: Record<string, SailorStatus> = {
  Actif: 'Active',
  'En mer': 'At Sea',
  'En congé': 'On Leave',
  Repos: 'Rest',
  Active: 'Active',
  'At Sea': 'At Sea',
  'On Leave': 'On Leave',
  Rest: 'Rest',
};
const SAILOR_STATUS_TO_BE: Record<SailorStatus, string> = {
  Active: 'Actif',
  'At Sea': 'En mer',
  'On Leave': 'En congé',
  Rest: 'Repos',
};

const CONTRACT_TO_EN: Record<string, ContractType> = {
  'À la part': 'Share Contract',
  'CDI Maritime': 'Permanent Maritime',
  'CDD Saisonnier': 'Seasonal Fixed-Term',
  'Share Contract': 'Share Contract',
  'Permanent Maritime': 'Permanent Maritime',
  'Seasonal Fixed-Term': 'Seasonal Fixed-Term',
};
const CONTRACT_TO_BE: Record<ContractType, string> = {
  'Share Contract': 'À la part',
  'Permanent Maritime': 'CDI Maritime',
  'Seasonal Fixed-Term': 'CDD Saisonnier',
};

const DOC_STATUS_TO_EN: Record<string, SailorDocument['status']> = {
  Valide: 'Valid',
  Manquant: 'Missing',
  'À renouveler': 'Renewal Due',
  Valid: 'Valid',
  Missing: 'Missing',
  'Renewal Due': 'Renewal Due',
};
const DOC_STATUS_TO_BE: Record<SailorDocument['status'], string> = {
  Valid: 'Valide',
  Missing: 'Manquant',
  'Renewal Due': 'À renouveler',
};

const ABSENCE_TO_EN: Record<string, SailorAbsence['type']> = {
  'Congé payé': 'Paid Leave',
  'Repos compensateur': 'Compensatory Rest',
  Maladie: 'Medical Leave',
  'Formation STCW': 'STCW Training',
  'Paid Leave': 'Paid Leave',
  'Compensatory Rest': 'Compensatory Rest',
  'Medical Leave': 'Medical Leave',
  'STCW Training': 'STCW Training',
};
const ABSENCE_TO_BE: Record<SailorAbsence['type'], string> = {
  'Paid Leave': 'Congé payé',
  'Compensatory Rest': 'Repos compensateur',
  'Medical Leave': 'Maladie',
  'STCW Training': 'Formation STCW',
};

const VESSEL_STATUS_TO_EN: Record<string, VesselStatus> = {
  Disponible: 'Available',
  'En mer': 'At Sea',
  'En maintenance': 'In Maintenance',
  Available: 'Available',
  'At Sea': 'At Sea',
  'In Maintenance': 'In Maintenance',
};
const VESSEL_STATUS_TO_BE: Record<VesselStatus, string> = {
  Available: 'Disponible',
  'At Sea': 'En mer',
  'In Maintenance': 'En maintenance',
};

const TRIP_STATUS_TO_EN: Record<string, TripStatus> = {
  'En cours': 'In Progress',
  Terminée: 'Completed',
  Planifiée: 'Scheduled',
  'In Progress': 'In Progress',
  Completed: 'Completed',
  Scheduled: 'Scheduled',
};
const TRIP_STATUS_TO_BE: Record<TripStatus, string> = {
  'In Progress': 'En cours',
  Completed: 'Terminée',
  Scheduled: 'Planifiée',
};

const SPECIES_TO_EN: Record<string, FishSpecies> = {
  'Bar de ligne': 'Line-Caught Sea Bass',
  'Dorade royale': 'Gilthead Bream',
  'Thon rouge': 'Bluefin Tuna',
  'Merlu blanc': 'European Hake',
  Langoustine: 'Norway Lobster',
  Sardine: 'Sardine',
  Maquereau: 'Mackerel',
  'Sole commune': 'Common Sole',
  'Line-Caught Sea Bass': 'Line-Caught Sea Bass',
  'Gilthead Bream': 'Gilthead Bream',
  'Bluefin Tuna': 'Bluefin Tuna',
  'European Hake': 'European Hake',
  'Norway Lobster': 'Norway Lobster',
  Mackerel: 'Mackerel',
  'Common Sole': 'Common Sole',
};
const SPECIES_TO_BE: Record<FishSpecies, string> = {
  'Line-Caught Sea Bass': 'Bar de ligne',
  'Gilthead Bream': 'Dorade royale',
  'Bluefin Tuna': 'Thon rouge',
  'European Hake': 'Merlu blanc',
  'Norway Lobster': 'Langoustine',
  Sardine: 'Sardine',
  Mackerel: 'Maquereau',
  'Common Sole': 'Sole commune',
};

const EXPENSE_TO_EN: Record<string, ExpenseCategory> = {
  Carburant: 'Fuel',
  Glace: 'Ice',
  Nourriture: 'Provisions',
  Entretien: 'Maintenance',
  Autres: 'Other',
  Fuel: 'Fuel',
  Ice: 'Ice',
  Provisions: 'Provisions',
  Maintenance: 'Maintenance',
  Other: 'Other',
};
const EXPENSE_TO_BE: Record<ExpenseCategory, string> = {
  Fuel: 'Carburant',
  Ice: 'Glace',
  Provisions: 'Nourriture',
  Maintenance: 'Entretien',
  Other: 'Autres',
};

const PAYMENT_STATUS_TO_EN: Record<string, PaymentRecord['status']> = {
  Payé: 'Paid',
  'En attente': 'Pending',
  Paid: 'Paid',
  Pending: 'Pending',
};

const NOTIF_CAT_TO_EN: Record<string, NotificationCategory> = {
  paiement: 'payment',
  sortie: 'trip',
  contrat: 'contract',
  document: 'document',
  finance: 'finance',
  ia: 'ai',
  payment: 'payment',
  trip: 'trip',
  contract: 'contract',
  ai: 'ai',
};

const MONTH_TO_EN: Record<string, string> = {
  Déc: 'Dec',
  Jan: 'Jan',
  Fév: 'Feb',
  Mar: 'Mar',
  Avr: 'Apr',
  Mai: 'May',
  Juin: 'Jun',
  Juil: 'Jul',
  Août: 'Aug',
  Sept: 'Sep',
  Oct: 'Oct',
  Nov: 'Nov',
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
  status: string;
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
      return 'Unable to reach the server. Please verify your connection.';
    }
    const data = axiosErr.response.data;
    if (data?.validationErrors) {
      const firstErr = Object.values(data.validationErrors)[0];
      if (firstErr) return firstErr;
    }
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return `Server error (${axiosErr.response.status})`;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
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

function normalizeRole(role: string): UserRole {
  const upper = (role || 'ARMATEUR').toUpperCase();
  if (upper === 'ADMIN' || upper === 'ARMATEUR') return 'ARMATEUR';
  if (upper === 'CAPITAINE') return 'CAPITAINE';
  if (upper === 'FINANCIER') return 'FINANCIER';
  if (upper === 'OBSERVATEUR') return 'OBSERVATEUR';
  return 'ARMATEUR';
}

export function normalizeMonthLabel(label: string): string {
  return MONTH_TO_EN[label] || label;
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
    grade: GRADE_TO_EN[raw.grade] || 'Deckhand',
    shareWeight: Number(raw.shareWeight ?? 1),
    status: SAILOR_STATUS_TO_EN[raw.status] || 'Active',
    contractType: CONTRACT_TO_EN[raw.contractType] || 'Share Contract',
    contractStart: raw.contractStart || new Date().toISOString().slice(0, 10),
    contractEnd: raw.contractEnd || undefined,
    vesselId: raw.vesselId != null ? String(raw.vesselId) : undefined,
    portAttache: raw.portAttache || 'Concarneau',
    yearsExperience: Number(raw.yearsExperience ?? 1),
    documents: Array.isArray(raw.documents)
      ? raw.documents.map((d: any): SailorDocument => ({
          id: String(d.id),
          name: d.name,
          status: DOC_STATUS_TO_EN[d.status] || 'Valid',
          expiryDate: d.expiryDate || undefined,
        }))
      : [],
    absences: Array.isArray(raw.absences)
      ? raw.absences.map((a: any): SailorAbsence => ({
          id: String(a.id),
          type: ABSENCE_TO_EN[a.type] || 'Compensatory Rest',
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
    status: VESSEL_STATUS_TO_EN[raw.status] || 'Available',
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
    status: TRIP_STATUS_TO_EN[raw.status] || 'Scheduled',
    catches: Array.isArray(raw.catches)
      ? raw.catches.map((c: any) => ({
          id: String(c.id),
          species: SPECIES_TO_EN[c.species] || 'Line-Caught Sea Bass',
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
    species: SPECIES_TO_EN[raw.species] || 'Line-Caught Sea Bass',
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
    category: EXPENSE_TO_EN[raw.category] || 'Other',
    description: raw.description,
    amount: Number(raw.amount ?? 0),
  };
}

export function mapBackendPayment(raw: any): PaymentRecord {
  return {
    id: String(raw.id),
    sailorId: String(raw.sailorId),
    tripId: String(raw.tripId),
    periodLabel: String(raw.periodLabel || '').replace(/^Marée\s+/i, 'Trip '),
    grossTripRevenue: Number(raw.grossTripRevenue ?? 0),
    commonExpenses: Number(raw.commonExpenses ?? 0),
    netDistributable: Number(raw.netDistributable ?? 0),
    crewPoolAmount: Number(raw.crewPoolAmount ?? 0),
    sailorWeight: Number(raw.sailorWeight ?? 1),
    totalCrewWeights: Number(raw.totalCrewWeights ?? 1),
    amountDue: Number(raw.amountDue ?? 0),
    status: PAYMENT_STATUS_TO_EN[raw.status] || 'Pending',
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
  const catRaw = String(raw.category || 'ai').toLowerCase();
  return {
    id: String(raw.id),
    title: raw.title,
    message: raw.message,
    category: NOTIF_CAT_TO_EN[catRaw] || 'ai',
    severity: (String(raw.severity || 'info').toLowerCase() === 'urgent'
      ? 'urgent'
      : String(raw.severity || 'info').toLowerCase() === 'warning'
      ? 'warning'
      : 'info') as AppNotification['severity'],
    createdAt: raw.createdAt || 'Just now',
    read: Boolean(raw.read),
    targetPage: raw.targetPage || undefined,
  };
}

// ============================================================================
// Service Modules
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
      grade: GRADE_TO_BE[sailor.grade] || sailor.grade,
      shareWeight: sailor.shareWeight,
      status: SAILOR_STATUS_TO_BE[sailor.status] || sailor.status,
      contractType: CONTRACT_TO_BE[sailor.contractType] || sailor.contractType,
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
      grade: GRADE_TO_BE[sailor.grade] || sailor.grade,
      shareWeight: sailor.shareWeight,
      status: SAILOR_STATUS_TO_BE[sailor.status] || sailor.status,
      contractType: CONTRACT_TO_BE[sailor.contractType] || sailor.contractType,
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
      type: ABSENCE_TO_BE[absence.type] || absence.type,
      startDate: absence.startDate,
      endDate: absence.endDate,
      days: absence.days,
      note: absence.note || null,
    });
    return {
      id: String(data.id),
      type: ABSENCE_TO_EN[data.type] || 'Compensatory Rest',
      startDate: data.startDate,
      endDate: data.endDate,
      days: Number(data.days),
      note: data.note || undefined,
    };
  },
  updateDocumentStatus: async (docId: string, status: SailorDocument['status']) => {
    const { data } = await axiosInstance.patch(`/documents/${docId}/status`, {
      status: DOC_STATUS_TO_BE[status] || status,
    });
    return {
      id: String(data.id),
      name: data.name as string,
      status: DOC_STATUS_TO_EN[data.status] || 'Valid',
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
      status: VESSEL_STATUS_TO_BE[vessel.status] || vessel.status,
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
      status: VESSEL_STATUS_TO_BE[vessel.status] || vessel.status,
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
      status: TRIP_STATUS_TO_BE[trip.status] || trip.status,
      catches: trip.catches.map((c) => ({
        species: SPECIES_TO_BE[c.species] || c.species,
        quantityKg: c.quantityKg,
        pricePerKg: c.pricePerKg,
      })),
      notes: trip.notes || null,
    };
    const { data } = await axiosInstance.post('/sorties', payload);
    return mapBackendTrip(data);
  },
  updateTripStatus: async (tripId: string, status: TripStatus) => {
    const { data } = await axiosInstance.patch(`/sorties/${tripId}/status`, {
      status: TRIP_STATUS_TO_BE[status] || status,
    });
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
      species: SPECIES_TO_BE[sale.species] || sale.species,
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
      category: EXPENSE_TO_BE[expense.category] || expense.category,
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
      ruleName: 'Active Fleet Share Rule',
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
