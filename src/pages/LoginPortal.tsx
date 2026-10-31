import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  HeartPulse,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StaffRole } from '../types/hospital';
import {
  HospitalHeroIllustration,
  ThemeSwitcherControl,
} from '../components/common/LuxeMedicalArtwork';

export const LoginPortal: React.FC = () => {
  const { login, loginWithDemoRole, requestPasswordReset } = useAuth();
  const { isBlossom } = useTheme();

  const [email, setEmail] = useState('admin@aurelia-hospital.org');
  const [password, setPassword] = useState('Admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('admin@aurelia-hospital.org');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetFeedback, setResetFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await login(email, password, rememberMe);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed.');
    }
  };

  const handleQuickDemoSelect = (role: StaffRole) => {
    setErrorMsg(null);
    loginWithDemoRole(role);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestPasswordReset(resetEmail, resetNewPass);
    setResetFeedback(res);
    if (res.success) {
      setEmail(resetEmail);
      setPassword(resetNewPass);
    }
  };

  if (isBlossom) {
    return (
      <div className="min-h-screen w-full bg-[#FAF1E8] text-[#3D3440] flex flex-col lg:flex-row overflow-hidden relative">
        {/* Soft Organic Pastel Shapes */}
        <div
          className="pointer-events-none absolute -top-36 -left-36 h-[560px] w-[560px] rounded-full opacity-75 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #F5E9E8 0%, rgba(234,226,243,0.6) 55%, rgba(250,241,232,0) 75%)',
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-12 h-[520px] w-[520px] rounded-full opacity-65 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #EAE2F3 0%, rgba(233,185,167,0.4) 55%, rgba(250,241,232,0) 75%)',
          }}
        />

        {/* LEFT SECTION: Editorial Blossom Care Sanctuary & Illustrated Hospital Scene */}
        <div className="relative z-10 lg:w-7/12 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#F5E9E8] via-[#FAF1E8] to-[#EAE2F3] border-b lg:border-b-0 lg:border-r border-[#D9B9C8]">
          {/* Brand Lockup & Theme Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#754C68] text-[#FAF1E8] shadow-md shadow-[#754C68]/20">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-[#3D3440] font-editorial">
                  Blossom Care Sanctuary
                </div>
                <div className="text-xs text-[#754C68] font-medium">
                  Hospital Bed Allocation &amp; Clinical Care Coordination
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeSwitcherControl />
            </div>
          </div>

          {/* Editorial Hero Copy & Custom Healthcare Illustration */}
          <div className="my-10 space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFFDFB]/85 border border-[#D9B9C8] px-3.5 py-1 text-xs font-semibold text-[#754C68]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#B98CA7]" />
              <span>BOUTIQUE INPATIENT FLOW &amp; CARE COMMAND</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-[#3D3440] font-editorial leading-[1.08] text-balance">
              Thoughtful Care Begins With Serene Coordination.
            </h1>

            <p className="text-sm sm:text-base text-[#665663] leading-relaxed">
              Every ward, ICU suite, and patient admission harmonized in one calm, intuitive workspace designed for clinical clarity.
            </p>

            <div className="pt-1">
              <HospitalHeroIllustration />
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#D9B9C8] text-xs">
            <div className="rounded-2xl bg-[#FFFDFB]/85 border border-[#D9B9C8] px-4 py-3">
              <div className="font-mono text-base font-bold text-[#754C68]">
                6 Care Wings
              </div>
              <div className="text-[#4E3D4A] font-medium">
                ICU, Maternity, Cardiac &amp; Surgical
              </div>
            </div>
            <div className="rounded-2xl bg-[#FFFDFB]/85 border border-[#D9B9C8] px-4 py-3">
              <div className="font-mono text-base font-bold text-[#754C68]">
                3 Staff Roles
              </div>
              <div className="text-[#4E3D4A] font-medium">
                Role-Based Clinical Access
              </div>
            </div>
            <div className="rounded-2xl bg-[#FFFDFB]/85 border border-[#D9B9C8] px-4 py-3">
              <div className="font-mono text-base font-bold text-[#2E2532]">
                24/7 Live
              </div>
              <div className="text-[#4E3D4A] font-medium">
                Acuity Queue &amp; Bed Telemetry
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Refined Blossom Care Staff Login Panel */}
        <div className="relative z-10 lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#FAF1E8]">
          <div className="w-full max-w-md rounded-3xl border border-[#D9B9C8] bg-[#FFFDFB] p-7 sm:p-9 shadow-xl shadow-[#754C68]/5 space-y-6">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#754C68]">
                STAFF CREDENTIAL PORTAL
              </div>
              <h2 className="text-3xl font-bold text-[#2E2532] font-editorial">
                Welcome to Blossom Care
              </h2>
              <p className="text-xs text-[#4E3D4A] font-medium">
                Sign in with your hospital staff credentials or choose a demo role below.
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-2xl border border-[#E9B9A7] bg-[#F5E9E8] p-3.5 text-xs font-medium text-[#754C68]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2E2532] mb-1.5">
                  Hospital Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#754C68]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#C9A9B8] bg-[#FAF1E8]/80 pl-10 pr-4 py-2.5 text-xs text-[#2E2532] placeholder-[#634F5E] focus:border-[#754C68] focus:bg-white focus:outline-none"
                    placeholder="name@aurelia-hospital.org"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2E2532]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetFeedback(null);
                      setForgotOpen(true);
                    }}
                    className="text-xs font-bold text-[#754C68] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#754C68]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#C9A9B8] bg-[#FAF1E8]/80 pl-10 pr-10 py-2.5 text-xs text-[#2E2532] placeholder-[#634F5E] focus:border-[#754C68] focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E3D4A] hover:text-[#2E2532]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer text-[#665663]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#D9B9C8] accent-[#754C68]"
                  />
                  <span>Keep staff session signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#754C68] hover:bg-[#5E3B53] py-3 text-xs font-bold text-[#FAF1E8] shadow-md shadow-[#754C68]/20 transition-all cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Verifying Credentials...'
                    : 'Enter Blossom Care Workspace'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Demo Account Selector */}
            <div className="pt-5 border-t border-[#EFE2E6] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#3D3440]">
                  <Sparkles className="h-3.5 w-3.5 text-[#754C68]" />
                  <span>Instant Demo Login (Sample Hospital Staff)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('Administrator')}
                  className="w-full flex items-center justify-between rounded-2xl border border-[#D9B9C8] bg-[#F5E9E8]/60 hover:bg-[#F5E9E8] hover:border-[#754C68] px-3.5 py-2.5 text-left transition-all cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[#3D3440]">
                      Administrator · Dr. Elena Vance
                    </div>
                    <div className="text-[11px] text-[#786675]">
                      Full access: Staff RBAC, Wards, Beds, Allocations &amp; Telemetry
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#754C68] shrink-0 ml-2">
                    Enter →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('Admission Staff')}
                  className="w-full flex items-center justify-between rounded-2xl border border-[#D9B9C8] bg-[#EAE2F3]/55 hover:bg-[#EAE2F3] hover:border-[#754C68] px-3.5 py-2.5 text-left transition-all cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[#3D3440]">
                      Admission Staff · Marcus Thorne
                    </div>
                    <div className="text-[11px] text-[#786675]">
                      Patient Registration, Waiting Queue &amp; Smart Bed Matching
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#754C68] shrink-0 ml-2">
                    Enter →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('Ward Staff')}
                  className="w-full flex items-center justify-between rounded-2xl border border-[#D9B9C8] bg-[#FAF1E8] hover:bg-[#F5E9E8]/70 hover:border-[#754C68] px-3.5 py-2.5 text-left transition-all cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[#3D3440]">
                      Ward Staff · Nurse Priya Kapoor
                    </div>
                    <div className="text-[11px] text-[#786675]">
                      Ward Floorplan, Bed Turnover Status &amp; Patient Discharges
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#754C68] shrink-0 ml-2">
                    Enter →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal (Blossom Care) */}
        {forgotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D3440]/55 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl border border-[#D9B9C8] bg-[#FFFDFB] p-6 sm:p-8 shadow-2xl space-y-4 text-[#3D3440]">
              <div className="flex items-center justify-between border-b border-[#EFE2E6] pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#754C68]" />
                  <h3 className="text-lg font-bold font-editorial">
                    Staff Password Reset
                  </h3>
                </div>
                <button
                  onClick={() => setForgotOpen(false)}
                  className="rounded-lg p-1 text-[#786675] hover:text-[#3D3440]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-[#786675] leading-relaxed">
                Enter your registered hospital staff email address and choose a new password to update your credential digest.
              </p>

              {resetFeedback && (
                <div
                  className={`rounded-xl p-3 text-xs border ${
                    resetFeedback.success
                      ? 'border-[#B9A5D5] bg-[#EAE2F3] text-[#3D3440]'
                      : 'border-[#E9B9A7] bg-[#F5E9E8] text-[#754C68]'
                  }`}
                >
                  {resetFeedback.message}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3D3440] mb-1">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#D9B9C8] bg-[#FAF1E8] px-3.5 py-2.5 text-[#3D3440]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3D3440] mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-[#D9B9C8] bg-[#FAF1E8] px-3.5 py-2.5 text-[#3D3440]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="rounded-xl border border-[#D9B9C8] px-4 py-2 font-semibold text-[#786675]"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#754C68] px-4 py-2 font-semibold text-[#FAF1E8] hover:bg-[#5E3B53]"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INITIAL THEME (Classic Luxe Medical)
  return (
    <div className="min-h-screen w-full bg-[#111A35] text-white flex flex-col lg:flex-row overflow-hidden relative">
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, #4169E1 0%, rgba(65,105,225,0) 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-10 h-[540px] w-[540px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, #8975D5 0%, rgba(137,117,213,0) 70%)',
        }}
      />

      <div className="relative z-10 lg:w-7/12 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#111A35] via-[#202B52] to-[#111A35] border-b lg:border-b-0 lg:border-r border-[#4169E1]/25">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4169E1] text-white shadow-lg shadow-[#4169E1]/30">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white font-display">
                AURELIA LUXE MEDICAL
              </div>
              <div className="text-xs text-[#619BFF] font-medium">
                Hospital Bed Allocation &amp; Clinical Operations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcherControl />
          </div>
        </div>

        <div className="my-10 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#FF8278]">
            <ShieldCheck className="h-4 w-4 text-[#619BFF]" />
            <span>Inpatient Flow &amp; Critical Care Command</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display leading-tight text-balance">
            Better Care Starts With Better Coordination.
          </h1>

          <p className="text-base sm:text-lg text-[#E8E4FF]/85 leading-relaxed">
            Your hospital operations, connected in one place. Coordinate ICU capacity, ward allocations, patient admissions, and biomedical equipment telemetry in real time.
          </p>

          <div className="pt-2">
            <HospitalHeroIllustration />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
          <div>
            <div className="font-mono text-lg font-bold text-[#619BFF]">6 Wards</div>
            <div className="text-[#E8E4FF]/70">ICU, Cardiac, Surgical &amp; General</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-[#8975D5]">3 Staff Roles</div>
            <div className="text-[#E8E4FF]/70">Role-Based Access Control</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-[#FF8278]">24/7 Live</div>
            <div className="text-[#E8E4FF]/70">Priority Triage &amp; Telemetry</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#111A35]/90">
        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#202B52]/75 backdrop-blur-xl p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white font-display">
              Staff Sign In
            </h2>
            <p className="text-xs text-[#E8E4FF]/75">
              Enter your hospital staff credentials or select a demo role below.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-[#FF8278] bg-[#FFE3D9]/15 p-3.5 text-xs text-[#FFE3D9]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#E8E4FF] mb-1.5">
                Hospital Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#619BFF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#111A35]/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#619BFF] focus:outline-none"
                  placeholder="name@aurelia-hospital.org"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#E8E4FF]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetFeedback(null);
                    setForgotOpen(true);
                  }}
                  className="text-xs font-medium text-[#619BFF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#619BFF]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#111A35]/90 pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#619BFF] focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8E4FF]/70 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[#E8E4FF]/85">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 accent-[#4169E1]"
                />
                <span>Keep staff session signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4169E1] hover:bg-[#3457c9] py-3 text-xs font-bold text-white shadow-lg shadow-[#4169E1]/30 transition-all cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? 'Verifying Credentials...'
                  : 'Sign In to Hospital Console'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-5 border-t border-white/15 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#E8E4FF]">
                <Sparkles className="h-3.5 w-3.5 text-[#FF8278]" />
                <span>Use Demo Account (Sample Staff)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('Administrator')}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-[#111A35]/80 hover:border-[#619BFF] px-3.5 py-2.5 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Administrator · Dr. Elena Vance
                  </div>
                  <div className="text-[11px] text-[#E8E4FF]/70 font-mono">
                    Full access: Staff Admin, Wards, Beds, Allocations
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#619BFF] shrink-0 ml-2">
                  Sign In →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('Admission Staff')}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-[#111A35]/80 hover:border-[#8975D5] px-3.5 py-2.5 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Admission Staff · Marcus Thorne
                  </div>
                  <div className="text-[11px] text-[#E8E4FF]/70 font-mono">
                    Patients, Waiting List, Bed Allocations &amp; Admissions
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#8975D5] shrink-0 ml-2">
                  Sign In →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('Ward Staff')}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-[#111A35]/80 hover:border-[#FF8278] px-3.5 py-2.5 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Ward Staff · Nurse Priya Kapoor
                  </div>
                  <div className="text-[11px] text-[#E8E4FF]/70 font-mono">
                    Ward &amp; Bed Status, Assigned Patients &amp; Discharges
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#FF8278] shrink-0 ml-2">
                  Sign In →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
