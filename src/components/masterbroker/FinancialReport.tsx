import React, {useState} from 'react';
import {
  BarChart3,
  LayoutDashboard,
  CandlestickChart,
  Wallet,
  FileText,
  Receipt,
  Building2,
  Settings,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Download,
  TrendingUp,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';

// --- Types ---
type ReportType = 'pnl' | 'balance' | 'reports' | 'cashflow' | 'settlement';

// --- Components ---

/**
 * Header component with top navigation
 */
const Header = ({
  currentReport,
  setReport,
  showBackButton,
  onBack,
}: {
  currentReport: ReportType;
  setReport: (r: ReportType) => void;
  showBackButton: boolean;
  onBack: () => void;
}) => {
  const navItems = [
    {id: 'reports', label: 'Reports Center', icon: FileText},
    {id: 'settlement', label: 'Daily Settlement', icon: Receipt},
    {id: 'balance', label: 'Balance Sheet', icon: Building2},
    {id: 'pnl', label: 'P&L Statement', icon: BarChart3},
    {id: 'cashflow', label: 'Cash Flow', icon: Wallet},
  ];

  return null;
};

/**
 * Main Content component that renders the selected report view
 */
const ReportContent = ({
  type,
  setReport,
  onBack,
}: {
  type: ReportType;
  setReport: (r: ReportType) => void;
  onBack: () => void;
}) => {
  const renderView = () => {
    switch (type) {
      case 'pnl':
        return <PnLView onBack={onBack} setReport={setReport} />;
      case 'balance':
        return <BalanceSheetView onBack={onBack} setReport={setReport} />;
      case 'reports':
        return <ReportsCenterView setReport={setReport} />;
      case 'cashflow':
        return <CashFlowView onBack={onBack} setReport={setReport} />;
      case 'settlement':
        return <SettlementView onBack={onBack} setReport={setReport} />;
      default:
        return <PnLView onBack={onBack} setReport={setReport} />;
    }
  };

  return (
    <motion.main
      key={type}
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -10}}
      transition={{duration: 0.3}}
      className="mx-auto max-w-7xl p-4 sm:p-6 md:p-10"
    >
      {renderView()}
    </motion.main>
  );
};

// --- Sub-Views (The 5 Pages) ---

