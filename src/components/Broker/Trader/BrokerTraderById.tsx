import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    CreditCard,
    TrendingUp,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Route } from '@/routes/_app/broker/trader/brokertraderByid.$id';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useGetBrokerClientById, useGetBrokerClientLedgerById } from './broekrtradermutaion';
import { ClientDetailStats } from '@/components/Clients/ClientDetailStats';
import { ClientDocs } from '@/components/Clients/ClientDocs';
import { ClientTabs } from '@/components/Clients/ClientTabs';


const formatQtyLot = (item) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    if (lotSize && lotSize !== qty) {
        return `${qty}/${lotSize}`;
    }
    return qty;
};


const formatPnL = (item) => {
    const pnl = item.pnl || item['p&l'] || 0;
    const sign = pnl > 0 ? '+' : '';

    return `${sign}${Number(pnl).toFixed(2)}`;
};

const renderDateTimeVertical = (value: string) => {
    if (!value || value === '-' || value === 'N/A') return <span>{value}</span>;
    const parts = value.split(', ');
    if (parts.length === 2) {
        return (
            <div className="flex flex-col">
                <span>{parts[0]}</span>
                <span className="text-gray-500 text-xs">{parts[1]}</span>
            </div>
        );
    }
    return <span>{value}</span>;
};

const formatCommission = (val: any) => {
    const num = Number(val);
    if (isNaN(num) || num <= 0) return '0';
    return num.toFixed(2);
};

