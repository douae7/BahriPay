import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Lock, Mail, Shield, User } from 'lucide-react';
import { useMaritime } from '../../context/MaritimeContext';
import { UserRole } from '../../types/maritime';
import { BrandLogo } from '../common/BrandLogo';
import { SafeImage } from '../common/SafeImage';
import { WorkspaceOceanBackdrop } from '../common/WorkspaceOceanBackdrop';
import { FloatingGlassCard, MagneticButton } from '../common/OceanMotion';
import { ThemeTogglePill } from '../common/ThemeTogglePill';

type AuthMode = 'login' | 'register' | 'forgot';

const ROLE_OPTIONS: { role: UserRole; label: string; scope: string }[] = [
  { role: 'ARMATEUR', label: 'Shipowner / Admin', scope: 'Full fleet, crew & finance control' },
  { role: 'CAPITAINE', label: 'Vessel Captain', scope: 'Fishing trips, catches & crew' },
  { role: 'FINANCIER', label: 'Finance Manager', scope: 'Sales, expenses & pay slips' },
  { role: 'OBSERVATEUR', label: 'Observer / Audit', scope: 'Read-only & report exports' },
];

const ROLE_DEMO_EMAILS: Record<UserRole, string> = {
  ARMATEUR: 'direction@bahripay-armement.fr',
  CAPITAINE: 'y.keravec@bahripay-armement.fr',
  FINANCIER: 'finances@bahripay-armement.fr',
  OBSERVATEUR: 'audit@bahripay-armement.fr',
};

