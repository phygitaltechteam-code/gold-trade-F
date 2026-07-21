import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthContext } from '@/context/AuthContext';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import React, { useEffect, useState, useRef } from 'react';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuthContext();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/signin' });
      return;
    }

    // Skip navigation on initial mount if already on a valid page
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Only navigate if on root path
      if (location.pathname === '/') {
        const defaultRoute = getDefaultRoute(user?.role);
        navigate({ to: defaultRoute });
      }
      return;
    }

    // After initial mount, only navigate if on auth pages or root
    const isAuthPage = ['/signin', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

    if (isAuthPage) {
      const defaultRoute = getDefaultRoute(user?.role);
      navigate({ to: defaultRoute });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  // Get default route based on role
  const getDefaultRoute = (role?: string) => {
    if (role === 'COMPANY') return '/dashboard';
    if (role === 'SUPERADMIN') return '/superadmin/superadmin';
    if (role === 'BROKER') return '/broker/brokerdashboard';
    if (role === 'SUPER_BROKER' || role === 'SUPERBROKER') return '/superbroker/superbrokerdashbaord';
    if (role === 'MASTER_BROKER') return '/masterbroker/dashboard';
    return '/';
  };

  return (
    <div className="bg-white dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {isAuthenticated && (
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#f8fafc]">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;