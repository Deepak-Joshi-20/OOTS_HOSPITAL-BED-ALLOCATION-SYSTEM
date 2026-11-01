import React, { useMemo } from 'react';
import {
  BarChart3,
  Download,
  Activity,
  Bed,
  Users,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useHospital } from '../context/HospitalContext';
import { useTheme } from '../context/ThemeContext';
import { InteractivePredictiveChart } from '../components/charts/InteractivePredictiveChart';

export const Analytics: React.FC = () => {
  const {
    wards,
    beds,
    patients,
    waitingQueue,
    doctors,
    appointments,
    departments,
    equipment,
  } = useHospital();
  const { isBlossom, palette } = useTheme();

  const wardAnalyticsData = useMemo(() => {
    return wards.map((w) => {
      const wardBeds = beds.filter((b) => b.wardId === w.id);
      const occupied = wardBeds.filter((b) => b.status === 'Occupied').length;
      const available = wardBeds.filter((b) => b.status === 'Available').length;
      const turnover = wardBeds.filter(
        (b) => b.status === 'Cleaning' || b.status === 'Maintenance'
      ).length;
      return {
        name: w.name.replace(' Ward', '').replace(' Unit', ''),
        Occupied: occupied,
        Available: available,
        Turnover: turnover,
        occupancyRate:
          wardBeds.length > 0
            ? Math.round((occupied / wardBeds.length) * 100)
            : 0,
      };
    });
  }, [wards, beds]);

  const acuityDistribution = useMemo(() => {
    const counts = {
      Critical: patients.filter((p) => p.acuity === 'Critical').length,
      High: patients.filter((p) => p.acuity === 'High').length,
      Moderate: patients.filter((p) => p.acuity === 'Moderate').length,
      Stable: patients.filter((p) => p.acuity === 'Stable').length,
    };
    return isBlossom
      ? [
          { name: 'Critical', value: counts.Critical, color: '#754C68' },
          { name: 'High', value: counts.High, color: '#B98CA7' },
          { name: 'Moderate', value: counts.Moderate, color: '#B9A5D5' },
          { name: 'Stable', value: counts.Stable, color: '#E9B9A7' },
        ]
      : [
          { name: 'Critical', value: counts.Critical, color: '#FF8278' },
          { name: 'High', value: counts.High, color: '#8975D5' },
          { name: 'Moderate', value: counts.Moderate, color: '#4169E1' },
          { name: 'Stable', value: counts.Stable, color: '#619BFF' },
        ];
  }, [patients, isBlossom]);

  const departmentSummaries = useMemo(() => {
    return departments.map((dept) => {
      const deptDoctors = doctors.filter((d) => d.department === dept.name);
      const deptAppointments = appointments.filter(
        (a) => a.department === dept.name
      );
      const deptEquipment = equipment.filter((e) => e.department === dept.name);
      return {
        ...dept,
        doctorCount: deptDoctors.length,
        appointmentCount: deptAppointments.length,
        equipmentCount: deptEquipment.length,
      };
    });
  }, [departments, doctors, appointments, equipment]);

  const handleExportCSV = () => {
    const headers = [
      'Ward Name,Occupied Beds,Available Beds,Turnover Beds,Occupancy %',
    ];
    const rows = wardAnalyticsData.map(
      (w) =>
        `"${w.name}",${w.Occupied},${w.Available},${w.Turnover},${w.occupancyRate}%`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const occupiedTotal = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyPct =
    beds.length > 0 ? Math.round((occupiedTotal / beds.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[11px] font-semibold text-white mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>HOSPITAL REPORTS &amp; CLINICAL ANALYTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Patient Statistics, Bed Occupancy &amp; Department Reports
          </h1>
          <p className="text-xs text-white/85 mt-0.5">
            Comprehensive analytics covering inpatient ward occupancy, appointment trends, acuity stratification, and department summaries.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export Utilization CSV</span>
        </button>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#6E7A99]">
            <span>Hospital Occupancy</span>
            <Bed className="h-4 w-4 text-[#4169E1]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#252D43]">
              {occupancyPct}%
            </span>
            <span className="text-xs font-semibold text-[#4169E1]">
              {occupiedTotal} / {beds.length} Beds
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#6E7A99]">
            <span>ICU Ventilator Load</span>
            <Activity className="h-4 w-4 text-[#4169E1]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#252D43]">
              {
                beds.filter((b) => b.hasVentilator && b.status === 'Occupied')
                  .length
              }{' '}
              /{' '}
              {beds.filter((b) => b.hasVentilator).length}
            </span>
            <span className="text-xs font-semibold text-[#8975D5]">
              Active Vents
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#6E7A99]">
            <span>Total Patient Census</span>
            <Users className="h-4 w-4 text-[#8975D5]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#252D43]">
              {patients.length}
            </span>
            <span className="text-xs font-semibold text-[#8975D5]">
              {waitingQueue.length} in Waiting Queue
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#6E7A99]">
            <span>Outpatient Appointments</span>
            <Calendar className="h-4 w-4 text-[#4169E1]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#252D43]">
              {appointments.length}
            </span>
            <span className="text-xs font-semibold text-[#4169E1]">
              {appointments.filter((a) => a.status === 'Scheduled').length}{' '}
              Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Hospital Trends Component */}
      <InteractivePredictiveChart />

      {/* Ward Utilization & Patient Acuity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-3xl bg-white border border-[#D5E0F2] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#252D43]">
                Ward Capacity vs. Active Bed Utilization
              </h2>
              <p className="text-xs text-[#6E7A99]">
                Comparison of occupied, available, and sanitization/maintenance beds across hospital wings
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={wardAnalyticsData}
                margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isBlossom ? '#EFE2E6' : '#E9EFF8'}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: palette.textMuted, fontSize: 11 }}
                  axisLine={{ stroke: palette.borderSubtle }}
                />
                <YAxis
                  tick={{ fill: palette.textMuted, fontSize: 11 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: palette.tooltipBg,
                    borderColor: palette.tooltipBorder,
                    borderRadius: '14px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="Occupied"
                  stackId="a"
                  fill={palette.chartOccupied}
                  radius={[0, 0, 4, 4]}
                  isAnimationActive={true}
                  animationDuration={650}
                />
                <Bar
                  dataKey="Available"
                  stackId="a"
                  fill={palette.chartAvailable}
                  isAnimationActive={true}
                  animationDuration={650}
                />
                <Bar
                  dataKey="Turnover"
                  stackId="a"
                  fill={palette.chartTurnover}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={650}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-white border border-[#D5E0F2] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#252D43]">
              Patient Acuity Stratification
            </h2>
            <p className="text-xs text-[#6E7A99]">
              Distribution of registered patients by clinical severity
            </p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={acuityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={4}
                  isAnimationActive={true}
                  animationDuration={650}
                >
                  {acuityDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E9EFF8]">
            {acuityDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-[#F4F7FC] px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[#252D43]">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#202B52]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department-Wise Summary Report Table */}
      <div className="rounded-3xl border border-[#D5E0F2] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-[#4169E1]" />
            <div>
              <h2 className="text-lg font-bold text-[#252D43]">
                Department-Wise Clinical Summary
              </h2>
              <p className="text-xs text-[#6E7A99]">
                Overview of specialist doctors, outpatient appointment volume, and medical assets per hospital department
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5E0F2] bg-[#111A35] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Head of Department</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Specialists</th>
                <th className="py-3 px-4">Appointments</th>
                <th className="py-3 px-4">Medical Equipment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E9F5]">
              {departmentSummaries.map((dept) => (
                <tr key={dept.id} className="hover:bg-[#E9EFF8]/50">
                  <td className="py-3 px-4 font-bold text-[#252D43]">
                    {dept.name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#4169E1]">
                    {dept.headDoctor}
                  </td>
                  <td className="py-3 px-4 text-[#5A6582]">
                    {dept.floor}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#252D43]">
                    {dept.doctorCount} Doctors
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#523B9E]">
                    {dept.appointmentCount} Visits
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#252D43]">
                    {dept.equipmentCount} Units
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