const PnLView = ({
  onBack,
  setReport,
}: {
  onBack: () => void;
  setReport: (r: ReportType) => void;
}) => (
  <div className="space-y-8 sm:space-y-12">
    <header className="flex flex-col justify-between gap-4 border-b border-stroke pb-6 sm:flex-row sm:items-center sm:gap-6 sm:pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-gray-50 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-lg border border-stroke text-[#0F1535] transition-colors sm:h-10 sm:w-10 lg:hidden"
        >
          <ArrowLeft size={16} className="sm:h-5 sm:w-5" />
        </button>
        <div>
          <nav className="text-gray-400 mb-1 flex items-center gap-1 text-xs sm:mb-2 sm:gap-2 sm:text-sm">
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Reports
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-[#0F1535]">Profit & Loss</span>
          </nav>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1535] sm:text-3xl md:text-4xl">
            P&L Statement
          </h2>
          <p className="text-gray-500 mt-1 text-xs sm:mt-2 sm:text-sm">
            Financial performance overview for Q3 2023.
          </p>
        </div>
      </div>
      <div className="xs:flex-row xs:items-center flex flex-col items-stretch gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-stroke bg-white px-3 py-2 text-xs shadow-sm sm:gap-3 sm:px-4 sm:py-2.5 sm:text-sm">
          <Calendar size={14} className="text-gray-400 sm:h-4 sm:w-4" />
          <span className="text-gray-700 font-semibold">
            Jul 1 - Sep 30, 2023
          </span>
        </div>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-[#F57F3D] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#E06D2C] sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm">
          <Download size={14} className="sm:h-4 sm:w-4" />
          Export PDF
        </button>
      </div>
    </header>

    <section className="border-b border-stroke pb-8 sm:pb-12">
      <div className="flex flex-col items-start justify-between gap-6 sm:gap-8 lg:flex-row lg:items-baseline">
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest sm:text-xs">
            Net Profit (Q3 2023)
          </h3>
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
            <span className="text-3xl font-bold tracking-tighter text-[#0F1535] sm:text-4xl md:text-5xl lg:text-6xl">
              $1.46M
            </span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 sm:px-3 sm:py-1 sm:text-sm">
              +12.5%
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            vs $1.30M last quarter
          </p>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-8 lg:gap-16">
          <div>
            <p className="text-gray-400 mb-0.5 text-[10px] font-bold uppercase tracking-widest sm:mb-1 sm:text-xs">
              Profit Margin
            </p>
            <p className="text-xl font-bold text-[#0F1535] sm:text-2xl md:text-3xl lg:text-4xl">
              59.8%
            </p>
          </div>
          <div className="hidden w-px bg-stroke sm:block"></div>
          <div>
            <p className="text-gray-400 mb-0.5 text-[10px] font-bold uppercase tracking-widest sm:mb-1 sm:text-xs">
              EBITDA
            </p>
            <p className="text-xl font-bold text-[#0F1535] sm:text-2xl md:text-3xl lg:text-4xl">
              $1.7M
            </p>
          </div>
        </div>
      </div>
    </section>

    <div className="grid grid-cols-1 gap-12 sm:gap-16">
      <section>
        <div className="mb-4 flex items-end justify-between border-b border-stroke pb-3 sm:mb-8 sm:pb-4">
          <h3 className="text-lg font-bold text-[#0F1535] sm:text-xl md:text-2xl">
            Revenue
          </h3>
          <span className="text-lg font-bold tracking-tight text-[#0F1535] sm:text-xl md:text-2xl">
            $2,450,890
          </span>
        </div>
        <div className="divide-y divide-stroke">
          {[
            {
              label: 'Brokerage Fees',
              desc: 'Transaction commissions from client trades',
              val: '$1,200,500',
            },
            {
              label: 'Making Charges',
              desc: 'Processing & Refinement fees for physical gold',
              val: '$850,240',
            },
            {
              label: 'Spread Revenue',
              desc: 'Profit generated from buy/sell spread',
              val: '$400,150',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="hover:bg-gray-50/50 group flex flex-col justify-between gap-2 rounded-xl px-2 py-4 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-6 md:py-8"
            >
              <div>
                <p className="text-sm font-bold text-[#0F1535] sm:text-base md:text-lg">
                  {item.label}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
              </div>
              <span className="text-sm font-bold text-[#0F1535] sm:text-base md:text-lg">
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between border-b border-stroke pb-3 sm:mb-8 sm:pb-4">
          <h3 className="text-lg font-bold text-[#0F1535] sm:text-xl md:text-2xl">
            Expenses
          </h3>
          <span className="text-lg font-bold tracking-tight text-[#0F1535] sm:text-xl md:text-2xl">
            ($985,340)
          </span>
        </div>
        <div className="divide-y divide-stroke">
          {[
            {
              label: 'Storage & Vaulting',
              desc: 'Secure facility costs and insurance',
              val: '($320,000)',
            },
            {
              label: 'Operational Fees',
              desc: 'Logistics, transport & handling',
              val: '($415,340)',
            },
            {
              label: 'Taxes & Compliance',
              desc: 'Regulatory expenses and audit fees',
              val: '($250,000)',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="hover:bg-gray-50/50 group flex flex-col justify-between gap-2 rounded-xl px-2 py-4 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-6 md:py-8"
            >
              <div>
                <p className="text-sm font-bold text-[#0F1535] sm:text-base md:text-lg">
                  {item.label}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
              </div>
              <span className="text-gray-400 text-sm font-bold sm:text-base md:text-lg">
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const BalanceSheetView = ({
  onBack,
  setReport,
}: {
  onBack: () => void;
  setReport: (r: ReportType) => void;
}) => (
  <div className="space-y-8 sm:space-y-12">
    <header className="flex flex-col justify-between gap-4 border-b border-stroke pb-6 sm:flex-row sm:items-center sm:gap-6 sm:pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-gray-50 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-lg border border-stroke text-[#0F1535] transition-colors sm:h-10 sm:w-10 lg:hidden"
        >
          <ArrowLeft size={16} className="sm:h-5 sm:w-5" />
        </button>
        <div>
          <nav className="text-gray-400 mb-1 flex items-center gap-1 text-xs sm:mb-2 sm:gap-2 sm:text-sm">
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Finance
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Reports
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-[#0F1535]">Balance Sheet</span>
          </nav>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1535] sm:text-3xl md:text-4xl">
            Balance Sheet
          </h2>
          <p className="text-gray-500 mt-1 text-xs sm:mt-2 sm:text-sm">
            Financial Position as of Oct 31, 2023.
          </p>
        </div>
      </div>
      <div className="xs:flex-row xs:items-center flex flex-col items-stretch gap-2 sm:gap-3">
        <select className="rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-bold text-[#0F1535] shadow-sm outline-none focus:ring-2 focus:ring-[#0F1535]/10 sm:px-4 sm:py-2.5 sm:text-sm">
          <option>October 2023</option>
          <option>September 2023</option>
          <option>August 2023</option>
        </select>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-[#F57F3D] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#E06D2C] sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm">
          <Download size={14} className="sm:h-4 sm:w-4" />
          Export PDF
        </button>
      </div>
    </header>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {[
        {label: 'Total Assets', val: '$42.59M', change: '+4.2%'},
        {label: 'Total Liabilities', val: '$28.10M', change: '+1.8%'},
        {label: 'Total Equity', val: '$14.49M', change: '+9.5%'},
      ].map((stat, i) => (
        <div
          key={i}
          className="rounded-xl border border-stroke bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-6 lg:p-8"
        >
          <p className="text-gray-400 mb-2 text-[10px] font-bold uppercase tracking-widest sm:mb-4 sm:text-xs">
            {stat.label}
          </p>
          <h3 className="mb-4 text-2xl font-bold text-[#0F1535] sm:mb-6 sm:text-3xl lg:text-4xl">
            {stat.val}
          </h3>
          <div className="flex items-center gap-1 border-t border-stroke pt-4 text-xs sm:gap-2 sm:pt-6 sm:text-sm">
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <TrendingUp size={12} className="sm:h-3.5 sm:w-3.5" />{' '}
              {stat.change}
            </span>
            <span className="text-gray-400 text-xs">vs last month</span>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
      <section className="overflow-x-auto">
        <div className="mb-4 flex items-end justify-between border-b border-stroke pb-3 sm:mb-6 sm:pb-4">
          <h3 className="text-lg font-bold text-[#0F1535] sm:text-xl">
            Assets
          </h3>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest sm:text-xs">
            USD
          </span>
        </div>
        <table className="w-full min-w-[400px] sm:min-w-0">
          <thead>
            <tr className="text-gray-400 border-b border-stroke text-left text-[10px] font-bold uppercase tracking-widest sm:text-xs">
              <th className="py-2 sm:py-4">Account</th>
              <th className="py-2 text-right sm:py-4">Oct 2023</th>
              <th className="py-2 text-right sm:py-4">Change</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 pt-4 sm:py-6 sm:pt-8" colSpan={3}>
                Current Assets
              </td>
            </tr>
            <AssetRow
              label="Cash in Hand & Banks"
              val="$12.45M"
              change="+11.1%"
              pos
            />
            <AssetRow label="Receivables" val="$4.12M" change="-5.2%" />
            <AssetRow
              label="Short-term Investments"
              val="$2.50M"
              change="+25.0%"
              pos
            />
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 pt-4 sm:py-6 sm:pt-8" colSpan={3}>
                Inventory Assets
              </td>
            </tr>
            <AssetRow label="Gold Inventory" val="$21.85M" change="+1.6%" pos />
            <AssetRow label="Silver Inventory" val="$0.85M" change="-5.5%" />
            <AssetRow
              label="Inventory In-Transit"
              val="$0.35M"
              change="+191%"
              pos
            />
          </tbody>
          <tfoot className="border-t-2 border-stroke">
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 text-sm sm:py-8 sm:text-lg">Total Assets</td>
              <td className="py-4 text-right text-base sm:py-8 sm:text-xl">
                $42.59M
              </td>
              <td className="py-4 text-right text-[10px] font-normal text-emerald-600 sm:py-8 sm:text-xs">
                +5.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="overflow-x-auto">
        <div className="mb-4 flex items-end justify-between border-b border-stroke pb-3 sm:mb-6 sm:pb-4">
          <h3 className="text-lg font-bold text-[#0F1535] sm:text-xl">
            Liabilities & Equity
          </h3>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest sm:text-xs">
            USD
          </span>
        </div>
        <table className="w-full min-w-[400px] sm:min-w-0">
          <thead>
            <tr className="text-gray-400 border-b border-stroke text-left text-[10px] font-bold uppercase tracking-widest sm:text-xs">
              <th className="py-2 sm:py-4">Account</th>
              <th className="py-2 text-right sm:py-4">Oct 2023</th>
              <th className="py-2 text-right sm:py-4">Change</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 pt-4 sm:py-6 sm:pt-8" colSpan={3}>
                Current Liabilities
              </td>
            </tr>
            <AssetRow label="Client Deposits" val="$15.40M" change="+4.0%" />
            <AssetRow label="Trade Payables" val="$8.25M" change="+1.8%" />
            <AssetRow label="Accrued Expenses" val="$0.45M" change="+8.2%" />
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 pt-4 sm:py-6 sm:pt-8" colSpan={3}>
                Long-Term Liabilities
              </td>
            </tr>
            <AssetRow label="Long-term Debt" val="$4.00M" change="0.0%" />
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 pt-4 sm:py-6 sm:pt-8" colSpan={3}>
                Shareholder&rsquo;s Equity
              </td>
            </tr>
            <AssetRow label="Common Stock" val="$5.00M" change="0.0%" />
            <AssetRow
              label="Retained Earnings"
              val="$9.49M"
              change="+15.2%"
              pos
            />
          </tbody>
          <tfoot className="border-t-2 border-stroke">
            <tr className="font-bold text-[#0F1535]">
              <td className="py-4 text-sm sm:py-8 sm:text-lg">
                Total Liabilities & Equity
              </td>
              <td className="py-4 text-right text-base sm:py-8 sm:text-xl">
                $42.59M
              </td>
              <td className="py-4 text-right text-[10px] font-normal text-emerald-600 sm:py-8 sm:text-xs">
                +5.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  </div>
);

const AssetRow = ({
  label,
  val,
  change,
  pos,
}: {
  label: string;
  val: string;
  change: string;
  pos?: boolean;
}) => (
  <tr className="hover:bg-gray-50 group transition-colors">
    <td className="text-gray-500 py-2 pl-2 text-xs transition-colors group-hover:text-[#0F1535] sm:py-4 sm:pl-4 sm:text-sm">
      {label}
    </td>
    <td className="py-2 text-right text-xs font-bold text-[#0F1535] sm:py-4 sm:text-sm">
      {val}
    </td>
    <td
      className={`py-2 text-right text-[10px] font-bold sm:py-4 sm:text-xs ${pos ? 'text-emerald-600' : 'text-rose-500'}`}
    >
      {change}
    </td>
  </tr>
);

const ReportsCenterView = ({
  setReport,
}: {
  setReport: (r: ReportType) => void;
}) => (
  <div className="space-y-8 sm:space-y-12">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div>
        <nav className="text-gray-400 mb-1 flex items-center gap-1 text-xs sm:mb-2 sm:gap-2 sm:text-sm">
          <span>Finance</span>
          <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
          <span className="font-medium text-[#0F1535]">Reports Center</span>
        </nav>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Financial Reports & Reconciliation
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm sm:text-base">
          Generate settlement reports, balance sheets, and cash flow statements
          for compliance.
        </p>
      </div>
      <div className="xs:flex-row xs:items-center flex flex-col items-stretch gap-2 sm:gap-3">
        <button className="text-gray-500 flex items-center justify-center gap-1.5 rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-bold shadow-sm transition-all hover:text-[#0F1535] sm:gap-2 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm">
          <Clock size={14} className="sm:h-4 sm:w-4" />
          Scheduled
        </button>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-[#F57F3D] px-3 py-2 text-xs font-bold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#E06D2C] sm:gap-2 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm">
          <Plus size={14} className="sm:h-4 sm:w-4" />
          New Template
        </button>
      </div>
    </header>

    <section>
      <h3 className="mb-4 text-base font-bold text-[#0F1535] sm:mb-8 sm:text-lg">
        Select Report Type
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {[
          {
            id: 'settlement',
            label: 'Daily Settlement',
            desc: 'End-of-day trade reconciliation and clearing status.',
            icon: Calendar,
          },
          {
            id: 'balance',
            label: 'Balance Sheet',
            desc: 'Assets, liabilities, and equity overview snapshot.',
            icon: Building2,
          },
          {
            id: 'pnl',
            label: 'P&L Statement',
            desc: 'Detailed profit and loss analysis by trading pair.',
            icon: BarChart3,
          },
          {
            id: 'cashflow',
            label: 'Cash Flow',
            desc: 'Tracking cash inflows and outflows over time.',
            icon: Wallet,
          },
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => setReport(item.id as ReportType)}
            className="group relative cursor-pointer rounded-xl border border-stroke bg-white p-4 transition-all hover:border-[#F57F3D] hover:ring-1 hover:ring-[#F57F3D] sm:rounded-2xl sm:p-6 lg:p-8"
          >
            <div className="text-gray-400 mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-stroke transition-colors group-hover:border-[#F57F3D]/20 group-hover:text-[#F57F3D] sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl lg:mb-6 lg:h-12 lg:w-12">
              <item.icon size={16} className="sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
            <h4 className="mb-1 text-sm font-bold text-[#0F1535] sm:mb-2 sm:text-base">
              {item.label}
            </h4>
            <p className="text-gray-400 text-[10px] leading-relaxed sm:text-xs">
              {item.desc}
            </p>
            <div className="absolute right-3 top-3 text-[#F57F3D] opacity-0 transition-opacity group-hover:opacity-100 sm:right-4 sm:top-4 lg:right-6 lg:top-6">
              <ArrowRight size={16} className="sm:h-5 sm:w-5" />
            </div>
          </div>
        ))}
      </div>
    </section>

    <div className="flex flex-col items-stretch gap-4 rounded-xl border border-stroke bg-white p-4 shadow-sm sm:gap-6 sm:rounded-2xl sm:p-6 lg:flex-row lg:items-end lg:gap-8 lg:p-8">
      <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
        <div>
          <label className="text-gray-400 mb-1 block text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs lg:mb-3">
            Start Date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-bold text-[#0F1535] outline-none focus:ring-2 focus:ring-[#F57F3D]/10 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm lg:py-3"
            defaultValue="2023-10-01"
          />
        </div>
        <div>
          <label className="text-gray-400 mb-1 block text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs lg:mb-3">
            End Date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-bold text-[#0F1535] outline-none focus:ring-2 focus:ring-[#F57F3D]/10 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm lg:py-3"
            defaultValue="2023-10-31"
          />
        </div>
      </div>
      <div className="hidden h-12 w-px bg-stroke lg:block"></div>
      <div className="w-full min-w-[200px] sm:min-w-[240px] lg:w-auto">
        <label className="text-gray-400 mb-1 block text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs lg:mb-3">
          Export Format
        </label>
        <div className="bg-gray-50 flex rounded-lg border border-stroke p-1 sm:rounded-xl">
          {['PDF', 'CSV', 'XLSX'].map((fmt) => (
            <button
              key={fmt}
              className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-all sm:py-2 sm:text-xs ${fmt === 'PDF' ? 'bg-white text-[#0F1535] shadow-sm ring-1 ring-stroke' : 'text-gray-400 hover:text-[#0F1535]'}`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
      <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F57F3D] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#E06D2C] active:scale-[0.98] sm:gap-2 sm:rounded-xl sm:px-8 sm:py-3 sm:text-sm lg:w-auto lg:px-10">
        <Download size={14} className="sm:h-4 sm:w-4" />
        Generate Report
      </button>
    </div>

    <section>
      <div className="mb-4 flex items-center justify-between sm:mb-6 lg:mb-8">
        <h3 className="text-base font-bold text-[#0F1535] sm:text-lg">
          Recent Reports
        </h3>
        <button className="text-gray-400 flex items-center gap-1 text-xs font-bold transition-colors hover:text-[#0F1535] sm:gap-2 sm:text-sm">
          View All <ArrowRight size={12} className="sm:h-4 sm:w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm sm:rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left lg:min-w-0">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 border-b border-stroke text-[8px] font-bold uppercase tracking-widest sm:text-[10px]">
                <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  Report Name
                </th>
                <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  Date Range
                </th>
                <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  Requested By
                </th>
                <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  Status
                </th>
                <th className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {[
                {
                  name: 'Daily Settlement',
                  ref: '#RPT-849',
                  range: 'Oct 24, 2023',
                  user: 'Alex Morgan',
                  status: 'Ready',
                  color: 'emerald',
                },
                {
                  name: 'Cash Flow',
                  ref: '#RPT-848',
                  range: 'Sep 1-30, 2023',
                  user: 'Sarah Jenkins',
                  status: 'Processing',
                  color: 'amber',
                },
                {
                  name: 'Q3 P&L',
                  ref: '#RPT-832',
                  range: 'Q3 2023',
                  user: 'Alex Morgan',
                  status: 'Ready',
                  color: 'emerald',
                },
                {
                  name: 'Balance Sheet',
                  ref: '#RPT-810',
                  range: 'Sep 2023',
                  user: 'Alex Morgan',
                  status: 'Failed',
                  color: 'rose',
                },
              ].map((report, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/50 group transition-colors"
                >
                  <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div className="text-gray-400 rounded-lg border border-stroke bg-white p-1.5 transition-colors group-hover:text-[#0F1535] sm:rounded-xl sm:p-2 lg:p-2.5">
                        <FileText
                          size={12}
                          className="sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F1535] sm:text-sm">
                          {report.name}
                        </p>
                        <p className="text-gray-400 text-[8px] sm:text-[10px]">
                          {report.ref}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-500 px-3 py-3 text-[10px] sm:px-4 sm:py-4 sm:text-xs lg:px-8 lg:py-6">
                    {report.range}
                  </td>
                  <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="bg-gray-100 text-gray-500 flex h-4 w-4 items-center justify-center rounded-full text-[6px] font-bold sm:h-5 sm:w-5 sm:text-[8px] lg:h-6 lg:w-6 lg:text-[10px]">
                        {report.user
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="text-gray-500 text-[10px] sm:text-xs">
                        {report.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-bold sm:px-2 sm:py-1 sm:text-[10px] lg:px-3 ${
                        report.color === 'emerald'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                          : report.color === 'amber'
                            ? 'border-amber-100 bg-amber-50 text-amber-700'
                            : 'border-rose-100 bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${
                          report.color === 'emerald'
                            ? 'bg-emerald-500'
                            : report.color === 'amber'
                              ? 'animate-pulse bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                      />
                      {report.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:gap-2 lg:gap-3">
                      <button className="rounded-lg border border-transparent p-1 transition-all hover:border-stroke hover:bg-white hover:text-[#0F1535] sm:p-1.5 lg:p-2">
                        <Download
                          size={10}
                          className="sm:h-3 sm:w-3 lg:h-4 lg:w-4"
                        />
                      </button>
                      <button className="rounded-lg border border-transparent p-1 transition-all hover:border-stroke hover:bg-white hover:text-rose-500 sm:p-1.5 lg:p-2">
                        <RefreshCw
                          size={10}
                          className="sm:h-3 sm:w-3 lg:h-4 lg:w-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
);

const CashFlowView = ({
  onBack,
  setReport,
}: {
  onBack: () => void;
  setReport: (r: ReportType) => void;
}) => (
  <div className="space-y-8 sm:space-y-12">
    <header className="flex flex-col justify-between gap-4 border-b border-stroke pb-6 sm:flex-row sm:items-center sm:gap-6 sm:pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-gray-50 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-lg border border-stroke text-[#0F1535] transition-colors sm:h-10 sm:w-10 lg:hidden"
        >
          <ArrowLeft size={16} className="sm:h-5 sm:w-5" />
        </button>
        <div>
          <nav className="text-gray-400 mb-1 flex items-center gap-1 text-xs sm:mb-2 sm:gap-2 sm:text-sm">
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Finance
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Reports
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-[#0F1535]">Cash Flow</span>
          </nav>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1535] sm:text-3xl md:text-4xl">
            Cash Flow Statement
          </h2>
          <p className="text-gray-500 mt-1 text-xs sm:mt-2 sm:text-sm">
            Cash movements for October 2023.
          </p>
        </div>
      </div>
      <div className="xs:flex-row xs:items-center flex flex-col items-stretch gap-2 sm:gap-3">
        <div className="bg-gray-50 flex rounded-lg border border-stroke p-1 sm:rounded-xl">
          {['Monthly', 'Quarterly', 'Yearly'].map((t) => (
            <button
              key={t}
              className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all sm:px-3 sm:py-1.5 sm:text-xs lg:px-4 lg:py-2 ${t === 'Monthly' ? 'bg-white text-[#0F1535] shadow-sm ring-1 ring-stroke' : 'text-gray-400 hover:text-[#0F1535]'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-[#F57F3D] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#E06D2C] sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm">
          Generate Report
        </button>
      </div>
    </header>

    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8 xl:gap-12">
      {[
        {label: 'Beginning Cash', val: '$4.25M', sub: 'Oct 1, 2023'},
        {label: 'Net Cash Flow', val: '+$0.32M', sub: '+12.5%', pos: true},
        {label: 'Operating CF', val: '$0.58M', sub: 'Primary source'},
        {label: 'Ending Cash', val: '$4.57M', sub: 'Oct 31, 2023'},
      ].map((stat, i) => (
        <div key={i}>
          <p className="text-gray-400 mb-1 text-[8px] font-bold uppercase tracking-widest sm:mb-2 sm:text-[10px] lg:mb-3 lg:text-xs">
            {stat.label}
          </p>
          <h3
            className={`text-base font-bold sm:text-lg lg:text-xl xl:text-3xl ${stat.pos ? 'text-emerald-600' : 'text-[#0F1535]'}`}
          >
            {stat.val}
          </h3>
          <p
            className={`mt-0.5 text-[8px] font-bold sm:mt-1 sm:text-[10px] lg:mt-2 ${stat.pos ? 'text-emerald-600' : 'text-gray-400'}`}
          >
            {stat.sub}
          </p>
        </div>
      ))}
    </div>

    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      {[
        {
          title: 'Operating Activities',
          total: '+$0.58M',
          pos: true,
          items: [
            {label: 'Cash receipts from platform fees', val: '$0.85M'},
            {label: 'Cash receipts from premium memberships', val: '$0.12M'},
            {label: 'Cash paid to suppliers', val: '($0.15M)'},
            {label: 'Cash paid for employee salaries', val: '($0.20M)'},
            {label: 'Interest paid', val: '($0.02M)'},
            {label: 'Income taxes paid', val: '($0.03M)'},
          ],
        },
        {
          title: 'Investing Activities',
          total: '($0.46M)',
          items: [
            {label: 'Purchase of secure vault facilities', val: '($0.40M)'},
            {label: 'Purchase of office equipment', val: '($0.06M)'},
            {label: 'Sale of old security hardware', val: '--', muted: true},
          ],
        },
        {
          title: 'Financing Activities',
          total: '+$0.20M',
          pos: true,
          items: [
            {label: 'Capital injection from partners', val: '$0.25M'},
            {label: 'Repayment of long-term debt', val: '($0.05M)'},
            {label: 'Dividends paid', val: '--', muted: true},
          ],
        },
      ].map((section, i) => (
        <div key={i}>
          <div className="mb-3 flex items-baseline justify-between border-b border-stroke pb-2 sm:mb-4 sm:pb-3 lg:mb-6">
            <h3 className="text-base font-bold text-[#0F1535] sm:text-lg lg:text-xl">
              {section.title}
            </h3>
            <span
              className={`font-mono text-xs font-bold sm:text-sm ${section.pos ? 'text-emerald-600' : 'text-[#0F1535]'}`}
            >
              {section.total}
            </span>
          </div>
          <div className="divide-y divide-stroke">
            {section.items.map((item, j) => (
              <div
                key={j}
                className="hover:bg-gray-50/50 flex items-center justify-between rounded-xl px-2 py-2 transition-colors sm:px-3 sm:py-3 lg:px-4 lg:py-4"
              >
                <span className="text-gray-500 text-[10px] font-light sm:text-xs lg:text-sm">
                  {item.label}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold sm:text-xs lg:text-sm ${item.muted ? 'text-gray-200' : 'text-[#0F1535]'}`}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t-2 border-stroke pt-6 sm:mt-12 sm:flex-row sm:gap-4 sm:pt-8 lg:mt-16 lg:gap-6 lg:pt-12">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0F1535] sm:text-xs lg:text-sm">
          Net Increase in Cash
        </h3>
        <p className="text-gray-400 mt-0.5 text-[8px] sm:mt-1 sm:text-[10px] lg:text-xs">
          Oct 2023
        </p>
      </div>
      <div className="text-2xl font-bold tracking-tighter text-[#0F1535] sm:text-3xl lg:text-4xl xl:text-5xl">
        +$324.5K
      </div>
    </div>
  </div>
);

const SettlementView = ({
  onBack,
  setReport,
}: {
  onBack: () => void;
  setReport: (r: ReportType) => void;
}) => (
  <div className="space-y-8 sm:space-y-12">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-gray-50 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-lg border border-stroke text-[#0F1535] transition-colors sm:h-10 sm:w-10 lg:hidden"
        >
          <ArrowLeft size={16} className="sm:h-5 sm:w-5" />
        </button>
        <div>
          <nav className="text-gray-400 mb-1 flex items-center gap-1 text-xs sm:mb-2 sm:gap-2 sm:text-sm">
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Finance
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <button
              onClick={() => setReport('reports')}
              className="transition-colors hover:text-[#0F1535]"
            >
              Reports
            </button>
            <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-[#0F1535]">Daily Settlement</span>
          </nav>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1535] sm:text-3xl md:text-4xl">
            Daily Settlement
          </h2>
          <p className="text-gray-500 mt-1 text-xs sm:mt-2 sm:text-sm">
            Trade settlements and clearing for today.
          </p>
        </div>
      </div>
      <div className="xs:flex-row xs:items-center flex flex-col items-stretch gap-2 sm:gap-4">
        <div className="flex items-center overflow-hidden rounded-lg border border-stroke bg-white shadow-sm sm:rounded-xl">
          <button className="hover:bg-gray-50 text-gray-400 border-r border-stroke p-1.5 transition-colors sm:p-2 lg:p-3">
            <ChevronRight size={12} className="rotate-180 sm:h-4 sm:w-4" />
          </button>
          <div className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold text-[#0F1535] sm:gap-2 sm:px-3 sm:py-2 sm:text-xs lg:gap-3 lg:px-6 lg:py-3 lg:text-sm">
            <Calendar size={12} className="text-[#F57F3D] sm:h-4 sm:w-4" />
            Oct 24, 2023
          </div>
          <button className="hover:bg-gray-50 text-gray-400 border-l border-stroke p-1.5 transition-colors sm:p-2 lg:p-3">
            <ChevronRight size={12} className="sm:h-4 sm:w-4" />
          </button>
        </div>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-[#F57F3D] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#F57F3D]/20 transition-all hover:bg-[#E06D2C] sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm lg:px-6 lg:py-3">
          <Download size={12} className="sm:h-4 sm:w-4" />
          Export PDF
        </button>
      </div>
    </header>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-12">
      <div className="border-stroke lg:border-r lg:pr-8 xl:pr-12">
        <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs lg:mb-3">
          Total Settled
        </p>
        <h3 className="mb-2 text-2xl font-bold tracking-tighter text-[#0F1535] sm:mb-3 sm:text-3xl lg:mb-4 lg:text-4xl">
          $2.85M
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 sm:px-2 sm:py-1 sm:text-xs">
            +12.5%
          </span>
          <p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest sm:text-[10px]">
            vs yesterday
          </p>
        </div>
      </div>
      <div className="border-stroke lg:border-r lg:pl-8 lg:pr-8 xl:pl-12 xl:pr-12">
        <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs lg:mb-3">
          Successful Settlements
        </p>
        <div className="mb-3 flex items-baseline gap-1 sm:mb-4 sm:gap-2 lg:mb-6 lg:gap-3">
          <span className="text-2xl font-bold text-[#0F1535] sm:text-3xl lg:text-4xl">
            1,248
          </span>
          <span className="text-gray-300 text-[10px] font-bold sm:text-xs lg:text-sm">
            / 1,255
          </span>
        </div>
        <div className="bg-gray-100 h-1 w-full rounded-full sm:h-1.5">
          <div
            className="h-1 rounded-full bg-[#0F1535] sm:h-1.5"
            style={{width: '98%'}}
          ></div>
        </div>
      </div>
      <div className="lg:pl-8 xl:pl-12">
        <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs lg:mb-3">
          Pending Settlements
        </p>
        <h3 className="mb-2 text-2xl font-bold text-[#0F1535] sm:mb-3 sm:text-3xl lg:mb-4 lg:text-4xl">
          7
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-lg border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 sm:px-2 sm:py-1 sm:text-xs">
            Review
          </span>
          <p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest sm:text-[10px]">
            Bank delays
          </p>
        </div>
      </div>
    </div>

    <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm sm:rounded-2xl">
      <div className="flex flex-col justify-between gap-4 border-b border-stroke p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:p-8">
        <div className="relative w-full lg:w-[320px] xl:w-[480px]">
          <Search
            className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            size={14}
          />
          <input
            className="w-full rounded-lg border border-stroke bg-white py-2 pl-8 pr-3 text-xs font-medium text-[#0F1535] outline-none transition-all focus:ring-2 focus:ring-[#F57F3D]/10 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm lg:py-3 lg:pl-12"
            placeholder="Search by Order ID, User..."
          />
        </div>
        <div className="xs:flex-row xs:items-center flex flex-col items-stretch gap-2 sm:gap-3 lg:gap-4">
          <select className="rounded-lg border border-stroke bg-white px-2 py-2 text-xs font-bold text-[#0F1535] outline-none focus:ring-2 focus:ring-[#F57F3D]/10 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm lg:px-4 lg:py-3">
            <option>All Statuses</option>
            <option>Settled</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
          <select className="rounded-lg border border-stroke bg-white px-2 py-2 text-xs font-bold text-[#0F1535] outline-none focus:ring-2 focus:ring-[#F57F3D]/10 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm lg:px-4 lg:py-3">
            <option>All Instruments</option>
            <option>XAU/USD</option>
            <option>XAG/USD</option>
          </select>
          <button className="text-gray-400 rounded-lg border border-stroke p-2 transition-all hover:border-stroke hover:text-[#0F1535] sm:rounded-xl sm:p-2.5 lg:p-3">
            <Filter size={14} className="sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left lg:min-w-0">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 border-b border-stroke text-[8px] font-bold uppercase tracking-widest sm:text-[10px]">
              <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                Order ID / Time
              </th>
              <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                User
              </th>
              <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                Instrument
              </th>
              <th className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                Amount
              </th>
              <th className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                Fees
              </th>
              <th className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                Status
              </th>
              <th className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke">
            {[
              {
                id: '#ORD-23945',
                time: '14:32 UTC',
                user: 'James Potter',
                type: 'Premium',
                inst: 'XAU/USD',
                amt: '$12.45K',
                fee: '$12.45',
                status: 'Settled',
                color: 'emerald',
              },
              {
                id: '#ORD-23944',
                time: '14:30 UTC',
                user: 'Emma Lewis',
                type: 'Standard',
                inst: 'XAG/USD',
                amt: '$3.20K',
                fee: '$3.20',
                status: 'Settled',
                color: 'emerald',
              },
              {
                id: '#ORD-23943',
                time: '14:15 UTC',
                user: 'Michael King',
                type: 'Corporate',
                inst: 'XAU/EUR',
                amt: '€45.0K',
                fee: '€45.00',
                status: 'Pending',
                color: 'amber',
              },
              {
                id: '#ORD-23942',
                time: '14:10 UTC',
                user: 'Sarah Wong',
                type: 'Standard',
                inst: 'XAU/USD',
                amt: '$8.75K',
                fee: '$8.75',
                status: 'Settled',
                color: 'emerald',
              },
              {
                id: '#ORD-23941',
                time: '13:55 UTC',
                user: 'David Ross',
                type: 'Premium',
                inst: 'XAG/USD',
                amt: '$1.50K',
                fee: '$1.50',
                status: 'Settled',
                color: 'emerald',
              },
              {
                id: '#ORD-23940',
                time: '13:45 UTC',
                user: 'Anna Lee',
                type: 'Standard',
                inst: 'XAU/USD',
                amt: '$5.00K',
                fee: '$5.00',
                status: 'Failed',
                color: 'rose',
              },
            ].map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50/50 group transition-colors"
              >
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  <p className="text-xs font-bold text-[#0F1535] sm:text-sm">
                    {row.id}
                  </p>
                  <p className="text-gray-400 font-mono mt-0.5 text-[8px] sm:mt-1 sm:text-[10px]">
                    {row.time}
                  </p>
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    <div className="bg-gray-100 text-gray-500 flex h-5 w-5 items-center justify-center rounded-full border border-stroke text-[8px] font-bold sm:h-6 sm:w-6 sm:text-[10px] lg:h-8 lg:w-8">
                      {row.user
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F1535] sm:text-sm">
                        {row.user}
                      </p>
                      <p className="text-gray-400 text-[8px] font-bold sm:text-[10px]">
                        {row.type}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs font-bold text-[#0F1535] sm:px-4 sm:py-4 sm:text-sm lg:px-8 lg:py-6">
                  {row.inst}
                </td>
                <td className="px-3 py-3 text-right text-xs font-bold text-[#0F1535] sm:px-4 sm:py-4 sm:text-sm lg:px-8 lg:py-6">
                  {row.amt}
                </td>
                <td className="text-gray-400 px-3 py-3 text-right text-[10px] sm:px-4 sm:py-4 sm:text-xs lg:px-8 lg:py-6">
                  {row.fee}
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  <span
                    className={`inline-flex items-center rounded-lg border px-1.5 py-0.5 text-[8px] font-bold sm:px-2 sm:py-1 sm:text-[10px] lg:px-3 ${
                      row.color === 'emerald'
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                        : row.color === 'amber'
                          ? 'border-amber-100 bg-amber-50 text-amber-700'
                          : 'border-rose-100 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-8 lg:py-6">
                  <button className="text-gray-300 transition-colors hover:text-[#0F1535]">
                    <MoreVertical size={12} className="sm:h-4 sm:w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="xs:flex-row flex flex-col items-center justify-between gap-3 border-t border-stroke p-4 sm:gap-4 sm:p-6 lg:p-8">
        <span className="text-gray-400 text-[10px] sm:text-xs">
          Showing <span className="font-bold text-[#0F1535]">1-6</span> of{' '}
          <span className="font-bold text-[#0F1535]">142</span>
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="text-gray-400 hover:bg-gray-50 flex h-6 w-6 items-center justify-center rounded-lg border border-stroke transition-all disabled:opacity-30 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
            <ChevronRight size={12} className="rotate-180 sm:h-4 sm:w-4" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0F1535] text-[10px] font-bold text-white shadow-lg shadow-[#0F1535]/20 sm:h-8 sm:w-8 sm:text-xs lg:h-10 lg:w-10 lg:text-sm">
            1
          </button>
          <button className="text-gray-400 hover:bg-gray-50 flex h-6 w-6 items-center justify-center rounded-lg border border-stroke text-[10px] transition-all sm:h-8 sm:w-8 sm:text-xs lg:h-10 lg:w-10 lg:text-sm">
            2
          </button>
          <button className="text-gray-400 hover:bg-gray-50 flex h-6 w-6 items-center justify-center rounded-lg border border-stroke text-[10px] transition-all sm:h-8 sm:w-8 sm:text-xs lg:h-10 lg:w-10 lg:text-sm">
            3
          </button>
          <button className="text-gray-400 hover:bg-gray-50 flex h-6 w-6 items-center justify-center rounded-lg border border-stroke transition-all sm:h-8 sm:w-8 lg:h-10 lg:w-10">
            <ChevronRight size={12} className="sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </section>
  </div>
);

// --- Main App Component ---

export default function FinancialReport() {
  const [report, setReport] = useState<ReportType>('reports');
  const showBackButton = report !== 'reports';

  const handleBack = () => {
    setReport('reports');
  };

  return (
    <div className="font-sans min-h-screen bg-white selection:bg-[#F57F3D]/10 selection:text-[#F57F3D]">
      <Header
        currentReport={report}
        setReport={setReport}
        showBackButton={showBackButton}
        onBack={handleBack}
      />
      <AnimatePresence mode="wait">
        <ReportContent
          type={report}
          setReport={setReport}
          onBack={handleBack}
        />
      </AnimatePresence>

      {/* Mobile Menu Button (Floating) */}
      <button className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F1535] text-white shadow-2xl transition-transform active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 md:hidden lg:bottom-8 lg:right-8 lg:h-16 lg:w-16">
        <LayoutDashboard size={18} className="sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
      </button>
    </div>
  );
}
