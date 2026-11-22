import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircle2,
  FileText,
  Plus,
  Printer,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMaritime } from '../../context/MaritimeContext';
import { useTheme } from '../../context/ThemeContext';
import { ExpenseCategory, FishSpecies, PaymentRecord } from '../../types/maritime';
import { AnimatedNumber, FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Carburant',
  'Glace',
  'Nourriture',
  'Entretien',
  'Autres',
];

const SPECIES_OPTIONS: FishSpecies[] = [
  'Bar de ligne',
  'Dorade royale',
  'Thon rouge',
  'Merlu blanc',
  'Langoustine',
  'Sardine',
  'Maquereau',
  'Sole commune',
];

export const FinancesView: React.FC = () => {
  const {
    sales,
    expenses,
    payments,
    trips,
    vessels,
    sailors,
    kpis,
    shareRule,
    setShareRule,
    addSale,
    addExpense,
    markPaymentPaid,
    generateTripPayments,
  } = useMaritime();
  const { theme } = useTheme();

  const [tab, setTab] = useState<'payments' | 'sales' | 'expenses'>('payments');
  const [selectedSlip, setSelectedSlip] = useState<PaymentRecord | null>(null);

  // Add Sale modal
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleTripId, setSaleTripId] = useState(trips[0]?.id || '');
  const [saleSpecies, setSaleSpecies] = useState<FishSpecies>('Bar de ligne');
  const [saleBuyer, setSaleBuyer] = useState('Criée de Concarneau');
  const [saleQty, setSaleQty] = useState(400);
  const [salePrice, setSalePrice] = useState(18.5);

  // Add Expense modal
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expVesselId, setExpVesselId] = useState(vessels[0]?.id || '');
  const [expTripId, setExpTripId] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Carburant');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState(1200);

  const expensesByCategory = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => ({
      category: cat,
      amount: expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0),
    }));
  }, [expenses]);

  const tripsWithoutPayments = useMemo(() => {
    const settledIds = new Set(payments.map((p) => p.tripId));
    return trips.filter((t) => t.status === 'Terminée' && !settledIds.has(t.id));
  }, [trips, payments]);

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const trip = trips.find((t) => t.id === saleTripId);
    addSale({
      tripId: saleTripId,
      vesselId: trip?.vesselId || vessels[0]?.id || '',
      date: new Date().toISOString().slice(0, 10),
      species: saleSpecies,
      buyer: saleBuyer.trim() || 'Criée directe',
      quantityKg: Number(saleQty) || 0,
      pricePerKg: Number(salePrice) || 0,
    });
    setSaleModalOpen(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      vesselId: expVesselId,
      tripId: expTripId || undefined,
      date: new Date().toISOString().slice(0, 10),
      category: expCategory,
      description: expDesc.trim() || expCategory,
      amount: Number(expAmount) || 0,
    });
    setExpenseModalOpen(false);
    setExpDesc('');
  };

  const axisColor = theme === 'dark' ? '#7DDCEB' : '#0A4565';
  const gridStroke = theme === 'dark' ? 'rgba(125,220,235,0.12)' : 'rgba(10,69,101,0.1)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#062B45] dark:text-[#F8FAFC]">
            Gestion financière &amp; Répartition à la part
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Ventes de poissons, charges d’exploitation, calcul transparent des parts et fiches de paiement Bahripay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <MagneticButton
            type="button"
            onClick={() => {
              if (!vessels.some((v) => v.id === expVesselId) && vessels[0]) {
                setExpVesselId(vessels[0].id);
              }
              setExpenseModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-sm font-semibold hover:border-[#16C5C0] cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#16C5C0]" />
            <span>Ajouter une dépense</span>
          </MagneticButton>
          <MagneticButton
            type="button"
            onClick={() => {
              if (!trips.some((t) => t.id === saleTripId) && trips[0]) {
                setSaleTripId(trips[0].id);
              }
              setSaleModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#19d8d2] text-[#062B45] font-semibold text-sm shadow-lg shadow-[#16C5C0]/25 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer une vente</span>
          </MagneticButton>
        </div>
      </div>

      {/* Top Financial Summary + Chart */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 grid grid-cols-2 gap-4">
          <FloatingGlassCard className="p-5" delay={0.04}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Recettes totales</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#0A4565] dark:text-[#16C5C0]">
              <AnimatedNumber value={Math.round(kpis.totalRevenue)} suffix=" €" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">{sales.length} ventes criée</div>
          </FloatingGlassCard>

          <FloatingGlassCard className="p-5" delay={0.08}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Dépenses totales</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#062B45] dark:text-[#F8FAFC]">
              <AnimatedNumber value={Math.round(kpis.totalExpenses)} suffix=" €" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">{expenses.length} écritures</div>
          </FloatingGlassCard>

          <FloatingGlassCard className="p-5" delay={0.12}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Bénéfice net</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={Math.round(kpis.netProfit)} suffix=" €" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">Résultat armement</div>
          </FloatingGlassCard>

          <FloatingGlassCard className="p-5" delay={0.16}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">À régler (équipage)</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              <AnimatedNumber value={Math.round(kpis.pendingPaymentsAmount)} suffix=" €" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">
              {kpis.pendingPaymentsCount} fiches en attente
            </div>
          </FloatingGlassCard>
        </div>

        <FloatingGlassCard className="xl:col-span-7 p-5" tiltEnabled={false} delay={0.18}>
          <h2 className="font-display font-semibold text-base mb-3 text-[#062B45] dark:text-[#F8FAFC]">
            Répartition des dépenses par poste
          </h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={82}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0).toLocaleString('fr-FR')} €`, 'Montant']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#062B45' : '#FFFFFF',
                    borderColor: 'rgba(22,197,192,0.35)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {expensesByCategory.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#16C5C0' : i === 3 ? '#0A4565' : '#7DDCEB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FloatingGlassCard>
      </div>

      {/* Segmented Module Tabs */}
      <div className="no-print inline-flex flex-wrap items-center gap-1 p-1.5 rounded-2xl bg-white/75 dark:bg-[#07263C]/75 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18">
        {[
          { id: 'payments' as const, label: `Répartition & Paiements (${payments.length})` },
          { id: 'sales' as const, label: `Recettes & Ventes (${sales.length})` },
          { id: 'expenses' as const, label: `Dépenses (${expenses.length})` },
        ].map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? 'text-[#062B45]'
                  : 'text-[#0A4565]/75 dark:text-[#7DDCEB]/80 hover:text-[#16C5C0]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bahripay-finances-tab"
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-[#16C5C0] shadow-md shadow-[#16C5C0]/25"
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: RÉPARTITION & PAIEMENTS */}
      {tab === 'payments' && (
        <div className="no-print space-y-5">
          {/* Configurable Share Rules Panel */}
          <FloatingGlassCard
            tiltEnabled={false}
            className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#16C5C0]/15 text-[#16C5C0] shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-base">
                  Règles de répartition des revenus à la part
                </h2>
                <p className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75 mt-0.5">
                  Parts appliquées lors du calcul des nouvelles marées (Capitaine 2.0 · Second/Mécanicien 1.5 · Matelot 1.0).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2">
                <span>Part Équipage :</span>
                <input
                  type="number"
                  min={20}
                  max={80}
                  value={shareRule.crewSharePercent}
                  onChange={(e) => {
                    const crew = Math.min(80, Math.max(20, Number(e.target.value)));
                    setShareRule({
                      ...shareRule,
                      crewSharePercent: crew,
                      boatSharePercent: 100 - crew,
                    });
                  }}
                  className="w-16 px-2 py-1.5 rounded-lg bg-[#F1F6FA]/90 dark:bg-[#041826]/90 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 font-mono font-bold text-center"
                />
                <span>%</span>
              </label>

              <span className="font-mono text-[#0A4565]/75 dark:text-[#7DDCEB]/80">
                Armateur : {shareRule.boatSharePercent}%
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareRule.deductCommonExpensesBeforeSplit}
                  onChange={(e) =>
                    setShareRule({
                      ...shareRule,
                      deductCommonExpensesBeforeSplit: e.target.checked,
                    })
                  }
                  className="accent-[#16C5C0]"
                />
                <span>Déduire frais communs avant partage</span>
              </label>
            </div>
          </FloatingGlassCard>

          {tripsWithoutPayments.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#16C5C0]/12 backdrop-blur-lg border border-[#16C5C0]/35 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="text-xs sm:text-sm font-medium">
                {tripsWithoutPayments.length} marée(s) terminée(s) prête(s) pour le calcul des parts équipage :
              </div>
              <div className="flex flex-wrap gap-2">
                {tripsWithoutPayments.map((t) => (
                  <MagneticButton
                    key={t.id}
                    type="button"
                    onClick={() => generateTripPayments(t.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-xs cursor-pointer shadow-sm"
                  >
                    Calculer {t.code}
                  </MagneticButton>
                ))}
              </div>
            </div>
          )}

          {/* Payments List */}
          <FloatingGlassCard tiltEnabled={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                    <th className="py-3.5 px-5">Marin &amp; Grade</th>
                    <th className="py-3.5 px-4">Marée</th>
                    <th className="py-3.5 px-4">Base nette partagée</th>
                    <th className="py-3.5 px-4">Pondération</th>
                    <th className="py-3.5 px-4 text-right">Montant dû</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                  {payments.map((pay) => {
                    const sailor = sailors.find((s) => s.id === pay.sailorId);
                    return (
                      <tr key={pay.id} className="hover:bg-[#16C5C0]/7 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold">
                            {sailor ? `${sailor.firstName} ${sailor.lastName}` : 'Marin'}
                          </div>
                          <div className="text-xs opacity-70">{sailor?.grade}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">{pay.periodLabel}</td>
                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                          {pay.netDistributable.toLocaleString('fr-FR')} €
                          <div className="text-[11px] opacity-65">
                            Pool {Math.round(pay.crewPoolAmount).toLocaleString('fr-FR')} €
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                          {pay.sailorWeight} / {pay.totalCrewWeights} parts
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                          {pay.amountDue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold">
                          {pay.status === 'Payé' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Payé ({pay.paidAt})
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">En attente</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSlip(pay)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F1F6FA]/90 dark:bg-[#041826]/90 text-xs font-semibold hover:text-[#16C5C0] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Fiche</span>
                            </button>
                            {pay.status === 'En attente' && (
                              <MagneticButton
                                type="button"
                                onClick={() => markPaymentPaid(pay.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#16C5C0] text-[#062B45] text-xs font-semibold cursor-pointer shadow-sm"
                              >
                                Régler
                              </MagneticButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FloatingGlassCard>
        </div>
      )}

      {/* TAB: RECETTES & VENTES */}
      {tab === 'sales' && (
        <FloatingGlassCard tiltEnabled={false} className="no-print overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-4">Espèce</th>
                  <th className="py-3.5 px-4">Acheteur / Criée</th>
                  <th className="py-3.5 px-4 text-right">Quantité (kg)</th>
                  <th className="py-3.5 px-4 text-right">Prix / kg</th>
                  <th className="py-3.5 px-5 text-right">Montant total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#16C5C0]/7 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs">{s.date}</td>
                    <td className="py-3 px-4 font-semibold">{s.species}</td>
                    <td className="py-3 px-4 text-xs">{s.buyer}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {s.quantityKg.toLocaleString('fr-FR')} kg
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {s.pricePerKg.toFixed(2)} €
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums font-bold text-[#0A4565] dark:text-[#16C5C0]">
                      {s.totalAmount.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FloatingGlassCard>
      )}

      {/* TAB: DÉPENSES */}
      {tab === 'expenses' && (
        <FloatingGlassCard tiltEnabled={false} className="no-print overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Navire</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-5 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {expenses.map((exp) => {
                  const vessel = vessels.find((v) => v.id === exp.vesselId);
                  return (
                    <tr key={exp.id} className="hover:bg-[#16C5C0]/7 transition-colors">
                      <td className="py-3 px-5 font-mono text-xs">{exp.date}</td>
                      <td className="py-3 px-4 font-semibold text-xs">{exp.category}</td>
                      <td className="py-3 px-4 text-xs">{vessel?.name || 'Flotte'}</td>
                      <td className="py-3 px-4 text-xs opacity-85">{exp.description}</td>
                      <td className="py-3 px-5 text-right font-mono tabular-nums font-bold">
                        {exp.amount.toLocaleString('fr-FR')} €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FloatingGlassCard>
      )}

      {/* MODAL: FICHE DE PAIEMENT MARITIME (PRINTABLE) */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="no-print fixed inset-0 bg-[#031524]/75 backdrop-blur-sm"
              onClick={() => setSelectedSlip(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-lg rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-2xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/25 p-6 sm:p-8 shadow-2xl space-y-5 print-clean"
            >
              <div className="flex items-start justify-between border-b border-[#0A4565]/12 dark:border-[#7DDCEB]/15 pb-4">
                <div>
                  <div className="text-xs font-mono text-[#16C5C0]">
                    BAHRIPAY · FICHE DE RÉPARTITION À LA PART
                  </div>
                  <h2 className="font-display font-bold text-xl mt-1">
                    {(() => {
                      const s = sailors.find((m) => m.id === selectedSlip.sailorId);
                      return s ? `${s.firstName} ${s.lastName}` : 'Marin';
                    })()}
                  </h2>
                  <div className="text-xs opacity-75">
                    {selectedSlip.periodLabel} · Matricule{' '}
                    {sailors.find((m) => m.id === selectedSlip.sailorId)?.registrationNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="no-print p-1.5 rounded-lg hover:bg-[#0A4565]/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-75">Recette brute de la marée</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.grossTripRevenue.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Frais communs déduits (carburant, glace, vivres)</span>
                  <span className="font-mono tabular-nums text-red-500">
                    - {selectedSlip.commonExpenses.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 font-semibold">
                  <span>Masse nette partageable</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.netDistributable.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Masse équipage ({shareRule.crewSharePercent}%)</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.crewPoolAmount.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Quote-part individuelle</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.sailorWeight} / {selectedSlip.totalCrewWeights} parts
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-base font-bold">
                  <span>Net à payer au marin</span>
                  <span className="font-mono tabular-nums text-xl text-[#16C5C0]">
                    {selectedSlip.amountDue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>

              <div className="no-print pt-3 flex items-center justify-end gap-3">
                <MagneticButton
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A4565] text-[#F8FAFC] text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer / PDF</span>
                </MagneticButton>
                {selectedSlip.status === 'En attente' && (
                  <MagneticButton
                    type="button"
                    onClick={() => {
                      markPaymentPaid(selectedSlip.id);
                      setSelectedSlip(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] text-xs font-semibold cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Valider le paiement</span>
                  </MagneticButton>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ENREGISTRER UNE VENTE */}
      <AnimatePresence>
        {saleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
              onClick={() => setSaleModalOpen(false)}
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onSubmit={handleSaveSale}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-2xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/25 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Nouvelle vente de poisson</h2>
                <button type="button" onClick={() => setSaleModalOpen(false)} className="cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Marée associée</label>
                  <select
                    value={saleTripId}
                    onChange={(e) => setSaleTripId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} · {vessels.find((v) => v.id === t.vesselId)?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Espèce</label>
                  <select
                    value={saleSpecies}
                    onChange={(e) => setSaleSpecies(e.target.value as FishSpecies)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  >
                    {SPECIES_OPTIONS.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Acheteur / Criée</label>
                  <input
                    required
                    value={saleBuyer}
                    onChange={(e) => setSaleBuyer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Quantité (kg)</label>
                    <input
                      type="number"
                      min={1}
                      value={saleQty}
                      onChange={(e) => setSaleQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Prix / kg (€)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.5}
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#16C5C0]/12 text-xs font-mono flex justify-between">
                  <span>Recette calculée automatiquement</span>
                  <strong>{(saleQty * salePrice).toLocaleString('fr-FR')} €</strong>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSaleModalOpen(false)} className="px-4 py-2 text-sm cursor-pointer">
                  Annuler
                </button>
                <MagneticButton type="submit" className="px-5 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm cursor-pointer">
                  Enregistrer
                </MagneticButton>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AJOUTER UNE DÉPENSE */}
      <AnimatePresence>
        {expenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
              onClick={() => setExpenseModalOpen(false)}
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onSubmit={handleSaveExpense}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-2xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/25 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Enregistrer une dépense</h2>
                <button type="button" onClick={() => setExpenseModalOpen(false)} className="cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Catégorie</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Navire</label>
                  <select
                    value={expVesselId}
                    onChange={(e) => setExpVesselId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Sortie associée (optionnel)</label>
                  <select
                    value={expTripId}
                    onChange={(e) => setExpTripId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  >
                    <option value="">Charge générale navire</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Libellé</label>
                  <input
                    required
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Ex. Soutage gazole marin"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Montant (€)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setExpenseModalOpen(false)} className="px-4 py-2 text-sm cursor-pointer">
                  Annuler
                </button>
                <MagneticButton type="submit" className="px-5 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm cursor-pointer">
                  Enregistrer
                </MagneticButton>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
