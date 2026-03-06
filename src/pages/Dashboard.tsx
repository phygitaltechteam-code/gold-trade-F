/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {motion} from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Bell,
  Wallet,
  Landmark,
  DollarSign,
  Layers,
  Edit3,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

// Combine clsx and twMerge for conditional Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const tradingData = [
  {name: 'Nov 01', value: 200},
  {name: 'Nov 02', value: 250},
  {name: 'Nov 03', value: 220},
  {name: 'Nov 04', value: 400},
  {name: 'Nov 05', value: 450},
  {name: 'Nov 06', value: 280},
  {name: 'Nov 07', value: 650},
  {name: 'Nov 08', value: 350},
  {name: 'Nov 09', value: 700},
  {name: 'Nov 10', value: 400},
  {name: 'Nov 11', value: 150},
  {name: 'Nov 12', value: 680},
  {name: 'Nov 13', value: 450},
];

const revenueData = [
  {name: 'Spread', value: 80, color: '#111827'},
  {name: 'Comm.', value: 60, color: '#f97316'},
  {name: 'Swap', value: 30, color: '#94a3b8'},
];

const traders = [
  {
    id: '88219',
    name: 'John Doe',
    volume: '1,204.50',
    pnl: '+12,450',
    risk: 'Low',
  },
  {
    id: '99102',
    name: 'Anna Smith',
    volume: '980.20',
    pnl: '+8,320',
    risk: 'Med',
  },
  {
    id: '11204',
    name: 'Robert King',
    volume: '845.00',
    pnl: '-2,100',
    risk: 'High',
  },
  {id: '44021', name: 'Mei Ling', volume: '720.10', pnl: '+5,600', risk: 'Low'},
];

const transactions = [
  {
    type: 'Deposit',
    date: 'Nov 14, 10:42 AM',
    amount: '$5,000.00',
    status: 'Completed',
    icon: ArrowDownLeft,
  },
  {
    type: 'Withdrawal',
    date: 'Nov 14, 09:15 AM',
    amount: '$1,250.00',
    status: 'Pending',
    icon: ArrowUpRight,
  },
  {
    type: 'Deposit',
    date: 'Nov 14, 08:30 AM',
    amount: '$10,000.00',
    status: 'Completed',
    icon: ArrowDownLeft,
  },
  {
    type: 'Withdrawal',
    date: 'Nov 13, 11:55 PM',
    amount: '$800.00',
    status: 'Rejected',
    icon: ArrowUpRight,
  },
];

