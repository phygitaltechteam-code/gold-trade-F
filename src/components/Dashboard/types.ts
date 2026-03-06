export type DashboardFilterType = '7Days' | '30Days' | '24Hours' | 'custom';

export interface DashboardFilters {
  filter: DashboardFilterType;
  from?: string;
  to?: string;
}

export interface DashboardStats {
  TOTAL_DEPOSITS: number;
  WITHDRAWALS: number;
  PLATFORM_PROFIT: number;
  OPEN_EXPOSURE: number;
  MARGIN_UTIL: number;
  tradingVolume: TradingVolumeData[];
  revenueSources: RevenueSourceData[];
  topTraders: TraderData[];
  recentTransactions: TransactionData[];
  changePercentages?: {
    TOTAL_DEPOSITS: number;
    WITHDRAWALS: number;
    PLATFORM_PROFIT: number;
    OPEN_EXPOSURE: number;
    MARGIN_UTIL: number;
  };
}

export interface TradingVolumeData {
  name: string;
  value: number;
}

export interface RevenueSourceData {
  name: string;
  value: number;
  color: string;
}

export interface TraderData {
  id: string;
  name: string;
  volume: string;
  pnl: string;
  risk: 'Low' | 'Med' | 'High';
}

export interface TransactionData {
  type: 'Deposit' | 'Withdrawal';
  date: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Rejected';
}

// Chart data types
export interface VolumeVsFeesData {
  date: string;
  volume: number;
  fees: number;
}

export interface TopUpsVsTransfersData {
  week: string;
  topups: number;
  transfers: number;
}
