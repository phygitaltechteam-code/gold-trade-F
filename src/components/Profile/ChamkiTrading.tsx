import React, {useEffect, useState} from 'react';
import {Database, Clock3, ChevronUp, ChevronDown} from 'lucide-react';
import {useGetTradeTime, useSetTradingTime} from '@/lib/react-query/commission';

const ChamkiTrading = () => {
  const [tradeTime, setTime] = useState<number>(1);
  const [isEnabled, setIsEnabled] = useState(false);
  const {data: tradeData} = useGetTradeTime();
  console.log('tradeee', tradeData);
  const {mutateAsync: setTradeTime} = useSetTradingTime();

  useEffect(() => {
    if (tradeData) {
      setIsEnabled(tradeData?.holdingStatus);
      setTime(tradeData?.tradingTime);
    }
  }, [tradeData]);
  const increaseTime = () => {
    if (tradeTime < 60) {
      setTime((prev) => prev + 1);
    }
  };

  const decreaseTime = () => {
    if (tradeTime > 1) {
      setTime((prev) => prev - 1);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (!isNaN(value)) {
      if (value >= 1 && value <= 60) {
        setTime(value);
      }
    }
  };

  const submit = () => {
    setTradeTime({holdingStatus: isEnabled, time: tradeTime});
  };
  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
          <div className="border-b border-stroke pb-4">
            <h2 className="text-lg font-semibold">Trading Time</h2>
          </div>

          <div className="grid grid-cols-1 gap-10 py-6 sm:grid-cols-2">
            {/* Trading Time Input */}
            <div className="space-y-2">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Trading Time (Minutes)
              </label>

              <div className="relative">
                {/* Left Clock Icon */}
                <button
                  type="button"
                  className="text-gray-400 absolute left-3 top-1/2 z-10 -translate-y-1/2 hover:text-orange-500"
                >
                  <Clock3 className="h-4 w-4" />
                </button>

                {/* Input */}
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={tradeTime}
                  onChange={handleTimeChange}
                  className="w-full rounded-xl border border-stroke bg-white py-2 pl-10 pr-12 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />

                {/* Right Triangle Buttons */}
                <div className="bg-gray-50 absolute right-2 top-1/2 flex -translate-y-1/2 flex-col overflow-hidden rounded-md">
                  <button
                    type="button"
                    onClick={increaseTime}
                    className="hover:bg-gray-100 flex h-5 w-6 items-center justify-center"
                  >
                    <ChevronUp className="h-3 w-3 text-neutral-900" />
                  </button>

                  <button
                    type="button"
                    onClick={decreaseTime}
                    className="hover:bg-gray-100 flex h-5 w-6 items-center justify-center"
                  >
                    <ChevronDown className="h-3 w-3 text-neutral-900" />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-xs">Range: 1 to 60 minutes</p>
            </div>

            {/* Toggle Button */}
            <div className="space-y-2">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Holding Status
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                    isEnabled ? 'bg-green-500' : 'bg-neutral-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      isEnabled ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>

                <span className="text-sm font-medium">
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => submit()}
              type="button"
              className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]"
            >
              <Database className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChamkiTrading;
