import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useTheme } from '../context/ThemeContext';
import { PaymentStatus } from '../types/hospital';

export const BillingManagement: React.FC = () => {
  const { invoices, patients, doctors, createInvoice, updateInvoiceStatus } =
    useHospital();
  const { isBlossom } = useTheme();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Create invoice form state
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id || ''
  );
  const [selectedDoctorName, setSelectedDoctorName] = useState(
    doctors[0]?.name || 'Dr. Elena Vance'
  );
  const [department, setDepartment] = useState('General Medicine');
  const [consultationCharge, setConsultationCharge] = useState(240);
  const [bedAndNursingCharge, setBedAndNursingCharge] = useState(1850);
  const [medicationAndLabCharge, setMedicationAndLabCharge] = useState(490);
  const [dueDate, setDueDate] = useState('2026-11-15');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.mrn.toLowerCase().includes(q) ||
        inv.department.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'All' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totals = useMemo(() => {
    const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPaid = invoices
      .filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPending = invoices
      .filter((i) => i.status === 'Pending')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const totalOverdue = invoices
      .filter((i) => i.status === 'Overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    return { totalBilled, totalPaid, totalPending, totalOverdue };
  }, [invoices]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    createInvoice({
      patientId: patient.id,
      patientName: patient.name,
      mrn: patient.mrn,
      doctorName: selectedDoctorName,
      department,
      issuedDate: new Date().toISOString().slice(0, 10),
      dueDate,
      consultationCharge: Number(consultationCharge) || 0,
      bedAndNursingCharge: Number(bedAndNursingCharge) || 0,
      medicationAndLabCharge: Number(medicationAndLabCharge) || 0,
      status: 'Pending',
      paymentMethod: 'Pending',
    });

    setModalOpen(false);
  };

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
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            Hospital Billing, Invoices &amp; Financial Records
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
            Itemized inpatient bed charges, physician consultation fees, laboratory billing, and payment status tracking.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm self-start sm:self-auto cursor-pointer ${
            isBlossom
              ? 'bg-[#B98CA7] hover:bg-[#a67893]'
              : 'bg-[#4169E1] hover:bg-[#3256C9]'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Generate Patient Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Total Billed Volume
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#252D43]">
            ${totals.totalBilled.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Settled / Paid
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#2850C8]">
            ${totals.totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Pending Insurance / Patient
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#754C68]">
            ${totals.totalPending.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Overdue Balance
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#B83227]">
            ${totals.totalOverdue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-2xs">
        <div className="md:col-span-7 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6582]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, patient name, MRN, or department..."
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 pl-9 pr-4 py-2 text-xs text-[#252D43] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-5 flex items-center gap-1 bg-[#E9EFF8] p-1 rounded-xl">
          {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111A35] text-white'
                  : 'text-[#252D43] hover:bg-white/70'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl border border-[#D5E0F2] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5E0F2] bg-[#111A35] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice &amp; Dates</th>
                <th className="py-3.5 px-4">Patient &amp; Physician</th>
                <th className="py-3.5 px-4 text-right">Consultation</th>
                <th className="py-3.5 px-4 text-right">Bed &amp; Nursing</th>
                <th className="py-3.5 px-4 text-right">Labs &amp; Meds</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E9F5]">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-[#E9EFF8]/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-[#252D43]">
                      {inv.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-[#5A6582]">
                      Issued {inv.issuedDate} · Due {inv.dueDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">
                      {inv.patientName} ({inv.mrn})
                    </div>
                    <div className="text-[11px] text-[#5A6582]">
                      {inv.doctorName} · {inv.department}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252D43]">
                    ${inv.consultationCharge.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252D43]">
                    ${inv.bedAndNursingCharge.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252D43]">
                    ${inv.medicationAndLabCharge.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-[#252D43]">
                    ${inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-[#E8E4FF] text-[#2850C8]'
                          : inv.status === 'Pending'
                          ? 'bg-[#F5E9E8] text-[#754C68]'
                          : 'bg-[#FFE3D9] text-[#B83227]'
                      }`}
                    >
                      {inv.status} ({inv.paymentMethod})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status !== 'Paid' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            updateInvoiceStatus(inv.id, 'Paid', 'Insurance')
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-2.5 py-1.5 font-bold text-white cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-[#5A6582]">
                        Receipt Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#4169E1]" />
                <h3 className="text-base font-bold text-[#252D43]">
                  Generate Itemized Hospital Invoice
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Attending Physician
                  </label>
                  <select
                    value={selectedDoctorName}
                    onChange={(e) => setSelectedDoctorName(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Consultation ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={consultationCharge}
                    onChange={(e) =>
                      setConsultationCharge(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Bed &amp; Nursing ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bedAndNursingCharge}
                    onChange={(e) =>
                      setBedAndNursingCharge(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Labs &amp; Meds ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={medicationAndLabCharge}
                    onChange={(e) =>
                      setMedicationAndLabCharge(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#E9EFF8] px-4 py-3 font-mono">
                <span className="font-bold text-[#252D43]">
                  Calculated Invoice Total:
                </span>
                <span className="text-base font-bold text-[#2850C8]">
                  $
                  {(
                    Number(consultationCharge) +
                    Number(bedAndNursingCharge) +
                    Number(medicationAndLabCharge)
                  ).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E9F5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-5 py-2 font-bold text-white cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
