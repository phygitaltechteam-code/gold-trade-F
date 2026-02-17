import React, {useState, useEffect} from 'react';
import {GrNotification} from 'react-icons/gr';
import {useNavigate} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {api} from '@/utils/axios';
import {FiChevronDown, FiChevronUp} from 'react-icons/fi';
import {useGetProfile} from '@/components/Profilehub/profilemutation';

interface Notification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    new Set(),
  );

  // Get profile data – this will update automatically after profile changes
  const {data: profileData, isLoading: profileLoading} = useGetProfile();

  const tokenData = localStorage.getItem('token');
  const token = tokenData ? JSON.parse(tokenData) : null;
  const user = token ? token.user : null;

  // Fetch notifications
  const {data: notificationData, refetch} = useQuery({
    queryKey: ['notificationdata'],
    queryFn: async () => {
      const response = await api.get('/customer/profile/notifications');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Initialize notifications and check for new ones
  useEffect(() => {
    if (notificationData) {
      const storedRead = localStorage.getItem('readNotifications');
      const readSet = storedRead ? new Set(JSON.parse(storedRead)) : new Set();

      const sortedNotifications = notificationData.sort(
        (a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const processedNotifications = sortedNotifications.map(
        (notification: Notification) => ({
          ...notification,
          isRead: readSet.has(notification.id),
        }),
      );

      setNotifications(processedNotifications);
      setReadNotifications(readSet);
    }
  }, [notificationData]);

  // Get unread count
  const unreadCount = notifications.filter(
    (n) => !readNotifications.has(n.id),
  ).length;

  // Handle notification click to mark as read
  const handleNotificationClick = (notificationId: string) => {
    const updatedReadNotifications = new Set(readNotifications);
    updatedReadNotifications.add(notificationId);

    setReadNotifications(updatedReadNotifications);
    localStorage.setItem(
      'readNotifications',
      JSON.stringify([...updatedReadNotifications]),
    );

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? {...n, isRead: true} : n)),
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updatedReadNotifications = new Set([...readNotifications, ...allIds]);

    setReadNotifications(updatedReadNotifications);
    localStorage.setItem(
      'readNotifications',
      JSON.stringify([...updatedReadNotifications]),
    );

    setNotifications((prev) => prev.map((n) => ({...n, isRead: true})));
  };

  const handleProfileClick = () => {
    navigate({to: '/accounthub/acounthub'});
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get notifications to display (limited or all)
  const displayedNotifications = isExpanded
    ? notifications
    : notifications.slice(0, 5);

  const profilePhoto = profileData?.photo || '';

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-6 py-4 dark:bg-[#101722]">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-sm font-medium leading-normal text-slate-500 dark:text-[#94a3b8]">
          SwissQuote
        </p>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white">
          {user?.fullname}
        </h2>
      </div>

      <div className="relative flex items-center gap-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (!isNotificationOpen) {
                setIsExpanded(false);
              }
            }}
            className="relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <GrNotification size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown (unchanged) */}
          {isNotificationOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-xl duration-200 dark:border-slate-800 dark:bg-[#1a2233]">
              <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="p-2">
                    {displayedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors ${
                          !readNotifications.has(notification.id)
                            ? 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {!readNotifications.has(notification.id) && (
                          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`truncate font-medium ${
                                !readNotifications.has(notification.id)
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                          </div>
                          <p
                            className={`mt-1 line-clamp-2 text-sm ${
                              !readNotifications.has(notification.id)
                                ? 'text-slate-700 dark:text-slate-300'
                                : 'text-slate-500 dark:text-slate-500'
                            }`}
                          >
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}

                    {notifications.length > 5 && (
                      <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {isExpanded ? (
                            <>
                              <FiChevronUp size={16} />
                              Show less
                            </>
                          ) : (
                            <>
                              <FiChevronDown size={16} />
                              View all ({notifications.length})
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <GrNotification className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Button with Photo */}
        <button
          onClick={handleProfileClick}
          className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 shadow-sm ring-2 ring-white transition-transform active:scale-95 dark:ring-[#101722]"
        >
          {profilePhoto ? (
            <img
              alt="Profile"
              className="h-full w-full object-cover"
              src={profilePhoto}
            />
          ) : (
            // Fallback placeholder when no photo or still loading
            <div className="flex h-full w-full items-center justify-center bg-primary text-white">
              {user?.fullname?.charAt(0) || 'U'}
            </div>
          )}
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNotificationOpen(false);
            setIsExpanded(false);
          }}
        />
      )}
    </div>
  );
};
