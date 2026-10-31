import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  X,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import { AccessDeniedPanel } from '../components/common/LuxeMedicalArtwork';
import { PermissionKey, StaffRole } from '../types/hospital';

const ALL_PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: 'manage_staff', label: 'Manage Staff & RBAC' },
  { key: 'manage_wards', label: 'Manage Wards & Beds' },
  { key: 'manage_settings', label: 'System Configuration' },
  { key: 'view_audit_logs', label: 'View Audit Logs' },
  { key: 'manage_patients', label: 'Register & Edit Patients' },
  { key: 'create_admissions', label: 'Direct Admissions' },
  { key: 'allocate_beds', label: 'Smart Bed Allocation' },
  { key: 'manage_discharges', label: 'Execute Discharges' },
  { key: 'update_bed_status', label: 'Update Bed Status' },
  { key: 'view_analytics', label: 'View Clinical Analytics' },
];

export const StaffManagement: React.FC = () => {
  const {
    staffAccounts,
    currentUser,
    hasPermission,
    inviteStaff,
    updateStaffRole,
    toggleStaffActive,
    toggleStaffPermission,
  } = useAuth();
  const { addAuditLog } = useHospital();

  const canManageStaff = hasPermission('manage_staff');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('Admission Staff');
  const [department, setDepartment] = useState('Central Patient Placement');
  const [title, setTitle] = useState('Admissions Coordinator');
  const [tempPassword, setTempPassword] = useState('Hospital@2026');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  if (!canManageStaff) {
    return <AccessDeniedPanel requiredRoleLabel="Administrator" />;
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    const res = inviteStaff({
      name,
      email,
      role,
      department,
      title,
      tempPassword,
    });
    if (!res.success) {
      setInviteError(res.error || 'Could not create staff account.');
      return;
    }

    addAuditLog(
      'StaffAdmin',
      `Invited new hospital staff member ${name} (${email}) with role [${role}].`,
      'Elevated'
    );
    setBannerMessage(
      `Provisioned staff account for ${name} (${email}) as ${role}.`
    );
    setName('');
    setEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#8975D5]/25 border border-[#8975D5]/40 px-3 py-1 text-[11px] font-semibold text-[#E8E4FF] mb-2">
            <Shield className="h-3.5 w-3.5 text-[#E8E4FF]" />
            <span>ADMINISTRATOR ACCESS CONTROL & RBAC</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Hospital Staff & Role Management
          </h1>
          <p className="text-xs text-[#A5B4D4] mt-0.5">
            Invite hospital staff by email, assign clinical roles, manage active credentials, and configure granular module permissions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] hover:from-[#3358D4] hover:to-[#4B89FF] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Hospital Staff</span>
        </button>
      </div>

      {bannerMessage && (
        <div className="rounded-2xl bg-[#E8E4FF] border border-[#8975D5]/50 px-5 py-3.5 flex items-center justify-between text-xs text-[#202B52]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#4169E1]" />
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-[11px] font-bold text-[#4169E1] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {staffAccounts.map((staff) => {
          const isSelf = staff.id === currentUser?.id;
          return (
            <div
              key={staff.id}
              className={`rounded-3xl bg-white border p-6 shadow-sm transition-all ${
                staff.active
                  ? 'border-[#D5E0F2]'
                  : 'border-[#FF8278]/50 bg-[#F8FAFE] opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9EFF8]">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#202B52] text-white font-display font-bold text-sm">
                    {staff.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#252D43] font-display">
                        {staff.name}
                      </h3>
                      {isSelf && (
                        <span className="rounded-md bg-[#E9EFF8] px-2 py-0.5 text-[10px] font-bold text-[#4169E1]">
                          Current Session
                        </span>
                      )}
                      {!staff.active && (
                        <span className="rounded-md bg-[#FFE3D9] px-2 py-0.5 text-[10px] font-bold text-[#C03C32]">
                          Deactivated
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#5A6582] flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3 w-3 text-[#7F8CA8]" />
                      <span>{staff.email}</span>
                      <span>•</span>
                      <span>{staff.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={staff.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as StaffRole;
                      updateStaffRole(staff.id, nextRole);
                      addAuditLog(
                        'StaffAdmin',
                        `Updated role for ${staff.name} to [${nextRole}].`,
                        'Elevated'
                      );
                    }}
                    className="rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-1.5 text-xs font-bold text-[#202B52]"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Admission Staff">Admission Staff</option>
                    <option value="Ward Staff">Ward Staff</option>
                  </select>

                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleStaffActive(staff.id);
                        addAuditLog(
                          'StaffAdmin',
                          `${
                            staff.active ? 'Deactivated' : 'Reactivated'
                          } staff account ${staff.name} (${staff.email}).`,
                          'Elevated'
                        );
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                        staff.active
                          ? 'bg-[#FFE3D9] text-[#C03C32] hover:bg-[#FF8278] hover:text-white'
                          : 'bg-[#4169E1] text-white'
                      }`}
                    >
                      {staff.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>

              {/* Granular Permissions Matrix */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-[#6E7A99] mb-2.5">
                  <span className="font-bold uppercase tracking-wider">
                    Granular Module Clearances
                  </span>
                  <span className="font-mono">
                    {staff.permissions.length} / {ALL_PERMISSIONS.length} Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_PERMISSIONS.map((perm) => {
                    const granted = staff.permissions.includes(perm.key);
                    return (
                      <button
                        key={perm.key}
                        type="button"
                        onClick={() => toggleStaffPermission(staff.id, perm.key)}
                        className={`rounded-xl px-2.5 py-1.5 text-left text-[11px] font-medium border transition-all cursor-pointer flex items-center justify-between ${
                          granted
                            ? 'bg-[#E9EFF8] border-[#619BFF]/50 text-[#202B52] font-semibold'
                            : 'bg-[#F8FAFE] border-[#E9EFF8] text-[#7F8CA8]'
                        }`}
                      >
                        <span className="truncate">{perm.label}</span>
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ml-1.5 ${
                            granted ? 'bg-[#4169E1]' : 'bg-[#D5E0F2]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#D5E0F2] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#111A35] to-[#202B52] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#619BFF]" />
                <h3 className="text-base font-bold font-display">
                  Invite Hospital Staff Member
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-[#A5B4D4] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {inviteError && (
                <div className="rounded-xl bg-[#FFE3D9] border border-[#FF8278] px-3.5 py-2.5 text-xs font-semibold text-[#C03C32]">
                  {inviteError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Full Name & Clinical Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Dr. Julian Bashir"
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3.5 py-2 text-xs text-[#252D43]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Hospital Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="j.bashir@luxemedical.org"
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3.5 py-2 text-xs text-[#252D43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs font-semibold text-[#252D43]"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Admission Staff">Admission Staff</option>
                    <option value="Ward Staff">Ward Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Initial Password
                  </label>
                  <div className="relative">
                    <Lock className="h-3.5 w-3.5 text-[#7F8CA8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] pl-8 pr-3 py-2 text-xs font-mono text-[#252D43]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E9EFF8]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] hover:bg-[#3358D4] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
