import React from 'react';
import {MdExpandMore} from 'react-icons/md';

const AccountSelector: React.FC = () => {
  return (
    <button className="group relative mb-8 flex w-fit max-w-full items-center gap-3 rounded-full border border-white/60 bg-white/80 py-2 pl-2 pr-4 shadow-[0_2px_8px_rgba(13,30,58,0.08)] backdrop-blur-sm transition-all hover:shadow-md active:scale-[0.98]">
      <div className="relative flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcwewouBa3QTNIKfTXyVJGl4taLFYw-txYZnJIlAC5R_v8aof71GRHZ5lZZZFSb-D_McYENH6DpSen0beEsGbSVG2eanDVRDdOPthi65bn7wW411PYU9VL6G7vofc-wNjS_zsqx2fAxlf-n9qYJnEmeJgUIquln_7ERVrfNLRwz5G9JyHUgoQDlI1L6TPBd2WbqeHTDnAV_OhGa0W8oXgfu2fCl04DBWFURLD5DN8XmMETeAMxCMi7NAsWq4iJXtrPjRk9sQP-i26-')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </div>
      <div className="flex flex-col items-start text-left">
        <p className="text-swiss-navy whitespace-nowrap text-xs font-semibold">
          Savings ••4582
        </p>
        <p className="text-[10px] font-medium text-slate-500">
          $12,450.00 Available
        </p>
      </div>
      <MdExpandMore className="ml-1 text-xl text-slate-400 transition-colors group-hover:text-primary" />
    </button>
  );
};

export default AccountSelector;
