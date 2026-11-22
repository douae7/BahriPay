import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Anchor,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Clock,
  Compass,
  Fish,
  RefreshCw,
  Ship,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useMaritime } from '../../context/MaritimeContext';
import { useTheme } from '../../context/ThemeContext';
import {
  AnimatedNumber,
  FloatingCircularStat,
  FloatingGlassCard,
  MagneticButton,
} from '../common/OceanMotion';

const formatEuro = (val: number) =>
  `${Math.round(val).toLocaleString('fr-FR')} €`;

export const DashboardView: React.FC = () => {
  const {
    kpis,
    monthlySeries,
    trips,
    vessels,
    sales,
    expenses,
    payments,
    notifications,
    setRoute,
  } = useMaritime();
  const { theme } = useTheme();
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('12m');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSeries = useMemo(() => {
    if (range === '3m') return monthlySeries.slice(-3);
    if (range === '6m') return monthlySeries.slice(-6);
    return monthlySeries;
  }, [monthlySeries, range]);

  const vesselProfitability = useMemo(() => {
    return vessels.map((v) => {
      const rev = sales
        .filter((s) => s.vesselId === v.id)
        .reduce((sum, s) => sum + s.totalAmount, 0);
      const exp = expenses
        .filter((e) => e.vesselId === v.id)
        .reduce((sum, e) => sum + e.amount, 0);
      const net = rev - exp;
      const margin = rev > 0 ? Math.round((net / rev) * 100) : 0;
      return { vessel: v, rev, exp, net, margin };
    });
  }, [vessels, sales, expenses]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 550);
  };

  const marginPct =
    kpis.totalRevenue > 0 ? Math.round((kpis.netProfit / kpis.totalRevenue) * 100) : 0;
  const activeVesselPct =
    vessels.length > 0
      ? Math.round(
          (vessels.filter((v) => v.status !== 'En maintenance').length / vessels.length) * 100
        )
      : 0;
  const paidCount = payments.filter((p) => p.status === 'Payé').length;
  const paidPct = payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 100;

  const gridStroke = theme === 'dark' ? 'rgba(125,220,235,0.12)' : 'rgba(10,69,101,0.1)';
  const axisTickColor = theme === 'dark' ? '#7DDCEB' : '#0A4565';
  const tooltipBg = theme === 'dark' ? '#062B45' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? 'rgba(22,197,192,0.35)' : 'rgba(10,69,101,0.15)';

  const kpiCards = [
    {
      label: 'Total marins',
      numericValue: kpis.totalSailors,
      suffix: '',
      sub: 'Équipage inscrit',
      icon: Users,
      route: 'sailors' as const,
    },
    {
      label: 'Bateaux actifs',
      numericValue: kpis.totalVessels,
      suffix: '',
      sub: `${vessels.filter((v) => v.status === 'En mer').length} en mer actuellement`,
      icon: Ship,
      route: 'fleet' as const,
    },
    {
      label: 'Sorties de pêche',
      numericValue: kpis.totalTrips,
      suffix: '',
      sub: `${trips.filter((t) => t.status === 'En cours').length} marée en cours`,
      icon: Compass,
      route: 'fleet' as const,
    },
    {
      label: 'Poissons pêchés',
      numericValue: kpis.totalCatchKg,
      suffix: ' kg',
      sub: 'Toutes espèces confondues',
      icon: Fish,
      route: 'fleet' as const,
    },
    {
      label: 'Recettes totales',
      numericValue: kpis.totalRevenue,
      suffix: ' €',
      sub: 'Ventes criée & mareyeurs',
      icon: TrendingUp,
      route: 'finances' as const,
      highlight: true,
    },
    {
      label: 'Dépenses totales',
      numericValue: kpis.totalExpenses,
      suffix: ' €',
      sub: 'Carburant, glace, entretien',
      icon: Anchor,
      route: 'finances' as const,
    },
    {
      label: 'Bénéfice net',
      numericValue: kpis.netProfit,
      suffix: ' €',
      sub: `Marge nette ${marginPct}%`,
      icon: Wallet,
      route: 'finances' as const,
      highlight: true,
    },
    {
      label: 'Paiements en attente',
      numericValue: kpis.pendingPaymentsAmount,
      suffix: ' €',
      sub: `${kpis.pendingPaymentsCount} fiches à régler`,
      icon: Clock,
      route: 'finances' as const,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#062B45] dark:text-[#F8FAFC]">
            Centre de contrôle Bahripay
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Vue consolidée et flottante des opérations en mer, captures et rentabilité de la flotte.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Actualiser les indicateurs"
            className="p-2.5 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18 hover:border-[#16C5C0] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#16C5C0] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18">
            {([
              { id: '3m', label: '3 mois' },
              { id: '6m', label: '6 mois' },
              { id: '12m', label: '12 mois' },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  range === opt.id
                    ? 'bg-[#16C5C0] text-[#062B45]'
                    : 'text-[#0A4565]/75 dark:text-[#7DDCEB]/75 hover:text-[#062B45] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Maritime Command Quick-Action Dock */}
      <FloatingGlassCard
        tiltEnabled={false}
        className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-white/85 via-[#E8F8FC]/85 to-white/85 dark:from-[#062B45]/85 dark:via-[#0A4565]/75 dark:to-[#062B45]/85"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#16C5C0]/18 border border-[#16C5C0]/35 flex items-center justify-center text-[#16C5C0] shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-display font-bold text-[#062B45] dark:text-[#F8FAFC]">
              Passerelle opérationnelle Bahripay
            </div>
            <div className="text-xs text-[#0A4565]/75 dark:text-[#7DDCEB]/80">
              {vessels.filter((v) => v.status === 'En mer').length} navire(s) actuellement en mer ·{' '}
              {kpis.pendingPaymentsCount} règlement(s) équipage en attente
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MagneticButton
            type="button"
            onClick={() => setRoute('fleet')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16C5C0] hover:bg-[#19d6d1] text-[#062B45] text-xs font-semibold shadow-md shadow-[#16C5C0]/25 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Sorties &amp; Flotte</span>
          </MagneticButton>
          <MagneticButton
            type="button"
            onClick={() => setRoute('sailors')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#041826]/80 border border-[#0A4565]/12 dark:border-[#7DDCEB]/20 hover:border-[#16C5C0] text-xs font-semibold cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#16C5C0]" />
            <span>Équipage</span>
          </MagneticButton>
          <MagneticButton
            type="button"
            onClick={() => setRoute('finances')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#041826]/80 border border-[#0A4565]/12 dark:border-[#7DDCEB]/20 hover:border-[#16C5C0] text-xs font-semibold cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-[#16C5C0]" />
            <span>Répartition parts</span>
          </MagneticButton>
          <MagneticButton
            type="button"
            onClick={() => setRoute('ocean-ai')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#062B45] dark:bg-[#7DDCEB]/15 text-[#F8FAFC] dark:text-[#7DDCEB] border border-[#16C5C0]/35 hover:border-[#16C5C0] text-xs font-semibold cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#16C5C0]" />
            <span>Ocean AI</span>
          </MagneticButton>
        </div>
      </FloatingGlassCard>

      {/* Floating Circular Ocean Gauges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FloatingCircularStat
          label="Marge nette armement"
          valueText={formatEuro(kpis.netProfit)}
          percent={marginPct}
          sublabel="Sur recettes criée"
          floatDelay="0s"
        />
        <FloatingCircularStat
          label="Disponibilité de la flotte"
          valueText={`${vessels.filter((v) => v.status !== 'En maintenance').length} / ${vessels.length} navires`}
          percent={activeVesselPct}
          sublabel="Opérationnels ou en mer"
          floatDelay="0.8s"
        />
        <FloatingCircularStat
          label="Règlements équipage"
          valueText={`${paidCount} / ${payments.length} fiches`}
          percent={paidPct}
          sublabel="Parts soldées"
          floatDelay="1.6s"
        />
      </section>

      {/* 8 Floating Glass KPI Cards with 3D Hover Tilt & Animated Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <FloatingGlassCard
              key={card.label}
              delay={idx * 0.035}
              onClick={() => setRoute(card.route)}
              className="p-5 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  {card.label}
                </span>
                <motion.span
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  className="p-1.5 rounded-lg bg-[#16C5C0]/12 text-[#16C5C0]"
                >
                  <Icon className="w-4 h-4" />
                </motion.span>
              </div>
              <div
                className={`mt-2.5 text-2xl font-bold ${
                  card.highlight
                    ? 'text-[#0A4565] dark:text-[#16C5C0]'
                    : 'text-[#062B45] dark:text-[#F8FAFC]'
                }`}
              >
                {isRefreshing ? (
                  <span className="inline-block w-24 h-7 rounded-lg bg-[#16C5C0]/20 animate-pulse" />
                ) : (
                  <AnimatedNumber value={card.numericValue} suffix={card.suffix} />
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs text-[#0A4565]/65 dark:text-[#F8FAFC]/60">
                <span>{card.sub}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#16C5C0] transition-opacity" />
              </div>
            </FloatingGlassCard>
          );
        })}
      </section>

      {/* Main Charts Row */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <FloatingGlassCard tiltEnabled={false} className="xl:col-span-7 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display font-semibold text-lg text-[#062B45] dark:text-[#F8FAFC]">
                Recettes et dépenses mensuelles
              </h2>
              <p className="text-xs text-[#0A4565]/65 dark:text-[#7DDCEB]/70">
                Comparatif financier des ventes en criée face aux coûts d’exploitation
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#16C5C0]" />
                Recettes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0A4565] dark:bg-[#7DDCEB]" />
                Dépenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16C5C0" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#16C5C0" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7DDCEB" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#7DDCEB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: axisTickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [
                    `${Number(value ?? 0).toLocaleString('fr-FR')} €`,
                    name === 'recettes' ? 'Recettes' : 'Dépenses',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="recettes"
                  stroke="#16C5C0"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="depenses"
                  stroke={theme === 'dark' ? '#7DDCEB' : '#0A4565'}
                  strokeWidth={2}
                  fill="url(#expGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FloatingGlassCard>

        <FloatingGlassCard tiltEnabled={false} delay={0.08} className="xl:col-span-5 p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-display font-semibold text-lg text-[#062B45] dark:text-[#F8FAFC]">
              Évolution des captures (kg)
            </h2>
            <p className="text-xs text-[#0A4565]/65 dark:text-[#7DDCEB]/70">
              Volume mensuel débarqué par l’ensemble de la flotte
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredSeries} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: axisTickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}T`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${Number(value ?? 0).toLocaleString('fr-FR')} kg`, 'Captures']}
                />
                <Bar dataKey="captureKg" fill="#16C5C0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FloatingGlassCard>
      </section>

      {/* Bottom Operational Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <FloatingGlassCard tiltEnabled={false} className="lg:col-span-4 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base sm:text-lg">
              Rentabilité par navire
            </h2>
            <button
              type="button"
              onClick={() => setRoute('ocean-ai')}
              className="text-xs font-semibold text-[#16C5C0] hover:underline cursor-pointer"
            >
              Analyse IA
            </button>
          </div>
          <div className="space-y-4">
            {vesselProfitability.map(({ vessel, rev, net, margin }) => (
              <div key={vessel.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium truncate">{vessel.name}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#0A4565] dark:text-[#7DDCEB]">
                    {formatEuro(net)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0A4565]/10 dark:bg-[#7DDCEB]/15 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(8, Math.min(100, margin))}%` }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#0A4565] to-[#16C5C0]"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#0A4565]/65 dark:text-[#F8FAFC]/60">
                  <span>{vessel.homePort} · {vessel.status}</span>
                  <span className="font-mono tabular-nums">
                    CA {formatEuro(rev)} · Marge {margin}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </FloatingGlassCard>

        <FloatingGlassCard tiltEnabled={false} delay={0.05} className="lg:col-span-5 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base sm:text-lg">
              Dernières sorties de pêche
            </h2>
            <button
              type="button"
              onClick={() => setRoute('fleet')}
              className="text-xs font-semibold text-[#16C5C0] hover:underline cursor-pointer"
            >
              Voir tout
            </button>
          </div>
          <div className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10">
            {trips.slice(0, 4).map((trip) => {
              const vessel = vessels.find((v) => v.id === trip.vesselId);
              return (
                <div key={trip.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="font-mono text-xs text-[#16C5C0]">{trip.code}</span>
                      <span className="truncate">{vessel?.name}</span>
                    </div>
                    <div className="text-xs text-[#0A4565]/65 dark:text-[#F8FAFC]/65 mt-0.5 truncate">
                      {trip.zone} · {trip.status}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono tabular-nums">
                    <div className="text-sm font-semibold">{formatEuro(trip.estimatedRevenue)}</div>
                    <div className="text-xs text-[#0A4565]/65 dark:text-[#7DDCEB]/75">
                      {trip.totalCatchKg.toLocaleString('fr-FR')} kg
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </FloatingGlassCard>

        <FloatingGlassCard tiltEnabled={false} delay={0.1} className="lg:col-span-3 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base sm:text-lg flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#16C5C0]" />
              <span>Alertes</span>
            </h2>
            <button
              type="button"
              onClick={() => setRoute('notifications')}
              className="text-xs font-semibold text-[#16C5C0] hover:underline cursor-pointer"
            >
              Centre
            </button>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => n.targetPage && setRoute(n.targetPage)}
                className="w-full text-left p-3 rounded-xl bg-white/60 dark:bg-[#041826]/65 hover:bg-[#16C5C0]/15 border border-[#0A4565]/8 dark:border-[#7DDCEB]/12 transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                  {n.title}
                </div>
                <div className="text-[11px] text-[#0A4565]/75 dark:text-[#7DDCEB]/75 mt-1 line-clamp-2">
                  {n.message}
                </div>
                <div className="text-[10px] text-[#0A4565]/55 dark:text-[#F8FAFC]/50 mt-1.5">
                  {n.createdAt}
                </div>
              </button>
            ))}
          </div>
        </FloatingGlassCard>
      </section>
    </div>
  );
};
