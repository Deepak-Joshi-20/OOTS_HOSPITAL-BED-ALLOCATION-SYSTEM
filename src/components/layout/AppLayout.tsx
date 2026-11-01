import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Building2,
  ClipboardList,
  CheckSquare,
  UserPlus,
  LogOut as DischargeIcon,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings as SettingsIcon,
  Stethoscope,
  Calendar,
  CreditCard,
  Wrench,
  Layers,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LogOut,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LuxePageAmbientBackground,
  ThemeSwitcherControl,
} from '../common/LuxeMedicalArtwork';
import { PermissionKey, StaffRole } from '../../types/hospital';

interface NavItem {
  label: string;
  path: string;
  icon: React.FC<{ className?: string }>;
  requiredPermission?: PermissionKey;
  badgeCount?: number;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, logout, hasPermission, loginWithDemoRole } = useAuth();
  const { patients, doctors, beds, waitingQueue, equipment } = useHospital();
  const { isBlossom } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Always show full navigation labels inside the mobile drawer even if desktop sidebar was collapsed
  const showSidebarLabels = !collapsed || mobileMenuOpen;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        section: 'Hospital Operations',
        items: [
          { label: 'Dashboard', path: '/', icon: LayoutDashboard },
          {
            label: 'Patient Management',
            path: '/patients',
            icon: Users,
          },
          {
            label: 'Bed Management',
            path: '/beds',
            icon: BedDouble,
          },
          {
            label: 'Ward Management',
            path: '/wards',
            icon: Building2,
          },
        ],
      },
      {
        section: 'Patient Flow & Allocation',
        items: [
          {
            label: 'Waiting List',
            path: '/waiting-list',
            icon: ClipboardList,
            badgeCount: waitingQueue.length,
          },
          {
            label: 'Bed Allocation',
            path: '/allocation',
            icon: CheckSquare,
          },
          {
            label: 'Admissions',
            path: '/admissions',
            icon: UserPlus,
          },
          {
            label: 'Discharges',
            path: '/discharges',
            icon: DischargeIcon,
          },
        ],
      },
      {
        section: 'Hospital Equipment Management',
        items: [
          {
            label: 'Hospital Equipment',
            path: '/equipment',
            icon: Wrench,
          },
          {
            label: 'Alerts',
            path: '/alerts',
            icon: AlertTriangle,
            badgeCount:
              waitingQueue.filter((w) => w.acuity === 'Critical').length +
              equipment.filter(
                (e) =>
                  e.availability === 'Under Maintenance' ||
                  e.condition === 'Needs Calibration'
              ).length,
          },
          {
            label: 'Doctors',
            path: '/doctors',
            icon: Stethoscope,
          },
          {
            label: 'Appointments',
            path: '/appointments',
            icon: Calendar,
          },
          {
            label: 'Departments',
            path: '/departments',
            icon: Layers,
          },
          {
            label: 'Billing & Payments',
            path: '/billing',
            icon: CreditCard,
          },
        ],
      },
      {
        section: 'Analytics & Governance',
        items: [
          {
            label: 'Analytics',
            path: '/analytics',
            icon: BarChart3,
          },
          {
            label: 'Audit Logs',
            path: '/audit-logs',
            icon: FileText,
            requiredPermission: 'view_audit_logs',
          },
          {
            label: 'Staff Management',
            path: '/staff',
            icon: ShieldCheck,
            requiredPermission: 'manage_staff',
          },
          {
            label: 'Settings',
            path: '/settings',
            icon: SettingsIcon,
          },
        ],
      },
    ],
    [waitingQueue, equipment]
  );

  const currentBreadcrumb = useMemo(() => {
    for (const grp of navGroups) {
      for (const item of grp.items) {
        if (item.path === location.pathname) {
          return { section: grp.section, title: item.label };
        }
      }
    }
    if (location.pathname === '/machines') {
      return {
        section: 'Hospital Equipment Management',
        title: 'Hospital Equipment',
      };
    }
    return {
      section: 'Hospital Operations',
      title: 'Care Sanctuary Overview',
    };
  }, [location.pathname, navGroups]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedPatients = patients
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.diagnosis.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((p) => ({
        tag: 'Patient',
        title: `${p.name} (${p.mrn})`,
        sub: `${p.acuity} Acuity · ${p.status}`,
        path: '/patients',
      }));

    const matchedBeds = beds
      .filter(
        (b) =>
          b.bedNumber.toLowerCase().includes(q) ||
          b.wardName.toLowerCase().includes(q) ||
          (b.patientName && b.patientName.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((b) => ({
        tag: 'Bed',
        title: `Bed ${b.bedNumber} — ${b.wardName}`,
        sub: `${b.status}${b.patientName ? ` · ${b.patientName}` : ''}`,
        path: '/beds',
      }));

    const matchedDoctors = doctors
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .map((d) => ({
        tag: 'Doctor',
        title: d.name,
        sub: `${d.specialization} · ${d.department}`,
        path: '/doctors',
      }));

    const matchedEquipment = equipment
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.assetTag.toLowerCase().includes(q) ||
          e.assignedWard.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .map((e) => ({
        tag: 'Equipment',
        title: `${e.name} (${e.assetTag})`,
        sub: `${e.availability} · ${e.assignedWard}`,
        path: '/equipment',
      }));

    return [
      ...matchedPatients,
      ...matchedBeds,
      ...matchedDoctors,
      ...matchedEquipment,
    ].slice(0, 7);
  }, [searchQuery, patients, doctors, beds, equipment]);

  const criticalWaiting = waitingQueue.filter(
    (w) => w.acuity === 'Critical' || w.acuity === 'High'
  );
  const availableBedsCount = useMemo(
    () => beds.filter((b) => b.status === 'Available').length,
    [beds]
  );

  return (
    <div
      className={`relative min-h-screen flex transition-colors duration-300 ${
        isBlossom
          ? 'bg-[#FAF1E8] text-[#3D3440]'
          : 'bg-[#E9EFF8] text-[#252D43]'
      }`}
    >
      {/* Ambient Background */}
      <LuxePageAmbientBackground />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#3D3440]/55 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: Berry Plum & Mauve Editorial Sidebar in Blossom Care, Deep Navy in Arctic Bloom */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 lg:sticky lg:top-0 lg:h-screen no-print ${
          isBlossom
            ? 'bg-gradient-to-b from-[#754C68] via-[#67415B] to-[#4E3145] text-[#FAF1E8] border-r border-[#D9B9C8]/40'
            : 'bg-gradient-to-b from-[#111A35] via-[#172243] to-[#111A35] text-white border-r border-[#202B52]'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'} ${
          mobileMenuOpen
            ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/15 px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left focus:outline-none overflow-hidden cursor-pointer"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${
                isBlossom
                  ? 'bg-[#F5E9E8] text-[#754C68] shadow-black/10'
                  : 'bg-gradient-to-br from-[#4169E1] to-[#619BFF] text-white shadow-[#4169E1]/30'
              }`}
            >
              <HeartPulse className="h-5 w-5" />
            </div>
            {showSidebarLabels && (
              <div className="min-w-0">
                <div
                  className={`truncate text-base font-bold tracking-tight text-white ${
                    isBlossom ? 'font-editorial' : 'font-display'
                  }`}
                >
                  Blossom Care
                </div>
                <div
                  className={`truncate text-[11px] ${
                    isBlossom ? 'text-[#EAE2F3]' : 'text-[#619BFF]'
                  }`}
                >
                  Intelligent Bed Allocation
                </div>
              </div>
            )}
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 text-white/75 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 cursor-pointer"
            aria-label="Close Navigation Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.section}>
              {showSidebarLabels && (
                <div
                  className={`px-3 mb-2 text-[10px] font-bold tracking-wider uppercase ${
                    isBlossom ? 'text-[#F7D6C8]' : 'text-[#9CC2FF]'
                  }`}
                >
                  {group.section}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const restricted =
                    item.requiredPermission &&
                    !hasPermission(item.requiredPermission);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      title={!showSidebarLabels ? item.label : undefined}
                      className={({ isActive }) => {
                        if (isBlossom) {
                          return `group flex items-center justify-between rounded-xl px-3 py-2.5 lg:py-2 text-xs transition-all whitespace-nowrap ${
                            isActive
                              ? 'bg-[#F5E9E8] text-[#4E2A42] font-bold shadow-sm border-l-4 border-[#E9B9A7]'
                              : restricted
                              ? 'text-white/75 hover:bg-white/10 hover:text-white font-medium'
                              : 'text-[#FAF1E8] hover:bg-white/15 hover:text-white font-medium'
                          }`;
                        }
                        return `group flex items-center justify-between rounded-xl px-3 py-2.5 lg:py-2 text-xs transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-gradient-to-r from-[#355CD6] to-[#4A7BF7] text-white font-bold shadow-sm border-l-4 border-white'
                            : restricted
                            ? 'text-[#DCE6FA]/75 hover:bg-[#202B52] hover:text-white font-medium'
                            : 'text-[#F0F4FC] hover:bg-[#24325F] hover:text-white font-medium'
                        }`;
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        {showSidebarLabels && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {showSidebarLabels && restricted && (
                        <span
                          className="ml-2 inline-flex items-center rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-white/90"
                          title="Requires Administrator Role"
                        >
                          Admin
                        </span>
                      )}
                      {showSidebarLabels &&
                        !restricted &&
                        item.badgeCount !== undefined &&
                        item.badgeCount > 0 && (
                          <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-mono font-extrabold ${
                              isBlossom
                                ? 'bg-[#E9B9A7] text-[#2E2532]'
                                : 'bg-[#FFE3D9] text-[#9E261B]'
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Compact Staff Profile Footer */}
        {currentUser && (
          <div
            className={`border-t border-white/15 p-3 ${
              isBlossom ? 'bg-[#4E3145]/90' : 'bg-[#111A35]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    isBlossom
                      ? 'bg-[#F5E9E8] text-[#754C68]'
                      : 'bg-[#202B52] border border-[#619BFF]/40 text-[#619BFF]'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                {showSidebarLabels && (
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-white">
                      {currentUser.name}
                    </div>
                    <div
                      className={`truncate text-[11px] ${
                        isBlossom ? 'text-[#E9B9A7]' : 'text-[#619BFF]'
                      }`}
                    >
                      {currentUser.role}
                    </div>
                  </div>
                )}
              </div>
              {showSidebarLabels && (
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-[#E9B9A7] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-md no-print ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FAF1E8]/92'
              : 'border-[#D5E0F2] bg-white/92'
          }`}
        >
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 lg:px-8">
            {/* Left: Mobile Drawer Toggle + Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer ${
                  isBlossom
                    ? 'border-[#D9B9C8] bg-[#FFFDFB] text-[#3D3440]'
                    : 'border-[#D5E0F2] bg-white text-[#252D43]'
                }`}
                aria-label="Open Navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                <span
                  className={`hidden md:inline whitespace-nowrap ${
                    isBlossom ? 'text-[#786675]' : 'text-[#5A6582]'
                  }`}
                >
                  {currentBreadcrumb.section}
                </span>
                <span className="hidden md:inline text-[#B98CA7]">/</span>
                <span
                  className={`font-bold truncate ${
                    isBlossom
                      ? 'text-[#3D3440] font-editorial text-sm sm:text-lg'
                      : 'text-[#252D43] font-display text-xs sm:text-base'
                  }`}
                >
                  {currentBreadcrumb.title}
                </span>
              </div>
            </div>

            {/* Center: Global Search (Desktop) */}
            <div className="relative flex-1 max-w-sm mx-2 hidden md:block">
              <div className="relative">
                <Search
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                    isBlossom ? 'text-[#786675]' : 'text-[#5A6582]'
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                  placeholder="Search patients (MRN), beds (ICU-01), or equipment..."
                  className={`w-full rounded-xl border pl-9 pr-4 py-1.5 text-xs focus:outline-none transition-colors ${
                    isBlossom
                      ? 'border-[#D9B9C8] bg-[#FFFDFB] text-[#3D3440] placeholder-[#9B8996] focus:border-[#754C68]'
                      : 'border-[#D5E0F2] bg-[#E9EFF8]/70 text-[#252D43] placeholder-[#5A6582] focus:border-[#4169E1] focus:bg-white'
                  }`}
                />
              </div>

              {searchFocused && searchQuery.trim().length > 0 && (
                <div
                  className={`absolute left-0 right-0 mt-2 rounded-2xl border p-2 shadow-xl z-50 ${
                    isBlossom
                      ? 'border-[#D9B9C8] bg-[#FFFDFB]'
                      : 'border-[#D5E0F2] bg-white'
                  }`}
                >
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-[#786675]">
                      No matching patients, beds, doctors, or equipment found.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((res, idx) => (
                        <button
                          key={idx}
                          onMouseDown={() => {
                            navigate(res.path);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                            isBlossom
                              ? 'hover:bg-[#F5E9E8]'
                              : 'hover:bg-[#E9EFF8]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">
                              {res.title}
                            </div>
                            <div className="text-[11px] opacity-75 truncate">
                              {res.sub}
                            </div>
                          </div>
                          <span
                            className={`ml-3 text-[11px] font-mono font-semibold shrink-0 ${
                              isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
                            }`}
                          >
                            {res.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Mobile Search Toggle, Dual-Theme Switcher, Clock, Urgent Notifications, Demo Role Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen((s) => !s);
                  setNotifOpen(false);
                  setProfileOpen(false);
                }}
                className={`md:hidden flex h-9 w-9 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                  isBlossom
                    ? 'border-[#D9B9C8] bg-[#FFFDFB] text-[#3D3440] hover:bg-[#F5E9E8]'
                    : 'border-[#D5E0F2] bg-white text-[#252D43] hover:bg-[#E9EFF8]'
                }`}
                aria-label="Toggle Global Search"
              >
                {mobileSearchOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>

              <ThemeSwitcherControl compact />

              <div className="hidden xl:flex items-center gap-2 text-xs opacity-75 font-mono tabular-nums">
                <span>
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Urgent Allocation Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    setProfileOpen(false);
                    setMobileSearchOpen(false);
                  }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    isBlossom
                      ? 'border-[#D9B9C8] bg-[#FFFDFB] text-[#3D3440] hover:bg-[#F5E9E8]'
                      : 'border-[#D5E0F2] bg-white text-[#252D43] hover:bg-[#E9EFF8]'
                  }`}
                  aria-label="Urgent Waiting Queue"
                >
                  <Bell className="h-4 w-4" />
                  {criticalWaiting.length > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white font-mono ${
                        isBlossom ? 'bg-[#754C68]' : 'bg-[#C4382B]'
                      }`}
                    >
                      {criticalWaiting.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    className={`fixed sm:absolute right-3 left-3 sm:left-auto sm:right-0 top-[68px] sm:top-auto sm:mt-2 sm:w-80 rounded-2xl border p-4 shadow-xl z-50 ${
                      isBlossom
                        ? 'border-[#C9A9B8] bg-[#FFFDFB]'
                        : 'border-[#B8C7E0] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#C5D3EB]">
                      <span className="text-xs font-bold text-[#1A2130]">
                        Priority Waiting List ({waitingQueue.length})
                      </span>
                      <button
                        onClick={() => navigate('/allocation')}
                        className={`text-xs font-bold hover:underline cursor-pointer ${
                          isBlossom ? 'text-[#754C68]' : 'text-[#2850C8]'
                        }`}
                      >
                        Allocate Beds
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {waitingQueue.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => navigate('/allocation')}
                          className={`cursor-pointer rounded-xl p-2.5 transition-colors border ${
                            isBlossom
                              ? 'bg-[#F5E9E8] border-[#D9B9C8] hover:bg-[#EAE2F3]'
                              : 'bg-[#E9EFF8]/85 border-[#C5D3EB] hover:bg-[#E8E4FF]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#1A2130]">
                            <span>{w.patientName}</span>
                            <span
                              className={`font-mono font-extrabold ${
                                isBlossom ? 'text-[#754C68]' : 'text-[#C4382B]'
                              }`}
                            >
                              {w.acuity}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#414C66] font-medium truncate">
                            Needs {w.requiredWardType} · {w.diagnosis}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Staff Role & Session Menu */}
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileOpen((o) => !o);
                      setNotifOpen(false);
                      setMobileSearchOpen(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-left text-white transition-colors cursor-pointer ${
                      isBlossom
                        ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                        : 'bg-[#111A35] hover:bg-[#202B52]'
                    }`}
                  >
                    <span className="flex h-5 w-5 sm:hidden items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                      {currentUser.name.charAt(0)}
                    </span>
                    <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
                      {currentUser.role}
                    </span>
                  </button>

                  {profileOpen && (
                    <div
                      className={`fixed sm:absolute right-3 left-3 sm:left-auto sm:right-0 top-[68px] sm:top-auto sm:mt-2 sm:w-72 rounded-2xl border p-4 shadow-xl z-50 space-y-3 text-xs ${
                        isBlossom
                          ? 'border-[#D9B9C8] bg-[#FFFDFB]'
                          : 'border-[#D5E0F2] bg-white'
                      }`}
                    >
                      <div className="border-b border-[#D9B9C8]/50 pb-3">
                        <div className="font-bold">{currentUser.name}</div>
                        <div className="opacity-75">{currentUser.email}</div>
                        <div
                          className={`font-semibold mt-1 ${
                            isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
                          }`}
                        >
                          Role: {currentUser.role} · {currentUser.department}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold opacity-75 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-[#B98CA7]" />
                          <span>Quick Demo Role Switch:</span>
                        </div>
                        {(
                          [
                            'Administrator',
                            'Admission Staff',
                            'Ward Staff',
                          ] as StaffRole[]
                        ).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              loginWithDemoRole(r);
                              setProfileOpen(false);
                            }}
                            className={`w-full rounded-xl px-3 py-1.5 text-left font-medium transition-colors cursor-pointer ${
                              currentUser.role === r
                                ? isBlossom
                                  ? 'bg-[#EAE2F3] text-[#754C68] font-bold'
                                  : 'bg-[#E8E4FF] text-[#4169E1] font-bold'
                                : isBlossom
                                ? 'hover:bg-[#F5E9E8]'
                                : 'hover:bg-[#E9EFF8]'
                            }`}
                          >
                            Switch to {r}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#D9B9C8]/50">
                        <button
                          onClick={logout}
                          className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold cursor-pointer transition-colors ${
                            isBlossom
                              ? 'bg-[#F5E9E8] text-[#754C68] hover:bg-[#754C68] hover:text-white'
                              : 'bg-[#FFE3D9] text-[#B83227] hover:bg-[#C4382B] hover:text-white'
                          }`}
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign Out of Hospital Console</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Expandable Global Search Bar */}
          {mobileSearchOpen && (
            <div
              className={`md:hidden border-t px-3 py-3 space-y-2 ${
                isBlossom
                  ? 'border-[#D9B9C8] bg-[#FFFDFB]'
                  : 'border-[#D5E0F2] bg-white'
              }`}
            >
              <div className="relative">
                <Search
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isBlossom ? 'text-[#786675]' : 'text-[#5A6582]'
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients (MRN), beds (ICU-01), doctors, or equipment..."
                  autoFocus
                  className={`w-full rounded-xl border pl-9 pr-4 py-2 text-xs focus:outline-none ${
                    isBlossom
                      ? 'border-[#D9B9C8] bg-[#FAF1E8] text-[#3D3440]'
                      : 'border-[#D5E0F2] bg-[#E9EFF8]/70 text-[#252D43]'
                  }`}
                />
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="space-y-1 max-h-60 overflow-y-auto pt-1">
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-3 text-center text-xs opacity-75">
                      No matching hospital records found.
                    </div>
                  ) : (
                    searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(res.path);
                          setSearchQuery('');
                          setMobileSearchOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                          isBlossom
                            ? 'bg-[#FAF1E8] hover:bg-[#F5E9E8]'
                            : 'bg-[#F4F7FC] hover:bg-[#E9EFF8]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            {res.title}
                          </div>
                          <div className="text-[11px] opacity-75 truncate">
                            {res.sub}
                          </div>
                        </div>
                        <span
                          className={`ml-3 text-[11px] font-mono font-semibold shrink-0 ${
                            isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
                          }`}
                        >
                          {res.tag}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>

        {/* Mobile Bottom Quick-Navigation Dock */}
        <nav
          aria-label="Mobile Quick Navigation"
          className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-md px-2 py-1.5 no-print ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FFFDFB]/95 text-[#3D3440]'
              : 'border-[#D5E0F2] bg-white/95 text-[#252D43]'
          }`}
        >
          <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? isBlossom
                      ? 'bg-[#F5E9E8] text-[#754C68]'
                      : 'bg-[#E9EFF8] text-[#2850C8]'
                    : 'opacity-75 hover:opacity-100'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4 mb-0.5" />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/beds"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? isBlossom
                      ? 'bg-[#F5E9E8] text-[#754C68]'
                      : 'bg-[#E9EFF8] text-[#2850C8]'
                    : 'opacity-75 hover:opacity-100'
                }`
              }
            >
              <BedDouble className="h-4 w-4 mb-0.5" />
              <span>Beds ({availableBedsCount})</span>
            </NavLink>

            <NavLink
              to="/allocation"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? isBlossom
                      ? 'bg-[#754C68] text-white shadow-xs'
                      : 'bg-[#2850C8] text-white shadow-xs'
                    : isBlossom
                    ? 'bg-[#EAE2F3]/80 text-[#754C68]'
                    : 'bg-[#E8E4FF]/80 text-[#2850C8]'
                }`
              }
            >
              <CheckSquare className="h-4 w-4 mb-0.5" />
              <span>Allocate</span>
            </NavLink>

            <NavLink
              to="/patients"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? isBlossom
                      ? 'bg-[#F5E9E8] text-[#754C68]'
                      : 'bg-[#E9EFF8] text-[#2850C8]'
                    : 'opacity-75 hover:opacity-100'
                }`
              }
            >
              <Users className="h-4 w-4 mb-0.5" />
              <span>Patients</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold opacity-80 hover:opacity-100 cursor-pointer"
            >
              <Menu className="h-4 w-4 mb-0.5" />
              <span>All Modules</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};
