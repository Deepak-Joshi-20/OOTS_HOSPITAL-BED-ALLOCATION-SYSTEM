/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPortal } from './pages/LoginPortal';

// Blossom Care — Intelligent Hospital Bed Allocation System Pages
import { Dashboard } from './pages/Dashboard';
import { PatientManagement } from './pages/PatientManagement';
import { DoctorManagement } from './pages/DoctorManagement';
import { AppointmentManagement } from './pages/AppointmentManagement';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { BedManagement } from './pages/BedManagement';
import { WardManagement } from './pages/WardManagement';
import { WaitingList } from './pages/WaitingList';
import { BedAllocation } from './pages/BedAllocation';
import { Admissions } from './pages/Admissions';
import { Discharges } from './pages/Discharges';
import { BillingManagement } from './pages/BillingManagement';
import { EquipmentManagement } from './pages/EquipmentManagement';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { AuditLogs } from './pages/AuditLogs';
import { StaffManagement } from './pages/StaffManagement';
import { Settings } from './pages/Settings';

const AuthenticatedAppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* Core Hospital Bed Allocation Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/beds" element={<BedManagement />} />
        <Route path="/wards" element={<WardManagement />} />
        <Route path="/waiting-list" element={<WaitingList />} />
        <Route path="/allocation" element={<BedAllocation />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/discharges" element={<Discharges />} />

        {/* Hospital Equipment Management & Clinical Operations */}
        <Route path="/equipment" element={<EquipmentManagement />} />
        <Route path="/machines" element={<EquipmentManagement />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/doctors" element={<DoctorManagement />} />
        <Route path="/appointments" element={<AppointmentManagement />} />
        <Route path="/departments" element={<DepartmentManagement />} />
        <Route path="/billing" element={<BillingManagement />} />

        {/* Analytics & Governance */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HospitalProvider>
          <BrowserRouter>
            <AuthenticatedAppRoutes />
          </BrowserRouter>
        </HospitalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
