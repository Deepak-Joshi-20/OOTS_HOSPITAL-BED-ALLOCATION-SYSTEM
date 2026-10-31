import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  Clock,
  Filter,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedPanel } from '../components/common/LuxeMedicalArtwork';
import { HospitalAuditLog } from '../types/hospital';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useHospital();
  const { hasPermission } = useAuth();

  const canViewAudit = hasPermission('view_audit_logs');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | HospitalAuditLog['category']
  >('ALL');
  const [severityFilter, setSeverityFilter] = useState<
    'ALL' | HospitalAuditLog['severity']
  >('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (categoryFilter !== 'ALL' && log.category !== categoryFilter) {
        return false;
      }
      if (severityFilter !== 'ALL' && log.severity !== severityFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.actorName.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, categoryFilter, severityFilter, search]);

  if (!canViewAudit) {
    return <AccessDeniedPanel requiredRoleLabel="Administrator" />;
  }

  const handleExportAuditCSV = () => {
    const header = 'ID,Timestamp,Actor,Role,Category,Severity,Action';
    const rows = filteredLogs.map(
      (l) =>
        `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.category}","${l.severity}","${l.action.replace(
          /"/g,
          '""'
        )}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4169E1]/25 border border-[#619BFF]/40 px-3 py-1 text-[11px] font-semibold text-[#E8E4FF] mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#619BFF]" />
            <span>HIPAA & CLINICAL OPERATIONS AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Hospital System Audit Logs
          </h1>
          <p className="text-xs text-[#A5B4D4] mt-0.5">
            Immutable operational ledger tracking bed allocations, admissions, discharges, and staff role changes.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          <Download className="h-4 w-4 text-[#619BFF]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#7F8CA8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit events by staff member, bed ID, patient, or action..."
            className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] pl-10 pr-4 py-2 text-xs text-[#252D43] focus:outline-none focus:border-[#4169E1]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-[#6E7A99] hidden sm:inline" />
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value as 'ALL' | HospitalAuditLog['category']
              )
            }
            className="rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-1.5 text-xs font-semibold text-[#252D43]"
          >
            <option value="ALL">All Categories</option>
            <option value="Allocation">Allocation</option>
            <option value="Admission">Admission</option>
            <option value="Discharge">Discharge</option>
            <option value="BedStatus">BedStatus</option>
            <option value="Authentication">Authentication</option>
            <option value="StaffAdmin">StaffAdmin</option>
            <option value="Settings">Settings</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(
                e.target.value as 'ALL' | HospitalAuditLog['severity']
              )
            }
            className="rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-1.5 text-xs font-semibold text-[#252D43]"
          >
            <option value="ALL">All Severity</option>
            <option value="Info">Info</option>
            <option value="Elevated">Elevated</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Audit Timeline Table */}
      <div className="rounded-3xl bg-white border border-[#D5E0F2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111A35] text-white text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Event ID</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Staff Actor</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFF8] text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F4F7FC]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#4169E1]">
                    {log.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#5A6582]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#8975D5]" />
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">
                      {log.actorName}
                    </div>
                    <div className="text-[10px] text-[#6E7A99]">
                      {log.actorRole}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-lg bg-[#E9EFF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#202B52]">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                        log.severity === 'Urgent'
                          ? 'bg-[#FFE3D9] text-[#C03C32]'
                          : log.severity === 'Elevated'
                          ? 'bg-[#E8E4FF] text-[#5B45B0]'
                          : 'bg-[#F4F7FC] text-[#4169E1]'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#252D43] font-medium">
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
