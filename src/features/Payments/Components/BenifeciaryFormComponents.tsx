import React, {InputHTMLAttributes, SelectHTMLAttributes} from 'react';
import {MdExpandMore} from 'react-icons/md';

// --- Types ---
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: React.ReactNode;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  leftIcon?: React.ReactNode;
  options: {value: string; label: string}[];
}

// --- Components ---

export const SectionHeader: React.FC<{title: string}> = ({title}) => (
  <h2 className="text-text-main dark:text-gray-200 mb-5 mt-8 text-xl font-bold leading-tight tracking-tight first:mt-4">
    {title}
  </h2>
);

export const InputField: React.FC<InputFieldProps> = ({
  label,
  leftIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="relative">
        {leftIcon && (
          <div className="text-gray-500 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          className={`bg-gray-50 dark:bg-gray-800 ring-gray-200 dark:ring-gray-700 dark:focus:bg-gray-900 text-text-main placeholder-gray-400 h-12 w-full rounded-xl border-none outline-none ring-1 transition-all focus:bg-white focus:ring-2 focus:ring-primary dark:text-white ${leftIcon ? 'pl-10' : 'px-4'} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  leftIcon,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="relative w-full space-y-1.5">
      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="relative">
        {leftIcon && (
          <div className="text-gray-500 dark:text-gray-400 pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <select
          className={`bg-gray-50 dark:bg-gray-800 ring-gray-200 dark:ring-gray-700 dark:focus:bg-gray-900 text-text-main h-12 w-full cursor-pointer appearance-none rounded-xl border-none outline-none ring-1 transition-all focus:bg-white focus:ring-2 focus:ring-primary dark:text-white ${leftIcon ? 'pl-10' : 'pl-4'} pr-10 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.value === ''}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <MdExpandMore className="text-gray-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl" />
      </div>
    </div>
  );
};

export const MobilePrefixSelect: React.FC = () => (
  <div className="relative w-28 shrink-0">
    <select className="bg-gray-50 dark:bg-gray-800 ring-gray-200 dark:ring-gray-700 dark:focus:bg-gray-900 text-text-main h-12 w-full cursor-pointer appearance-none rounded-xl border-none pl-3 pr-8 text-sm outline-none ring-1 transition-all focus:bg-white focus:ring-2 focus:ring-primary dark:text-white">
      <option value="us">🇺🇸 +1</option>
      <option value="uk">🇬🇧 +44</option>
      <option value="fr">🇫🇷 +33</option>
      <option value="de">🇩🇪 +49</option>
    </select>
    <MdExpandMore className="text-gray-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg" />
  </div>
);

export const ProgressBar: React.FC<{
  step: number;
  total: number;
  label: string;
}> = ({step, total, label}) => {
  return (
    <div className="flex w-full flex-col items-center justify-center bg-white pb-2 pt-6 dark:bg-[#1e1e1e]">
      <div className="flex flex-row items-center justify-center gap-3">
        {Array.from({length: total}).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i + 1 === step
                ? 'w-12 bg-primary'
                : 'dark:bg-gray-700 w-2 bg-[#e6dfdb]'
            }`}
          />
        ))}
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs font-medium">
        Step {step} of {total}: {label}
      </p>
    </div>
  );
};

export const Divider: React.FC = () => (
  <hr className="border-gray-100 dark:border-gray-800 my-8" />
);
