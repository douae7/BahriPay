import React, { useEffect, useMemo, useState } from 'react';
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
  BrainCircuit,
  Info,
  Lightbulb,
  Loader2,
  Send,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMaritime } from '../../context/MaritimeContext';
import { useTheme } from '../../context/ThemeContext';
import { aiApi, AiAnalysisDTO, extractApiErrorMessage, normalizeMonthLabel } from '../../services/apiClient';
import { AIMessage } from '../../types/maritime';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

const SUGGESTED_QUESTIONS = [
  'Which vessel is the most profitable?',
  'What is the average revenue this month?',
  'Which trip generated the highest profit?',
  'Forecast next month’s revenue.',
  'What are our main expense categories?',
];

export const OceanAIView: React.FC = () => {
  const { vessels, trips, sales, expenses, monthlySeries, kpis, backendConnected } = useMaritime();
  const { theme } = useTheme();
  const [backendAnalysis, setBackendAnalysis] = useState<AiAnalysisDTO | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!backendConnected) {
      setBackendAnalysis(null);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const res = await aiApi.analyse();
        if (active) setBackendAnalysis(res);
      } catch {
        // Keep local analytics fallback if unavailable
      }
    })();
    return () => {
      active = false;
    };
  }, [backendConnected, trips.length, sales.length, expenses.length]);

  const analytics = useMemo(() => {
    const vesselStats = backendAnalysis?.vesselProfitability?.length
      ? backendAnalysis.vesselProfitability.map((v) => ({
          name: v.vesselName,
          registration: v.registration,
          rev: Number(v.revenue),
          exp: Number(v.expenses),
          net: Number(v.netProfit),
        }))
      : vessels
          .map((v) => {
            const rev = sales.filter((s) => s.vesselId === v.id).reduce((sum, s) => sum + s.totalAmount, 0);
            const exp = expenses.filter((e) => e.vesselId === v.id).reduce((sum, e) => sum + e.amount, 0);
            const net = rev - exp;
            return { name: v.name, registration: v.registration, rev, exp, net };
          })
          .sort((a, b) => b.net - a.net);

    const bestVessel = vesselStats[0];

    const tripStats = trips
      .map((t) => {
        const rev =
          sales.filter((s) => s.tripId === t.id).reduce((sum, s) => sum + s.totalAmount, 0) ||
          t.estimatedRevenue;
        const exp = expenses.filter((e) => e.tripId === t.id).reduce((sum, e) => sum + e.amount, 0);
        return { code: t.code, vessel: vessels.find((v) => v.id === t.vesselId)?.name, rev, exp, net: rev - exp };
      })
      .sort((a, b) => b.net - a.net);

    const bestTrip = tripStats[0];

    const expenseTotals = (['Fuel', 'Maintenance', 'Ice', 'Provisions', 'Other'] as const)
      .map((cat) => ({
        category: cat,
        total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const avgTripRevenue = trips.length > 0 ? Math.round(kpis.totalRevenue / trips.length) : 0;

    const recent3 = monthlySeries.slice(-3);
    const meanRecentRev = Math.round(
      recent3.reduce((s, m) => s + m.recettes, 0) / Math.max(1, recent3.length)
    );
    const meanRecentCatch = Math.round(
      recent3.reduce((s, m) => s + m.captureKg, 0) / Math.max(1, recent3.length)
    );

    const forecastSeries = backendAnalysis?.forecastSeries?.length
      ? backendAnalysis.forecastSeries.map((pt) => ({
          month: normalizeMonthLabel(pt.month),
          historique: pt.historique != null ? Number(pt.historique) : null,
          prevision: pt.prevision != null ? Number(pt.prevision) : null,
        }))
      : [
          ...monthlySeries.slice(-5).map((m) => ({
            month: m.month,
            historique: m.recettes,
            prevision: null as number | null,
          })),
          {
            month: 'Dec (Est.)',
            historique: null as number | null,
            prevision: Math.round(meanRecentRev * 1.04),
          },
          {
            month: 'Jan (Est.)',
            historique: null as number | null,
            prevision: Math.round(meanRecentRev * 0.96),
          },
          {
            month: 'Feb (Est.)',
            historique: null as number | null,
            prevision: Math.round(meanRecentRev * 1.08),
          },
        ];

    return {
      vesselStats,
      bestVessel,
      bestTrip,
      expenseTotals,
      avgTripRevenue,
      meanRecentRev,
      meanRecentCatch,
      forecastSeries,
    };
  }, [backendAnalysis, vessels, trips, sales, expenses, monthlySeries, kpis]);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'assistant',
      timestamp: 'Now',
      content:
        'Hello. I am Bahripay Ocean AI. Ask me anything about your fleet profitability, operating expenses, or catch forecasts.',
      highlights: [
        {
          label: 'Leading Vessel',
          value: analytics.bestVessel ? analytics.bestVessel.name : '—',
        },
        {
          label: 'Overall Net Margin',
          value: `${kpis.totalRevenue > 0 ? Math.round((kpis.netProfit / kpis.totalRevenue) * 100) : 0}%`,
        },
      ],
    },
  ]);
  const [input, setInput] = useState('');

  const buildAnswer = (question: string): AIMessage => {
    const q = question.toLowerCase();
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (q.includes('vessel') || q.includes('boat') || q.includes('profitable')) {
      const top = analytics.bestVessel;
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: top
          ? `Based on recorded sales and operating expenses, "${top.name}" (${top.registration}) is currently the most profitable vessel with a net profit of ${top.net.toLocaleString('en-US')} DH on ${top.rev.toLocaleString('en-US')} DH in revenue.`
          : 'No vessel data available.',
        highlights: analytics.vesselStats.slice(0, 3).map((v) => ({
          label: v.name,
          value: `${v.net.toLocaleString('en-US')} DH net`,
        })),
      };
    }

    if (q.includes('average') || q.includes('revenue')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: `For the current period, total revenue stands at ${Math.round(kpis.totalRevenue).toLocaleString('en-US')} DH, averaging ${analytics.avgTripRevenue.toLocaleString('en-US')} DH per recorded fishing trip.`,
        highlights: [
          { label: 'Monthly Revenue', value: `${Math.round(kpis.totalRevenue).toLocaleString('en-US')} DH` },
          { label: 'Average / Trip', value: `${analytics.avgTripRevenue.toLocaleString('en-US')} DH` },
        ],
      };
    }

    if (q.includes('trip') || q.includes('profit') || q.includes('highest')) {
      const bt = analytics.bestTrip;
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: bt
          ? `The highest-performing trip is ${bt.code} (${bt.vessel || 'Vessel'}), generating ${bt.net.toLocaleString('en-US')} DH in net profit after deducting ${bt.exp.toLocaleString('en-US')} DH in trip expenses.`
          : 'No trips recorded.',
        highlights: bt
          ? [
              { label: 'Trip', value: bt.code },
              { label: 'Gross Revenue', value: `${bt.rev.toLocaleString('en-US')} DH` },
              { label: 'Net Profit', value: `${bt.net.toLocaleString('en-US')} DH` },
            ]
          : undefined,
      };
    }

    if (q.includes('forecast') || q.includes('next') || q.includes('predict')) {
      const estRev = Math.round(analytics.meanRecentRev * 1.04);
      const estKg = Math.round(analytics.meanRecentCatch * 1.03);
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: `Based on available operational history, Ocean AI projects next month’s revenue at approximately ${estRev.toLocaleString('en-US')} DH for a total catch volume near ${estKg.toLocaleString('en-US')} kg.`,
        highlights: [
          { label: 'Estimated Revenue (Forecast)', value: `${estRev.toLocaleString('en-US')} DH` },
          { label: 'Projected Catch', value: `${estKg.toLocaleString('en-US')} kg` },
        ],
      };
    }

    if (q.includes('expense') || q.includes('cost') || q.includes('fuel') || q.includes('categor')) {
      const topExp = analytics.expenseTotals[0];
      const pct =
        kpis.totalExpenses > 0 ? Math.round((topExp.total / kpis.totalExpenses) * 100) : 0;
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: `Your top expense category is "${topExp.category}" at ${topExp.total.toLocaleString('en-US')} DH (${pct}% of total expenses). Optimizing transit cruising speeds and bulk refueling could save an estimated 6–9% on this line item.`,
        highlights: analytics.expenseTotals.slice(0, 3).map((e) => ({
          label: e.category,
          value: `${e.total.toLocaleString('en-US')} DH`,
        })),
      };
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: now,
      content: `Fleet-wide summary (${vessels.length} vessels, ${trips.length} trips): cumulative revenue of ${Math.round(kpis.totalRevenue).toLocaleString('en-US')} DH and net profit of ${Math.round(kpis.netProfit).toLocaleString('en-US')} DH. Choose a suggested prompt for a deeper breakdown.`,
      highlights: [
        { label: 'Net Profit', value: `${Math.round(kpis.netProfit).toLocaleString('en-US')} DH` },
        { label: 'Total Volume', value: `${kpis.totalCatchKg.toLocaleString('en-US')} kg` },
      ],
    };
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || asking) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (backendConnected) {
      setAsking(true);
      try {
        const res = await aiApi.ask(trimmed);
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: res.answer,
          timestamp: res.timestamp || now,
          highlights: res.highlights,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const errMsg: AIMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          content: `Unable to reach Ocean AI at the moment: ${extractApiErrorMessage(err)}`,
          timestamp: now,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setAsking(false);
      }
      return;
    }

    const aiMsg = buildAnswer(trimmed);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const axisColor = theme === 'dark' ? '#7DDCEB' : '#0A4565';
  const gridStroke = theme === 'dark' ? 'rgba(125,220,235,0.12)' : 'rgba(10,69,101,0.1)';

  return (
    <div className="space-y-6">
      {/* Header + Status Pill */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight flex items-center gap-2.5 text-[#062B45] dark:text-[#F8FAFC]">
            <BrainCircuit className="w-7 h-7 text-[#16C5C0]" />
            <span>Ocean AI — Decision Intelligence</span>
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Comparative vessel analysis, seasonal projections, and Bahripay conversational assistant.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/75 dark:bg-[#16C5C0]/15 backdrop-blur-xl border border-[#16C5C0]/35 text-xs text-[#062B45] dark:text-[#7DDCEB]">
          {asking ? <Loader2 className="w-4 h-4 text-[#16C5C0] shrink-0 animate-spin" /> : <Info className="w-4 h-4 text-[#16C5C0] shrink-0" />}
          <span>
            {backendAnalysis
              ? `Live intelligence · ${backendAnalysis.historicalTripsCount} trips analyzed`
              : `Live fleet intelligence · ${trips.length} trips analyzed`}
          </span>
        </div>
      </div>

      {/* Main Split: Conversational Assistant + Predictive Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Chat Workspace */}
        <FloatingGlassCard
          tiltEnabled={false}
          className="xl:col-span-5 rounded-3xl flex flex-col h-[580px] overflow-hidden shadow-[0_14px_42px_rgba(22,197,192,0.12)]"
        >
          <div className="p-4 sm:p-5 border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/15 flex items-center justify-between bg-gradient-to-r from-[#062B45] to-[#0A4565] text-[#F8FAFC]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#16C5C0]/20 text-[#16C5C0]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-semibold text-sm">Ocean AI Assistant</div>
                <div className="text-[11px] text-[#7DDCEB]">Live fleet performance analysis</div>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28 }}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-[#16C5C0] text-[#062B45] font-medium'
                      : 'bg-[#F1F6FA]/90 dark:bg-[#041826]/85 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 text-[#062B45] dark:text-[#F8FAFC]'
                  }`}
                >
                  <p>{m.content}</p>
                  {m.highlights && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#0A4565]/12 dark:border-[#7DDCEB]/15 grid grid-cols-2 gap-2">
                      {m.highlights.map((h) => (
                        <div key={h.label} className="text-[11px]">
                          <div className="opacity-65">{h.label}</div>
                          <div className="font-mono font-bold text-[#0A4565] dark:text-[#16C5C0]">
                            {h.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] opacity-55 mt-1 px-1">{m.timestamp}</span>
              </motion.div>
            ))}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2.5 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 flex gap-2 overflow-x-auto">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-xl bg-[#F1F6FA]/90 dark:bg-[#041826]/85 hover:bg-[#16C5C0]/20 text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors border border-[#0A4565]/10 dark:border-[#7DDCEB]/12"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3.5 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/12 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your fleet..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F1F6FA]/90 dark:bg-[#041826]/85 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
            />
            <MagneticButton
              type="submit"
              aria-label="Send question"
              className="p-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#19d8d2] text-[#062B45] cursor-pointer shadow-md shadow-[#16C5C0]/25"
            >
              <Send className="w-4 h-4" />
            </MagneticButton>
          </form>
        </FloatingGlassCard>

        {/* Right Predictive Analytics */}
        <div className="xl:col-span-7 space-y-6">
          {/* Forecast Chart */}
          <FloatingGlassCard tiltEnabled={false} className="p-5 sm:p-6 rounded-3xl" delay={0.08}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#16C5C0]" />
                  <span>Revenue Projection (3-Month Forecast)</span>
                </h2>
                <p className="text-xs opacity-70">
                  Comparison between recent actual history and seasonal projection
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0A4565] dark:bg-[#7DDCEB]" />
                  Historical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#16C5C0]" />
                  Forecast
                </span>
              </div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.forecastSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      `${Number(v ?? 0).toLocaleString('en-US')} DH`,
                      name === 'historique' ? 'Historical' : 'Forecast',
                    ]}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#062B45' : '#FFFFFF',
                      borderColor: 'rgba(22,197,192,0.35)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="historique"
                    stroke={theme === 'dark' ? '#7DDCEB' : '#0A4565'}
                    fill={theme === 'dark' ? '#7DDCEB' : '#0A4565'}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="prevision"
                    stroke="#16C5C0"
                    strokeDasharray="5 4"
                    fill="#16C5C0"
                    fillOpacity={0.22}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </FloatingGlassCard>

          {/* Vessel Comparison + Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FloatingGlassCard tiltEnabled={false} className="p-5 rounded-3xl" delay={0.14}>
              <h3 className="font-display font-semibold text-base mb-3">
                Net Profit by Vessel
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.vesselStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="registration"
                      tick={{ fill: axisColor, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: axisColor, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(v) => [`${Number(v ?? 0).toLocaleString('en-US')} DH`, 'Net Profit']}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#062B45' : '#FFFFFF',
                        borderColor: 'rgba(22,197,192,0.35)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="net" fill="#16C5C0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FloatingGlassCard>

            <FloatingGlassCard className="p-5 rounded-3xl space-y-3" delay={0.18}>
              <h3 className="font-display font-semibold text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#16C5C0]" />
                <span>Optimization Recommendations</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F1F6FA]/85 dark:bg-[#041826]/75 border border-[#0A4565]/10 dark:border-[#7DDCEB]/12">
                  <div className="font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                    Fuel Optimization (#1 Cost Driver)
                  </div>
                  <p className="opacity-75 mt-1">
                    Reducing return transit speed by 1.2 knots from Rochebonne cuts estimated diesel consumption by 7.5%.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F6FA]/85 dark:bg-[#041826]/75 border border-[#0A4565]/10 dark:border-[#7DDCEB]/12">
                  <div className="font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                    Peak Season Window: May – July
                  </div>
                  <p className="opacity-75 mt-1">
                    Schedule hull careening and dry-dock maintenance in Jan–Feb to preserve 100% summer availability.
                  </p>
                </div>
              </div>
            </FloatingGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
