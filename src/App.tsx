/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { HospitalProvider } from './context/HospitalContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPortal } from './pages/LoginPortal';

// Hospital Bed Allocation System Pages
import { Dashboard } from './pages/Dashboard';
import { PatientManagement } from './pages/PatientManagement';
import { BedManagement } from './pages/BedManagement';
import { WardManagement } from './pages/WardManagement';
import { WaitingList } from './pages/WaitingList';
import { BedAllocation } from './pages/BedAllocation';
import { Admissions } from './pages/Admissions';
import { Discharges } from './pages/Discharges';
import { Analytics } from './pages/Analytics';
import { AuditLogs } from './pages/AuditLogs';
import { StaffManagement } from './pages/StaffManagement';
import { Settings } from './pages/Settings';

// Preserved Predictive Maintenance & OS Telemetry Modules
import { MachineMonitoring } from './pages/MachineMonitoring';
import { MachineDetails } from './pages/MachineDetails';
import { Predictions } from './pages/Predictions';
import { Alerts } from './pages/Alerts';
import { ProcessManagement } from './pages/ProcessManagement';
import { CPUScheduling } from './pages/CPUScheduling';
import { SynchronizationLab } from './pages/SynchronizationLab';
import { IPCCommunication } from './pages/IPCCommunication';
import { DeadlockManagement } from './pages/DeadlockManagement';
import { MemoryManagement } from './pages/MemoryManagement';
import { SystemPerformance } from './pages/SystemPerformance';
import { EventLogs } from './pages/EventLogs';
import { Reports } from './pages/Reports';

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
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/settings" element={<Settings />} />

        {/* Preserved Biomedical Predictive Maintenance & OS Modules */}
        <Route path="/machines" element={<MachineMonitoring />} />
        <Route path="/machines/:id" element={<MachineDetails />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/os/processes" element={<ProcessManagement />} />
        <Route path="/os/scheduling" element={<CPUScheduling />} />
        <Route path="/os/synchronization" element={<SynchronizationLab />} />
        <Route path="/os/ipc" element={<IPCCommunication />} />
        <Route path="/os/deadlock" element={<DeadlockManagement />} />
        <Route path="/os/memory" element={<MemoryManagement />} />
        <Route path="/system/performance" element={<SystemPerformance />} />
        <Route path="/system/logs" element={<EventLogs />} />
        <Route path="/system/reports" element={<Reports />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SystemProvider>
          <HospitalProvider>
            <BrowserRouter>
              <AuthenticatedAppRoutes />
            </BrowserRouter>
          </HospitalProvider>
        </SystemProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