// Animation variants
const containerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Dashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="font-sans min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-orange-100"
    >
      <main className="mx-auto w-full max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:space-y-8 lg:px-8 lg:py-8">
        {/* Financial Overview Header - Responsive */}
        <motion.section
          variants={itemVariants}
          className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
              Financial Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Real-time financial health and exposure metrics for Nov 14, 2023.
            </p>
          </div>
          <div className="flex w-full self-start rounded-lg bg-slate-100 p-1 sm:w-auto">
            {['Daily', 'Weekly', 'Monthly'].map((period) => (
              <motion.button
                key={period}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-[10px] font-semibold transition-all sm:flex-none sm:px-4 sm:text-xs',
                  period === 'Daily'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {period}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Stat Cards Grid - Responsive */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5"
        >
          <StatCard
            title="TOTAL DEPOSITS"
            value="$12.45M"
            trend="+12.5%"
            isUp={true}
            icon={<Landmark className="h-4 w-4 sm:h-5 sm:w-5" />}
          />
          <StatCard
            title="WITHDRAWALS"
            value="$4.20M"
            trend="-5.2%"
            isUp={false}
            icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />}
          />
          <StatCard
            title="PLATFORM PROFIT"
            value="$850,230"
            progress={78}
            isDark={true}
            icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
          />
          <StatCard
            title="OPEN EXPOSURE"
            value="1,240 XAU"
            status="High Volatility"
            statusType="warning"
            icon={<Layers className="h-4 w-4 sm:h-5 sm:w-5" />}
          />
          <StatCard
            title="MARGIN UTIL"
            value="45.8%"
            status="Healthy"
            statusType="success"
            icon={<Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />}
          />
        </motion.section>

        {/* Charts Section - Responsive */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:col-span-2"
          >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Daily Trading Volume
              </h3>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 sm:h-3 sm:w-3"></span>
                <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                  USD Volume
                </span>
              </div>
            </div>
            <div className="h-[200px] w-full sm:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tradingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 9}}
                    dy={8}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{r: 4, strokeWidth: 0, fill: '#f97316'}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Revenue Source
              </h3>
              <button className="text-left text-[10px] font-bold text-orange-500 hover:underline sm:text-right sm:text-xs">
                View All
              </button>
            </div>
            <div className="h-[200px] w-full sm:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{top: 10, right: 10, left: 10, bottom: 5}}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 9}}
                    dy={8}
                  />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.section>

        {/* Tables Section - Responsive */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2"
        >
          {/* Top Traders - Mobile Card View */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Top Traders
              </h3>
              <motion.button
                whileHover={{rotate: 90}}
                transition={{duration: 0.2}}
                className="text-slate-400 hover:text-slate-600"
              >
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </div>

            {/* Mobile Card View */}
            <div className="block divide-y divide-slate-100 sm:hidden">
              {traders.map((trader, index) => (
                <motion.div
                  key={trader.id}
                  initial={{opacity: 0, x: -20}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: index * 0.1}}
                  className="space-y-3 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{scale: 1.1}}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500"
                      >
                        {trader.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </motion.div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {trader.name}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          ID: #{trader.id}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-md px-2 py-1 text-[9px] font-bold',
                        trader.risk === 'Low'
                          ? 'bg-emerald-50 text-emerald-600'
                          : trader.risk === 'Med'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600',
                      )}
                    >
                      {trader.risk} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-[9px] text-slate-400">
                        Volume (XAU)
                      </p>
                      <p className="text-sm font-medium text-slate-600">
                        {trader.volume}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] text-slate-400">PNL</p>
                      <p
                        className={cn(
                          'text-sm font-bold',
                          trader.pnl.startsWith('+')
                            ? 'text-emerald-500'
                            : 'text-rose-500',
                        )}
                      >
                        {trader.pnl}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-bold uppercase tracking-wider text-slate-400 lg:text-[10px]">
                    <th className="px-4 py-4 lg:px-6">Trader</th>
                    <th className="px-4 py-4 lg:px-6">Volume (XAU)</th>
                    <th className="px-4 py-4 lg:px-6">PNL</th>
                    <th className="px-4 py-4 lg:px-6">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {traders.map((trader, index) => (
                    <motion.tr
                      key={trader.id}
                      initial={{opacity: 0, x: -20}}
                      animate={{opacity: 1, x: 0}}
                      transition={{delay: index * 0.1}}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 lg:px-6">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{scale: 1.1}}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 lg:h-8 lg:w-8 lg:text-xs"
                          >
                            {trader.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </motion.div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 lg:text-sm">
                              {trader.name}
                            </div>
                            <div className="text-[8px] text-slate-400 lg:text-[10px]">
                              ID: #{trader.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600 lg:px-6 lg:text-sm">
                        {trader.volume}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-4 text-xs font-bold lg:px-6 lg:text-sm',
                          trader.pnl.startsWith('+')
                            ? 'text-emerald-500'
                            : 'text-rose-500',
                        )}
                      >
                        {trader.pnl}
                      </td>
                      <td className="px-4 py-4 lg:px-6">
                        <span
                          className={cn(
                            'rounded-md px-2 py-1 text-[8px] font-bold lg:text-[10px]',
                            trader.risk === 'Low'
                              ? 'bg-emerald-50 text-emerald-600'
                              : trader.risk === 'Med'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-rose-50 text-rose-600',
                          )}
                        >
                          {trader.risk}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Transactions - Mobile Card View */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Recent Transactions
              </h3>
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className="text-[10px] font-bold text-orange-500 hover:underline sm:text-xs"
              >
                View All
              </motion.button>
            </div>

            {/* Mobile Card View */}
            <div className="block divide-y divide-slate-100 sm:hidden">
              {transactions.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{opacity: 0, x: 20}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: i * 0.1}}
                  className="space-y-3 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{rotate: 360}}
                        transition={{duration: 0.3}}
                        className="rounded-lg bg-slate-100 p-1.5"
                      >
                        <tx.icon className="h-3 w-3 text-slate-600" />
                      </motion.div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">
                          {tx.type}
                        </span>
                        <p className="text-[9px] text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-[8px] font-bold',
                        tx.status === 'Completed'
                          ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                          : tx.status === 'Pending'
                            ? 'border border-amber-100 bg-amber-50 text-amber-600'
                            : 'border border-rose-100 bg-rose-50 text-rose-600',
                      )}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <p className="pl-8 text-sm font-bold text-slate-900">
                    {tx.amount}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-bold uppercase tracking-wider text-slate-400 lg:text-[10px]">
                    <th className="px-4 py-4 lg:px-6">Type</th>
                    <th className="px-4 py-4 lg:px-6">Date/Time</th>
                    <th className="px-4 py-4 lg:px-6">Amount</th>
                    <th className="px-4 py-4 lg:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx, i) => (
                    <motion.tr
                      key={i}
                      initial={{opacity: 0, x: 20}}
                      animate={{opacity: 1, x: 0}}
                      transition={{delay: i * 0.1}}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 lg:px-6">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{rotate: 360}}
                            transition={{duration: 0.3}}
                            className="rounded-lg bg-slate-100 p-1.5 lg:p-2"
                          >
                            <tx.icon className="h-3 w-3 text-slate-600 lg:h-3.5 lg:w-3.5" />
                          </motion.div>
                          <span className="text-xs font-bold text-slate-900 lg:text-sm">
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 lg:px-6 lg:text-sm">
                        {tx.date}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-900 lg:px-6 lg:text-sm">
                        {tx.amount}
                      </td>
                      <td className="px-4 py-4 lg:px-6">
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-[8px] font-bold lg:px-3 lg:text-[10px]',
                            tx.status === 'Completed'
                              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                              : tx.status === 'Pending'
                                ? 'border border-amber-100 bg-amber-50 text-amber-600'
                                : 'border border-rose-100 bg-rose-50 text-rose-600',
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  isUp?: boolean;
  progress?: number;
  status?: string;
  statusType?: 'warning' | 'success';
  isDark?: boolean;
  icon: React.ReactNode;
}

function StatCard({
  title,
  value,
  trend,
  isUp,
  progress,
  status,
  statusType,
  isDark,
  icon,
}: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        transition: {type: 'spring', stiffness: 300, damping: 15},
      }}
      className={cn(
        'rounded-xl border p-4 transition-all duration-300 sm:rounded-2xl sm:p-5 lg:p-6',
        isDark
          ? 'border-slate-800 bg-[#111827] text-white shadow-xl shadow-slate-200/50'
          : 'border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md',
      )}
    >
      <div className="mb-3 flex items-start justify-between sm:mb-4">
        <h4
          className={cn(
            'text-[8px] font-bold uppercase tracking-wider sm:text-[9px] lg:text-[10px]',
            isDark ? 'text-slate-400' : 'text-slate-400',
          )}
        >
          {title}
        </h4>
        <motion.div
          whileHover={{rotate: 360}}
          transition={{duration: 0.3}}
          className={cn(
            'rounded-lg p-1.5 sm:p-2',
            isDark ? 'bg-slate-800' : 'bg-slate-50',
          )}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: cn(
              'w-3.5 h-3.5 sm:w-4 sm:h-4',
              isDark ? 'text-orange-500' : 'text-slate-400',
            ),
          })}
        </motion.div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <motion.div
          initial={{scale: 0.5}}
          animate={{scale: 1}}
          transition={{type: 'spring', stiffness: 200, delay: 0.2}}
          className="text-lg font-bold tracking-tight sm:text-xl lg:text-2xl"
        >
          {value}
        </motion.div>

        {trend && (
          <motion.div
            initial={{opacity: 0, x: -10}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.3}}
            className="flex items-center gap-1.5"
          >
            {isUp ? (
              <TrendingUp className="h-2.5 w-2.5 text-emerald-500 sm:h-3 sm:w-3" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5 text-rose-500 sm:h-3 sm:w-3" />
            )}
            <span
              className={cn(
                'text-[8px] font-bold sm:text-[9px] lg:text-[10px]',
                isUp ? 'text-emerald-500' : 'text-rose-500',
              )}
            >
              {trend}
            </span>
            <span className="text-[7px] font-medium text-slate-400 sm:text-[8px] lg:text-[10px]">
              vs last month
            </span>
          </motion.div>
        )}

        {progress !== undefined && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800 sm:h-1.5">
              <motion.div
                initial={{width: 0}}
                animate={{width: `${progress}%`}}
                transition={{duration: 1, delay: 0.4}}
                className="h-full rounded-full bg-orange-500"
              />
            </div>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.5}}
              className="text-[7px] font-medium text-slate-400 sm:text-[8px] lg:text-[10px]"
            >
              {progress}% of quarterly target
            </motion.div>
          </div>
        )}

        {status && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.3}}
            className="flex items-center gap-2"
          >
            {statusType === 'warning' && (
              <motion.div
                animate={{scale: [1, 1.1, 1]}}
                transition={{repeat: Infinity, duration: 2}}
                className="flex items-center gap-1.5 text-orange-500"
              >
                <span className="text-[8px] sm:text-xs">⚠️</span>
                <span className="text-[7px] font-bold uppercase tracking-wide sm:text-[8px] lg:text-[10px]">
                  {status}
                  
                </span>
              </motion.div>
            )}
            {statusType === 'success' && (
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-medium text-slate-400 sm:text-[8px] lg:text-[10px]">
                  Safe Level
                </span>
                <div className="flex items-center gap-1">
                  <motion.span
                    animate={{scale: [1, 1.2, 1]}}
                    transition={{repeat: Infinity, duration: 2}}
                    className="h-1 w-1 rounded-full bg-emerald-500 sm:h-1.5 sm:w-1.5"
                  />
                  <span className="text-[7px] font-bold uppercase tracking-wide text-emerald-500 sm:text-[8px] lg:text-[10px]">
                    {status}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
