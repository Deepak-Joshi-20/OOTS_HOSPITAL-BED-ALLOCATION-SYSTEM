import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  Trash2,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { useSystem, exportToCSV } from '../context/SystemContext';
import { SystemEventLog } from '../types';
import { EmptyStateIllustration } from '../components/common/ArcticBackground';

export const EventLogs: React.FC = () => {
  const { eventLogs, clearEventLogs } = useSystem();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedEvent, setSelectedEvent] = useState<SystemEventLog | null>(null);

  const filteredLogs = useMemo(() => {
    return eventLogs
      .filter((log) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          log.id.toLowerCase().includes(q) ||
          log.sourceProcess.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q);
        const matchesCategory =
          categoryFilter === 'All' || log.category === categoryFilter;
        const matchesSeverity =
          severityFilter === 'All' || log.severity === severityFilter;
        return matchesSearch && matchesCategory && matchesSeverity;
      })
      .sort((a, b) => {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? tB - tA : tA - tB;
      });
  }, [eventLogs, search, categoryFilter, severityFilter, sortOrder]);

  const handleExportCSV = () => {
    exportToCSV(
      `pmas_system_event_logs_${new Date().toISOString().slice(0, 10)}.csv`,
      filteredLogs.map((l) => ({
        EventID: l.id,
        Timestamp: l.timestamp,
        SourceProcess: l.sourceProcess,
        Category: l.category,
        Severity: l.severity,
        Description: l.description,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            System &amp; Kernel Event Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Audit trail of sensor readings, risk recalculations, mutex acquisitions, IPC packets, page faults, and maintenance alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3457c9] disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Logs CSV</span>
          </button>
          <button
            onClick={clearEventLogs}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3.5 py-2.5 text-xs font-semibold text-[#7C8495] hover:text-[#FF806D]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C8495]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Event ID, process name, or message..."
            className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] pl-9 pr-3 py-2 text-xs text-[#252A36] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs text-[#252A36]"
          >
            <option value="All">All Event Categories</option>
            <option value="Sensor">Sensor</option>
            <option value="RiskEngine">RiskEngine</option>
            <option value="Process">Process</option>
            <option value="Synchronization">Synchronization</option>
            <option value="IPC">IPC</option>
            <option value="Deadlock">Deadlock</option>
            <option value="Memory">Memory</option>
            <option value="Alert">Alert</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs text-[#252A36]"
          >
            <option value="All">All Severities</option>
            <option value="Info">Info</option>
            <option value="Notice">Notice</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            onClick={() =>
              setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))
            }
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs font-semibold text-[#252A36]"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#4169E1]" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-12 text-center space-y-3">
          <EmptyStateIllustration />
          <h3 className="text-base font-bold text-[#252A36] font-display">
            No Matching System Events
          </h3>
          <p className="text-xs text-[#7C8495]">
            Run any OS simulation or poll a machine sensor reading to populate new system events.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E9EAF0] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E9EAF0] bg-[#F8F7F3]/70 text-[11px] font-semibold text-[#7C8495] uppercase">
                  <th className="py-3.5 px-4">Event ID &amp; Time</th>
                  <th className="py-3.5 px-4">Source Process</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0]">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F8F7F3]/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <div className="font-bold text-[#252A36]">{log.id}</div>
                      <div className="text-[11px] text-[#7C8495]">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#252A36] whitespace-nowrap">
                      {log.sourceProcess}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#4169E1]">
                      {log.category}
                    </td>
                    <td className="py-3 px-4 text-[#252A36] max-w-lg">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={
                          log.severity === 'Critical'
                            ? 'text-[#FF806D]'
                            : log.severity === 'Warning'
                            ? 'text-[#8B78DB]'
                            : 'text-[#4169E1]'
                        }
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(log)}
                        className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#252A36] hover:bg-[#E9E4FF]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#252A36]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#E9EAF0] bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-3">
              <span className="font-mono font-bold text-[#4169E1]">
                {selectedEvent.id} · {selectedEvent.category}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-[#7C8495]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7C8495]">Source Process:</span>
                <span className="font-bold text-[#252A36]">
                  {selectedEvent.sourceProcess}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C8495]">Timestamp:</span>
                <span className="font-mono text-[#252A36]">
                  {new Date(selectedEvent.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C8495]">Severity:</span>
                <span className="font-bold text-[#FF806D]">
                  {selectedEvent.severity}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-[#F8F7F3] p-3.5 text-[#252A36] leading-relaxed border border-[#E9EAF0]">
              {selectedEvent.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
