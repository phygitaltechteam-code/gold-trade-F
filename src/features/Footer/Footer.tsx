import {useState, useRef, useEffect} from 'react';
import {
  FaEllipsisV,
  FaThLarge,
  FaUsers,
  FaUser,
  FaCog,
  FaCreditCard,
  FaUserCircle,
} from 'react-icons/fa';
import {motion, AnimatePresence} from 'framer-motion';
import {useNavigate, useLocation} from '@tanstack/react-router';
import {User2} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    icon: FaThLarge,
    to: '/dashboard',
    iconSize: 'text-xl',
  },
  {
    label: 'Account',
    icon: FaCreditCard,

    to: '/eprivate/eprivatereports',
    iconSize: 'text-xl',
  },

  // {
  //   label: 'Transaction',
  //   icon: FaUser,
  //   to: '/wallet/paymentdashbord',
  //   iconSize: 'text-xl',
  // },

  {
    label: 'Profile',
    icon: FaUserCircle,
    to: '/accounthub/acounthub',
    iconSize: 'text-xl',
  },
];

const Footer = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showTooltip = (label: string) => setActiveTooltip(label);
  const hideTooltip = () => setActiveTooltip(null);

  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
    setActiveTooltip(null);
  };

  const handleSubMenuItemClick = (to: string) => {
    navigate({to});
    setShowSettingsMenu(false);
  };

  // Check if current route is a settings subroute
  const isSettingsRoute = location.pathname.startsWith('/settings');

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[768px] bg-white/95 shadow-lg backdrop-blur-sm dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map(({label, icon: Icon, to, iconSize, subroute}) => {
          const isActive = subroute
            ? isSettingsRoute
            : location.pathname === to;

          if (subroute) {
            return (
              <div key={label} className="relative" ref={settingsRef}>
                <div className="flex flex-col items-center">
                  <button
                    aria-label={label}
                    onClick={handleSettingsClick}
                    onTouchStart={() => showTooltip(label)}
                    onTouchEnd={hideTooltip}
                    onMouseEnter={() => showTooltip(label)}
                    onMouseLeave={hideTooltip}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      isActive || showSettingsMenu
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon
                      className={`${iconSize} transition-colors ${
                        isActive || showSettingsMenu
                          ? 'text-primary dark:text-blue-400'
                          : 'text-neutral-400 dark:text-neutral-400'
                      }`}
                    />
                  </button>

                  <span
                    className={`mt-1 text-xs transition-colors ${
                      isActive || showSettingsMenu
                        ? 'font-medium text-primary dark:text-blue-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Settings Submenu */}
                <AnimatePresence>
                  {showSettingsMenu && subroute && (
                    <motion.div
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: 10}}
                      transition={{duration: 0.2}}
                      className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/95 absolute bottom-full right-0 mb-3 w-48 rounded-xl border bg-white/95 shadow-2xl backdrop-blur-lg"
                      style={{left: 'auto', transform: 'none'}}
                    >
                      <div className="p-0">
                        {subroute.map((item) => {
                          const isSubActive = location.pathname === item.to;
                          return (
                            <button
                              key={item.label}
                              onClick={() => handleSubMenuItemClick(item.to)}
                              className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                                isSubActive
                                  ? 'bg-blue-50 dark:bg-blue-900/20'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isSubActive
                                    ? 'bg-blue-100 text-primary dark:bg-blue-800 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                              >
                                {item.label === 'Profile' ? (
                                  <FaUser className="text-sm" />
                                ) : (
                                  <FaCog className="text-sm" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div
                                  className={`text-sm font-medium ${
                                    isSubActive
                                      ? 'text-primary dark:text-blue-300'
                                      : 'text-gray-700 dark:text-gray-200'
                                  }`}
                                >
                                  {item.label}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip */}
                <AnimatePresence>
                  {activeTooltip === label && !showSettingsMenu && (
                    <motion.div
                      initial={{opacity: 0, y: 6}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: 6}}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white dark:bg-white dark:text-black"
                    >
                      {label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Regular navigation items
          return (
            <div key={label} className="relative">
              <div className="flex flex-col items-center">
                <button
                  aria-label={label}
                  onClick={() => {
                    console;
                    navigate({to});
                    hideTooltip();
                  }}
                  onTouchStart={() => showTooltip(label)}
                  onTouchEnd={hideTooltip}
                  onMouseEnter={() => showTooltip(label)}
                  onMouseLeave={hideTooltip}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon
                    className={`${iconSize} transition-colors ${
                      isActive
                        ? 'text-primary dark:text-blue-400'
                        : 'text-neutral-400 dark:text-neutral-400'
                    }`}
                  />
                </button>

                <span
                  className={`mt-1 text-xs transition-colors ${
                    isActive
                      ? 'font-medium text-primary dark:text-blue-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              <AnimatePresence>
                {activeTooltip === label && (
                  <motion.div
                    initial={{opacity: 0, y: 6}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 6}}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white dark:bg-white dark:text-black"
                  >
                    {label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
