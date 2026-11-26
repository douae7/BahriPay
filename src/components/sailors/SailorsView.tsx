import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  CheckCircle2,
  Edit3,
  FileWarning,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useMaritime } from '../../context/MaritimeContext';
import {
  ContractType,
  Sailor,
  SailorAbsence,
  SailorDocument,
  SailorGrade,
  SailorStatus,
} from '../../types/maritime';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';

const GRADE_WEIGHTS: Record<SailorGrade, number> = {
  Captain: 2.0,
  'First Mate': 1.5,
  Engineer: 1.5,
  Deckhand: 1.0,
  Apprentice: 0.75,
};

export const SailorsView: React.FC = () => {
  const {
    sailors,
    vessels,
    trips,
    payments,
    addSailor,
    updateSailor,
    deleteSailor,
    addSailorAbsence,
    updateSailorDocStatus,
  } = useMaritime();

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedSailorId, setSelectedSailorId] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSailor, setEditingSailor] = useState<Sailor | null>(null);

  // Sailor Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<SailorGrade>('Deckhand');
  const [status, setStatus] = useState<SailorStatus>('Active');
  const [contractType, setContractType] = useState<ContractType>('Share Contract');
  const [contractStart, setContractStart] = useState('2026-01-15');
  const [contractEnd, setContractEnd] = useState('');
  const [vesselId, setVesselId] = useState('ves-1');
  const [portAttache, setPortAttache] = useState('Concarneau');
  const [yearsExperience, setYearsExperience] = useState(5);

  const [absType, setAbsType] = useState<SailorAbsence['type']>('Compensatory Rest');
  const [absStart, setAbsStart] = useState('2026-11-24');
  const [absEnd, setAbsEnd] = useState('2026-11-28');

  const selectedSailor = useMemo(
    () => sailors.find((s) => s.id === selectedSailorId) || null,
    [sailors, selectedSailorId]
  );

  const filteredSailors = useMemo(() => {
    return sailors.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q) ||
        s.portAttache.toLowerCase().includes(q);
      const matchesGrade = gradeFilter === 'ALL' || s.grade === gradeFilter;
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [sailors, search, gradeFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingSailor(null);
    setFirstName('');
    setLastName('');
    setRegistrationNumber(`ENIM-${Math.floor(400000 + Math.random() * 500000)}`);
    setPhone('+33 6 ');
    setEmail('');
    setGrade('Deckhand');
    setStatus('Active');
    setContractType('Share Contract');
    setContractStart(new Date().toISOString().slice(0, 10));
    setContractEnd('');
    setVesselId(vessels[0]?.id || '');
    setPortAttache('Concarneau');
    setYearsExperience(3);
    setFormModalOpen(true);
  };

  const openEditModal = (sailor: Sailor) => {
    setEditingSailor(sailor);
    setFirstName(sailor.firstName);
    setLastName(sailor.lastName);
    setRegistrationNumber(sailor.registrationNumber);
    setPhone(sailor.phone);
    setEmail(sailor.email);
    setGrade(sailor.grade);
    setStatus(sailor.status);
    setContractType(sailor.contractType);
    setContractStart(sailor.contractStart);
    setContractEnd(sailor.contractEnd || '');
    setVesselId(sailor.vesselId || '');
    setPortAttache(sailor.portAttache);
    setYearsExperience(sailor.yearsExperience);
    setFormModalOpen(true);
  };

  const handleSaveSailor = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      registrationNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      grade,
      shareWeight: GRADE_WEIGHTS[grade],
      status,
      contractType,
      contractStart,
      contractEnd: contractEnd || undefined,
      vesselId: vesselId || undefined,
      portAttache,
      yearsExperience: Number(yearsExperience) || 1,
    };

    if (editingSailor) {
      updateSailor({
        ...editingSailor,
        ...payload,
      });
    } else {
      addSailor({
        ...payload,
        documents: [
          { id: `doc-${Date.now()}-1`, name: 'Seafarer Medical Fitness', status: 'Valid', expiryDate: '2027-11-01' },
          { id: `doc-${Date.now()}-2`, name: 'STCW Safety Certificate', status: 'Renewal Due', expiryDate: '2026-12-20' },
        ],
        absences: [],
      });
    }
    setFormModalOpen(false);
  };

  const handleAddAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSailor) return;
    const d1 = new Date(absStart);
    const d2 = new Date(absEnd);
    const diffDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
    addSailorAbsence(selectedSailor.id, {
      type: absType,
      startDate: absStart,
      endDate: absEnd,
      days: diffDays,
    });
  };

  const cycleDocStatus = (sailorId: string, doc: SailorDocument) => {
    const order: SailorDocument['status'][] = ['Valid', 'Renewal Due', 'Missing'];
    const next = order[(order.indexOf(doc.status) + 1) % order.length];
    updateSailorDocStatus(sailorId, doc.id, next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
            Crew Administration
          </h1>
          <p className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
            Complete crew registry, grades, share contracts, absences, and maritime certificates.
          </p>
        </div>
        <MagneticButton
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#19d6d1] text-[#062B45] font-semibold text-sm shadow-lg shadow-[#16C5C0]/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crew Member</span>
        </MagneticButton>
      </div>

      {/* Floating Glass Filters Toolbar */}
      <FloatingGlassCard tiltEnabled={false} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-[#0A4565]/50 dark:text-[#7DDCEB]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, maritime ID, or home port..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/70 dark:bg-[#041826]/70 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            aria-label="Filter by grade"
            className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#041826]/70 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
          >
            <option value="ALL">All Grades</option>
            <option value="Captain">Captain</option>
            <option value="First Mate">First Mate</option>
            <option value="Engineer">Engineer</option>
            <option value="Deckhand">Deckhand</option>
            <option value="Apprentice">Apprentice</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-[#041826]/70 border border-[#0A4565]/10 dark:border-[#7DDCEB]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="At Sea">At Sea</option>
            <option value="On Leave">On Leave</option>
            <option value="Rest">Rest</option>
          </select>
        </div>
      </FloatingGlassCard>

      {/* Desktop Floating Glass Table */}
      <FloatingGlassCard tiltEnabled={false} className="hidden md:block overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12 text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
              <th className="py-3.5 px-5">Crew Member &amp; ID</th>
              <th className="py-3.5 px-4">Grade &amp; Share</th>
              <th className="py-3.5 px-4">Assigned Vessel</th>
              <th className="py-3.5 px-4">Contract</th>
              <th className="py-3.5 px-4">Documents</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A4565]/10 dark:divide-[#7DDCEB]/10 text-sm">
            {filteredSailors.map((sailor) => {
              const vessel = vessels.find((v) => v.id === sailor.vesselId);
              const missingDocs = sailor.documents.filter((d) => d.status !== 'Valid').length;
              return (
                <tr
                  key={sailor.id}
                  onClick={() => setSelectedSailorId(sailor.id)}
                  className="hover:bg-[#16C5C0]/10 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#062B45] dark:text-[#F8FAFC]">
                      {sailor.firstName} {sailor.lastName}
                    </div>
                    <div className="text-xs font-mono text-[#0A4565]/65 dark:text-[#7DDCEB]/70">
                      {sailor.registrationNumber} · {sailor.portAttache}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium">{sailor.grade}</div>
                    <div className="text-xs font-mono tabular-nums text-[#16C5C0]">
                      Coeff. {sailor.shareWeight.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {vessel ? vessel.name : 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div>{sailor.contractType}</div>
                    {sailor.contractEnd && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400">
                        Ends: {sailor.contractEnd}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {missingDocs === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                        <FileWarning className="w-3.5 h-3.5" />
                        {missingDocs} to review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium">{sailor.status}</td>
                  <td
                    className="py-3.5 px-5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(sailor)}
                        title="Edit"
                        className="p-2 rounded-lg hover:bg-[#0A4565]/10 dark:hover:bg-[#7DDCEB]/15 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSailorId === sailor.id) setSelectedSailorId(null);
                          deleteSailor(sailor.id);
                        }}
                        title="Delete"
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSailors.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[#0A4565]/65 dark:text-[#7DDCEB]/70">
                  No crew members match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </FloatingGlassCard>

      {/* Mobile Floating Glass Cards */}
      <div className="md:hidden space-y-3">
        {filteredSailors.map((sailor, idx) => {
          const vessel = vessels.find((v) => v.id === sailor.vesselId);
          return (
            <FloatingGlassCard
              key={sailor.id}
              delay={idx * 0.03}
              onClick={() => setSelectedSailorId(sailor.id)}
              className="p-4 space-y-2.5 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-base">
                    {sailor.firstName} {sailor.lastName}
                  </div>
                  <div className="text-xs font-mono text-[#0A4565]/65 dark:text-[#7DDCEB]/75">
                    {sailor.registrationNumber} · {sailor.grade}
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#16C5C0]">{sailor.status}</span>
              </div>
              <div className="text-xs text-[#0A4565]/80 dark:text-[#F8FAFC]/75 flex flex-wrap gap-x-3 gap-y-1">
                <span>Vessel: {vessel?.name || '—'}</span>
                <span>Share: {sailor.shareWeight.toFixed(2)}</span>
                <span>{sailor.contractType}</span>
              </div>
              <div className="pt-2 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedSailorId(sailor.id)}
                  className="text-xs font-semibold text-[#16C5C0]"
                >
                  Open detailed profile
                </button>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openEditModal(sailor)}
                    className="p-2 rounded-lg bg-[#F1F6FA] dark:bg-[#041826]"
                    aria-label="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSailor(sailor.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </FloatingGlassCard>
          );
        })}
      </div>

      {/* SLIDE-OVER: CREW MEMBER DETAIL */}
      {selectedSailor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#031524]/65 backdrop-blur-sm"
            onClick={() => setSelectedSailorId(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-xl h-full overflow-y-auto p-6 sm:p-7 shadow-2xl border-l border-[#0A4565]/15 dark:border-[#7DDCEB]/18 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#0A4565]/10 dark:border-[#7DDCEB]/12">
              <div>
                <div className="text-xs font-mono text-[#16C5C0]">{selectedSailor.registrationNumber}</div>
                <h2 className="font-display font-bold text-2xl mt-0.5">
                  {selectedSailor.firstName} {selectedSailor.lastName}
                </h2>
                <div className="text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80 mt-1">
                  {selectedSailor.grade} · Coeff. {selectedSailor.shareWeight.toFixed(2)} · {selectedSailor.portAttache}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSailorId(null)}
                className="p-2 rounded-xl hover:bg-[#0A4565]/10 dark:hover:bg-[#7DDCEB]/10 cursor-pointer"
                aria-label="Close profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-[#F1F6FA] dark:bg-[#041826]/80 space-y-2">
                <div className="text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  Contact Info
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-[#16C5C0]" />
                  <span>{selectedSailor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-[#16C5C0]" />
                  <span className="truncate">{selectedSailor.email}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#F1F6FA] dark:bg-[#041826]/80 space-y-1.5">
                <div className="text-xs font-semibold text-[#0A4565]/70 dark:text-[#7DDCEB]/75">
                  Contract &amp; Experience
                </div>
                <div className="text-sm font-semibold">{selectedSailor.contractType}</div>
                <div className="text-xs text-[#0A4565]/75 dark:text-[#F8FAFC]/70">
                  Since {selectedSailor.contractStart} · {selectedSailor.yearsExperience} yrs at sea
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-base">
                  Administrative Documents &amp; Certificates
                </h3>
                <span className="text-[11px] text-[#0A4565]/65 dark:text-[#7DDCEB]/70">
                  Click to cycle status
                </span>
              </div>
              <div className="space-y-2">
                {selectedSailor.documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => cycleDocStatus(selectedSailor.id, doc)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F1F6FA] dark:bg-[#041826]/70 hover:bg-[#16C5C0]/10 transition-colors text-left cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-medium">{doc.name}</div>
                      {doc.expiryDate && (
                        <div className="text-xs text-[#0A4565]/65 dark:text-[#F8FAFC]/55">
                          Expires: {doc.expiryDate}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        doc.status === 'Valid'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : doc.status === 'Renewal Due'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-base mb-3">
                Absences &amp; Leave Tracking
              </h3>
              <form onSubmit={handleAddAbsence} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                <select
                  value={absType}
                  onChange={(e) => setAbsType(e.target.value as typeof absType)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/12 dark:border-[#7DDCEB]/15 text-xs"
                >
                  <option value="Compensatory Rest">Compensatory Rest</option>
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="STCW Training">STCW Training</option>
                  <option value="Medical Leave">Medical Leave</option>
                </select>
                <input
                  type="date"
                  value={absStart}
                  onChange={(e) => setAbsStart(e.target.value)}
                  className="px-2.5 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/12 dark:border-[#7DDCEB]/15 text-xs"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#16C5C0] text-[#062B45] font-semibold text-xs cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="space-y-2">
                {selectedSailor.absences.length === 0 ? (
                  <p className="text-xs text-[#0A4565]/65 dark:text-[#7DDCEB]/70">
                    No absences recorded for this period.
                  </p>
                ) : (
                  selectedSailor.absences.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#F1F6FA] dark:bg-[#041826]/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold">{a.type}</span>
                        <span className="opacity-70 ml-2">
                          {a.startDate} → {a.endDate}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-[#16C5C0]">{a.days} d</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-base mb-3">
                Trip &amp; Settlement History
              </h3>
              <div className="space-y-2 text-xs">
                {trips
                  .filter((t) => t.crewIds.includes(selectedSailor.id))
                  .map((t) => {
                    const pay = payments.find(
                      (p) => p.tripId === t.id && p.sailorId === selectedSailor.id
                    );
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-[#F1F6FA] dark:bg-[#041826]/70 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold">
                            {t.code} · {t.zone}
                          </div>
                          <div className="opacity-70 mt-0.5">
                            {t.departureDate.slice(0, 10)} · {t.totalCatchKg.toLocaleString('en-US')} kg
                          </div>
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          {pay ? (
                            <>
                              <div className="font-bold">{pay.amountDue.toLocaleString('en-US')} DH</div>
                              <div
                                className={
                                  pay.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'
                                }
                              >
                                {pay.status}
                              </div>
                            </>
                          ) : (
                            <span className="opacity-65">{t.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CREW MEMBER */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#031524]/70 backdrop-blur-sm"
            onClick={() => setFormModalOpen(false)}
          />
          <form
            onSubmit={handleSaveSailor}
            className="relative z-10 w-full max-w-lg rounded-3xl bg-white/95 dark:bg-[#062439]/95 backdrop-blur-xl border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#16C5C0]" />
                <span>{editingSailor ? 'Edit Crew Member' : 'New Crew Member'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#0A4565]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">First Name</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Last Name</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Maritime ID</label>
                <input
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Home Port</label>
                <input
                  required
                  value={portAttache}
                  onChange={(e) => setPortAttache(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Phone</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Professional Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as SailorGrade)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                >
                  <option value="Captain">Captain (2.0 shares)</option>
                  <option value="First Mate">First Mate (1.5 shares)</option>
                  <option value="Engineer">Engineer (1.5 shares)</option>
                  <option value="Deckhand">Deckhand (1.0 share)</option>
                  <option value="Apprentice">Apprentice (0.75 share)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SailorStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="At Sea">At Sea</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Rest">Rest</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Contract Type</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                >
                  <option value="Share Contract">Share Contract</option>
                  <option value="Permanent Maritime">Permanent Maritime</option>
                  <option value="Seasonal Fixed-Term">Seasonal Fixed-Term</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Assigned Vessel</label>
                <select
                  value={vesselId}
                  onChange={(e) => setVesselId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F6FA] dark:bg-[#041826] border border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-sm"
                >
                  <option value="">No fixed vessel</option>
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registration})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0A4565]/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#16C5C0] hover:bg-[#13b0ac] text-[#062B45] font-semibold text-sm cursor-pointer"
              >
                {editingSailor ? 'Save Changes' : 'Create Crew Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
