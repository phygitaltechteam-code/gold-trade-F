import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Filter
} from 'lucide-react';

import { Client, ClientStatus } from './types';
import { MOCK_CLIENTS } from './mockData';
import { motion } from 'framer-motion';

interface ClientDashboardProps {
  onSelectClient: (client: Client) => void;
}

const StatCard = ({ title, value, subtext, trend, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</div>
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
    </div>
    <div className="text-3xl font-semibold text-slate-900 mb-2">{value}</div>
    <div className="flex items-center gap-2">
      {trend && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
      <span className="text-xs text-slate-400 font-medium">{subtext}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: ClientStatus }) => {
  const styles = {
    'Active': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Suspended': 'bg-rose-50 text-rose-600 border-rose-100',
    'Pending Review': 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = MOCK_CLIENTS.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 py-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Client Management</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Traders" 
          value="1,890" 
          subtext="74% engagement rate"
          icon={Users}
        />
        <StatCard 
          title="Pending KYC" 
          value="45" 
          subtext="Requires attention"
          icon={Clock}
        />
        <StatCard 
          title="Total Assets (AUM)" 
          value="$14.2M" 
          subtext="vs last month"
          trend={5.3}
          icon={TrendingUp}
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm mb-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by Name or Email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Pending Review</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KYC Verification</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
              <option>All Levels</option>
              <option>Level 1</option>
              <option>Level 2</option>
              <option>Level 3</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Date</label>
            <input type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">P&L Range</label>
            <div className="flex gap-2">
              <input type="text" placeholder="Min" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
              <input type="text" placeholder="Max" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Asset Under Control</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total P&L</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => onSelectClient(client)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={client.avatar} alt={client.name} className="w-8 h-8 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{client.name}</div>
                        <div className="text-xs text-slate-400">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-slate-600">${client.assetUnderControl.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-slate-600">${client.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${client.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {client.totalPnL >= 0 ? '+' : ''}${client.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{filteredClients.length}</span> of <span className="font-medium text-slate-900">97</span> results
            </span>
            <select className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded border border-orange-500">1</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all">2</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all">10</button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
