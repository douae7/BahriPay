import React, { useMemo, useState } from 'react';
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
  Send,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMaritime } from '../../context/MaritimeContext';
import { useTheme } from '../../context/ThemeContext';
import { AIMessage } from '../../types/maritime';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

const SUGGESTED_QUESTIONS = [
  'Quel bateau est le plus rentable ?',
  'Quelle est la moyenne des recettes ce mois-ci ?',
  'Quelle sortie a généré le plus de bénéfices ?',
  'Prévoir les revenus du prochain mois.',
  'Quels sont les principaux postes de dépenses ?',
];

export const OceanAIView: React.FC = () => {
  const { vessels, trips, sales, expenses, monthlySeries, kpis } = useMaritime();
  const { theme } = useTheme();

  // Compute real live metrics from current app state for transparent demo responses
  const analytics = useMemo(() => {
    const vesselStats = vessels
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

    const expenseTotals = ['Carburant', 'Entretien', 'Glace', 'Nourriture', 'Autres'].map((cat) => ({
      category: cat,
      total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    })).sort((a, b) => b.total - a.total);

    const avgTripRevenue = trips.length > 0 ? Math.round(kpis.totalRevenue / trips.length) : 0;

    // Trend projection based on last 3 months mean
    const recent3 = monthlySeries.slice(-3);
    const meanRecentRev = Math.round(
      recent3.reduce((s, m) => s + m.recettes, 0) / Math.max(1, recent3.length)
    );
    const meanRecentCatch = Math.round(
      recent3.reduce((s, m) => s + m.captureKg, 0) / Math.max(1, recent3.length)
    );

    const forecastSeries = [
      ...monthlySeries.slice(-5).map((m) => ({
        month: m.month,
        historique: m.recettes,
        prevision: null as number | null,
      })),
      {
        month: 'Déc (Est.)',
        historique: null as number | null,
        prevision: Math.round(meanRecentRev * 1.04),
      },
      {
        month: 'Jan (Est.)',
        historique: null as number | null,
        prevision: Math.round(meanRecentRev * 0.96),
      },
      {
        month: 'Fév (Est.)',
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
  }, [vessels, trips, sales, expenses, monthlySeries, kpis]);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'assistant',
      timestamp: 'Maintenant',
      content:
        'Bonjour. Je suis Ocean AI de Bahripay (mode démonstration analytique connecté à vos données de session). Posez-moi une question sur la rentabilité de vos navires, vos dépenses ou vos prévisions de captures.',
      highlights: [
        {
          label: 'Navire leader',
          value: analytics.bestVessel ? analytics.bestVessel.name : '—',
        },
        {
          label: 'Marge nette globale',
          value: `${kpis.totalRevenue > 0 ? Math.round((kpis.netProfit / kpis.totalRevenue) * 100) : 0}%`,
        },
      ],
    },
  ]);
  const [input, setInput] = useState('');

  const buildAnswer = (question: string): AIMessage => {
    const q = question.toLowerCase();
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (q.includes('bateau') || q.includes('rentable') || q.includes('navire')) {
      const top = analytics.bestVessel;
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: top
          ? `D’après l’analyse des ventes et charges enregistrées, « ${top.name} » (${top.registration}) est actuellement le navire le plus rentable avec un bénéfice net de ${top.net.toLocaleString('fr-FR')} € pour ${top.rev.toLocaleString('fr-FR')} € de recettes.`
          : 'Aucune donnée de navire disponible.',
        highlights: analytics.vesselStats.slice(0, 3).map((v) => ({
          label: v.name,
          value: `${v.net.toLocaleString('fr-FR')} € net`,
        })),
      };
    }

    if (q.includes('moyenne') || q.includes('recette')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: `Sur la période en cours, le total des recettes s’élève à ${Math.round(kpis.totalRevenue).toLocaleString('fr-FR')} €, soit une moyenne de ${analytics.avgTripRevenue.toLocaleString('fr-FR')} € par sortie de pêche enregistrée.`,
        highlights: [
          { label: 'Recettes mois', value: `${Math.round(kpis.totalRevenue).toLocaleString('fr-FR')} €` },
          { label: 'Moyenne / sortie', value: `${analytics.avgTripRevenue.toLocaleString('fr-FR')} €` },
        ],
      };
    }

    if (q.includes('sortie') || q.includes('bénéfice') || q.includes('marée')) {
      const bt = analytics.bestTrip;
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: bt
          ? `La sortie la plus performante est ${bt.code} (${bt.vessel || 'Navire'}), qui a généré ${bt.net.toLocaleString('fr-FR')} € de bénéfice net après déduction de ${bt.exp.toLocaleString('fr-FR')} € de frais de marée.`
          : 'Aucune sortie enregistrée.',
        highlights: bt
          ? [
              { label: 'Sortie', value: bt.code },
              { label: 'Recette brute', value: `${bt.rev.toLocaleString('fr-FR')} €` },
              { label: 'Bénéfice net', value: `${bt.net.toLocaleString('fr-FR')} €` },
            ]
          : undefined,
      };
    }

    if (q.includes('prévoir') || q.includes('prochain') || q.includes('prévision')) {
      const estRev = Math.round(analytics.meanRecentRev * 1.04);
      const estKg = Math.round(analytics.meanRecentCatch * 1.03);
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: `En mode démonstration (moyenne glissante des 3 derniers mois pondérée par la saisonnalité hivernale), Ocean AI estime pour le mois prochain un chiffre d’affaires de ${estRev.toLocaleString('fr-FR')} € pour un volume de captures proche de ${estKg.toLocaleString('fr-FR')} kg.`,
        highlights: [
          { label: 'Revenu estimé (Démo)', value: `${estRev.toLocaleString('fr-FR')} €` },
          { label: 'Captures prévues', value: `${estKg.toLocaleString('fr-FR')} kg` },
        ],
      };
    }

    if (q.includes('dépense') || q.includes('poste') || q.includes('coût')) {
      const topExp = analytics.expenseTotals[0];
      const pct =
        kpis.totalExpenses > 0 ? Math.round((topExp.total / kpis.totalExpenses) * 100) : 0;
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: now,
        content: `Le premier poste de charge est « ${topExp.category} » avec ${topExp.total.toLocaleString('fr-FR')} € (${pct}% des dépenses totales). Une optimisation des régimes de croisière et du groupage carburant permettrait d’économiser environ 6 à 9% sur ce poste.`,
        highlights: analytics.expenseTotals.slice(0, 3).map((e) => ({
          label: e.category,
          value: `${e.total.toLocaleString('fr-FR')} €`,
        })),
      };
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: now,
      content: `Analyse globale de votre flotte (${vessels.length} navires, ${trips.length} sorties) : recettes cumulées de ${Math.round(kpis.totalRevenue).toLocaleString('fr-FR')} € pour un bénéfice net de ${Math.round(kpis.netProfit).toLocaleString('fr-FR')} €. Utilisez une des requêtes suggérées pour un focus détaillé.`,
      highlights: [
        { label: 'Bénéfice net', value: `${Math.round(kpis.netProfit).toLocaleString('fr-FR')} €` },
        { label: 'Volume total', value: `${kpis.totalCatchKg.toLocaleString('fr-FR')} kg` },
      ],
    };
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: now,
    };
    const aiMsg = buildAnswer(trimmed);
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  const axisColor = theme === 'dark' ? '#7DDCEB' : '#0A4565';
  const gridStroke = theme === 'dark' ? 'rgba(125,220,235,0.12)' : 'rgba(10,69,101,0.1)';

  return (
    <div className="space-y-6">
      {/* Header + Explicit Demo State Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight flex items-center gap-2.5 text-[#062B45] dark:text-[#F8FAFC]">
            <BrainCircuit className="w-7 h-7 text-[#16C5C0]" />
            <span>Ocean AI — Intelligence Décisionnelle</span>
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Analyse comparative des navires, projections saisonnières et assistant conversationnel Bahripay.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/75 dark:bg-[#16C5C0]/15 backdrop-blur-xl border border-[#16C5C0]/35 text-xs text-[#062B45] dark:text-[#7DDCEB]">
          <Info className="w-4 h-4 text-[#16C5C0] shrink-0" />
          <span>
            Mode démonstration : calculs sur historique local · Prêt pour API Spring Boot / LLM
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
                <div className="font-display font-semibold text-sm">Assistant Ocean AI</div>
                <div className="text-[11px] text-[#7DDCEB]">Analyse de l’armement en direct</div>
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
              placeholder="Posez une question sur votre flotte..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F1F6FA]/90 dark:bg-[#041826]/85 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
            />
            <MagneticButton
              type="submit"
              aria-label="Envoyer la question"
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
                  <span>Projection des revenus (Simulation 3 mois)</span>
                </h2>
                <p className="text-xs opacity-70">
                  Comparaison entre l’historique récent et l’estimation saisonnière simulée
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0A4565] dark:bg-[#7DDCEB]" />
                  Historique
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#16C5C0]" />
                  Prévision Démo
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
                    formatter={(v) => [`${Number(v ?? 0).toLocaleString('fr-FR')} €`]}
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
                Rentabilité nette par navire
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
                      formatter={(v) => [`${Number(v ?? 0).toLocaleString('fr-FR')} €`, 'Net']}
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
                <span>Recommandations d’optimisation</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F1F6FA]/85 dark:bg-[#041826]/75 border border-[#0A4565]/10 dark:border-[#7DDCEB]/12">
                  <div className="font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                    Optimisation carburant (Poste n°1)
                  </div>
                  <p className="opacity-75 mt-1">
                    Réduire la vitesse de transit de 1,2 nœud sur les retours de Rochebonne diminue la consommation estimée de 7,5%.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#F1F6FA]/85 dark:bg-[#041826]/75 border border-[#0A4565]/10 dark:border-[#7DDCEB]/12">
                  <div className="font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                    Fenêtre de forte activité : Mai – Juillet
                  </div>
                  <p className="opacity-75 mt-1">
                    Planifier les carénages d’entretien en Janvier–Février pour préserver 100% de disponibilité estivale.
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
