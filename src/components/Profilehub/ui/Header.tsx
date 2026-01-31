import {useNavigate} from '@tanstack/react-router';
import React from 'react';
import {MdArrowBackIosNew} from 'react-icons/md';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightElement,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({to: '/accounthub/acounthub'});
    }
  };

  return (
    <header className="bg-background-light/95 dark:bg-background-dark/95 sticky top-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-sm">
      {showBack ? (
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
        >
          <MdArrowBackIosNew className="text-xl" />
        </button>
      ) : (
        <div className="w-10" />
      )}

      <div className="flex-1 px-4 text-center">
        {subtitle && (
          <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            {subtitle}
          </p>
        )}
        {title && (
          <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>

      <div className="flex w-10 items-center justify-center">
        {rightElement}
      </div>
    </header>
  );
};
