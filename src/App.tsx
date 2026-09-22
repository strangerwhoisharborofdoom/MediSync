import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/auth/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PharmacyDashboard } from './components/pharmacy/PharmacyDashboard';
import { AppointmentsView } from './components/common/AppointmentsView';
import { AuditLogView } from './components/common/AuditLogView';
import { MessagesView } from './components/common/MessagesView';
import { ReportsView } from './components/common/ReportsView';
import { SettingsView } from './components/common/SettingsView';
import { MediVoiceModal } from './components/voice/MediVoiceModal';
import { MedicationsView } from './components/patient/MedicationsView';
import { PrescriptionsView } from './components/patient/PrescriptionsView';
import { RefillsView } from './components/patient/RefillsView';

const MainAppContent: React.FC = () => {
  const { isLoggedIn, activeRole, highContrastMode, largeTextMode } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  // Render role-specific or shared view based on tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (activeRole === 'patient') return <PatientDashboard onSelectTab={setActiveTab} />;
        if (activeRole === 'caregiver') return <CaregiverDashboard onSelectTab={setActiveTab} />;
        if (activeRole === 'doctor') return <DoctorDashboard />;
        if (activeRole === 'pharmacy') return <PharmacyDashboard initialSubTab="refills" />;
        return <PatientDashboard onSelectTab={setActiveTab} />;

      case 'medications':
        if (activeRole === 'pharmacy') return <PharmacyDashboard initialSubTab="inventory" />;
        return <MedicationsView />;

      case 'inventory':
        return <PharmacyDashboard initialSubTab="inventory" />;

      case 'prescriptions':
        if (activeRole === 'doctor') return <DoctorDashboard />;
        if (activeRole === 'pharmacy') return <PharmacyDashboard initialSubTab="prescriptions" />;
        return <PrescriptionsView />;

      case 'refills':
        if (activeRole === 'pharmacy') return <PharmacyDashboard initialSubTab="refills" />;
        return <RefillsView />;

      case 'appointments':
        return <AppointmentsView />;

      case 'messages':
        return <MessagesView />;

      case 'alerts':
        return <CaregiverDashboard onSelectTab={setActiveTab} />;

      case 'reports':
        return <ReportsView />;

      case 'audit':
        return <AuditLogView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-100/90 text-slate-900 ${
        highContrastMode ? 'contrast-125' : ''
      } ${largeTextMode ? 'text-base' : 'text-sm'}`}
    >
      {/* Top Persistent Header with Role Switcher */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Left Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderTabContent()}
        </main>
      </div>

      {/* Persistent Floating MediVoice Assistant */}
      <MediVoiceModal onNavigateTab={setActiveTab} />

      {/* Notification Toast Stream */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
