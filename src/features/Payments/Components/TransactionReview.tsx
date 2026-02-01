import {useNavigate} from '@tanstack/react-router';
import React from 'react';
import {
  MdArrowBack,
  MdAccountBalance,
  MdExpandMore,
  MdLock,
  MdSend,
  MdFace,
} from 'react-icons/md';

const TransferReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light font-sans flex min-h-screen justify-center text-slate-900">
      <div className="bg-background-light relative min-h-screen w-full max-w-md shadow-2xl">
        <div className="relative flex min-h-screen flex-col">
          <header className="bg-background-light/80 sticky top-0 z-50 border-b border-slate-200/50 backdrop-blur-md">
            <div className="flex h-14 items-center justify-between px-4">
              <button
                type="button"
                className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
                aria-label="Go back"
                onClick={() => navigate({to: '/sendpayment'})}
              >
                <MdArrowBack size={24} />
              </button>
              <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight">
                Review Transfer
              </h1>
            </div>
          </header>

          <main className="relative z-10 flex w-full flex-1 flex-col p-4">
            <div className="flex flex-col items-center justify-center pb-8 pt-6">
              <span className="mb-1 text-sm font-medium text-slate-500">
                Total Amount
              </span>
              <div className="relative">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  $60.00
                </h2>
              </div>
            </div>

            {/* Details Card */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {/* TO Section */}
              <div className="group cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    To
                  </span>
                  <button className="rounded px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 flex-shrink-0 rounded-full border border-slate-200 bg-slate-100 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAkX71PAJHVl90AxwfNPl8VlnxURXEdiAo-LelEdatKlqSjkCOProhaWDT0TAB6H3LuZbuVvhbzRrGOyxtE6pqtcg7rouKlog92uPY5mF3RJthvR4RtWOsTvf7DDBiD_Fq6WgxEpU4wlDG91dH0sx2n6zqGhB_Jonphjue_ctORyTZX8dxzJguYTSN3cAvbxa8WGrdEN6R8Wpopw2QzCYQll9EO7LzLJhEHhGLIkpV7Mf6yCMibFQaLLv-_3ndH4M59Z5837KRnXvu7")',
                    }}
                    aria-label="Profile picture of Rahul Sharma"
                  />
                  <div className="flex flex-col">
                    <p className="text-base font-semibold text-slate-900">
                      Rahul Sharma
                    </p>
                    <p className="text-sm text-slate-500">
                      HDFC Bank •••• 4521
                    </p>
                  </div>
                </div>
              </div>

              {/* FROM Section */}
              <div className="group cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    From
                  </span>
                  <button className="rounded px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                    <MdAccountBalance size={24} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5">
                      <p className="text-base font-semibold text-slate-900">
                        E Private Account
                      </p>
                      <MdExpandMore className="text-slate-400" size={20} />
                    </div>
                    <p className="text-sm text-slate-500">
                      Axis Bank •••• 8890
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">
                    Oct 24, 2023
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Reference Note</span>
                  <span className="font-medium text-slate-900">
                    Rent payment
                  </span>
                </div>

                <div className="my-2 h-px w-full bg-slate-200"></div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-900">Total Debit</span>
                  <span className="text-lg font-bold text-slate-900">
                    $60.00
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-background-light/90 z-40 border-t border-slate-200 p-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-md flex-col gap-4">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <MdLock size={14} className="text-slate-500" />
                <span>Protected by 256-bit bank-grade encryption</span>
              </div>

              <button
                className="group relative flex h-14 w-full transform items-center justify-center rounded-xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/50 active:scale-[0.98] active:bg-primary/75"
                onClick={() => navigate({to: '/securitypinpage'})}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">Confirm & Send</span>
                  <MdSend
                    size={20}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="absolute right-4 opacity-70">
                  <MdFace size={24} />
                </div>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TransferReviewScreen;
