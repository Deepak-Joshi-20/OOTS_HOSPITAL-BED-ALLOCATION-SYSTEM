import React, { useState } from 'react';
import { Cpu, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WelcomeHeroIllustration } from './ArcticBackground';

export const OperatorLoginModal: React.FC = () => {
  const { showOperatorGate, setShowOperatorGate, settings, updateSettings } = useSystem();
  const [name, setName] = useState(settings.operatorName);
  const [role, setRole] = useState(settings.operatorRole);
  const [facility, setFacility] = useState(settings.facilityName);

  if (!showOperatorGate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      operatorName: name.trim() || 'Aarav Sharma',
      operatorRole: role.trim() || 'Lead Systems & Reliability Engineer',
      facilityName: facility.trim() || 'Arctic Bloom Smart Plant · Sector 04',
    });
    setShowOperatorGate(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#252A36]/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#E9EAF0] bg-[#F8F7F3] shadow-2xl">
        {/* Decorative background schematic inside login screen */}
        <div className="relative border-b border-[#E9EAF0] bg-white px-8 pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#4169E1]">
                <Cpu className="h-4 w-4" />
                <span>ARCTIC BLOOM OS · CONSOLE SESSION</span>
              </div>
              <h2 className="text-2xl font-bold text-[#252A36] font-display">
                Operator Console Authentication
              </h2>
              <p className="text-sm text-[#7C8495] leading-relaxed">
                Understand machine health. Predict failures. Experience operating systems in action.
              </p>
            </div>
            <div className="md:col-span-5">
              <WelcomeHeroIllustration />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-[#F8F7F3]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252A36] mb-1.5">
                Operator Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2.5 text-sm text-[#252A36] focus:border-[#4169E1] focus:outline-none"
                placeholder="e.g., Aarav Sharma"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#252A36] mb-1.5">
                Engineering Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2.5 text-sm text-[#252A36] focus:border-[#4169E1] focus:outline-none"
                placeholder="Lead Systems Engineer"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252A36] mb-1.5">
              Monitored Plant Sector
            </label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2.5 text-sm text-[#252A36] focus:border-[#4169E1] focus:outline-none"
              required
            />
          </div>

          <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#4169E1] shrink-0 mt-0.5" />
            <p className="text-xs text-[#7C8495] leading-relaxed">
              This interactive platform simulates industrial telemetry streams, rule-based predictive risk scoring, and real-time Operating System scheduling, synchronization, IPC, deadlock avoidance, and virtual memory algorithms.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowOperatorGate(false)}
              className="rounded-xl border border-[#E9EAF0] bg-white px-4 py-2.5 text-xs font-semibold text-[#7C8495] hover:text-[#252A36] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3457c9] transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enter System Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