export const BrokerTraderById: React.FC = () => {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const { data: clientData, isLoading, refetch } = useGetBrokerClientById(id);
    const displayClient = clientData;



    console.log('displayClient', displayClient?.intradayLeverage);
    const [activeTab, setActiveTab] = useState('ledger');
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [walletActionType, setWalletActionType] = useState<'add' | 'withdraw'>(
        'add',
    );
    const [walletAmount, setWalletAmount] = useState('');
    const [walletPin, setWalletPin] = useState('');
    const [showWalletPin, setShowWalletPin] = useState(false);
    const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
    const [intradayMargin, setIntradayMargin] = useState('');
    const [holdingMargin, setHoldingMargin] = useState('');
    const [marginPin, setMarginPin] = useState('');
    const [showMarginPin, setShowMarginPin] = useState(false);
    const [editData, setEditData] = useState({
        fullname: '',
        phoneNumber: '',
        aadharCardNumber: '',
        brokeragePercent: '',
        address: '',
        password: '',
        type: '',
        panCardNumber: '',
        stockHoldingLimit: 0,
    });

    useEffect(() => {
        if (displayClient) {
            setIntradayMargin(
                displayClient?.intradayLeverage != null
                    ? String(displayClient.intradayLeverage)
                    : ''
            );

            setHoldingMargin(
                displayClient?.deliveryLeverage != null
                    ? String(displayClient.deliveryLeverage)
                    : ''
            );
        }
    }, [displayClient]);


    useEffect(() => {
        if (displayClient) {
            setIntradayMargin(
                displayClient?.intradayLeverage != null
                    ? String(displayClient.intradayLeverage)
                    : ''
            );

            setHoldingMargin(
                displayClient?.deliveryLeverage != null
                    ? String(displayClient.deliveryLeverage)
                    : ''
            );
        }
    }, [displayClient]);

    const { data: ledgerData } = useGetBrokerClientLedgerById(id);

    const totalPnL = useMemo(() => {
        const ledgerDataArray = ledgerData?.data || [];
        return ledgerDataArray.reduce((sum: number, item: any) => {
            return sum + Number(item.pnl ?? item['p&l'] ?? 0);
        }, 0);
    }, [ledgerData]);


    const [tradingLedgerData, setTradingLedgerData] = useState<any[]>([]);
    const [paymentData, setPaymentData] = useState<any[]>([]);

    // Trading Ledger Data from API
    useEffect(() => {
        const tradingLedgers = ledgerData?.data || [];
        const formattedLedgers = tradingLedgers.map((item: any) => {
            const amountVal =
                item.amount ?? item.transactionAmount ?? item.paidAmount ?? 0;
            const typeVal = item.type ?? item.paymentStatus ?? item.sr ?? '';
            const dateSource = item.dateTime ?? item.createdAt;

            return {
                ...item,
                dateTime: dateSource
                    ? new Date(dateSource).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : '-',
                buyTime: item.buyTime
                    ? new Date(item.buyTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : '-',
                sellTime: item.sellTime
                    ? new Date(item.sellTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : '-',
                type: typeVal,
                amount: `₹${amountVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
                balanceAfter: `₹${(item.balanceAfter ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            };
        });
        console.log('formattedLedgers', formattedLedgers);
        setTradingLedgerData(formattedLedgers);
    }, [ledgerData]);
    useEffect(() => {
        const tradingLedgers = clientData?.tradingLedgers || [];
        const formattedLedgers = tradingLedgers.map((item: any) => {
            const amountVal =
                item.amount ?? item.transactionAmount ?? item.paidAmount ?? 0;
            const typeVal = item.type ?? item.paymentStatus ?? item.sr ?? '';
            const dateSource = item.dateTime ?? item.createdAt;

            return {
                ...item,
                dateTime: item.createdAt
                    ? new Date(item.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : '-',
                balanceAfter: `₹${(item.balanceAfter ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
                amount: `₹${amountVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            };
        });
        console.log('formattedLedgers', formattedLedgers);
        setPaymentData(formattedLedgers);
    }, [clientData]);
    const renderDateTime = (dateString: string) => {
        if (!dateString || dateString === '-') return '-';
        const parts = dateString.split(', ');
        if (parts.length === 2) {
            return (
                <div className="flex flex-col">
                    <span>{parts[0]}</span>
                    <span className="text-xs text-gray-500">{parts[1]}</span>
                </div>
            );
        }
        return dateString;
    };

    const ledgerColumns = [
        { header: 'Date & Time', accessor: 'dateTime', render: (item: any) => renderDateTime(item.dateTime) },
        { header: 'Trader Name', accessor: 'customerName' },
        { header: 'Script', accessor: 'script' },
        { header: 'Qty/Lot', accessor: (item: any) => formatQtyLot(item) },
        { header: 'Buy Price', accessor: 'buyPrice' },
        { header: 'Sell Price', accessor: 'sellPrice' },
        { header: 'Buy Time', accessor: 'buyTime', render: (item: any) => renderDateTime(item.buyTime) },
        { header: 'Sell Time', accessor: 'sellTime', render: (item: any) => renderDateTime(item.sellTime) },
        { header: 'Status', accessor: 'status' },
        { header: 'P&L', accessor: (item: any) => formatPnL(item) },
        { header: 'Admin Commission', accessor: (item: any) => formatCommission(item.companyCommission) },
        { header: 'Super Broker Commission', accessor: (item: any) => formatCommission(item.superBrokerCommission) },
        { header: 'Broker Commission', accessor: (item: any) => formatCommission(item.brokerCommission) },
    ];

    const paymentColumns = [
        { header: 'Date/Time', accessor: 'dateTime' },
        { header: 'Amount', accessor: 'amount' },
        { header: 'Wallet Amount', accessor: 'walletAmount' },
    ];

    // Trading Ledger Columns - No Sr column
    const tradingLedgerColumns = [
        {
            header: 'Date & Time',
            accessor: 'dateTime',
            className: 'min-w-[160px]',
        },
        {
            header: 'Type',
            accessor: 'type',
            render: (item: any) => (
                <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.type === 'CREDIT'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                >
                    {item.type === 'CREDIT' ? 'Credit' : 'Debit'}
                </span>
            ),
        },
        {
            header: 'Amount',
            accessor: 'amount',
            render: (item: any) => (
                <span
                    className={`font-semibold ${item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                        }`}
                >
                    {item.amount}
                </span>
            ),
        },
        {
            header: 'Balance After',
            accessor: 'balanceAfter',
            render: (item: any) => (
                <span className="font-semibold text-blue-600">{item.balanceAfter}</span>
            ),
        },
        {
            header: 'Notes',
            accessor: 'Notes',
            render: (item: any) => (
                <span className="font-mono text-gray-500 text-xs">{item.Notes}</span>
            ),
        },
    ];

    const handleBack = () => {
        navigate({ to: '/broker/trader/brokertrader' });
    };


    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-6 py-8 text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
                <p className="text-slate-500">Loading client details...</p>
            </div>
        );
    }

    const fullName = displayClient?.user?.fullname || 'Unknown';
    const email = displayClient?.user?.email || 'N/A';
    const phone = displayClient?.user?.phoneNumber || 'N/A';
    const isActive = displayClient?.user?.isActive || false;
    const isVerified = displayClient?.user?.isVerified || false;
    const walletAmountValue = parseFloat(displayClient?.wallets?.amount || '0');
    const blockedAmount = parseFloat(
        displayClient?.wallets?.blockedAmount || '0',
    );
    const aadharNumber = displayClient?.aadharCardNumber || 'N/A';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-9xl mx-auto px-4 py-6 md:px-6 md:py-8"
        >
            {/* Header */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="rounded-xl border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div>
                        <div className="mb-1 flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
                                {fullName}
                            </h1>
                            {isActive && isVerified && (
                                <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Verified Active
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> CRN:{' '}
                                {displayClient?.CRN || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setIntradayMargin(
                                displayClient?.intradayLeverage != null
                                    ? String(displayClient.intradayLeverage)
                                    : ''
                            );
                            setHoldingMargin(
                                displayClient?.deliveryLeverage != null
                                    ? String(displayClient.deliveryLeverage)
                                    : ''
                            );
                            setMarginPin('');
                            setShowMarginPin(false);
                            setIsMarginModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 md:px-5 md:py-3"
                    >
                        <TrendingUp className="h-4 w-4 text-orange-500" /> Add Margin
                    </button>
                    <button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0 md:px-5 md:py-3"
                    >
                        <CreditCard className="h-4 w-4" /> Wallet Balance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:gap-8">
                <div className="space-y-6 lg:col-span-2">
                    {/* Quick Stats Component */}
                    <ClientDetailStats
                        walletAmountValue={walletAmountValue}
                        blockedAmount={blockedAmount}
                        totalPnL={totalPnL}  // ← Pass totalPnL instead of isActive/isVerified
                    />


                    {/* Documentation Component */}
                    <ClientDocs displayClient={displayClient} />

                    {/* Tabs: Ledger & Payment & Trading Ledger Component */}
                    <ClientTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tradingLedgerData={tradingLedgerData}
                        paymentData={paymentData}
                        ledgerColumns={ledgerColumns}
                        // paymentColumns={paymentColumns}
                        tradingLedgerColumns={tradingLedgerColumns}
                    />
                </div>
            </div>

        </motion.div>
    );
};
