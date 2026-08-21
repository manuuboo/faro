import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import HomeView from '../components/dashboard/HomeView';
import SalesView from '../components/dashboard/SalesView';
import InventoryView from '../components/dashboard/InventoryView';
import PurchasesView from '../components/dashboard/PurchasesView';
import ClientsView from '../components/dashboard/ClientsView';
import SuppliersView from '../components/dashboard/SuppliersView';
import ReportsView from '../components/dashboard/ReportsView';
import SettingsView from '../components/dashboard/SettingsView';
import InvoicesView from '../components/dashboard/InvoicesView';
import ChatView from '../components/dashboard/ChatView';
import NotificationPanel from '../components/dashboard/NotificationPanel';
import ProfileMenu from '../components/dashboard/ProfileMenu';
import HelpTutorial from '../components/dashboard/HelpTutorial';
import MobileBottomNav from '../components/dashboard/MobileBottomNav';
import MasMenu from '../components/dashboard/MasMenu';
import { getUserData, isOnboardingComplete, isTutorialComplete } from '../services/storage';
import { useBusinessData } from '../hooks/useBusinessData';
import type { OnboardingData } from '../types/onboarding';
import './Dashboard.css';

export type DashboardSection =
  | 'home'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'clients'
  | 'suppliers'
  | 'finances'
  | 'reports'
  | 'invoices'
  | 'settings'
  | 'chat';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DashboardSection>('home');
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMasMenu, setShowMasMenu] = useState(false);

  const businessContext = useBusinessData();

  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate('/onboarding');
      return;
    }
    const ud = getUserData();
    setUserData(ud);

    // Show tutorial on first visit
    if (!isTutorialComplete()) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }

    const handleOpenTutorial = () => setShowTutorial(true);
    window.addEventListener('open-tutorial', handleOpenTutorial);
    return () => window.removeEventListener('open-tutorial', handleOpenTutorial);
  }, [navigate]);

  const handleNavigate = useCallback((section: DashboardSection) => {
    setActiveSection(section);
    setShowNotifications(false);
    setShowProfileMenu(false);
    setShowMasMenu(false);
  }, []);

  const handleOpenChat = useCallback(() => {
    setActiveSection('chat');
    setShowNotifications(false);
    setShowProfileMenu(false);
    setShowMasMenu(false);
  }, []);

  if (!userData) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <HomeView
            userData={userData}
            business={businessContext}
            onNavigate={handleNavigate}
            onOpenChat={handleOpenChat}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenHelp={() => setShowTutorial(true)}
          />
        );
      case 'sales':
        return <SalesView business={businessContext} />;
      case 'purchases':
        return <PurchasesView business={businessContext} />;
      case 'inventory':
        return <InventoryView business={businessContext} />;
      case 'clients':
        return <ClientsView business={businessContext} />;
      case 'suppliers':
        return <SuppliersView business={businessContext} />;
      case 'finances':
        return <SalesView business={businessContext} />;
      case 'reports':
        return <ReportsView business={businessContext} />;
      case 'invoices':
        return <InvoicesView business={businessContext} />;
      case 'settings':
        return (
          <SettingsView
            userData={userData}
            business={businessContext}
            onUserDataChange={setUserData}
            onRestartTutorial={() => setShowTutorial(true)}
          />
        );
      case 'chat':
        return <ChatView userData={userData} />;
      default:
        return <HomeView userData={userData} business={businessContext} onNavigate={handleNavigate} onOpenChat={handleOpenChat} onOpenNotifications={() => setShowNotifications(true)} onOpenHelp={() => setShowTutorial(true)} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        userData={userData}
        onProfileClick={() => setShowProfileMenu(v => !v)}
        unreadNotifications={businessContext.stats.unreadNotifications}
        showProfileMenu={showProfileMenu}
      />
      <main className="dashboard-main" id="main-content">
        {activeSection !== 'home' && (
          <div className="mobile-back-header">
            <button className="mobile-back-btn" onClick={() => handleNavigate('home')} aria-label="Volver al inicio">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Inicio</span>
            </button>
          </div>
        )}
        {renderContent()}
      </main>

      <MobileBottomNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenChat={handleOpenChat}
        onOpenMas={() => setShowMasMenu(true)}
        unreadNotifications={businessContext.stats.unreadNotifications}
      />

      {/* Overlays */}
      {showMasMenu && (
        <MasMenu
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onClose={() => setShowMasMenu(false)}
          userData={userData}
          onOpenNotifications={() => setShowNotifications(true)}
          onLogout={() => {
            import('../services/storage').then(({ clearUserData }) => {
              clearUserData();
              navigate('/onboarding');
            });
          }}
          unreadNotifications={businessContext.stats.unreadNotifications}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          notifications={businessContext.data.notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={businessContext.markNotificationRead}
          onMarkAllRead={businessContext.markAllNotificationsRead}
          onClear={businessContext.clearNotifications}
        />
      )}

      {showProfileMenu && (
        <ProfileMenu
          userData={userData}
          onClose={() => setShowProfileMenu(false)}
          onNavigate={(section) => {
            handleNavigate(section);
            setShowProfileMenu(false);
          }}
          onLogout={() => {
            import('../services/storage').then(({ clearUserData }) => {
              clearUserData();
              navigate('/onboarding');
            });
          }}
        />
      )}

      {showTutorial && (
        <HelpTutorial
          onClose={() => setShowTutorial(false)}
          onNavigate={handleNavigate}
          onOpenChat={handleOpenChat}
        />
      )}
    </div>
  );
}
