import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { OfflineModal } from './components/layout/OfflineModal';
import { SignOutConfirmModal } from './components/common/SignOutConfirmModal';
import { PermissionReminderDialog } from './components/common/PermissionReminderDialog';

// Modals
import { IncomingOrderModal } from './screens/main/IncomingOrderModal';
import { OrderDetailModal } from './screens/main/OrderDetailModal';

// Pre-auth screens
import { SplashScreen } from './screens/preauth/SplashScreen';
import { WelcomeScreen } from './screens/preauth/WelcomeScreen';
import { OnboardingScreen } from './screens/preauth/OnboardingScreen';
import { TermsConditionsScreen } from './screens/preauth/TermsConditionsScreen';
import { PrivacyPolicyScreen } from './screens/preauth/PrivacyPolicyScreen';
import { LegalAcceptanceScreen } from './screens/preauth/LegalAcceptanceScreen';
import { PermissionsScreen } from './screens/preauth/PermissionsScreen';
import { LoginScreen } from './screens/preauth/LoginScreen';
import { OtpScreen } from './screens/preauth/OtpScreen';
import { RegistrationScreen } from './screens/preauth/RegistrationScreen';
import { DocumentUploadScreen } from './screens/preauth/DocumentUploadScreen';
import { VerificationStatusScreen } from './screens/preauth/VerificationStatusScreen';
import { ApprovalScreen } from './screens/preauth/ApprovalScreen';
import { RestaurantSetupScreen } from './screens/preauth/RestaurantSetupScreen';

// Main screens
import { DashboardScreen } from './screens/main/DashboardScreen';
import { OrdersScreen } from './screens/main/OrdersScreen';
import { MenuScreen } from './screens/main/MenuScreen';
import { FinanceScreen } from './screens/main/FinanceScreen';
import { AnalyticsScreen } from './screens/main/AnalyticsScreen';
import { ReviewsScreen } from './screens/main/ReviewsScreen';
import { OffersScreen } from './screens/main/OffersScreen';
import { ProfileScreen } from './screens/main/ProfileScreen';
import { DocumentsScreen } from './screens/main/DocumentsScreen';
import { StaffScreen } from './screens/main/StaffScreen';
import { NotificationsScreen } from './screens/main/NotificationsScreen';
import { InventoryScreen } from './screens/main/InventoryScreen';
import { SupportScreen } from './screens/main/SupportScreen';
import { SettingsScreen } from './screens/main/SettingsScreen';
import { AdminScreen } from './screens/main/AdminScreen';

import { VolumeX } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentScreen,
    isAudioUnlocked,
    unlockAudio,
    showToast,
  } = useApp();

  const isPreAuth = [
    'splash',
    'welcome',
    'terms',
    'privacy',
    'acceptance',
    'permissions',
    'onboarding',
    'login',
    'otp',
    'register',
    'documents',
    'verification_status',
    'approval',
    'setup',
  ].includes(currentScreen);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      // Pre-Auth
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'terms':
      case 'privacy':
      case 'acceptance':
        return <TermsConditionsScreen />;
      case 'permissions':
        return <PermissionsScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'register':
        return <RegistrationScreen />;
      case 'documents':
        return <DocumentUploadScreen />;
      case 'verification_status':
        return <VerificationStatusScreen />;
      case 'approval':
        return <ApprovalScreen />;
      case 'setup':
        return <RestaurantSetupScreen />;

      // Main Section
      case 'dashboard':
        return <DashboardScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'menu':
        return <MenuScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'offers':
        return <OffersScreen />;
      case 'settings':
        return <SettingsScreen />;

      // Business Tools
      case 'inventory':
        return <InventoryScreen />;
      case 'earnings':
        return <FinanceScreen />;
      case 'reviews':
        return <ReviewsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'documents_compliance':
        return <DocumentsScreen />;
      case 'staff':
        return <StaffScreen />;
      case 'notifications_center':
        return <NotificationsScreen />;
      case 'support':
        return <SupportScreen />;
      case 'admin':
        return <AdminScreen />;

      default:
        return <DashboardScreen />;
    }
  };

  const appView = isPreAuth ? (
    <div className="min-h-screen bg-slate-50">{renderCurrentScreen()}</div>
  ) : (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex min-w-0 relative">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-12 bg-slate-50">
          {renderCurrentScreen()}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Audio Permission Alert Banner (if browser blocked autoplay) */}
      {!isAudioUnlocked && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-feedo-600 text-white px-3 sm:px-4 py-2 text-xs flex items-center justify-between gap-2 shadow-xs sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <strong>Order Sound Notice:</strong> Click anywhere on screen or tap here to enable loud audio alerts when orders are assigned to your restaurant.
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              const ok = await unlockAudio();
              if (ok) {
                showToast('🔔 Order alert sound enabled!', 'success');
              }
            }}
            className="px-3 py-1 bg-white text-slate-900 font-black rounded-lg hover:bg-amber-100 transition-colors shrink-0 text-[11px] shadow-xs cursor-pointer ml-2"
          >
            Enable Sound
          </button>
        </div>
      )}

      {/* Modals & Slide-overs */}
      <ToastContainer />
      <IncomingOrderModal />
      <OrderDetailModal />
      <NotificationsDrawer />
      <OfflineModal />
      <SignOutConfirmModal />
      <PermissionReminderDialog />

      {/* Main Responsive Application */}
      <div className="flex-1">{appView}</div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
