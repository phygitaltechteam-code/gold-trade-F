import {createFileRoute} from '@tanstack/react-router';
import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdSwapHoriz, MdInfoOutline} from 'react-icons/md';
import {ImSpinner8} from 'react-icons/im';

export const Route = createFileRoute('/_app/currencyconverter')({
  component: CurrencyConverter,
});

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  ts: string;
}

function CurrencyConverter() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<'USD' | 'INR'>('USD');
  const [toCurrency, setToCurrency] = useState<'USD' | 'INR'>('INR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://cdn.moneyconvert.net/api/latest.json',
        );
        if (!response.ok) throw new Error('Failed to fetch exchange rates');
        const data = await response.json();
        setRates(data);
        setError(null);
      } catch (err) {
        setError('Unable to load exchange rates. Please try again.');
        console.error('Error fetching rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
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
  }, [amount, fromCurrency, toCurrency, rates]);

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

  const getLastUpdated = () => {
    if (!rates?.ts) return '';
    const date = new Date(rates.ts);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="font-display text-gray-900 dark:bg-gray-900 flex min-h-screen w-screen flex-col overflow-hidden bg-white antialiased dark:text-white">
      {/* Header */}
      <header className="dark:bg-gray-900/80 fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <button
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 -ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <h1 className="text-lg font-semibold">Currency Converter</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-20 sm:px-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <ImSpinner8 className="mb-4 animate-spin text-4xl text-orange-500" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading exchange rates...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
              <p className="mb-2 text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Converter */}
        {!loading && !error && rates && (
          <div className="flex flex-1 flex-col">
            {/* Rate Info Card */}
            <div className="mb-6 rounded-xl bg-orange-50 p-4 dark:bg-orange-900/20">
              <div className="flex items-start gap-2">
                <MdInfoOutline className="mt-0.5 shrink-0 text-xl text-orange-500" />
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                  <p className="mb-1 font-medium">Exchange Rate</p>
                  <p>1 USD = {rates.rates.INR.toFixed(2)} INR</p>
                  <p>1 INR = {(1 / rates.rates.INR).toFixed(4)} USD</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">
                    Last updated: {getLastUpdated()}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input Card */}
            <div className="dark:bg-gray-800 mb-4 rounded-xl bg-white p-6 shadow-lg">
              <label className="text-gray-600 dark:text-gray-400 mb-2 block text-sm font-medium">
                Amount
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-12 flex-1 rounded-lg border bg-white px-4 text-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Enter amount"
                />
                <div className="relative">
                  <select
                    value={fromCurrency}
                    onChange={(e) =>
                      setFromCurrency(e.target.value as 'USD' | 'INR')
                    }
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-12 cursor-pointer appearance-none rounded-lg border bg-white px-4 pr-8 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-gray-500">▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="my-2 flex justify-center">
              <button
                onClick={handleSwapCurrencies}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-all hover:bg-orange-200 active:scale-95 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
              >
                <MdSwapHoriz className="text-2xl" />
              </button>
            </div>

            {/* Result Card */}
            <div className="dark:bg-gray-800 mt-2 rounded-xl bg-white p-6 shadow-lg">
              <label className="text-gray-600 dark:text-gray-400 mb-2 block text-sm font-medium">
                Converted Amount
              </label>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 text-gray-900 flex h-12 flex-1 items-center rounded-lg px-4 text-lg font-medium dark:text-white">
                  {convertedAmount || '0'}
                </div>
                <div className="relative">
                  <select
                    value={toCurrency}
                    onChange={(e) =>
                      setToCurrency(e.target.value as 'USD' | 'INR')
                    }
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-12 cursor-pointer appearance-none rounded-lg border bg-white px-4 pr-8 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-gray-500">▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                Quick amounts
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((value) => (
                  <button
                    key={value}
                    onClick={() => setAmount(value.toString())}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-gray-500 dark:text-gray-400 mt-6 text-center text-xs">
              Rates provided by moneyconvert.net • Updated every 10 minutes
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
