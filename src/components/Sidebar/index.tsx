/* eslint-disable */

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import SidebarLinkGroup from './SidebarLinkGroup';
import { SidebarProps } from '@/types';
import { IoIosArrowDown } from 'react-icons/io';
import {
  MdDashboard,
  MdSettings,
  MdOutlineVerified,
  MdOutlineMonitor,
  MdOutlinePriceChange,
  MdPersonAdd,
  MdHistory,
} from 'react-icons/md';
import { useAuthContext } from '@/context/AuthContext';
import { FaUsers, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { TbReportAnalytics, TbUserStar } from 'react-icons/tb';
import {
  LucideBox,
  UserPlus,
  Wallet,
  FileText,
  LayoutDashboard,
  UserCog,
  Activity,
  Users,
  Clock,
  HandCoins,
  BarChart3,
  Settings,
  Receipt,
  Key,
  LogOut,
  User,
} from 'lucide-react';
import { useGetProfile } from '@/lib/react-query/admin';
import { useGetMasterbrokerProfile } from '@/lib/react-query/masterbroker';
import { useGetSuperbrokerProfile } from '@/lib/react-query/superbrocker';

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { user } = useAuthContext();

  const isCompany = user?.role === 'COMPANY';
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isBroker = user?.role === 'BROKER';
  const isCustomer = user?.role === 'CUSTOMER';
  const isSuperBroker =
    user?.role === 'SUPER_BROKER' || user?.role === 'SUPERBROKER';
  const isMasterBroker = user?.role === 'MASTER_BROKER';

  // Get profile based on role
  let profileData;
  if (isCompany) {
    const { data } = useGetProfile();
    profileData = data;
  } else if (isMasterBroker) {
    const { data } = useGetMasterbrokerProfile();
    profileData = data;
  } else if (isSuperBroker) {
    const { data } = useGetSuperbrokerProfile();
    profileData = data;
  }

  const profile = profileData?.data || profileData;

  const isFixedOpenRef = useRef(false);
  const [isFixedOpen, setIsFixedOpen] = useState(false);
  const isExpanded = sidebarOpen || isFixedOpen;

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
        icon: <LayoutDashboard size={22} />,
      },
      {
        label: 'Super Broker',
        path: '/companybroker/DisplaySuperBroker',
        icon: <TbUserStar size={22} />,
      },
      {
        label: 'Master Broker',
        path: '/companybroker/display-master-broker',
        icon: <TbUserStar size={22} />,
      },
      {
        label: 'Broker',
        path: '/companybroker/displaybroker',
        icon: <UserCog size={22} />,
      },
      {
        label: 'Traders',
        path: '/clients/mainpage',
        icon: <Users size={22} />,
      },
      {
        label: 'Live Monitoring',
        path: '/TransactionLedger',
        icon: <Activity size={22} />,
      },

      {
        label: 'Pending Approvals',
        path: '/Approval/pendingapprovals',
        icon: <Clock size={22} />,
      },
      {
        label: 'Withdrawal Requests',
        path: '/withdrawlreq/withdrawlRequest',
        icon: <HandCoins size={22} />,
      },
      {
        label: 'Deposite ',
        path: '/companybroker/depositeall',
        icon: <LucideBox size={22} />,
      },
      {
        label: 'Settings',
        path: '/profile',
        icon: <Settings size={22} />,
      },
      //  {
      //       label: 'Logout',
      //       onClick: () => handleSignOut(),
      //       icon: <LogOut size={18} />, },
    ]
    : isSuperAdmin
      ? [
        {
          label: 'Dashboard',
          path: '/superadmin/superadmin',
          icon: <LayoutDashboard size={22} />,
        },
        {
          label: 'Master Broker',
          path: '/companybroker/display-master-broker',
          icon: <TbUserStar size={22} />,
        },
        {
          label: 'Super Broker',
          path: '/companybroker/DisplaySuperBroker',
          icon: <TbUserStar size={22} />,
        },
        {
          label: 'Broker',
          path: '/companybroker/displaybroker',
          icon: <UserCog size={22} />,
        },
        {
          label: 'Live Monitoring',
          path: '/TransactionLedger',
          icon: <Activity size={22} />,
        },
        {
          label: 'Clients',
          path: '/clients/mainpage',
          icon: <Users size={22} />,
        },
        {
          label: 'Settings',
          icon: <Settings size={22} />,
          subRoutes: [
            {
              label: 'Profile',
              path: '/superadmin/profile',
              icon: <User size={18} />,
            },
            {
              label: 'Change Password',
              path: '/change-password',
              icon: <Key size={18} />,
            },

            {
              label: 'Logout',
              onClick: () => handleSignOut(),
              icon: <LogOut size={18} />,
            },
          ],
        },
      ]
      : isBroker
        ? [
          {
            label: 'Dashboard',
            path: '/broker/brokerdashboard',
            icon: <LayoutDashboard size={22} />,
          },
          {
            label: 'Commission History',
            path: '/broker/commissionhistory',
            icon: <HandCoins size={22} />,
          },
          {
            label: 'Transaction Ledger',
            path: '/brokerledger',
            icon: <Receipt size={22} />,
          },
          // {
          //   label: 'Profile',
          //   path: '/broker/brokerprofiles',
          //   icon: <UserCog size={22} />,
          // },
          {
            label: 'Setting',
            icon: <Settings size={22} />,

            path: '/broker/brokerprofiles',

          },
        ]
        : isCustomer
          ? [
            {
              label: 'Dashboard',
              path: '/customer/dashboard',
              icon: <LayoutDashboard size={22} />,
            },
            {
              label: 'My Orders',
              path: '/customer/orders',
              icon: <LucideBox size={22} />,
            },
            {
              label: 'Settings',
              icon: <Settings size={22} />,
              subRoutes: [
                {
                  label: 'Change Password',
                  path: '/change-password',
                  icon: <Key size={18} />,
                },
                {
                  label: 'Logout',
                  onClick: () => handleSignOut(),
                  icon: <LogOut size={18} />,
                },
              ],
            },
          ]
          : isSuperBroker
            ? [
              {
                label: 'Dashboard',
                path: '/superbroker/superbrokerdashbaord',
                icon: <LayoutDashboard size={22} />,
              },
              {
                label: 'Broker List',
                path: '/broker/displaybroker',
                icon: <UserCog size={22} />,
              },
              {
                label: 'Commission History',
                path: '/superbrokercommissionhistory',
                icon: <HandCoins size={22} />,
              },
              {
                label: 'Transaction Ledger',
                path: '/superbrokertransaction',
                icon: <Receipt size={22} />,
              },
              {
                label: 'Settings',

                path: '/broker/superbrokerprofile',
                icon: <Settings size={22} />,

                // {
                //   label: 'Logout',
                //   onClick: () => handleSignOut(),
                //   icon: <LogOut size={18} />,
                // },

              },
            ]
            : isMasterBroker
              ? [
                {
                  label: 'Dashboard',
                  path: '/masterbroker/dashboard',
                  icon: <LayoutDashboard size={22} />,
                },
                {
                  label: 'Trader Dashboard',
                  path: '/masterbroker/client-dashboard',
                  icon: <UserCog size={22} />,
                },
                {
                  label: 'Ledger Transaction',
                  path: '/masterbroker/ledger-transaction',
                  icon: <HandCoins size={22} />,
                },
                {
                  label: 'Widraw Request',
                  path: '/masterbroker/widrawrequest',
                  icon: <UserCog size={22} />,
                },
                {
                  label: 'Deposit',
                  path: '/masterbroker/depositmaster',
                  icon: <LucideBox size={22} />,
                },
                {
                  label: 'Settings',

                  path: '/masterbroker/profile',
                  icon: <Settings size={22} />,

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
      const { target } = event;
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
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
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

  const getRoleText = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Admin';
    if (isCompany) return 'Company';
    if (isSuperBroker) return 'Super Broker';
    if (isMasterBroker) return 'Master Broker';
    if (isBroker) return 'Broker';
    if (isCustomer) return 'Customer';
    return 'User';
  };

  const getUserName = () => {
    if (profile?.fullname) return profile.fullname;
    if (profile?.user?.fullname) return profile.user.fullname;
    if (user?.fullname) return user.fullname;
    if (user?.name) return user.name;
    return 'GoldTrade';
  };

  const getUserImage = () => {
    if (profile?.photo) return profile.photo;
    if (profile?.user?.photo) return profile.user.photo;
    return '/default-avatar.png';
  };

  // Width classes based on expanded state
  const sidebarWidth = isExpanded ? 'w-64' : 'w-20';

  return (
    <div className="relative z-50">
      <aside
        ref={sidebar}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-white text-black shadow-lg transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:translate-x-0 ${sidebarWidth}`}
      >
        <div className={`flex items-center ${isExpanded ? 'px-4 py-3 lg:px-5 lg:py-6' : 'justify-center px-2 py-3 lg:py-6'}`}>
          <button
            ref={trigger}
            className={`flex items-center gap-3 rounded-lg transition-all duration-200 focus:outline-none ${!isExpanded ? 'justify-center' : ''
              }`}
            onClick={() => {
              const nextState = !isExpanded;
              setSidebarOpen(nextState);
              setIsFixedOpen(nextState);
              setHoveredRoute(null);
              setShowSubRoutes(null);
              setHoveredRect(null);
            }}
          >
            <div className={`flex ${isExpanded ? 'items-center gap-3' : 'items-center justify-center'}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-lg shadow-orange-500/20 transition-transform duration-200 hover:scale-105 active:scale-95 ${!isExpanded ? 'mx-auto' : ''}`}>
                <img
                  src={getUserImage()}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              {isExpanded && (
                <div className="flex flex-col items-start overflow-hidden">
                  <p className="font-bold text-black-2 text-sm truncate max-w-[120px]">
                    {getUserName()}
                  </p>
                  <p className="bg-gradient-to-r from-[#FF6321] to-[#FF8C00] bg-clip-text text-xs font-semibold text-transparent">
                    {getRoleText()}
                  </p>
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto px-2 duration-300 ease-linear">
          <nav className={`${isExpanded ? 'mt-4 space-y-1 p-2' : 'mt-2 space-y-1 p-1'}`}>
            <ul>
              {sidebarRoutes.length > 0 ? (
                sidebarRoutes.map((route, index) =>
                  route.subRoutes ? (
                    <SidebarLinkGroup activeCondition={true} key={index}>
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
                              if (isExpanded) {
                                handleClick();
                                return;
                              }
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
                            className={`group flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-black hover:bg-primary/10 ${pathname.includes(route.path || '')
                              ? 'bg-primary/10'
                              : ''
                              } ${!isExpanded ? 'justify-center' : ''}`}
                          >
                            <span className={`text-black transition-colors group-hover:text-primary ${!isExpanded ? 'mx-auto' : ''}`}>
                              {route.icon}
                            </span>
                            {isExpanded && route.label}
                            {isExpanded && (
                              <IoIosArrowDown
                                className={`ml-auto transform duration-200 ${open ? 'rotate-180' : ''
                                  }`}
                              />
                            )}
                          </button>
                          {open && isExpanded && (
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
                                      <span className="flex items-center gap-2">
                                        {subRoute.icon}
                                        {subRoute.label}
                                      </span>
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
                                      <span className="flex items-center gap-2">
                                        {subRoute.icon}
                                        {subRoute.label}
                                      </span>
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
                          if (!isExpanded) {
                            const rect = (
                              e.currentTarget as unknown as HTMLAnchorElement
                            ).getBoundingClientRect();
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
                        onClick={() => {
                          setHoveredRoute(null);
                          setShowSubRoutes(null);
                          setSidebarOpen(false);
                        }}
                        className={`group flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-black hover:bg-primary/10 ${pathname.includes(route.path) ? 'bg-primary/10' : ''
                          } ${!isExpanded ? 'justify-center' : ''}`}
                      >
                        <span className={`text-black transition-colors group-hover:text-primary ${!isExpanded ? 'mx-auto' : ''}`}>
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
        </div><div className="mt-auto px-2 py-2">
          <button
            onClick={handleSignOut}
            className={`flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 ${!isExpanded ? 'justify-center' : ''
              }`}
          >
            <LogOut className={`h-5 w-5 ${!isExpanded ? 'mx-auto' : ''}`} />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Tooltip for collapsed sidebar */}
      {hoveredLabel && tooltipPos && !isExpanded && (
        <div
          className="fixed z-[999] rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-black shadow-lg pointer-events-none"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
          }}
        >
          {hoveredLabel}
        </div>
      )}

      {/* Submenu popup for collapsed sidebar */}
      {showSubRoutes && hoveredRect && !isExpanded && (
        <div
          className="fixed z-[999] w-56 overflow-y-auto rounded-md bg-white p-2 text-black shadow-lg border border-gray-200"
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
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-black hover:bg-primary/10 transition-colors"
              >
                <span className="text-gray-600">{subRoute.icon}</span>
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
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-black hover:bg-primary/10 transition-colors"
              >
                <span className="text-gray-600">{subRoute.icon}</span>
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