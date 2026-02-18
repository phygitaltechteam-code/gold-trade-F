import {createFileRoute} from '@tanstack/react-router';
import React, {useState, useEffect} from 'react';
import {
  MdArrowBack,
  MdSwapHoriz,
  MdInfoOutline,
  MdRefresh,
  MdTrendingUp,
  MdOutlineCurrencyExchange,
} from 'react-icons/md';
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

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await unAuthenticatedApi.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
      );
      setRates(res.data);

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
      setError(null);
    } catch (err) {
      setError('Unable to fetch exchange rates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

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

    const usdToInr = rates.rates.INR;
    const inrToUsd = 1 / usdToInr;

    let result: number;
    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      result = numAmount * usdToInr;
    } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
      result = numAmount * inrToUsd;
    } else {
      result = numAmount;
    }

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
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header - Compact on mobile */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all duration-200 hover:bg-slate-100 sm:h-10 sm:w-10"
            aria-label="Go back"
          >
            <MdArrowBack className="text-lg sm:text-xl" />
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <MdOutlineCurrencyExchange className="text-xl text-blue-600 sm:text-2xl" />
            <h1 className="text-base font-semibold text-slate-800 sm:text-lg">
              <span className="xs:inline hidden">Currency Converter</span>
              <span className="xs:hidden">Converter</span>
            </h1>
          </div>

          <button
            onClick={fetchRates}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-all duration-200 hover:bg-slate-100 sm:h-10 sm:w-10"
            aria-label="Refresh rates"
          >
            <MdRefresh className="text-lg sm:text-xl" />
          </button>
        </div>
      </header>

      {/* Main Content - Reduced padding on mobile */}
      <main className="mx-auto max-w-7xl px-3 pb-6 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Loading State - Compact on mobile */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-20">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xl sm:rounded-2xl sm:p-8">
                <div className="relative">
                  <ImSpinner8 className="mx-auto mb-3 animate-spin text-3xl text-blue-600 sm:mb-4 sm:text-4xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
                </div>
                <p className="text-center text-sm font-medium text-slate-600 sm:text-base">
                  Fetching rates...
                </p>
                <p className="mt-1 text-center text-xs text-slate-400 sm:mt-2 sm:text-sm">
                  Just a moment
                </p>
              </div>
            </div>
          )}

          {/* Error State - Compact on mobile */}
          {error && !loading && (
            <div className="rounded-xl border border-red-100 bg-white p-6 shadow-xl sm:rounded-2xl sm:p-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 sm:mb-4 sm:h-16 sm:w-16">
                  <MdInfoOutline className="text-2xl text-red-500 sm:text-3xl" />
                </div>
                <p className="mb-1 text-sm font-medium text-red-600 sm:text-base">
                  Something went wrong
                </p>
                <p className="mb-4 px-2 text-xs text-slate-500 sm:mb-6 sm:text-sm">
                  {error}
                </p>
                <button
                  onClick={fetchRates}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 sm:gap-2 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base"
                >
                  <MdRefresh className="text-base sm:text-lg" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Converter - Compact spacing on mobile */}
          {!loading && !error && rates && (
            <div className="space-y-3 sm:space-y-5">
              {/* Exchange Rate Card - Compact on mobile */}
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-6">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-50 p-2 sm:p-3">
                    <MdTrendingUp className="text-base text-blue-600 sm:text-xl" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between sm:mb-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 sm:text-base">
                          Live Rate
                        </p>
                        <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                          Real-time data
                        </p>
                      </div>
                      <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 sm:gap-2 sm:px-3 sm:py-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 sm:h-2 sm:w-2"></span>
                        <span className="text-xs font-medium text-green-700">
                          Live
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 sm:rounded-xl sm:p-4">
                        <span className="mb-0.5 block text-xs text-slate-400 sm:mb-1">
                          1 USD
                        </span>
                        <span className="text-base font-bold text-slate-800 sm:text-xl">
                          {rates.rates.INR.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-slate-400 sm:text-sm">
                            INR
                          </span>
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 sm:rounded-xl sm:p-4">
                        <span className="mb-0.5 block text-xs text-slate-400 sm:mb-1">
                          1 INR
                        </span>
                        <span className="text-base font-bold text-slate-800 sm:text-xl">
                          {(1 / rates.rates.INR).toFixed(4)}{' '}
                          <span className="text-xs font-normal text-slate-400 sm:text-sm">
                            USD
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 sm:mt-4 sm:pt-3">
                      <p className="text-xs text-slate-400">{lastUpdated}</p>
                      <p className="hidden text-xs text-slate-400 sm:block">
                        ExchangeRate-API
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Input Card - Compact on mobile */}
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-6">
                <label className="mb-1 block text-xs font-medium text-slate-700 sm:mb-2 sm:text-sm">
                  Amount
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 sm:left-4 sm:text-base">
                      {fromCurrency}
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 text-base text-slate-800 placeholder-slate-300 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:rounded-xl sm:pl-16 sm:pr-4 sm:text-lg"
                    />
                  </div>
                  <select
                    value={fromCurrency}
                    onChange={(e) =>
                      setFromCurrency(e.target.value as 'USD' | 'INR')
                    }
                    className="h-12 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:w-32 sm:rounded-xl sm:px-4 sm:text-base"
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

              {/* Result Card - Compact on mobile */}
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-6">
                <label className="mb-1 block text-xs font-medium text-slate-700 sm:mb-2 sm:text-sm">
                  Converted Amount
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 sm:left-4 sm:text-base">
                      {toCurrency}
                    </span>
                    <div className="flex h-12 w-full items-center rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 pl-12 pr-3 text-base font-semibold text-slate-800 sm:h-14 sm:rounded-xl sm:pl-16 sm:pr-4 sm:text-lg">
                      {convertedAmount || '0.00'}
                    </div>
                  </div>
                  <select
                    value={toCurrency}
                    onChange={(e) =>
                      setToCurrency(e.target.value as 'USD' | 'INR')
                    }
                    className="h-12 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:w-32 sm:rounded-xl sm:px-4 sm:text-base"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              {/* Additional Info - Compact on mobile */}
              <div className="px-2 text-center">
                <p className="text-xs leading-tight text-slate-400">
                  <span className="hidden sm:inline">
                    Rates updated every minute •{' '}
                  </span>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CurrencyConverter;