export const AuthPages: React.FC = () => {
  const { setRoute, loginWithCredentials, registerAccount, requestPasswordReset, isLoading } = useMaritime();
  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ARMATEUR');
  const [email, setEmail] = useState('direction@bahripay-armement.fr');
  const [password, setPassword] = useState('Bahripay2026!');
  const [fullName, setFullName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (mode === 'login') {
      setEmail(ROLE_DEMO_EMAILS[role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsError(false);

    if (mode === 'forgot') {
      if (!email.includes('@')) {
        setIsError(true);
        setFeedback('Please enter a valid email address.');
        return;
      }
      try {
        const msg = await requestPasswordReset(email.trim());
        setFeedback(msg);
      } catch (err) {
        setIsError(true);
        setFeedback(err instanceof Error ? err.message : 'Unable to process request.');
      }
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim() || !email.includes('@') || password.length < 6) {
        setIsError(true);
        setFeedback('Please enter your full name, a valid email, and a password (min. 6 characters).');
        return;
      }
      try {
        await registerAccount(fullName.trim(), email.trim(), password, selectedRole);
      } catch (err) {
        setIsError(true);
        setFeedback(err instanceof Error ? err.message : 'Unable to create account.');
      }
      return;
    }

    if (!email.includes('@') || !password.trim()) {
      setIsError(true);
      setFeedback('Please enter your sign-in credentials.');
      return;
    }

    try {
      await loginWithCredentials(email.trim(), password, selectedRole);
    } catch (err) {
      setIsError(true);
      setFeedback(err instanceof Error ? err.message : 'Invalid credentials.');
    }
  };

  return (
    <div className="relative min-h-screen text-[#062B45] dark:text-[#F8FAFC] flex flex-col lg:flex-row transition-colors duration-300 overflow-x-hidden">
      <WorkspaceOceanBackdrop />

      {/* Left Maritime Editorial Panel */}
      <div className="relative z-10 lg:w-5/12 xl:w-1/2 min-h-[260px] lg:min-h-screen overflow-hidden bg-[#062B45] flex flex-col justify-between p-6 sm:p-10 text-[#F8FAFC]">
        <div className="absolute inset-0 overflow-hidden">
          <SafeImage
            src="/src/assets/images/auth_ocean_vessel_1795370246430.jpg"
            alt="Bahripay maritime vessel"
            className="w-full h-full object-cover scale-[1.32] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041928] via-[#062B45]/55 to-[#062B45]/75" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setRoute('landing')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7DDCEB] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </button>

          <ThemeTogglePill onDarkSurface />
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <BrandLogo lightText size="lg" />
          <h2 className="mt-5 font-display font-bold text-2xl sm:text-3xl leading-tight text-balance">
            Secure oversight for your crews and maritime fleet
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#F8FAFC]/80 max-w-md leading-relaxed">
            Role-based access tailored to every sea grade and operational management responsibility.
          </p>
        </div>
      </div>

      {/* Right Floating Glass Authentication Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-5 sm:p-10 lg:p-14">
        <FloatingGlassCard tiltEnabled={false} className="w-full max-w-md p-6 sm:p-8">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="mb-7">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#062B45] dark:text-[#F8FAFC]">
                {mode === 'login' && 'Sign in to Bahripay'}
                {mode === 'register' && 'Create a fleet account'}
                {mode === 'forgot' && 'Reset your password'}
              </h1>
              <p className="mt-2 text-sm text-[#0A4565]/75 dark:text-[#7DDCEB]/80">
                {mode === 'login' && 'Access your real-time maritime command center.'}
                {mode === 'register' && 'Set up your maritime workspace and choose your role.'}
                {mode === 'forgot' && 'Enter your work email address to receive a reset link.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#0A4565] dark:text-[#7DDCEB] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#0A4565]/50 dark:text-[#7DDCEB]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jean-Baptiste Le Gall"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/85 dark:bg-[#041826]/85 border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0A4565] dark:text-[#7DDCEB] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#0A4565]/50 dark:text-[#7DDCEB]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@bahripay-armement.fr"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/85 dark:bg-[#041826]/85 border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#0A4565] dark:text-[#7DDCEB]">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setFeedback(null);
                        }}
                        className="text-xs font-medium text-[#16C5C0] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#0A4565]/50 dark:text-[#7DDCEB]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/85 dark:bg-[#041826]/85 border border-[#0A4565]/15 dark:border-[#7DDCEB]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#16C5C0]"
                      required
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0A4565] dark:text-[#7DDCEB] mb-2">
                    <Shield className="w-3.5 h-3.5 text-[#16C5C0]" />
                    <span>Role &amp; Access Level</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROLE_OPTIONS.map((opt) => {
                      const active = selectedRole === opt.role;
                      return (
                        <button
                          key={opt.role}
                          type="button"
                          onClick={() => handleSelectRole(opt.role)}
                          className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#16C5C0]/18 border-[#16C5C0] text-[#062B45] dark:text-[#F8FAFC]'
                              : 'bg-white/60 dark:bg-[#041826]/65 border-[#0A4565]/15 dark:border-[#7DDCEB]/15 text-[#0A4565]/80 dark:text-[#F8FAFC]/75 hover:border-[#16C5C0]/50'
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.label}</div>
                          <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{opt.scope}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {feedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                    isError
                      ? 'bg-red-500/12 border-red-500/40 text-red-700 dark:text-red-300'
                      : 'bg-[#16C5C0]/15 border-[#16C5C0]/40 text-[#062B45] dark:text-[#7DDCEB]'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isError ? 'text-red-500' : 'text-[#16C5C0]'}`} />
                  <span>{feedback}</span>
                </div>
              )}

              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-xl bg-[#16C5C0] hover:bg-[#19d6d1] disabled:opacity-60 text-[#062B45] font-semibold text-sm shadow-lg shadow-[#16C5C0]/25 transition-colors cursor-pointer"
              >
                {isLoading ? (
                  'Signing in securely...'
                ) : (
                  <>
                    {mode === 'login' && 'Sign in to Bahripay'}
                    {mode === 'register' && 'Create account & continue'}
                    {mode === 'forgot' && 'Send reset link'}
                  </>
                )}
              </MagneticButton>
            </form>

            <div className="mt-6 pt-6 border-t border-[#0A4565]/10 dark:border-[#7DDCEB]/15 flex items-center justify-between text-xs sm:text-sm">
              {mode === 'login' ? (
                <>
                  <span className="text-[#0A4565]/70 dark:text-[#F8FAFC]/65">New to Bahripay?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setFeedback(null);
                    }}
                    className="font-semibold text-[#16C5C0] hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[#0A4565]/70 dark:text-[#F8FAFC]/65">Already registered?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setFeedback(null);
                    }}
                    className="font-semibold text-[#16C5C0] hover:underline cursor-pointer"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </FloatingGlassCard>
      </div>
    </div>
  );
};
