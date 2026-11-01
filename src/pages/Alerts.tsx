import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  HeartPulse,
  Wrench,
  BedDouble,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useTheme } from '../context/ThemeContext';

interface HospitalAlertItem {
  id: string;
  category: 'Critical Placement' | 'Ward Capacity' | 'Bed Sanitization' | 'Equipment Service';
  severity: 'Urgent' | 'Elevated' | 'Info';
  title: string;
  description: string;
  targetPath: string;
  actionLabel: string;
  timestamp: string;
}

export const Alerts: React.FC = () => {
  const { waitingQueue, beds, wards, equipment, updateBedStatus, updateEquipmentStatus } =
    useHospital();
  const { isBlossom } = useTheme();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<
    'All' | HospitalAlertItem['category']
  >('All');

  const hospitalAlerts = useMemo<HospitalAlertItem[]>(() => {
    const list: HospitalAlertItem[] = [];

    // 1. Critical & High Acuity Waiting Queue Alerts
    waitingQueue
      .filter((w) => w.acuity === 'Critical' || w.acuity === 'High')
      .forEach((w) => {
        list.push({
          id: `ALT-WAIT-${w.id}`,
          category: 'Critical Placement',
          severity: w.acuity === 'Critical' ? 'Urgent' : 'Elevated',
          title: `${w.acuity} Acuity Placement Required · ${w.patientName}`,
          description: `${w.diagnosis} — Requires ${w.requiredWardType} bed${
            w.needsVentilator ? ' with Mechanical Ventilator' : ''
          }${w.needsIsolation ? ' & Isolation Suite' : ''} (Priority Score: ${
            w.priorityScore
          }).`,
          targetPath: '/allocation',
          actionLabel: 'Open Bed Allocation',
          timestamp: w.requestedAt,
        });
      });

    // 2. High Ward Occupancy Alerts
    wards.forEach((ward) => {
      const wardBeds = beds.filter((b) => b.wardId === ward.id);
      const occupied = wardBeds.filter((b) => b.status === 'Occupied').length;
      const pct =
        wardBeds.length > 0 ? Math.round((occupied / wardBeds.length) * 100) : 0;
      if (pct >= 75) {
        list.push({
          id: `ALT-WARD-${ward.id}`,
          category: 'Ward Capacity',
          severity: pct >= 85 ? 'Urgent' : 'Elevated',
          title: `High Ward Occupancy (${pct}%) · ${ward.name}`,
          description: `${occupied} of ${wardBeds.length} beds currently occupied in ${ward.floor} (${ward.wing}). Coordinate discharges or step-down transfers.`,
          targetPath: '/wards',
          actionLabel: 'Inspect Ward Capacity',
          timestamp: 'Live Telemetry',
        });
      }
    });

    // 3. Bed Sanitization & Maintenance Turnover Alerts
    beds
      .filter((b) => b.status === 'Cleaning' || b.status === 'Maintenance')
      .forEach((bed) => {
        list.push({
          id: `ALT-BED-${bed.id}`,
          category: 'Bed Sanitization',
          severity: bed.status === 'Maintenance' ? 'Elevated' : 'Info',
          title: `Bed ${bed.bedNumber} (${bed.wardName}) — ${bed.status}`,
          description: `Unit is currently marked "${bed.status}" (Last sanitized: ${bed.lastSanitized}). Mark available once environmental turnover completes.`,
          targetPath: '/beds',
          actionLabel: 'Manage Bed Status',
          timestamp: bed.lastSanitized,
        });
      });

    // 4. Hospital Medical Equipment Calibration & Maintenance Alerts
    equipment
      .filter(
        (eq) =>
          eq.availability === 'Under Maintenance' ||
          eq.condition === 'Needs Calibration'
      )
      .forEach((eq) => {
        list.push({
          id: `ALT-EQ-${eq.id}`,
          category: 'Equipment Service',
          severity: 'Elevated',
          title: `Equipment Service Alert · ${eq.name} (${eq.assetTag})`,
          description: `Assigned to ${eq.assignedWard} — Status: ${eq.availability}, Condition: ${eq.condition}. Next scheduled calibration: ${eq.nextCalibrationDate}.`,
          targetPath: '/equipment',
          actionLabel: 'Review Equipment',
          timestamp: eq.nextCalibrationDate,
        });
      });

    return list;
  }, [waitingQueue, wards, beds, equipment]);

  const filteredAlerts = useMemo(() => {
    if (categoryFilter === 'All') return hospitalAlerts;
    return hospitalAlerts.filter((a) => a.category === categoryFilter);
  }, [hospitalAlerts, categoryFilter]);

  const cleaningBedsCount = beds.filter((b) => b.status === 'Cleaning').length;
  const serviceEqCount = equipment.filter(
    (e) =>
      e.availability === 'Under Maintenance' ||
      e.condition === 'Needs Calibration'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl p-6 shadow-md border ${
          isBlossom
            ? 'bg-gradient-to-r from-[#754C68] via-[#67415B] to-[#4E3145] text-[#FAF1E8] border-[#D9B9C8]/40'
            : 'bg-gradient-to-r from-[#111A35] to-[#202B52] text-white border-[#4169E1]/30'
        }`}
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white mb-2">
            <Bell className="h-3.5 w-3.5" />
            <span>CLINICAL &amp; HOSPITAL EQUIPMENT ALERTS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            Hospital Operational &amp; Equipment Service Alerts
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
            Monitor priority ICU bed placement requests, high ward occupancy warnings, sanitization turnover, and biomedical equipment calibration alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cleaningBedsCount > 0 && (
            <button
              onClick={() => {
                beds
                  .filter((b) => b.status === 'Cleaning')
                  .forEach((b) => updateBedStatus(b.id, 'Available'));
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-3.5 py-2 text-xs font-bold text-white cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Complete All Sanitization ({cleaningBedsCount})</span>
            </button>
          )}
          {serviceEqCount > 0 && (
            <button
              onClick={() => {
                equipment
                  .filter(
                    (e) =>
                      e.availability === 'Under Maintenance' ||
                      e.condition === 'Needs Calibration'
                  )
                  .forEach((e) =>
                    updateEquipmentStatus(e.id, 'Available', 'Excellent')
                  );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-3.5 py-2 text-xs font-bold text-white cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              <span>Clear Equipment Service Alerts ({serviceEqCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            'All',
            'Critical Placement',
            'Ward Capacity',
            'Bed Sanitization',
            'Equipment Service',
          ] as const
        ).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              categoryFilter === cat
                ? isBlossom
                  ? 'bg-[#754C68] text-white'
                  : 'bg-[#111A35] text-white'
                : 'bg-white border border-[#D5E0F2] text-[#252D43] hover:bg-[#E9EFF8]'
            }`}
          >
            {cat}{' '}
            {cat === 'All'
              ? `(${hospitalAlerts.length})`
              : `(${hospitalAlerts.filter((a) => a.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-3xl border border-[#D5E0F2] bg-white p-10 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-[#4169E1] mx-auto" />
            <div className="text-sm font-bold text-[#252D43]">
              No Active Alerts in This Category
            </div>
            <p className="text-xs text-[#5A6582]">
              All hospital wards, patient placements, and medical equipment in this category are operating within normal parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-[#D5E0F2] bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                    alert.severity === 'Urgent'
                      ? 'bg-[#C4382B]'
                      : alert.severity === 'Elevated'
                      ? 'bg-[#5641A6]'
                      : 'bg-[#4169E1]'
                  }`}
                >
                  {alert.category === 'Critical Placement' ? (
                    <HeartPulse className="h-5 w-5" />
                  ) : alert.category === 'Equipment Service' ? (
                    <Wrench className="h-5 w-5" />
                  ) : alert.category === 'Bed Sanitization' ? (
                    <BedDouble className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        alert.severity === 'Urgent'
                          ? 'bg-[#FFE3D9] text-[#B83227]'
                          : alert.severity === 'Elevated'
                          ? 'bg-[#E8E4FF] text-[#523B9E]'
                          : 'bg-[#E9EFF8] text-[#2850C8]'
                      }`}
                    >
                      {alert.severity} · {alert.category}
                    </span>
                    <span className="font-mono text-[11px] text-[#5A6582]">
                      {alert.timestamp}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#252D43]">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-[#5A6582] leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(alert.targetPath)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shrink-0 self-start sm:self-center cursor-pointer ${
                  isBlossom
                    ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                    : 'bg-[#4169E1] hover:bg-[#3256C9]'
                }`}
              >
                <span>{alert.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
