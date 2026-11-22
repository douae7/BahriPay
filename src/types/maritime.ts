export type UserRole = 'ARMATEUR' | 'CAPITAINE' | 'FINANCIER' | 'OBSERVATEUR';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  portAttache: string;
  avatarInitials: string;
}

export type SailorGrade = 'Capitaine' | 'Second' | 'Mécanicien' | 'Matelot' | 'Mousse';
export type SailorStatus = 'Actif' | 'En mer' | 'En congé' | 'Repos';
export type ContractType = 'À la part' | 'CDI Maritime' | 'CDD Saisonnier';

export interface SailorDocument {
  id: string;
  name: string;
  status: 'Valide' | 'Manquant' | 'À renouveler';
  expiryDate?: string;
}

export interface SailorAbsence {
  id: string;
  type: 'Congé payé' | 'Repos compensateur' | 'Maladie' | 'Formation STCW';
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
  shareWeight: number; // Coefficient de part (ex: Capitaine 2.0, Matelot 1.0)
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

export type VesselStatus = 'Disponible' | 'En mer' | 'En maintenance';

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
  | 'Bar de ligne'
  | 'Dorade royale'
  | 'Thon rouge'
  | 'Merlu blanc'
  | 'Langoustine'
  | 'Sardine'
  | 'Maquereau'
  | 'Sole commune';

export interface CatchEntry {
  id: string;
  species: FishSpecies;
  quantityKg: number;
  pricePerKg: number;
  totalValue: number;
}

export type TripStatus = 'En cours' | 'Terminée' | 'Planifiée';

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

export type ExpenseCategory = 'Carburant' | 'Glace' | 'Nourriture' | 'Entretien' | 'Autres';

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
  boatSharePercent: number; // ex: 45% Armateur / Navire
  crewSharePercent: number; // ex: 55% Équipage
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
  status: 'Payé' | 'En attente';
  paidAt?: string;
}

export type NotificationCategory =
  | 'paiement'
  | 'sortie'
  | 'contrat'
  | 'document'
  | 'finance'
  | 'ia';

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
