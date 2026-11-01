import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BedDouble,
  HeartPulse,
  ClipboardList,
  ArrowUpRight,
  CheckCircle2,
  UserPlus,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HospitalHeroIllustration } from '../components/common/LuxeMedicalArtwork';
import { InteractivePredictiveChart } from '../components/charts/InteractivePredictiveChart';

export const Dashboard: React.FC = () => {
  const {
    wards,
    beds,
    waitingQueue,
    admissions,
    discharges,
    allocateBedToPatient,
    getRecommendedBedsForPatient,
  } = useHospital();
  const { currentUser, hasPermission } = useAuth();
  const { isBlossom, palette } = useTheme();
  const navigate = useNavigate();

  // Operational Hospital Metrics
  const stats = useMemo(() => {
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
    const availableBeds = beds.filter((b) => b.status === 'Available').length;
    const cleaningBeds = beds.filter((b) => b.status === 'Cleaning').length;
    const maintenanceBeds = beds.filter((b) => b.status === 'Maintenance').length;

    const icuBeds = beds.filter((b) => b.isICU);
    const icuAvailable = icuBeds.filter((b) => b.status === 'Available').length;
    const icuOccupied = icuBeds.filter((b) => b.status === 'Occupied').length;

    const generalBeds = beds.filter((b) => !b.isICU);
    const generalAvailable = generalBeds.filter(
      (b) => b.status === 'Available'
    ).length;
    const generalOccupied = generalBeds.filter(
      (b) => b.status === 'Occupied'
    ).length;

    const occupancyRate = Math.round(
      (occupiedBeds / Math.max(1, totalBeds)) * 100
    );

    return {
      totalBeds,
      occupiedBeds,
      availableBeds,
      cleaningBeds,
      maintenanceBeds,
      icuTotal: icuBeds.length,
      icuAvailable,
      icuOccupied,
      generalTotal: generalBeds.length,
      generalAvailable,
      generalOccupied,
      occupancyRate,
    };
  }, [beds]);

  // Ward Occupancy Comparison Data
  const wardChartData = useMemo(() => {
    return wards.map((w) => {
      const wardBeds = beds.filter((b) => b.wardId === w.id);
      const occupied = wardBeds.filter((b) => b.status === 'Occupied').length;
      const available = wardBeds.filter((b) => b.status === 'Available').length;
      const turnover = wardBeds.filter(
        (b) => b.status === 'Cleaning' || b.status === 'Maintenance'
      ).length;
      return {
        ward: w.name.split(' ')[0],
        fullName: w.name,
        Occupied: occupied,
        Available: available,
        Turnover: turnover,
      };
    });
  }, [wards, beds]);

  // Bed Status Donut Data
  const statusPieData = useMemo(
    () =>
      isBlossom
        ? [
            { name: 'Occupied', value: stats.occupiedBeds, color: '#754C68' },
            { name: 'Available', value: stats.availableBeds, color: '#B9A5D5' },
            {
              name: 'Sanitizing',
              value: stats.cleaningBeds,
              color: '#B98CA7',
            },
            {
              name: 'Maintenance',
              value: stats.maintenanceBeds,
              color: '#E9B9A7',
            },
          ]
        : [
            { name: 'Occupied', value: stats.occupiedBeds, color: '#4169E1' },
            { name: 'Available', value: stats.availableBeds, color: '#619BFF' },
            {
              name: 'Cleaning Turnover',
              value: stats.cleaningBeds,
              color: '#8975D5',
            },
            {
              name: 'Maintenance',
              value: stats.maintenanceBeds,
              color: '#FF8278',
            },
          ],
    [stats, isBlossom]
  );

  // 7-Day Trend of ICU vs. General Ward Occupancy Rates (%)
  const sevenDayOccupancyTrend = useMemo(() => {
    const liveIcuRate = Math.round(
      (stats.icuOccupied / Math.max(1, stats.icuTotal)) * 100
    );
    const liveGeneralRate = Math.round(
      (stats.generalOccupied / Math.max(1, stats.generalTotal)) * 100
    );

    return [
      { day: 'Day 1 (Mon)', icuOccupancy: 72, generalOccupancy: 58 },
      { day: 'Day 2 (Tue)', icuOccupancy: 76, generalOccupancy: 61 },
      { day: 'Day 3 (Wed)', icuOccupancy: 81, generalOccupancy: 64 },
      { day: 'Day 4 (Thu)', icuOccupancy: 78, generalOccupancy: 67 },
      { day: 'Day 5 (Fri)', icuOccupancy: 85, generalOccupancy: 70 },
      { day: 'Day 6 (Sat)', icuOccupancy: 82, generalOccupancy: 66 },
      {
        day: 'Today (Live)',
        icuOccupancy: liveIcuRate,
        generalOccupancy: liveGeneralRate,
      },
    ];
  }, [stats]);

  const handleQuickAssign = (patientId: string) => {
    const qItem = waitingQueue.find((w) => w.patientId === patientId);
    if (!qItem) return;
    const recs = getRecommendedBedsForPatient(qItem);
    if (recs.length > 0) {
      allocateBedToPatient(patientId, recs[0].id);
    } else {
      navigate('/allocation');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. MAGAZINE-INSPIRED WELCOME HERO BANNER */}
      <section
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-8 shadow-md border ${
          isBlossom
            ? 'bg-gradient-to-r from-[#F5E9E8] via-[#FAF1E8] to-[#EAE2F3] text-[#3D3440] border-[#D9B9C8]'
            : 'bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#111A35] text-white border-[#4169E1]/30'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold ${
                isBlossom
                  ? 'bg-[#FFFDFB]/85 border border-[#D9B9C8] text-[#754C68]'
                  : 'bg-white/10 text-[#619BFF]'
              }`}
            >
              <Sparkles
                className={`h-3.5 w-3.5 shrink-0 ${
                  isBlossom ? 'text-[#B98CA7]' : 'text-[#FF8278]'
                }`}
              />
              <span className="truncate">
                {isBlossom
                  ? `BLOSSOM CARE SANCTUARY · ${currentUser?.role.toUpperCase()}`
                  : `BLOSSOM CARE HOSPITAL BED ALLOCATION · ${currentUser?.role.toUpperCase()}`}
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl lg:text-[42px] font-bold leading-tight text-balance ${
                isBlossom
                  ? 'text-[#3D3440] font-editorial'
                  : 'text-white font-display'
              }`}
            >
              Welcome back, {currentUser?.name || 'Clinical Director'}
            </h1>
            <p
              className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                isBlossom ? 'text-[#665663]' : 'text-[#E8E4FF]/85'
              }`}
            >
              Real-time bed availability, ICU &amp; maternity capacity coordination, and priority inpatient placement across 6 care wings.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => navigate('/allocation')}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                  isBlossom
                    ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                    : 'bg-[#4169E1] hover:bg-[#3256C9]'
                }`}
              >
                <BedDouble className="h-4 w-4" />
                <span>Allocate Available Beds ({stats.availableBeds})</span>
              </button>
              <button
                onClick={() => navigate('/patients')}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isBlossom
                    ? 'border-[#D9B9C8] bg-[#FFFDFB] hover:bg-[#F5E9E8] text-[#3D3440]'
                    : 'border-white/20 bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <UserPlus
                  className={`h-4 w-4 ${
                    isBlossom ? 'text-[#754C68]' : 'text-[#619BFF]'
                  }`}
                />
                <span>Register New Patient</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HospitalHeroIllustration />
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL KPI CARDS WITH VARIED PROPORTIONS & PASTEL ACCENTS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Berry Plum / Primary Occupancy Card */}
        <div
          onClick={() => navigate('/beds')}
          className={`md:col-span-4 cursor-pointer rounded-3xl text-white p-6 shadow-md border flex flex-col justify-between ${
            isBlossom
              ? 'bg-gradient-to-br from-[#754C68] to-[#58384E] border-[#B98CA7]/40'
              : 'bg-gradient-to-br from-[#202B52] to-[#111A35] border-[#4169E1]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`dashboard-metric-label text-xs font-semibold uppercase tracking-wider ${
                isBlossom ? 'text-[#F5E9E8]' : 'text-[#619BFF]'
              }`}
            >
              Hospital Bed Occupancy
            </span>
            <BedDouble
              className={`h-5 w-5 ${
                isBlossom ? 'text-[#E9B9A7]' : 'text-[#619BFF]'
              }`}
            />
          </div>
          <div className="my-3.5 flex items-baseline gap-3">
            <span className="dashboard-metric-value text-4xl font-bold font-mono tabular-nums text-white">
              {stats.occupancyRate}%
            </span>
            <span className="dashboard-metric-label text-xs text-white/85 font-mono">
              {stats.occupiedBeds} / {stats.totalBeds} Beds Occupied
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isBlossom
                  ? 'bg-gradient-to-r from-[#E9B9A7] to-[#EAE2F3]'
                  : 'bg-gradient-to-r from-[#4169E1] to-[#619BFF]'
              }`}
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Separate ICU Availability Card (Lavender Mist Tinted) */}
        <div
          onClick={() => navigate('/beds')}
          className={`md:col-span-4 cursor-pointer rounded-3xl border p-6 flex flex-col justify-between transition-colors ${
            isBlossom
              ? 'border-[#C9A9B8] bg-[#EAE2F3]/90 hover:border-[#754C68]'
              : 'border-[#B8C7E0] bg-[#E8E4FF]/85 hover:border-[#523B9E]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="dashboard-metric-label text-xs font-bold uppercase tracking-wider text-[#1A2130]">
              ICU Critical Care Suites
            </span>
            <HeartPulse
              className={`h-5 w-5 ${
                isBlossom ? 'text-[#754C68]' : 'text-[#523B9E]'
              }`}
            />
          </div>
          <div className="my-3.5 flex items-baseline justify-between">
            <div>
              <span className="dashboard-metric-value text-3xl font-bold font-mono tabular-nums text-[#1A2130]">
                {stats.icuAvailable}
              </span>
              <span className="dashboard-metric-label ml-1.5 text-xs font-bold text-[#1A2130]">
                Available Now
              </span>
            </div>
            <span
              className={`dashboard-metric-label text-xs font-mono font-bold ${
                isBlossom ? 'text-[#754C68]' : 'text-[#523B9E]'
              }`}
            >
              {stats.icuOccupied}/{stats.icuTotal} Occupied
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isBlossom ? 'bg-[#754C68]' : 'bg-[#523B9E]'
              }`}
              style={{
                width: `${Math.round(
                  (stats.icuOccupied / Math.max(1, stats.icuTotal)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Separate General & Specialty Ward Availability + Priority Queue */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/beds')}
            className={`cursor-pointer rounded-3xl border p-5 flex flex-col justify-between transition-colors ${
              isBlossom
                ? 'border-[#C9A9B8] bg-[#FFFDFB] hover:border-[#754C68]'
                : 'border-[#B8C7E0] bg-white hover:border-[#2850C8]'
            }`}
          >
            <div className="dashboard-metric-label text-xs font-bold text-[#414C66]">
              General &amp; Specialty
            </div>
            <div
              className={`dashboard-metric-value my-2 text-3xl font-bold font-mono tabular-nums ${
                isBlossom ? 'text-[#754C68]' : 'text-[#2850C8]'
              }`}
            >
              {stats.generalAvailable}
            </div>
            <div className="dashboard-metric-label text-[11px] font-semibold text-[#414C66]">
              Ready of {stats.generalTotal} beds
            </div>
          </div>

          <div
            onClick={() => navigate('/waiting-list')}
            className={`cursor-pointer rounded-3xl border p-5 flex flex-col justify-between transition-colors ${
              isBlossom
                ? 'border-[#C9A9B8] bg-[#F5E9E8] hover:border-[#754C68]'
                : 'border-[#F0A79E] bg-[#FFE3D9]/80 hover:border-[#C4382B]'
            }`}
          >
            <div className="dashboard-metric-label flex items-center justify-between text-xs font-bold text-[#1A2130]">
              <span>Waiting Queue</span>
              <ClipboardList
                className={`h-4 w-4 ${
                  isBlossom ? 'text-[#754C68]' : 'text-[#B83227]'
                }`}
              />
            </div>
            <div
              className={`dashboard-metric-value my-2 text-3xl font-bold font-mono tabular-nums ${
                isBlossom ? 'text-[#754C68]' : 'text-[#B83227]'
              }`}
            >
              {waitingQueue.length}
            </div>
            <div className="dashboard-metric-label text-[11px] font-semibold text-[#414C66]">
              Priority placement
            </div>
          </div>
        </div>
      </section>

      {/* 3. URGENT ALLOCATION NOTIFICATION BANNER */}
      {waitingQueue.some((w) => w.acuity === 'Critical') && (
        <section
          className={`rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
            isBlossom
              ? 'border-[#C9A9B8] bg-gradient-to-r from-[#F5E9E8] via-[#EAE2F3] to-[#F5E9E8] text-[#2E2532]'
              : 'border-[#4169E1]/50 bg-gradient-to-r from-[#202B52] via-[#111A35] to-[#202B52] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                isBlossom ? 'bg-[#754C68]' : 'bg-[#C4382B]'
              }`}
            >
              <Bell className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span
                className={`font-bold mr-2 ${
                  isBlossom ? 'text-[#754C68]' : 'text-[#FFD8D1]'
                }`}
              >
                PRIORITY ICU PLACEMENT ALERT:
              </span>
              <span>
                {
                  waitingQueue.find((w) => w.acuity === 'Critical')
                    ?.patientName
                }{' '}
                ({waitingQueue.find((w) => w.acuity === 'Critical')?.diagnosis})
                is awaiting an immediate ventilator-capable ICU suite.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/allocation')}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shrink-0 self-start sm:self-auto cursor-pointer ${
              isBlossom
                ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                : 'bg-[#C4382B] hover:bg-[#A62B20]'
            }`}
          >
            Assign ICU Bed Now
          </button>
        </section>
      )}

      {/* 4. WARD OCCUPANCY COMPARISON & BED STATUS VISUALIZATION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ward Occupancy Comparison Chart */}
        <div
          className={`lg:col-span-8 rounded-3xl border p-6 shadow-xs ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FFFDFB]'
              : 'border-[#D5E0F2] bg-white'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2
                className={`text-xl font-bold ${
                  isBlossom
                    ? 'text-[#3D3440] font-editorial'
                    : 'text-[#252D43] font-display'
                }`}
              >
                Ward Occupancy &amp; Available Capacity
              </h2>
              <p className="text-xs opacity-75">
                Live bed distribution across ICU, Cardiac, Surgical, General, Pediatrics, and Maternity
              </p>
            </div>
            <button
              onClick={() => navigate('/wards')}
              className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer ${
                isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
              }`}
            >
              <span>Manage Wards</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isBlossom ? '#EFE2E6' : '#E2E9F5'}
                />
                <XAxis
                  dataKey="ward"
                  tick={{ fontSize: 11, fill: palette.textMuted }}
                />
                <YAxis tick={{ fontSize: 11, fill: palette.textMuted }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: palette.tooltipBg,
                    borderColor: palette.tooltipBorder,
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="Occupied"
                  stackId="a"
                  fill={palette.chartOccupied}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Available"
                  stackId="a"
                  fill={palette.chartAvailable}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Turnover"
                  name="Sanitizing / Maint."
                  stackId="a"
                  fill={palette.chartTurnover}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Availability Breakdown Donut */}
        <div
          className={`lg:col-span-4 rounded-3xl border p-6 flex flex-col justify-between shadow-xs ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FFFDFB]'
              : 'border-[#D5E0F2] bg-white'
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                isBlossom
                  ? 'text-[#3D3440] font-editorial'
                  : 'text-[#252D43] font-display'
              }`}
            >
              Bed Status Breakdown
            </h2>
            <p className="text-xs opacity-75">
              Real-time readiness across {stats.totalBeds} licensed beds
            </p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: palette.tooltipBg,
                    borderColor: palette.tooltipBorder,
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            className={`space-y-2 pt-2 border-t text-xs ${
              isBlossom ? 'border-[#EFE2E6]' : 'border-[#E2E9F5]'
            }`}
          >
            {statusPieData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="font-mono font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4B. 7-DAY TREND OF ICU VS. GENERAL WARD OCCUPANCY RATES (LINE CHART) */}
      <section
        className={`rounded-3xl border p-6 shadow-xs ${
          isBlossom
            ? 'border-[#D9B9C8] bg-[#FFFDFB]'
            : 'border-[#D5E0F2] bg-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2
              className={`text-xl font-bold ${
                isBlossom
                  ? 'text-[#3D3440] font-editorial'
                  : 'text-[#252D43] font-display'
              }`}
            >
              7-Day Trend: ICU vs. General Ward Occupancy Rates
            </h2>
            <p className="text-xs opacity-75">
              Rolling 7-day percentage occupancy comparison between high-acuity ICU suites and General &amp; Specialty inpatient wards
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div
              className={`rounded-xl border px-3 py-1.5 font-mono font-bold ${
                isBlossom
                  ? 'border-[#D9B9C8] bg-[#F5E9E8] text-[#754C68]'
                  : 'border-[#D5E0F2] bg-[#E9EFF8] text-[#2850C8]'
              }`}
            >
              Live ICU:{' '}
              {
                sevenDayOccupancyTrend[sevenDayOccupancyTrend.length - 1]
                  .icuOccupancy
              }
              %
            </div>
            <div
              className={`rounded-xl border px-3 py-1.5 font-mono font-bold ${
                isBlossom
                  ? 'border-[#D9B9C8] bg-[#EAE2F3] text-[#3D3440]'
                  : 'border-[#D5E0F2] bg-[#E8E4FF] text-[#523B9E]'
              }`}
            >
              Live General:{' '}
              {
                sevenDayOccupancyTrend[sevenDayOccupancyTrend.length - 1]
                  .generalOccupancy
              }
              %
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sevenDayOccupancyTrend}
              margin={{ top: 10, right: 18, left: -8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isBlossom ? '#EFE2E6' : '#E2E9F5'}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: palette.textMuted }}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: palette.textMuted }}
              />
              <Tooltip
                formatter={(value) => `${value ?? 0}%`}
                contentStyle={{
                  backgroundColor: palette.tooltipBg,
                  borderColor: palette.tooltipBorder,
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={85}
                stroke={isBlossom ? '#B84335' : '#C4382B'}
                strokeDasharray="4 4"
                label={{
                  value: 'Critical Surge Threshold (85%)',
                  position: 'insideTopRight',
                  fill: isBlossom ? '#B84335' : '#C4382B',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="icuOccupancy"
                name="ICU Ward Occupancy (%)"
                stroke={isBlossom ? '#754C68' : '#4169E1'}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: isBlossom ? '#754C68' : '#4169E1',
                  strokeWidth: 2,
                  stroke: '#FFFFFF',
                }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={650}
              />
              <Line
                type="monotone"
                dataKey="generalOccupancy"
                name="General Ward Occupancy (%)"
                stroke={isBlossom ? '#B98CA7' : '#8975D5'}
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{
                  r: 3.5,
                  fill: isBlossom ? '#B98CA7' : '#8975D5',
                  strokeWidth: 1.5,
                  stroke: '#FFFFFF',
                }}
                activeDot={{ r: 5.5 }}
                isAnimationActive={true}
                animationDuration={650}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. PRIORITY WAITING LIST PREVIEW + LIVE ADMISSIONS & DISCHARGES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Waiting-List Preview */}
        <div
          className={`lg:col-span-6 rounded-3xl border p-6 space-y-4 shadow-xs ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FFFDFB]'
              : 'border-[#D5E0F2] bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-xl font-bold ${
                  isBlossom
                    ? 'text-[#3D3440] font-editorial'
                    : 'text-[#252D43] font-display'
                }`}
              >
                Priority Waiting List Queue
              </h2>
              <p className="text-xs opacity-75">
                Patients awaiting immediate bed assignment ordered by clinical acuity
              </p>
            </div>
            <button
              onClick={() => navigate('/waiting-list')}
              className={`text-xs font-semibold hover:underline cursor-pointer ${
                isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
              }`}
            >
              Full Queue ({waitingQueue.length})
            </button>
          </div>

          {waitingQueue.length === 0 ? (
            <div className="rounded-2xl bg-[#FAF1E8] p-8 text-center text-xs opacity-75">
              All queued patients have been assigned to hospital beds.
            </div>
          ) : (
            <div className="space-y-2.5">
              {waitingQueue.slice(0, 4).map((item) => {
                const recommended = getRecommendedBedsForPatient(item)[0];
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isBlossom
                        ? 'border-[#D9B9C8] bg-[#FAF1E8]/75'
                        : 'border-[#D5E0F2] bg-[#E9EFF8]/45'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#1A2130]">
                          {item.patientName} ({item.age}y)
                        </span>
                        <span className="text-[#414C66]">·</span>
                        <span
                          className={`font-mono font-bold ${
                            isBlossom
                              ? 'text-[#754C68]'
                              : item.acuity === 'Critical'
                              ? 'text-[#B83227]'
                              : 'text-[#2850C8]'
                          }`}
                        >
                          {item.acuity} (Score {item.priorityScore})
                        </span>
                      </div>
                      <p className="text-xs text-[#414C66] font-medium truncate">
                        {item.diagnosis} · Needs {item.requiredWardType}
                      </p>
                    </div>

                    {hasPermission('allocate_beds') && recommended ? (
                      <button
                        onClick={() => handleQuickAssign(item.patientId)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shrink-0 cursor-pointer ${
                          isBlossom
                            ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                            : 'bg-[#4169E1] hover:bg-[#3256C9]'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Assign {recommended.bedNumber}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/allocation')}
                        className="rounded-xl border border-[#D9B9C8] bg-white px-3 py-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Review
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Admissions & Discharges Activity Panel */}
        <div
          className={`lg:col-span-6 rounded-3xl border p-6 space-y-4 shadow-xs ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FFFDFB]'
              : 'border-[#D5E0F2] bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-xl font-bold ${
                  isBlossom
                    ? 'text-[#3D3440] font-editorial'
                    : 'text-[#252D43] font-display'
                }`}
              >
                Recent Patient Admissions &amp; Discharges
              </h2>
              <p className="text-xs opacity-75">
                Latest inpatient placements and completed bed releases
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <button
                onClick={() => navigate('/admissions')}
                className={`hover:underline cursor-pointer ${
                  isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
                }`}
              >
                Admissions
              </button>
              <span className="opacity-50">·</span>
              <button
                onClick={() => navigate('/discharges')}
                className={`hover:underline cursor-pointer ${
                  isBlossom ? 'text-[#B98CA7]' : 'text-[#8975D5]'
                }`}
              >
                Discharges
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {admissions.slice(0, 3).map((adm) => (
              <div
                key={adm.id}
                className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 text-xs ${
                  isBlossom
                    ? 'border-[#D9B9C8] bg-[#EAE2F3]/55'
                    : 'border-[#D5E0F2] bg-[#E8E4FF]/35'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold">
                    Admitted: {adm.patientName} ({adm.mrn})
                  </div>
                  <div className="opacity-80 truncate">
                    Assigned to{' '}
                    <strong
                      className={
                        isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
                      }
                    >
                      {adm.bedId}
                    </strong>{' '}
                    ({adm.wardName}) · {adm.attendingPhysician}
                  </div>
                </div>
                <span className="font-mono text-[11px] opacity-70 shrink-0">
                  {adm.admittedAt}
                </span>
              </div>
            ))}

            {discharges.slice(0, 2).map((dsc) => (
              <div
                key={dsc.id}
                className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 text-xs ${
                  isBlossom
                    ? 'border-[#D9B9C8] bg-[#F5E9E8]/75'
                    : 'border-[#D5E0F2] bg-[#FFE3D9]/45'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-[#1A2130]">
                    Discharged: {dsc.patientName} ({dsc.mrn})
                  </div>
                  <div className="text-[#414C66] font-medium truncate">
                    Released{' '}
                    <strong
                      className={
                        isBlossom ? 'text-[#754C68]' : 'text-[#B83227]'
                      }
                    >
                      {dsc.releasedBedId}
                    </strong>{' '}
                    · {dsc.outcome}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-[#414C66] font-semibold shrink-0">
                  {dsc.dischargedAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE PREDICTIVE MAINTENANCE & BIOMEDICAL TELEMETRY CHART */}
      <section>
        <InteractivePredictiveChart compact />
      </section>
    </div>
  );
};
