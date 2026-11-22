import React, { useMemo, useState } from 'react';
import {
  Anchor,
  Compass,
  Fish,
  Plus,
  Ship,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useMaritime } from '../../context/MaritimeContext';
import {
  CatchEntry,
  FishSpecies,
  FishingTrip,
  TripStatus,
  Vessel,
  VesselStatus,
} from '../../types/maritime';
import { SafeImage } from '../common/SafeImage';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

const SPECIES_LIST: FishSpecies[] = [
  'Bar de ligne',
  'Dorade royale',
  'Thon rouge',
  'Merlu blanc',
  'Langoustine',
  'Sardine',
  'Maquereau',
  'Sole commune',
];

export const FleetAndTripsView: React.FC = () => {
  const {
    vessels,
    sailors,
    trips,
    addVessel,
    updateVessel,
    addTrip,
    updateTripStatus,
    generateTripPayments,
    setRoute,
  } = useMaritime();

  const [activeTab, setActiveTab] = useState<'trips' | 'vessels'>('trips');
  const [tripStatusFilter, setTripStatusFilter] = useState<string>('ALL');
  const [selectedTrip, setSelectedTrip] = useState<FishingTrip | null>(null);

  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [tripVesselId, setTripVesselId] = useState(vessels[0]?.id || '');
  const [tripCrewIds, setTripCrewIds] = useState<string[]>(['sai-1', 'sai-4']);
  const [departureDate, setDepartureDate] = useState('2026-11-22T04:30');
  const [returnDate, setReturnDate] = useState('2026-11-24T16:30');
  const [zone, setZone] = useState('Golfe de Gascogne · Atlantique');
  const [tripStatus, setTripStatus] = useState<TripStatus>('Terminée');
  const [catches, setCatches] = useState<Omit<CatchEntry, 'id' | 'totalValue'>[]>([
    { species: 'Bar de ligne', quantityKg: 950, pricePerKg: 18.5 },
  ]);

  const [vesselModalOpen, setVesselModalOpen] = useState(false);
  const [vName, setVName] = useState('');
  const [vReg, setVReg] = useState('');
  const [vType, setVType] = useState('Chalutier hauturier');
  const [vCap, setVCap] = useState(14000);
  const [vPower, setVPower] = useState(550);
  const [vLen, setVLen] = useState(19.5);
  const [vPort, setVPort] = useState('Concarneau');

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => tripStatusFilter === 'ALL' || t.status === tripStatusFilter);
  }, [trips, tripStatusFilter]);

  const tripPreviewTotals = useMemo(() => {
    const kg = catches.reduce((s, c) => s + Number(c.quantityKg || 0), 0);
    const rev = catches.reduce(
      (s, c) => s + Number(c.quantityKg || 0) * Number(c.pricePerKg || 0),
      0
    );
    return { kg, rev: Math.round(rev * 100) / 100 };
  }, [catches]);

  const toggleCrewMember = (id: string) => {
    setTripCrewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCatchRow = () => {
    setCatches((prev) => [...prev, { species: 'Merlu blanc', quantityKg: 500, pricePerKg: 7.5 }]);
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCatches: CatchEntry[] = catches.map((c, idx) => ({
      id: `cat-${Date.now()}-${idx}`,
      species: c.species,
      quantityKg: Number(c.quantityKg) || 0,
      pricePerKg: Number(c.pricePerKg) || 0,
      totalValue: Math.round((Number(c.quantityKg) || 0) * (Number(c.pricePerKg) || 0) * 100) / 100,
    }));

    addTrip({
      vesselId: tripVesselId,
      crewIds: tripCrewIds,
      departureDate,
      returnDate,
      zone,
      status: tripStatus,
      catches: formattedCatches,
      totalCatchKg: tripPreviewTotals.kg,
      estimatedRevenue: tripPreviewTotals.rev,
    });
    setTripModalOpen(false);
  };

  const handleSaveVessel = (e: React.FormEvent) => {
    e.preventDefault();
    addVessel({
      name: vName.trim(),
      registration: vReg.trim().toUpperCase(),
      type: vType,
      capacityKg: Number(vCap),
      enginePowerHp: Number(vPower),
      lengthMeters: Number(vLen),
      homePort: vPort,
      status: 'Disponible',
      lastMaintenanceDate: new Date().toISOString().slice(0, 10),
    });
    setVesselModalOpen(false);
    setVName('');
    setVReg('');
  };

  const handleCycleVesselStatus = (vessel: Vessel) => {
    const order: VesselStatus[] = ['Disponible', 'En mer', 'En maintenance'];
    const next = order[(order.indexOf(vessel.status) + 1) % order.length];
    updateVessel({ ...vessel, status: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
            Bateaux &amp; Sorties de pêche
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Supervisez la disponibilité de la flotte et enregistrez les marées avec calcul automatique des recettes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setVesselModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-sm font-semibold hover:border-[#16C5C0] transition-colors cursor-pointer"
          >
            <Ship className="w-4 h-4 text-[#16C5C0]" />
            <span>Ajouter un bateau</span>
          </button>

          <MagneticButton
            type="button"
            onClick={() => {
              if (!vessels.some((v) => v.id === tripVesselId) && vessels[0]) {
                setTripVesselId(vessels[0].id);
              }
              if (!tripCrewIds.some((id) => sailors.some((s) => s.id === id)) && sailors.length > 0) {
                setTripCrewIds(sailors.slice(0, 2).map((s) => s.id));
              }
              setTripModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#19d6d1] text-[#062B45] font-semibold text-sm shadow-lg shadow-[#16C5C0]/25 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer une sortie</span>
          </MagneticButton>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18">
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-[#16C5C0] text-[#062B45]'
                : 'text-[#0A4565]/75 dark:text-[#7DDCEB]/80'
            }`}
          >
            Sorties de pêche ({trips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vessels')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'vessels'
                ? 'bg-[#16C5C0] text-[#062B45]'
                : 'text-[#0A4565]/75 dark:text-[#7DDCEB]/80'
            }`}
          >
            Flotte de navires ({vessels.length})
          </button>
        </div>

        {activeTab === 'trips' && (
          <select
            value={tripStatusFilter}
            onChange={(e) => setTripStatusFilter(e.target.value)}
            aria-label="Filtrer les sorties par statut"
            className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#07263C]/80 backdrop-blur-xl border border-[#0A4565]/12 dark:border-[#7DDCEB]/18 text-xs sm:text-sm"
          >
            <option value="ALL">Toutes les sorties</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminées</option>
            <option value="Planifiée">Planifiées</option>
          </select>
        )}
      </div>

      {/* TAB 1: SORTIES DE PÊCHE */}
      {activeTab === 'trips' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTrips.map((trip, idx) => {
            const vessel = vessels.find((v) => v.id === trip.vesselId);
            const crewMembers = sailors.filter((s) => trip.crewIds.includes(s.id));
            return (
              <FloatingGlassCard
                key={trip.id}
                delay={idx * 0.04}
                className="p-5 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#16C5C0]">
                        <span>{trip.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{trip.status}</span>
                      </div>
                      <h2 className="font-display font-bold text-lg sm:text-xl mt-1">
                        {vessel?.name || 'Navire inconnu'}
                      </h2>
                      <div className="text-xs text-[#0A4565]/70 dark:text-[#7DDCEB]/75 flex items-center gap-1.5 mt-1">
                        <Compass className="w-3.5 h-3.5 text-[#16C5C0]" />
                        <span>{trip.zone}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono tabular-nums">
                      <div className="text-lg font-bold text-[#0A4565] dark:text-[#16C5C0]">
                        {trip.estimatedRevenue.toLocaleString('fr-FR')} €
                      </div>
                      <div className="text-xs text-[#0A4565]/65 dark:text-[#7DDCEB]/75">
                        {trip.totalCatchKg.toLocaleString('fr-FR')} kg
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 space-y-1.5">
                    {trip.catches.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between text-xs text-[#0A4565]/85 dark:text-[#F8FAFC]/80"
                      >
                        <span className="flex items-center gap-1.5">
                          <Fish className="w-3.5 h-3.5 text-[#16C5C0]" />
                          {c.species}
                        </span>
                        <span className="font-mono tabular-nums">
                          {c.quantityKg.toLocaleString('fr-FR')} kg × {c.pricePerKg.toFixed(2)} € ={' '}
                          <strong>{c.totalValue.toLocaleString('fr-FR')} €</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#0A4565]/75 dark:text-[#7DDCEB]/80">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {crewMembers.length} marins ({crewMembers.map((m) => m.lastName).join(', ')})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {trip.status === 'En cours' && (
                      <button
                        type="button"
                        onClick={() => updateTripStatus(trip.id, 'Terminée')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Clôturer marée
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedTrip(trip)}
                      className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-[#041826]/70 font-semibold hover:text-[#16C5C0] cursor-pointer"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </FloatingGlassCard>
            );
          })}
        </div>
      )}

      {/* TAB 2: FLOTTE DE NAVIRES */}
      {activeTab === 'vessels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vessels.map((vessel, idx) => {
            const captain = sailors.find((s) => s.id === vessel.captainId);
            const vesselTripsCount = trips.filter((t) => t.vesselId === vessel.id).length;
            return (
              <FloatingGlassCard
                key={vessel.id}
                delay={idx * 0.05}
                className="overflow-hidden flex flex-col sm:flex-row p-0"
              >
                <div className="sm:w-44 h-44 sm:h-auto shrink-0 overflow-hidden">
                  <SafeImage
                    src={vessel.imageUrl}
                    alt={vessel.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-[#16C5C0]">{vessel.registration}</span>
                      <button
                        type="button"
                        onClick={() => handleCycleVesselStatus(vessel)}
                        title="Cliquer pour modifier la disponibilité"
                        className={`text-xs font-semibold cursor-pointer ${
                          vessel.status === 'Disponible'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : vessel.status === 'En mer'
                            ? 'text-[#16C5C0]'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {vessel.status}
                      </button>
                    </div>
                    <h2 className="font-display font-bold text-xl mt-0.5">{vessel.name}</h2>
                    <div className="text-xs text-[#0A4565]/75 dark:text-[#7DDCEB]/75">
                      {vessel.type} · Port d’attache : {vessel.homePort}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 text-xs font-mono tabular-nums">
                    <div>
                      <div className="text-[10px] font-sans opacity-65">Capacité</div>
                      <div className="font-semibold">{(vessel.capacityKg / 1000).toFixed(1)} T</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans opacity-65">Puissance</div>
                      <div className="font-semibold">{vessel.enginePowerHp} CV</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans opacity-65">Sorties</div>
                      <div className="font-semibold">{vesselTripsCount}</div>
                    </div>
                  </div>

                  <div className="text-xs text-[#0A4565]/70 dark:text-[#F8FAFC]/65 flex items-center justify-between">
                    <span>
                      Patron : {captain ? `${captain.firstName} ${captain.lastName}` : 'À désigner'}
                    </span>
                    <span className="text-[11px]">Révision : {vessel.lastMaintenanceDate}</span>
                  </div>
                </div>
              </FloatingGlassCard>
            );
          })}
        </div>
      )}

      {/* MODAL: DÉTAIL D'UNE SORTIE */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
            onClick={() => setSelectedTrip(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-[#16C5C0]">{selectedTrip.code}</div>
                <h2 className="font-display font-bold text-xl">
                  {vessels.find((v) => v.id === selectedTrip.vesselId)?.name}
                </h2>
                <p className="text-xs opacity-75 mt-0.5">{selectedTrip.zone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="p-1.5 rounded-lg hover:bg-[#0A4565]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl bg-[#F1F6FA] dark:bg-[#041826]">
              <div>
                <div className="opacity-65">Départ</div>
                <div className="font-mono font-semibold mt-0.5">
                  {selectedTrip.departureDate.replace('T', ' ')}
                </div>
              </div>
              <div>
                <div className="opacity-65">Retour</div>
                <div className="font-mono font-semibold mt-0.5">
                  {selectedTrip.returnDate.replace('T', ' ')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold">Détail des captures</div>
              {selectedTrip.catches.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#F1F6FA] dark:bg-[#041826]/70"
                >
                  <span>{c.species}</span>
                  <span className="font-mono tabular-nums">
                    {c.quantityKg} kg · {c.totalValue.toLocaleString('fr-FR')} €
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  generateTripPayments(selectedTrip.id);
                  setSelectedTrip(null);
                  setRoute('finances');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-xs cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Calculer &amp; voir les parts équipage</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#0A4565]/10 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENREGISTRER UNE NOUVELLE SORTIE */}
      {tripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
            onClick={() => setTripModalOpen(false)}
          />
          <form
            onSubmit={handleSaveTrip}
            className="relative z-10 w-full max-w-2xl rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <Anchor className="w-5 h-5 text-[#16C5C0]" />
                <span>Enregistrer une sortie de pêche</span>
              </h2>
              <button
                type="button"
                onClick={() => setTripModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#0A4565]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Navire</label>
                <select
                  value={tripVesselId}
                  onChange={(e) => setTripVesselId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                >
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registration})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Statut de la sortie</label>
                <select
                  value={tripStatus}
                  onChange={(e) => setTripStatus(e.target.value as TripStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                >
                  <option value="Terminée">Terminée (débarquée)</option>
                  <option value="En cours">En cours (en mer)</option>
                  <option value="Planifiée">Planifiée</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date de départ</label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date de retour</label>
                <input
                  type="datetime-local"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">Zone de pêche</label>
                <input
                  required
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2">
                Sélection de l’équipage ({tripCrewIds.length} sélectionnés)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sailors.map((s) => {
                  const selected = tripCrewIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleCrewMember(s.id)}
                      className={`p-2 rounded-xl text-left text-xs border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#16C5C0]/15 border-[#16C5C0] font-semibold'
                          : 'bg-[#F1F6FA] dark:bg-[#041826] border-transparent opacity-80'
                      }`}
                    >
                      <div className="truncate">{s.firstName} {s.lastName}</div>
                      <div className="text-[10px] opacity-75">{s.grade}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold">Captures par espèce</label>
                <button
                  type="button"
                  onClick={handleAddCatchRow}
                  className="text-xs font-semibold text-[#16C5C0] hover:underline cursor-pointer"
                >
                  + Ajouter une espèce
                </button>
              </div>
              <div className="space-y-2">
                {catches.map((c, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <select
                      value={c.species}
                      onChange={(e) =>
                        setCatches((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, species: e.target.value as FishSpecies } : row
                          )
                        )
                      }
                      className="col-span-5 px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-xs"
                    >
                      {SPECIES_LIST.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      placeholder="kg"
                      value={c.quantityKg}
                      onChange={(e) =>
                        setCatches((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, quantityKg: Number(e.target.value) } : row
                          )
                        )
                      }
                      className="col-span-3 px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-xs font-mono"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min={0.5}
                      placeholder="€/kg"
                      value={c.pricePerKg}
                      onChange={(e) =>
                        setCatches((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, pricePerKg: Number(e.target.value) } : row
                          )
                        )
                      }
                      className="col-span-3 px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setCatches((prev) => prev.filter((_, i) => i !== idx))}
                      className="col-span-1 p-1.5 text-red-500 cursor-pointer"
                      aria-label="Retirer ligne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-[#16C5C0]/12 flex items-center justify-between text-xs sm:text-sm font-mono tabular-nums">
                <span>Total capturé : {tripPreviewTotals.kg.toLocaleString('fr-FR')} kg</span>
                <span className="font-bold text-[#0A4565] dark:text-[#16C5C0]">
                  Recette estimée : {tripPreviewTotals.rev.toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTripModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm cursor-pointer"
              >
                Enregistrer la sortie
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AJOUTER UN BATEAU */}
      {vesselModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
            onClick={() => setVesselModalOpen(false)}
          />
          <form
            onSubmit={handleSaveVessel}
            className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl">Ajouter un navire</h2>
              <button
                type="button"
                onClick={() => setVesselModalOpen(false)}
                className="p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nom du bateau</label>
                <input
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="Ex. Vent d’Ouest"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Immatriculation</label>
                  <input
                    required
                    value={vReg}
                    onChange={(e) => setVReg(e.target.value)}
                    placeholder="CC 940212"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Port d’attache</label>
                  <input
                    required
                    value={vPort}
                    onChange={(e) => setVPort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Type de navire</label>
                <input
                  required
                  value={vType}
                  onChange={(e) => setVType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Capacité (kg)</label>
                  <input
                    type="number"
                    value={vCap}
                    onChange={(e) => setVCap(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Puissance (CV)</label>
                  <input
                    type="number"
                    value={vPower}
                    onChange={(e) => setVPower(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Longueur (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vLen}
                    onChange={(e) => setVLen(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVesselModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-sm cursor-pointer"
              >
                Ajouter le navire
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
