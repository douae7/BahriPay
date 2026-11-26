export type UserRole = 'ARMATEUR' | 'CAPITAINE' | 'FINANCIER' | 'OBSERVATEUR';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  portAttache: string;
  avatarInitials: string;
}

export type SailorGrade = 'Captain' | 'First Mate' | 'Engineer' | 'Deckhand' | 'Apprentice';
export type SailorStatus = 'Active' | 'At Sea' | 'On Leave' | 'Rest';
export type ContractType = 'Share Contract' | 'Permanent Maritime' | 'Seasonal Fixed-Term';

export interface SailorDocument {
  id: string;
  name: string;
  status: 'Valid' | 'Missing' | 'Renewal Due';
  expiryDate?: string;
}

export interface SailorAbsence {
  id: string;
  type: 'Paid Leave' | 'Compensatory Rest' | 'Medical Leave' | 'STCW Training';
  startDate: string;
  endDate: string;
  days: number;
  note?: string;
}

export interface Sailor {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  grade: SailorGrade;
  shareWeight: number; // Share coefficient (e.g., Captain 2.0, Deckhand 1.0)
  status: SailorStatus;
  contractType: ContractType;
  contractStart: string;
  contractEnd?: string;
  vesselId?: string;
  portAttache: string;
  yearsExperience: number;
  documents: SailorDocument[];
  absences: SailorAbsence[];
}

export type VesselStatus = 'Available' | 'At Sea' | 'In Maintenance';

export interface Vessel {
  id: string;
  name: string;
  registration: string;
  type: string;
  capacityKg: number;
  enginePowerHp: number;
  lengthMeters: number;
  homePort: string;
  status: VesselStatus;
  captainId?: string;
  lastMaintenanceDate: string;
  imageUrl?: string;
}

export type FishSpecies =
  | 'Line-Caught Sea Bass'
  | 'Gilthead Bream'
  | 'Bluefin Tuna'
  | 'European Hake'
  | 'Norway Lobster'
  | 'Sardine'
  | 'Mackerel'
  | 'Common Sole';

export interface CatchEntry {
  id: string;
  species: FishSpecies;
  quantityKg: number;
  pricePerKg: number;
  totalValue: number;
}

export type TripStatus = 'In Progress' | 'Completed' | 'Scheduled';

export interface FishingTrip {
  id: string;
  code: string;
  vesselId: string;
  crewIds: string[];
  departureDate: string;
  returnDate: string;
  zone: string;
  status: TripStatus;
  catches: CatchEntry[];
  totalCatchKg: number;
  estimatedRevenue: number;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  tripId: string;
  vesselId: string;
  date: string;
  species: FishSpecies;
  buyer: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
}

export type ExpenseCategory = 'Fuel' | 'Ice' | 'Provisions' | 'Maintenance' | 'Other';

export interface ExpenseRecord {
  id: string;
  tripId?: string;
  vesselId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export interface ShareRuleConfig {
  boatSharePercent: number; // e.g. 45% Shipowner / Vessel
  crewSharePercent: number; // e.g. 55% Crew
  deductCommonExpensesBeforeSplit: boolean;
}

export interface PaymentRecord {
  id: string;
  sailorId: string;
  tripId: string;
  periodLabel: string;
  grossTripRevenue: number;
  commonExpenses: number;
  netDistributable: number;
  crewPoolAmount: number;
  sailorWeight: number;
  totalCrewWeights: number;
  amountDue: number;
  status: 'Paid' | 'Pending';
  paidAt?: string;
}

export type NotificationCategory =
  | 'payment'
  | 'trip'
  | 'contract'
  | 'document'
  | 'finance'
  | 'ai';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: 'info' | 'warning' | 'urgent';
  createdAt: string;
  read: boolean;
  targetPage?: AppRoute;
}

export type AppRoute =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'sailors'
  | 'fleet'
  | 'finances'
  | 'ocean-ai'
  | 'reports'
  | 'notifications';

export interface MonthlyPerformancePoint {
  month: string;
  recettes: number;
  depenses: number;
  benefice: number;
  captureKg: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  highlights?: { label: string; value: string }[];
}
