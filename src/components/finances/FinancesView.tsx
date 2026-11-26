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
  'Fuel',
  'Ice',
  'Provisions',
  'Maintenance',
  'Other',
];

const SPECIES_OPTIONS: FishSpecies[] = [
  'Line-Caught Sea Bass',
  'Gilthead Bream',
  'Bluefin Tuna',
  'European Hake',
  'Norway Lobster',
  'Sardine',
  'Mackerel',
  'Common Sole',
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
  const [saleSpecies, setSaleSpecies] = useState<FishSpecies>('Line-Caught Sea Bass');
  const [saleBuyer, setSaleBuyer] = useState('Concarneau Fish Auction');
  const [saleQty, setSaleQty] = useState(400);
  const [salePrice, setSalePrice] = useState(18.5);

  // Add Expense modal
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expVesselId, setExpVesselId] = useState(vessels[0]?.id || '');
  const [expTripId, setExpTripId] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Fuel');
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
    return trips.filter((t) => t.status === 'Completed' && !settledIds.has(t.id));
  }, [trips, payments]);

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const trip = trips.find((t) => t.id === saleTripId);
    addSale({
      tripId: saleTripId,
      vesselId: trip?.vesselId || vessels[0]?.id || '',
      date: new Date().toISOString().slice(0, 10),
      species: saleSpecies,
      buyer: saleBuyer.trim() || 'Direct Auction',
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
            Finances &amp; Crew Share Settlements
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Fish auction sales, operating costs, transparent share calculation, and Bahripay payment slips.
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
            <span>Add Expense</span>
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
            <span>Record Sale</span>
          </MagneticButton>
        </div>
      </div>

      {/* Top Financial Summary + Chart */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 grid grid-cols-2 gap-4">
          <FloatingGlassCard className="p-5" delay={0.04}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Total Revenue</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#0A4565] dark:text-[#16C5C0]">
              <AnimatedNumber value={Math.round(kpis.totalRevenue)} suffix=" DH" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">{sales.length} auction sales</div>
          </FloatingGlassCard>

          <FloatingGlassCard className="p-5" delay={0.08}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Total Expenses</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-[#062B45] dark:text-[#F8FAFC]">
              <AnimatedNumber value={Math.round(kpis.totalExpenses)} suffix=" DH" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">{expenses.length} entries</div>
          </FloatingGlassCard>

          <FloatingGlassCard className="p-5" delay={0.12}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Net Profit</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={Math.round(kpis.netProfit)} suffix=" DH" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">Fleet operating result</div>
          </FloatingGlassCard>

          <FloatingGlassCard className="p-5" delay={0.16}>
            <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75">Due to Crew</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              <AnimatedNumber value={Math.round(kpis.pendingPaymentsAmount)} suffix=" DH" />
            </div>
            <div className="text-[11px] opacity-70 mt-1">
              {kpis.pendingPaymentsCount} slips pending
            </div>
          </FloatingGlassCard>
        </div>

        <FloatingGlassCard className="xl:col-span-7 p-5" tiltEnabled={false} delay={0.18}>
          <h2 className="font-display font-semibold text-base mb-3 text-[#062B45] dark:text-[#F8FAFC]">
            Expenses Breakdown by Category
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
                  width={90}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0).toLocaleString('en-US')} DH`, 'Amount']}
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
          { id: 'payments' as const, label: `Share Splits & Payments (${payments.length})` },
          { id: 'sales' as const, label: `Revenue & Sales (${sales.length})` },
          { id: 'expenses' as const, label: `Expenses (${expenses.length})` },
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

      {/* TAB: SHARE SPLITS & PAYMENTS */}
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
                  Crew Share Distribution Rules
                </h2>
                <p className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75 mt-0.5">
                  Share weights applied to new trip settlements (Captain 2.0 · First Mate/Engineer 1.5 · Deckhand 1.0).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2">
                <span>Crew Share:</span>
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
                Shipowner: {shareRule.boatSharePercent}%
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
                <span>Deduct common expenses before split</span>
              </label>
            </div>
          </FloatingGlassCard>

          {tripsWithoutPayments.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#16C5C0]/12 backdrop-blur-lg border border-[#16C5C0]/35 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="text-xs sm:text-sm font-medium">
                {tripsWithoutPayments.length} completed trip(s) ready for crew share calculation:
              </div>
              <div className="flex flex-wrap gap-2">
                {tripsWithoutPayments.map((t) => (
                  <MagneticButton
                    key={t.id}
                    type="button"
                    onClick={() => generateTripPayments(t.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-xs cursor-pointer shadow-sm"
                  >
                    Calculate {t.code}
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
                    <th className="py-3.5 px-5">Crew Member &amp; Grade</th>
                    <th className="py-3.5 px-4">Trip</th>
                    <th className="py-3.5 px-4">Net Shared Base</th>
                    <th className="py-3.5 px-4">Share Weight</th>
                    <th className="py-3.5 px-4 text-right">Amount Due</th>
                    <th className="py-3.5 px-4">Status</th>
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
                            {sailor ? `${sailor.firstName} ${sailor.lastName}` : 'Crew Member'}
                          </div>
                          <div className="text-xs opacity-70">{sailor?.grade}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">{pay.periodLabel}</td>
                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                          {pay.netDistributable.toLocaleString('en-US')} DH
                          <div className="text-[11px] opacity-65">
                            Pool {Math.round(pay.crewPoolAmount).toLocaleString('en-US')} DH
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                          {pay.sailorWeight} / {pay.totalCrewWeights} shares
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                          {pay.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })} DH
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold">
                          {pay.status === 'Paid' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid ({pay.paidAt})
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">Pending</span>
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
                              <span>Slip</span>
                            </button>
                            {pay.status === 'Pending' && (
                              <MagneticButton
                                type="button"
                                onClick={() => markPaymentPaid(pay.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#16C5C0] text-[#062B45] text-xs font-semibold cursor-pointer shadow-sm"
                              >
                                Settle
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

      {/* TAB: REVENUE & SALES */}
      {tab === 'sales' && (
        <FloatingGlassCard tiltEnabled={false} className="no-print overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-4">Species</th>
                  <th className="py-3.5 px-4">Buyer / Auction</th>
                  <th className="py-3.5 px-4 text-right">Quantity (kg)</th>
                  <th className="py-3.5 px-4 text-right">Price / kg</th>
                  <th className="py-3.5 px-5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#16C5C0]/7 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs">{s.date}</td>
                    <td className="py-3 px-4 font-semibold">{s.species}</td>
                    <td className="py-3 px-4 text-xs">{s.buyer}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {s.quantityKg.toLocaleString('en-US')} kg
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {s.pricePerKg.toFixed(2)} DH
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums font-bold text-[#0A4565] dark:text-[#16C5C0]">
                      {s.totalAmount.toLocaleString('en-US')} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FloatingGlassCard>
      )}

      {/* TAB: EXPENSES */}
      {tab === 'expenses' && (
        <FloatingGlassCard tiltEnabled={false} className="no-print overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Vessel</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {expenses.map((exp) => {
                  const vessel = vessels.find((v) => v.id === exp.vesselId);
                  return (
                    <tr key={exp.id} className="hover:bg-[#16C5C0]/7 transition-colors">
                      <td className="py-3 px-5 font-mono text-xs">{exp.date}</td>
                      <td className="py-3 px-4 font-semibold text-xs">{exp.category}</td>
                      <td className="py-3 px-4 text-xs">{vessel?.name || 'Fleet'}</td>
                      <td className="py-3 px-4 text-xs opacity-85">{exp.description}</td>
                      <td className="py-3 px-5 text-right font-mono tabular-nums font-bold">
                        {exp.amount.toLocaleString('en-US')} DH
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FloatingGlassCard>
      )}

      {/* MODAL: MARITIME PAYMENT SLIP (PRINTABLE) */}
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
                    BAHRIPAY · CREW SHARE SETTLEMENT SLIP
                  </div>
                  <h2 className="font-display font-bold text-xl mt-1">
                    {(() => {
                      const s = sailors.find((m) => m.id === selectedSlip.sailorId);
                      return s ? `${s.firstName} ${s.lastName}` : 'Crew Member';
                    })()}
                  </h2>
                  <div className="text-xs opacity-75">
                    {selectedSlip.periodLabel} · ID{' '}
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
                  <span className="opacity-75">Gross trip revenue</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.grossTripRevenue.toLocaleString('en-US')} DH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Common expenses deducted (fuel, ice, provisions)</span>
                  <span className="font-mono tabular-nums text-red-500">
                    - {selectedSlip.commonExpenses.toLocaleString('en-US')} DH
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 font-semibold">
                  <span>Net distributable pool</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.netDistributable.toLocaleString('en-US')} DH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Crew pool ({shareRule.crewSharePercent}%)</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.crewPoolAmount.toLocaleString('en-US')} DH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Individual share weight</span>
                  <span className="font-mono tabular-nums">
                    {selectedSlip.sailorWeight} / {selectedSlip.totalCrewWeights} shares
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-base font-bold">
                  <span>Net payable to crew member</span>
                  <span className="font-mono tabular-nums text-xl text-[#16C5C0]">
                    {selectedSlip.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })} DH
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
                  <span>Print / PDF</span>
                </MagneticButton>
                {selectedSlip.status === 'Pending' && (
                  <MagneticButton
                    type="button"
                    onClick={() => {
                      markPaymentPaid(selectedSlip.id);
                      setSelectedSlip(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] text-xs font-semibold cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Approve Payment</span>
                  </MagneticButton>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RECORD SALE */}
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
                <h2 className="font-display font-bold text-xl">New Fish Sale</h2>
                <button type="button" onClick={() => setSaleModalOpen(false)} className="cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Associated Trip</label>
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
                  <label className="block text-xs font-semibold mb-1">Species</label>
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
                  <label className="block text-xs font-semibold mb-1">Buyer / Auction</label>
                  <input
                    required
                    value={saleBuyer}
                    onChange={(e) => setSaleBuyer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      min={1}
                      value={saleQty}
                      onChange={(e) => setSaleQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Price / kg (DH)</label>
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
                  <span>Automatically calculated revenue</span>
                  <strong>{(saleQty * salePrice).toLocaleString('en-US')} DH</strong>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSaleModalOpen(false)} className="px-4 py-2 text-sm cursor-pointer">
                  Cancel
                </button>
                <MagneticButton type="submit" className="px-5 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm cursor-pointer">
                  Save
                </MagneticButton>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD EXPENSE */}
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
                <h2 className="font-display font-bold text-xl">Record Expense</h2>
                <button type="button" onClick={() => setExpenseModalOpen(false)} className="cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
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
                  <label className="block text-xs font-semibold mb-1">Vessel</label>
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
                  <label className="block text-xs font-semibold mb-1">Associated Trip (optional)</label>
                  <select
                    value={expTripId}
                    onChange={(e) => setExpTripId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  >
                    <option value="">General vessel expense</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <input
                    required
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Marine diesel bunkering"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Amount (DH)</label>
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
                  Cancel
                </button>
                <MagneticButton type="submit" className="px-5 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm cursor-pointer">
                  Save
                </MagneticButton>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
