import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { useMaritime } from '../../context/MaritimeContext';
import { useTheme } from '../../context/ThemeContext';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

type ReportType = 'financial' | 'trips' | 'sailors' | 'production';

export const ReportsView: React.FC = () => {
  const { monthlySeries, trips, sailors, sales, vessels, payments } = useMaritime();
  const { theme } = useTheme();

  const [reportType, setReportType] = useState<ReportType>('financial');
  const [dateFrom, setDateFrom] = useState('2026-11-01');
  const [dateTo, setDateTo] = useState('2026-11-30');

  const productionBySpecies = useMemo(() => {
    const map = new Map<string, { species: string; kg: number; value: number }>();
    sales.forEach((s) => {
      const curr = map.get(s.species) || { species: s.species, kg: 0, value: 0 };
      curr.kg += s.quantityKg;
      curr.value += s.totalAmount;
      map.set(s.species, curr);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [sales]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const d = t.departureDate.slice(0, 10);
      return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
    });
  }, [trips, dateFrom, dateTo]);

  const handleExportExcelCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = 'bahripay_report.csv';

    if (reportType === 'financial') {
      filename = 'bahripay_financial_report.csv';
      headers = ['Month', 'Revenue (DH)', 'Expenses (DH)', 'Net Profit (DH)', 'Catch (kg)'];
      rows = monthlySeries.map((m) => [
        m.month,
        String(m.recettes),
        String(m.depenses),
        String(m.benefice),
        String(m.captureKg),
      ]);
    } else if (reportType === 'trips') {
      filename = 'bahripay_trips_report.csv';
      headers = ['Code', 'Vessel', 'Zone', 'Departure', 'Status', 'Catch (kg)', 'Revenue (DH)'];
      rows = filteredTrips.map((t) => [
        t.code,
        vessels.find((v) => v.id === t.vesselId)?.name || '',
        t.zone,
        t.departureDate,
        t.status,
        String(t.totalCatchKg),
        String(t.estimatedRevenue),
      ]);
    } else if (reportType === 'sailors') {
      filename = 'bahripay_crew_report.csv';
      headers = ['ID', 'Name', 'Grade', 'Contract', 'Port', 'Status', 'Total Shares (DH)'];
      rows = sailors.map((s) => {
        const totalPaid = payments
          .filter((p) => p.sailorId === s.id)
          .reduce((acc, p) => acc + p.amountDue, 0);
        return [
          s.registrationNumber,
          `${s.firstName} ${s.lastName}`,
          s.grade,
          s.contractType,
          s.portAttache,
          s.status,
          String(Math.round(totalPaid)),
        ];
      });
    } else {
      filename = 'bahripay_production_stats.csv';
      headers = ['Species', 'Volume (kg)', 'Total Sales (DH)'];
      rows = productionBySpecies.map((p) => [p.species, String(p.kg), String(p.value)]);
    }

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const axisColor = theme === 'dark' ? '#7DDCEB' : '#0A4565';
  const gridStroke = theme === 'dark' ? 'rgba(125,220,235,0.12)' : 'rgba(10,69,101,0.1)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#062B45] dark:text-[#F8FAFC]">
            Reports &amp; Statistics
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Monthly and annual comparative analytics with Excel (CSV) export and Bahripay PDF printing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <MagneticButton
            type="button"
            onClick={handleExportExcelCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-xs sm:text-sm font-semibold hover:border-[#16C5C0] cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#16C5C0]" />
            <span>Export Excel (.csv)</span>
          </MagneticButton>
          <MagneticButton
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#19d8d2] text-[#062B45] font-semibold text-xs sm:text-sm cursor-pointer shadow-lg shadow-[#16C5C0]/25"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF / Print</span>
          </MagneticButton>
        </div>
      </div>

      {/* Controls: Report Type & Date Filters */}
      <FloatingGlassCard
        tiltEnabled={false}
        className="no-print p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex flex-wrap gap-1.5">
          {([
            { id: 'financial', label: 'Financial' },
            { id: 'trips', label: 'Fishing Trips' },
            { id: 'sailors', label: 'Crew' },
            { id: 'production', label: 'Species Production' },
          ] as const).map((t) => {
            const active = reportType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setReportType(t.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'text-[#062B45]'
                    : 'bg-[#F1F6FA]/85 dark:bg-[#041826]/75 text-[#0A4565]/80 dark:text-[#7DDCEB]/80 hover:text-[#16C5C0]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bahripay-report-tab"
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#16C5C0] shadow-md shadow-[#16C5C0]/25"
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="opacity-70">Period:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F1F6FA]/90 dark:bg-[#041826]/85 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15"
          />
          <span>→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F1F6FA]/90 dark:bg-[#041826]/85 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15"
          />
        </div>
      </FloatingGlassCard>

      {/* Annual Comparison Chart */}
      <FloatingGlassCard tiltEnabled={false} className="p-5 sm:p-6 print-clean" delay={0.08}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#16C5C0]" />
              <span>Annual Revenue vs. Net Profit Comparison</span>
            </h2>
            <p className="text-xs opacity-70">Consolidated rolling 12-month performance</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={(v) => [`${Number(v ?? 0).toLocaleString('en-US')} DH`]}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#062B45' : '#FFFFFF',
                  borderColor: 'rgba(22,197,192,0.35)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="recettes" name="Revenue" fill="#0A4565" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benefice" name="Net Profit" fill="#16C5C0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FloatingGlassCard>

      {/* Report Data Table */}
      <FloatingGlassCard tiltEnabled={false} className="overflow-hidden print-clean" delay={0.14}>
        <div className="overflow-x-auto">
          {reportType === 'financial' && (
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold opacity-75">
                  <th className="py-3.5 px-5">Month</th>
                  <th className="py-3.5 px-4 text-right">Revenue</th>
                  <th className="py-3.5 px-4 text-right">Expenses</th>
                  <th className="py-3.5 px-4 text-right">Net Profit</th>
                  <th className="py-3.5 px-5 text-right">Catches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm font-mono tabular-nums">
                {monthlySeries.map((m) => (
                  <tr key={m.month} className="hover:bg-[#16C5C0]/6 transition-colors">
                    <td className="py-3 px-5 font-sans font-semibold">{m.month}</td>
                    <td className="py-3 px-4 text-right">{m.recettes.toLocaleString('en-US')} DH</td>
                    <td className="py-3 px-4 text-right">{m.depenses.toLocaleString('en-US')} DH</td>
                    <td className="py-3 px-4 text-right font-bold text-[#16C5C0]">
                      {m.benefice.toLocaleString('en-US')} DH
                    </td>
                    <td className="py-3 px-5 text-right">{m.captureKg.toLocaleString('en-US')} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'trips' && (
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold opacity-75">
                  <th className="py-3.5 px-5">Code</th>
                  <th className="py-3.5 px-4">Vessel</th>
                  <th className="py-3.5 px-4">Zone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Volume</th>
                  <th className="py-3.5 px-5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-[#16C5C0]/6 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs">{t.code}</td>
                    <td className="py-3 px-4 font-semibold">
                      {vessels.find((v) => v.id === t.vesselId)?.name}
                    </td>
                    <td className="py-3 px-4 text-xs">{t.zone}</td>
                    <td className="py-3 px-4 text-xs">{t.status}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {t.totalCatchKg.toLocaleString('en-US')} kg
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums font-bold">
                      {t.estimatedRevenue.toLocaleString('en-US')} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'sailors' && (
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold opacity-75">
                  <th className="py-3.5 px-5">Crew Member</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Contract</th>
                  <th className="py-3.5 px-4">Home Port</th>
                  <th className="py-3.5 px-5 text-right">Cumulative Shares</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {sailors.map((s) => {
                  const total = payments
                    .filter((p) => p.sailorId === s.id)
                    .reduce((sum, p) => sum + p.amountDue, 0);
                  return (
                    <tr key={s.id} className="hover:bg-[#16C5C0]/6 transition-colors">
                      <td className="py-3 px-5 font-semibold">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3 px-4 text-xs">{s.grade}</td>
                      <td className="py-3 px-4 text-xs">{s.contractType}</td>
                      <td className="py-3 px-4 text-xs">{s.portAttache}</td>
                      <td className="py-3 px-5 text-right font-mono tabular-nums font-bold">
                        {Math.round(total).toLocaleString('en-US')} DH
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'production' && (
            <table className="w-full text-left border-collapse min-w-[460px]">
              <thead>
                <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold opacity-75">
                  <th className="py-3.5 px-5">Landed Species</th>
                  <th className="py-3.5 px-4 text-right">Landed Volume</th>
                  <th className="py-3.5 px-5 text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
                {productionBySpecies.map((p) => (
                  <tr key={p.species} className="hover:bg-[#16C5C0]/6 transition-colors">
                    <td className="py-3 px-5 font-semibold">{p.species}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {p.kg.toLocaleString('en-US')} kg
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums font-bold text-[#16C5C0]">
                      {p.value.toLocaleString('en-US')} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FloatingGlassCard>
    </div>
  );
};
