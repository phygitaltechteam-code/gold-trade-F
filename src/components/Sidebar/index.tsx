/* eslint-disable */

import {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from '@tanstack/react-router';
import SidebarLinkGroup from './SidebarLinkGroup';
import {SidebarProps} from '@/types';
import {IoIosArrowDown} from 'react-icons/io';
import {
  MdDashboard,
  MdSettings,
  MdOutlineVerified,
  MdOutlineMonitor,
  MdOutlinePriceChange,
} from 'react-icons/md';
import {useAuthContext} from '@/context/AuthContext';
import {FaUsers} from 'react-icons/fa';
import {RiMoneyDollarCircleLine} from 'react-icons/ri';
import {TbReportAnalytics} from 'react-icons/tb';
import {LucideBox} from 'lucide-react';

const Sidebar = ({sidebarOpen, setSidebarOpen}: SidebarProps) => {
  const location = useLocation();
  const {pathname} = location;
  const {user} = useAuthContext();

  const isCompany = user?.role === 'COMPANY';
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdmin = user?.role === 'ADMIN'; // Add this back for logo display

  console.log('userrrr', user);

  const isFixedOpenRef = useRef(false);
  const [isFixedOpen, setIsFixedOpen] = useState(false);
  const isExpanded = sidebarOpen || isFixedOpen;

  console.log('isExpandedvbbbn', isExpanded);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [hoveredRect, setHoveredRect] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showSubRoutes, setShowSubRoutes] = useState<{
    label: string;
    subRoutes: any[];
  } | null>(null);

  const handleSignOut = async () => {
    try {
      // Clear everything
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      window.location.href = '/';
    }
  };

  const sidebarRoutes = isCompany
    ? [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: <MdDashboard size={22} />,
        },
        {
          label: 'Add Broker',
          path: '/companybroker/displaybroker',
          icon: <MdDashboard size={22} />,
        },
        {
          label: 'Clients',
          path: '/clients/mainpage',
          icon: <FaUsers size={22} />,
        },
        {
          label: 'KYC Approvals',
          path: '/KYCApproval/kycmain',
          icon: <MdOutlineVerified size={22} />,
        },
        {
          label: 'Live Monitoring',
          path: '/KYCApproval/livemonitoring',
          icon: <MdOutlineMonitor size={22} />,
        },
        {
          label: 'Withdrawal Requests',
          path: '/withdrawlreq/withdrawlRequest',
          icon: <RiMoneyDollarCircleLine size={22} />,
        },
        {
          label: 'Financial Reports',
          path: '/Report/financialReport',
          icon: <TbReportAnalytics size={22} />,
        },
        {
          label: 'Revenue Config',
          path: '/Report/ReviewConfig',
          icon: <MdOutlinePriceChange size={22} />,
        },
        {
          label: 'Admin Registration',
          path: '/superadmin/superadmin',
          icon: <FaUsers size={22} />,
        },
        {
          label: 'Settings',
          icon: <MdSettings size={22} />,
          subRoutes: [
            {label: 'Change Password', path: '/change-password'},
            {label: 'Logout', onClick: () => handleSignOut()},
          ],
        },
      ]
    : isSuperAdmin
      ? [
          {
            label: 'Dashboard',
            path: '/superadmin/superadmin',
            icon: <MdDashboard size={22} />,
          },
        ]
      : [];

  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const {target} = event;
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
      setHoveredRoute(null);
      setShowSubRoutes(null);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const keyHandler = ({keyCode}: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
      setHoveredRoute(null);
      setShowSubRoutes(null);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle screen resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setIsFixedOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get the correct role display text
  const getRoleText = () => {
    if (isAdmin) return 'Admin';
    if (isSuperAdmin) return 'Super Admin';
    if (isCompany) return 'Company';
    return 'User';
  };

  return (
    <div className="relative z-50">
      {/* SIDEBAR */}
      <aside
        ref={sidebar}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-white text-black transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0`}
      >
        {/* Header with Custom Logo Design */}
        <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-6">
          <button
            ref={trigger}
            className="flex items-center gap-3 rounded-lg transition-all duration-200 focus:outline-none"
            onClick={() => {
              const nextState = !isExpanded;
              setSidebarOpen(nextState);
              setIsFixedOpen(nextState);
              setHoveredRoute(null);
              setShowSubRoutes(null);
              setHoveredRect(null);
            }}
          >
            <div className="flex items-center gap-3">
              {/* THE LOGO DESIGN REQUESTED */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6321] shadow-lg shadow-orange-500/20 transition-transform duration-200 hover:scale-105 active:scale-95">
                <LucideBox className="h-6 w-6 text-white" />
              </div>

              {isExpanded && (
                <div className="flex flex-col items-start overflow-hidden">
                  <p className="font-bold text-black-2">GoldTrade</p>
                  <p className="bg-gradient-to-r from-[#FF6321] to-[#FF8C00] bg-clip-text text-xl font-bold text-transparent">
                    {getRoleText()}
                  </p>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* SUB-MENUBAR */}
        <div className="no-scrollbar flex flex-col overflow-y-auto px-2 duration-300 ease-linear">
          <nav className="mt-4 space-y-1 p-2">
            <ul>
              {sidebarRoutes.length > 0 ? (
                sidebarRoutes.map((route, index) =>
                  route.subRoutes ? (
                    <SidebarLinkGroup activeCondition={isExpanded} key={index}>
                      {(handleClick, open) => (
                        <div className="relative">
                          <button
                            onMouseEnter={(e) => {
                              if (!isExpanded) {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setHoveredLabel(route.label);
                                setTooltipPos({
                                  top: rect.top + rect.height / 2,
                                  left: rect.right + 8,
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredLabel(null);
                              setTooltipPos(null);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              const rect = (
                                e.currentTarget as HTMLElement
                              ).getBoundingClientRect();

                              setHoveredRect({
                                top: rect.top,
                                left: rect.right + 5,
                              });
                              setHoveredRoute(route.label);
                              setShowSubRoutes({
                                label: route.label,
                                subRoutes: route.subRoutes || [],
                              });
                            }}
                            className={`group flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-black hover:bg-primary/10 ${
                              pathname.includes(route.path || '')
                                ? 'bg-primary/10'
                                : ''
                            }`}
                          >
                            <span className="text-black transition-colors group-hover:text-primary">
                              {route.icon}
                            </span>
                            {isExpanded && route.label}
                            {isExpanded && (
                              <IoIosArrowDown
                                className={`ml-auto transform duration-200 ${open ? 'rotate-180' : ''}`}
                              />
                            )}
                          </button>
                          {isExpanded && open && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {route.subRoutes.map((subRoute, subIndex) => (
                                <li key={subIndex}>
                                  {subRoute.onClick ? (
                                    <button
                                      onClick={() => {
                                        subRoute.onClick();
                                        setHoveredRoute(null);
                                        setShowSubRoutes(null);
                                        setSidebarOpen(false);
                                      }}
                                      className="block w-full rounded px-3 py-2 text-left text-sm text-black hover:bg-primary/20"
                                    >
                                      {subRoute.label}
                                    </button>
                                  ) : (
                                    <Link
                                      to={subRoute.path}
                                      onClick={() => {
                                        setHoveredRoute(null);
                                        setShowSubRoutes(null);
                                        setSidebarOpen(false);
                                      }}
                                      className="block rounded px-3 py-2 text-sm text-black hover:bg-primary/20"
                                    >
                                      {subRoute.label}
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </SidebarLinkGroup>
                  ) : (
                    <li key={index}>
                      <Link
                        to={route.path}
                        onMouseEnter={(e) => {
                          const rect = (
                            e.currentTarget as unknown as HTMLAnchorElement
                          ).getBoundingClientRect();
                          setHoveredLabel(route.label);
                          setTooltipPos({
                            top: rect.top + rect.height / 2,
                            left: rect.right + 8,
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredLabel(null);
                          setTooltipPos(null);
                        }}
                        onClick={() => {
                          setHoveredRoute(null);
                          setShowSubRoutes(null);
                          setSidebarOpen(false);
                        }}
                        className={`group flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-black hover:bg-primary/10 ${
                          pathname.includes(route.path) ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="text-black transition-colors group-hover:text-primary">
                          {route.icon}
                        </span>
                        {isExpanded && route.label}
                      </Link>
                    </li>
                  ),
                )
              ) : (
                <li className="text-gray-500 px-3 py-2 text-center text-sm">
                  No menu items available
                </li>
              )}
            </ul>
          </nav>
        </div>
      </aside>

      {hoveredLabel && tooltipPos && !isExpanded && (
        <div
          className="fixed z-50 rounded bg-white px-2 py-1 text-xs text-black shadow"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
          }}
        >
          {hoveredLabel}
        </div>
      )}

      {/* Floating Subroute Menu when sidebar is collapsed */}
      {showSubRoutes && hoveredRect && (
        <div
          className="fixed z-[999] w-56 overflow-y-auto rounded-md bg-white p-2 text-black shadow-lg"
          style={{
            top: (() => {
              const menuItemCount = showSubRoutes.subRoutes.length;
              const estimatedHeight = menuItemCount * 40 + 20;
              const maxTop = window.innerHeight - estimatedHeight - 20;
              return Math.min(hoveredRect.top, maxTop);
            })(),
            left: hoveredRect.left + 5,
            maxHeight: 'calc(100vh - 100px)',
          }}
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
              setHoveredRoute(null);
              setShowSubRoutes(null);
              setHoveredRect(null);
            }, 300);
          }}
        >
          {showSubRoutes.subRoutes.map((subRoute, subIndex) =>
            subRoute.onClick ? (
              <button
                key={subIndex}
                onClick={() => {
                  subRoute.onClick();
                  setHoveredRect(null);
                  setHoveredRoute(null);
                  setShowSubRoutes(null);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-black hover:bg-primary/10"
              >
                {subRoute.label}
              </button>
            ) : (
              <Link
                key={subIndex}
                to={subRoute.path}
                onClick={() => {
                  setHoveredRect(null);
                  setHoveredRoute(null);
                  setShowSubRoutes(null);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-black hover:bg-primary/10"
              >
                {subRoute.label}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
