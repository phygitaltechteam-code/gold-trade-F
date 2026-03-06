import React from 'react';
import { 
  ChevronLeft, 
  MoreVertical, 
  CheckCircle2, 
  CreditCard, 
  Mail, 
  RotateCcw, 
  Snowflake,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Building2,
  User,
  Users,
  MapPin,
  Calendar,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Client, Transaction } from './types';
import { MOCK_TRANSACTIONS } from './mockData';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

const InfoSection = ({ title, children, icon: Icon }: any) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      <Icon className="w-4 h-4 text-slate-400" />
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
      {children}
    </div>
  </div>
);

const InfoItem = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
  <div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-sm font-medium text-slate-900">{value}</div>
    {subValue && <div className="text-xs text-slate-400 mt-0.5">{subValue}</div>}
  </div>
);

const DocCard = ({ name, type, status, icon: Icon, color }: any) => (
  <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-orange-200 transition-all cursor-pointer group">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-slate-900 truncate">{name}</div>
      <div className="text-xs text-slate-400 flex items-center gap-1.5">
        {type} • <span className="text-emerald-600 font-medium">{status}</span>
      </div>
    </div>
    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
  </div>
);

export const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-7xl mx-auto px-6 py-8"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <button onClick={onBack} className="hover:text-slate-600 transition-colors">Dashboard</button>
        <span>›</span>
        <button onClick={onBack} className="hover:text-slate-600 transition-colors">Clients</button>
        <span>›</span>
        <span className="text-slate-900 font-medium">Profile Details</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{client.name}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UID:</span>
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono rounded border border-slate-200">{client.uid}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building2 className="w-16 h-16" />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Equity</div>
              <div className="text-2xl font-semibold text-slate-900">${client.assetUnderControl.toLocaleString()}</div>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 2.4% <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="w-16 h-16 border-4 border-slate-900/20 rounded-full flex items-center justify-center font-bold text-4xl">#</div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gold Holdings</div>
              <div className="text-2xl font-semibold text-slate-900">450g <span className="text-slate-400 text-sm font-normal">XAU</span></div>
              <div className="text-xs text-orange-500 font-medium mt-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" /> Physical Allocation
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard className="w-16 h-16" />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Wallet Balance</div>
              <div className="text-2xl font-semibold text-slate-900">${client.balance.toLocaleString()}</div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          {/* Client Information Card */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Client Information</h2>
            </div>
            <div className="p-8 space-y-10">
              <InfoSection title="Personal Details" icon={User}>
                <InfoItem label="Residential Address" value={client.address} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Date of Birth" value={client.dob} />
                  <InfoItem label="Nationality" value={client.nationality} />
                </div>
                <InfoItem label="Tax ID (SSN/TIN)" value={client.taxId} />
              </InfoSection>

              <InfoSection title="Bank Details" icon={Building2}>
                <InfoItem label="Primary Bank Name" value={client.bankName} />
                <InfoItem label="Account Number" value={client.accountNumber} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Routing / IFSC" value={client.routingIfsc} />
                  <InfoItem label="Account Type" value={client.accountType} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verification Status</div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </InfoSection>

              <InfoSection title="Nominee Details" icon={Users}>
                <InfoItem label="Nominee Name" value={client.nomineeName} />
                <InfoItem label="Relationship" value={client.nomineeRelationship} />
                <InfoItem label="Contact" value={client.nomineeContact} />
                <InfoItem label="Allocation" value={client.nomineeAllocation} />
              </InfoSection>
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verified Documentation</h2>
              <button className="text-xs font-semibold text-orange-500 hover:text-orange-600">Manage Files</button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DocCard name="Passport.pdf" type="ID Proof" status="Verified" icon={FileText} color="bg-rose-50 text-rose-500" />
              <DocCard name="Utility_Bill.jpg" type="Address" status="Verified" icon={ImageIcon} color="bg-blue-50 text-blue-500" />
              <DocCard name="Tax_Form_W9.pdf" type="Tax" status="Verified" icon={FileText} color="bg-orange-50 text-orange-500" />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Transactions</h2>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date/Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{tx.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            tx.type === 'Deposit' ? 'bg-emerald-500' : 
                            tx.type === 'Withdrawal' ? 'bg-rose-500' : 
                            tx.type === 'Buy Gold' ? 'bg-orange-500' : 'bg-slate-400'
                          }`} />
                          <span className="text-sm font-medium text-slate-900">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{tx.description}</td>
                      <td className={`px-6 py-4 text-sm font-semibold text-right ${tx.amount >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-900">{tx.dateTime.split(' ')[0]} {tx.dateTime.split(' ')[1]}</div>
                        <div className="text-[10px] text-slate-400">{tx.dateTime.split(' ')[2]}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-600">
                        ${tx.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Showing 5 of 128 transactions</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Prev</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={client.avatar} 
                alt={client.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">{client.name}</h2>
            <p className="text-sm text-slate-400 mb-6">{client.email}</p>
            
            <div className="grid grid-cols-2 gap-6 text-left border-t border-slate-50 pt-6">
              <div className="space-y-4">
                <InfoItem label="Phone" value={client.phone} />
                <InfoItem label="Region" value={client.region} />
              </div>
              <div className="space-y-4">
                <InfoItem label="Joined" value={client.joinedDate} />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">KYC Level</div>
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-orange-100">
                    Level {client.kycLevel} (Max)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Admin Actions</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
                <CreditCard className="w-4 h-4" /> Credit
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                <Mail className="w-4 h-4" /> Email
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors">
                <Snowflake className="w-4 h-4" /> Freeze
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes</label>
              <textarea 
                placeholder="Add a note about this client..."
                className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2">
                <span>Last edited by Admin_01</span>
                <span>Oct 12, 14:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
