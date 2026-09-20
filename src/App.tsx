import React, { useState, useEffect, useCallback } from 'react';
import { ClientAccount, ScreenDevice } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminAccountsManager } from './components/AdminAccountsManager';
import { ScreenPlayer } from './components/ScreenPlayer';
import { AdminLogin } from './components/AdminLogin';
import { ClientLogin } from './components/ClientLogin';
import { UnifiedLogin } from './components/UnifiedLogin';
import { ScreenPlayerLauncher } from './components/ScreenPlayerLauncher';
import { PortalGateway } from './components/PortalGateway';
import { TamyLogo } from './components/TamyLogo';
import { 
  Tv, 
  ShieldCheck, 
  Sliders, 
  Phone, 
  Mail, 
  Globe, 
  Radio, 
  Layers
} from 'lucide-react';

export type PortalType = 'gateway' | 'admin' | 'client' | 'player' | 'login';

export default function App() {
  const [accounts, setAccounts] = useState<ClientAccount[]>(() => StorageService.getAccounts());
  const [screens, setScreens] = useState<ScreenDevice[]>(() => StorageService.getScreens());
  
  // Sessions
  const [adminSession, setAdminSession] = useState<{ email: string; name: string } | null>(() =>
    StorageService.getAdminSession()
  );
  const [clientSession, setClientSession] = useState<{ accountId: string } | null>(() =>
    StorageService.getClientSession()
  );

  // Active Client Account
  const [activeAccount, setActiveAccount] = useState<ClientAccount | null>(() => {
    const list = StorageService.getAccounts();
    const savedSess = StorageService.getClientSession();
    if (savedSess?.accountId) {
      const found = list.find(a => a.id === savedSess.accountId);
      if (found) return found;
    }
    return list[0] || null;
  });

  // Active Screen for Client Dashboard
  const [activeScreenId, setActiveScreenId] = useState<string>(() => {
    const list = StorageService.getScreens(activeAccount?.id);
    return list[0]?.id || '';
  });

  // Player State
  const [playerScreenCode, setPlayerScreenCode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam) return screenParam;
    return null;
  });

  const [savedScreenCode, setSavedScreenCode] = useState<string | null>(() =>
    StorageService.getSavedScreenCode()
  );

  // Current Portal from URL / initial state
  const [portal, setPortal] = useState<PortalType>(() => {
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    const screenParam = params.get('screen');
    const hash = window.location.hash.replace('#/', '').replace('#', '');

    if (screenParam) return 'player';
    if (portalParam === 'admin' || hash === 'admin') return 'admin';
    if (portalParam === 'client' || hash === 'client') return 'client';
    if (portalParam === 'player' || hash === 'player') return 'player';
    if (portalParam === 'login' || hash === 'login') return 'login';
    return 'gateway';
  });

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      const screenParam = params.get('screen');
      const accountParam = params.get('account');
      const hash = window.location.hash.replace('#/', '').replace('#', '');

      if (screenParam) {
        setPortal('player');
        setPlayerScreenCode(screenParam);
      } else if (portalParam === 'admin' || hash === 'admin') {
        setPortal('admin');
        setPlayerScreenCode(null);
      } else if (portalParam === 'client' || hash === 'client') {
        setPortal('client');
        setPlayerScreenCode(null);
        if (accountParam) {
          const acc = StorageService.getAccounts().find(a => a.id === accountParam);
          if (acc) {
            setActiveAccount(acc);
            StorageService.setClientSession({ accountId: acc.id });
            setClientSession({ accountId: acc.id });
          }
        }
      } else if (portalParam === 'player' || hash === 'player') {
        setPortal('player');
      } else if (portalParam === 'login' || hash === 'login') {
        setPortal('login');
        setPlayerScreenCode(null);
      } else {
        setPortal('gateway');
        setPlayerScreenCode(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync with URL navigation
  const navigateToPortal = useCallback(
    (targetPortal: PortalType, extraParams?: Record<string, string>) => {
      const url = new URL(window.location.href);

      if (targetPortal === 'gateway') {
        url.searchParams.delete('portal');
        url.searchParams.delete('screen');
        url.searchParams.delete('account');
        window.history.pushState({}, '', url.pathname);
      } else {
        url.searchParams.set('portal', targetPortal);
        if (extraParams) {
          Object.entries(extraParams).forEach(([k, v]) => {
            if (v) url.searchParams.set(k, v);
            else url.searchParams.delete(k);
          });
        }
        if (targetPortal !== 'player') {
          url.searchParams.delete('screen');
        }
        window.history.pushState({}, '', url.toString());
      }

      setPortal(targetPortal);
    },
    []
  );

  // Sync state whenever accounts or screens change
  const reloadData = useCallback(() => {
    const refreshedAccounts = StorageService.getAccounts();
    const refreshedScreens = StorageService.getScreens();
    setAccounts(refreshedAccounts);
    setScreens(refreshedScreens);

    // Keep active account updated
    if (activeAccount) {
      const updatedActive = refreshedAccounts.find(a => a.id === activeAccount.id);
      setActiveAccount(updatedActive || refreshedAccounts[0] || null);
    } else if (refreshedAccounts.length > 0) {
      setActiveAccount(refreshedAccounts[0]);
    } else {
      setActiveAccount(null);
    }

    setSavedScreenCode(StorageService.getSavedScreenCode());
  }, [activeAccount]);

  // When active account changes, update active screen
  useEffect(() => {
    const accountScreens = StorageService.getScreens(activeAccount?.id);
    if (accountScreens.length > 0) {
      const exists = accountScreens.find(s => s.id === activeScreenId);
      if (!exists) {
        setActiveScreenId(accountScreens[0].id);
      }
    } else {
      setActiveScreenId('');
    }
  }, [activeAccount, activeScreenId]);

  // Subscribe to cloud sync events
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(msg => {
      if (msg.type === 'SCREEN_REFRESH' || msg.type === 'HEARTBEAT' || msg.type === 'SCHEDULE_UPDATED') {
        const freshScreens = StorageService.getScreens();
        setScreens(freshScreens);
      }
    });
    return () => unsubscribe();
  }, []);

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (session: { email: string; name: string }) => {
    StorageService.setAdminSession(session);
    setAdminSession(session);
  };

  const handleAdminLogout = () => {
    StorageService.setAdminSession(null);
    setAdminSession(null);
    navigateToPortal('gateway');
  };

  // Client Auth Handlers
  const handleClientLoginSuccess = (account: ClientAccount) => {
    StorageService.setClientSession({ accountId: account.id });
    setClientSession({ accountId: account.id });
    setActiveAccount(account);
    // Update URL param
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'client');
    url.searchParams.set('account', account.id);
    window.history.pushState({}, '', url.toString());
  };

  const handleClientLogout = () => {
    StorageService.setClientSession(null);
    setClientSession(null);
    setActiveAccount(null);
    navigateToPortal('gateway');
  };

  // Player Launch Handlers
  const handleLaunchPlayer = (screenCode: string, saveOnDevice: boolean) => {
    setPlayerScreenCode(screenCode);
    if (saveOnDevice) {
      StorageService.setSavedScreenCode(screenCode);
      setSavedScreenCode(screenCode);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'player');
    url.searchParams.set('screen', screenCode);
    window.history.pushState({}, '', url.toString());
  };

  const handleChangeScreenInPlayer = () => {
    setPlayerScreenCode(null);
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'player');
    url.searchParams.delete('screen');
    window.history.pushState({}, '', url.toString());
  };

  const handleExitPlayer = () => {
    setPlayerScreenCode(null);
    navigateToPortal('gateway');
  };

  // Admin selecting client to enter their dashboard
  const handleAdminSelectAccountForDashboard = (account: ClientAccount) => {
    StorageService.setClientSession({ accountId: account.id });
    setClientSession({ accountId: account.id });
    setActiveAccount(account);
    navigateToPortal('client', { account: account.id });
  };

  // ==========================================
  // RENDER PORTALS
  // ==========================================

  // 1. Full-screen Player Mode (when screen code is active)
  if (portal === 'player' && playerScreenCode) {
    return (
      <ScreenPlayer
        screenCode={playerScreenCode}
        onExitPlayer={handleExitPlayer}
        onChangeScreen={handleChangeScreenInPlayer}
        isEmbedded={false}
      />
    );
  }

  // 2. Player Launcher Mode (code entry / select screen / saved screen)
  if (portal === 'player' && !playerScreenCode) {
    return (
      <ScreenPlayerLauncher
        screens={screens}
        accounts={accounts}
        initialCode={savedScreenCode || undefined}
        onLaunchScreen={handleLaunchPlayer}
        onNavigatePortal={navigateToPortal}
      />
    );
  }

  // 3. Admin Portal
  if (portal === 'admin') {
    // If not logged in as Admin, show Admin Login page
    if (!adminSession) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onNavigatePortal={navigateToPortal}
        />
      );
    }

    // Admin Logged In: Full Admin Accounts & Screen Limits Management
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
        <Header
          activePortal="admin"
          onLogout={handleAdminLogout}
          adminData={adminSession}
          onOpenScreens={() => navigateToPortal('player')}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminAccountsManager
            accounts={accounts}
            screens={screens}
            onAccountsChange={reloadData}
            onSelectAccountForDashboard={handleAdminSelectAccountForDashboard}
          />
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            نظام تامي الرقمي لإدارة الشاشات الإعلانية © {new Date().getFullYear()} — بوابة الإدارة المركزية
          </div>
        </footer>
      </div>
    );
  }

  // 4. Client Portal
  if (portal === 'client') {
    // If no client account is logged in, show Client Login page
    if (!clientSession || !activeAccount) {
      return (
        <ClientLogin
          accounts={accounts}
          preselectedAccountId={activeAccount?.id}
          onLoginSuccess={handleClientLoginSuccess}
          onNavigatePortal={navigateToPortal}
        />
      );
    }

    // Client Logged In: Full Screens & Scheduling Management
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
        <Header
          activePortal="client"
          onLogout={handleClientLogout}
          activeAccount={activeAccount}
          onOpenScreens={() => navigateToPortal('player')}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ClientDashboard
            activeAccount={activeAccount}
            screens={screens.filter(s => s.accountId === activeAccount.id)}
            activeScreenId={activeScreenId}
            setActiveScreenId={setActiveScreenId}
            onRefreshData={reloadData}
            onOpenPlayer={(screenCode) => {
              setPlayerScreenCode(screenCode);
              navigateToPortal('player', { screen: screenCode });
            }}
          />
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            منصة تامي الرقمية لإدارة الشاشات — حساب {activeAccount.name} ({activeAccount.companyName})
          </div>
        </footer>
      </div>
    );
  }

  // 5. Unified Login Portal
  if (portal === 'login') {
    return (
      <UnifiedLogin
        accounts={accounts}
        onAdminLoginSuccess={(session) => {
          handleAdminLoginSuccess(session);
          navigateToPortal('admin');
        }}
        onClientLoginSuccess={(account) => {
          handleClientLoginSuccess(account);
          navigateToPortal('client', { account: account.id });
        }}
        onNavigatePortal={navigateToPortal}
      />
    );
  }

  // 6. Default: Portal Gateway (Central Landing Page)
  return (
    <PortalGateway
      onSelectPortal={(selected) => navigateToPortal(selected)}
      screensCount={screens.length}
      accountsCount={accounts.length}
    />
  );
}
