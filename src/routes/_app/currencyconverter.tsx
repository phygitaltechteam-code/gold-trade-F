import {createFileRoute} from '@tanstack/react-router';
import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdSwapHoriz, MdInfoOutline} from 'react-icons/md';
import {ImSpinner8} from 'react-icons/im';
import {unAuthenticatedApi} from '@/utils/axios';

export const Route = createFileRoute('/_app/currencyconverter')({
  component: CurrencyConverter,
});

interface ExchangeRates {
  base: string;
  rates: {
    INR: number;
  };
  ts: number;
}

function CurrencyConverter() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<'USD' | 'INR'>('USD');
  const [toCurrency, setToCurrency] = useState<'USD' | 'INR'>('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch exchange rates
  const fetchRates = async () => {
    try {
      setLoading(true);

      const res = await unAuthenticatedApi.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
      );

      setRates(res.data);

      // Set last updated time
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );

      setError('');
    } catch (err) {
      setError('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();

    const interval = setInterval(() => {
      fetchRates();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update last updated timestamp
  const updateLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp);
    setLastUpdated(
      date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
      }),
    );
  };

  // Initial fetch and interval setup
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate conversion when inputs change
  useEffect(() => {
    if (!rates || !amount) {
      setConvertedAmount('');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setConvertedAmount('');
      return;
    }

    // Get rates
    const usdToInr = rates.rates.INR;
    const inrToUsd = 1 / usdToInr;

    let result: number;
    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      result = numAmount * usdToInr;
    } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
      result = numAmount * inrToUsd;
    } else {
      result = numAmount; // Same currency
    }

    // Format with 2 decimal places for INR, 4 for USD
    const formatted =
      toCurrency === 'INR' ? result.toFixed(2) : result.toFixed(4);

    setConvertedAmount(formatted);
  }, [amount, fromCurrency, toCurrency, rates, lastUpdated]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="font-display from-gray-50 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen w-full bg-gradient-to-br via-white to-orange-50 antialiased dark:text-white">
      {/* Header */}
      <header className="border-gray-200/60 dark:border-gray-800 dark:bg-gray-900/70 sticky top-0 z-50 border-b bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105"
            aria-label="Go back"
          >
            <MdArrowBack className="text-2xl" />
          </button>

          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Currency Converter
          </h1>

          <div className="w-10" />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        {/* Loading */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="dark:bg-gray-800/70 rounded-2xl bg-white/70 p-10 shadow-xl backdrop-blur-xl">
              <ImSpinner8 className="mx-auto mb-4 animate-spin text-5xl text-orange-500" />
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                Fetching latest exchange rates...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-2xl bg-red-50/80 p-8 text-center shadow-lg backdrop-blur-xl dark:bg-red-900/20">
              <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchRates}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Converter */}
        {!loading && !error && rates && (
          <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Rate Card */}
            <div className="dark:to-gray-900 rounded-3xl bg-gradient-to-br from-orange-100/60 to-white p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:from-orange-900/20">
              <div className="flex items-start gap-3">
                <MdInfoOutline className="mt-1 text-2xl text-orange-500" />

                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <p className="text-sm font-semibold">Live Exchange Rate</p>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="dark:bg-gray-800/60 rounded-xl bg-white/70 p-3 text-center shadow-inner">
                      <span className="text-gray-500 block text-xs">1 USD</span>
                      <span className="text-lg font-bold">
                        {rates.rates.INR.toFixed(2)} INR
                      </span>
                    </div>

                    <div className="dark:bg-gray-800/60 rounded-xl bg-white/70 p-3 text-center shadow-inner">
                      <span className="text-gray-500 block text-xs">1 INR</span>
                      <span className="text-lg font-bold">
                        {(1 / rates.rates.INR).toFixed(4)} USD
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-500 mt-3 text-xs">
                    Updated: {lastUpdated}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Card */}
            <div className="dark:bg-gray-800/70 rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl">
              <label className="mb-2 block text-sm font-medium">Amount</label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-900/60 h-14 flex-1 rounded-xl border bg-white/80 px-4 text-lg shadow-inner transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"
                />

                <select
                  value={fromCurrency}
                  onChange={(e) =>
                    setFromCurrency(e.target.value as 'USD' | 'INR')
                  }
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-900/60 h-14 rounded-xl border bg-white/80 px-4 shadow-inner sm:w-40"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            {/* Swap */}
            <div className="flex justify-center">
              <button
                onClick={handleSwapCurrencies}
                className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              >
                <MdSwapHoriz className="text-2xl transition-transform group-hover:rotate-180" />
              </button>
            </div>

            {/* Result Card */}
            <div className="dark:bg-gray-800/70 rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl">
              <label className="mb-2 block text-sm font-medium">
                Converted Amount
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="bg-gray-100/80 dark:bg-gray-900/60 flex h-14 flex-1 items-center rounded-xl px-4 text-lg font-semibold shadow-inner">
                  {convertedAmount || '0'}
                </div>

                <select
                  value={toCurrency}
                  onChange={(e) =>
                    setToCurrency(e.target.value as 'USD' | 'INR')
                  }
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-900/60 h-14 rounded-xl border bg-white/80 px-4 shadow-inner sm:w-40"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            {/* <p className="text-center text-xs text-gray-500">
            Rates by moneyconvert.net • Auto refresh 30s
          </p> */}
          </div>
        )}
      </main>
    </div>
  );
}

export default CurrencyConverter;
