import React from 'react';
import {motion} from 'framer-motion';
import {TrendingUp, TrendingDown} from 'lucide-react';
import {cn} from '@/utils/utilities';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  progress?: number;
  status?: string;
  statusType?: 'warning' | 'success';
  isDark?: boolean;
  icon: React.ElementType;
  trend?: string;
  isUp?: boolean;
}

const itemVariants = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive,
  progress,
  status,
  statusType,
  isDark,
  icon: Icon,
  trend,
  isUp,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        transition: {type: 'spring', stiffness: 300, damping: 15},
      }}
      className={cn(
        'rounded-xl border p-4 transition-all duration-300 sm:rounded-2xl sm:p-5 lg:p-6',
        isDark
          ? 'border-slate-800 bg-[#111827] text-white shadow-xl shadow-slate-200/50'
          : 'border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md',
      )}
    >
      <div className="mb-3 flex items-start justify-between sm:mb-4">
        <h4
          className={cn(
            'text-[8px] font-bold uppercase tracking-wider sm:text-[9px] lg:text-[10px]',
            isDark ? 'text-slate-400' : 'text-slate-400',
          )}
        >
          {title}
        </h4>
        <motion.div
          whileHover={{rotate: 360}}
          transition={{duration: 0.3}}
          className={cn(
            'rounded-lg p-1.5 sm:p-2',
            isDark ? 'bg-slate-800' : 'bg-slate-50',
          )}
        >
          <Icon
            className={cn(
              'h-3.5 w-3.5 sm:h-4 sm:w-4',
              isDark ? 'text-orange-500' : 'text-slate-400',
            )}
          />
        </motion.div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <motion.div
          initial={{scale: 0.5}}
          animate={{scale: 1}}
          transition={{type: 'spring', stiffness: 200, delay: 0.2}}
          className="text-lg font-bold tracking-tight sm:text-xl lg:text-2xl"
        >
          {value}
        </motion.div>

        {(trend || change) && (
          <motion.div
            initial={{opacity: 0, x: -10}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.3}}
            className="flex items-center gap-1.5"
          >
            {isUp || (isPositive !== undefined && isPositive) ? (
              <TrendingUp className="h-2.5 w-2.5 text-emerald-500 sm:h-3 sm:w-3" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5 text-rose-500 sm:h-3 sm:w-3" />
            )}
            <span
              className={cn(
                'text-[8px] font-bold sm:text-[9px] lg:text-[10px]',
                isUp || isPositive ? 'text-emerald-500' : 'text-rose-500',
              )}
            >
              {trend || change}
            </span>
            <span className="text-[7px] font-medium text-slate-400 sm:text-[8px] lg:text-[10px]">
              vs last month
            </span>
          </motion.div>
        )}

        {progress !== undefined && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800 sm:h-1.5">
              <motion.div
                initial={{width: 0}}
                animate={{width: `${progress}%`}}
                transition={{duration: 1, delay: 0.4}}
                className="h-full rounded-full bg-orange-500"
              />
            </div>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.5}}
              className="text-[7px] font-medium text-slate-400 sm:text-[8px] lg:text-[10px]"
            >
              {progress}% of quarterly target
            </motion.div>
          </div>
        )}

        {status && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.3}}
            className="flex items-center gap-2"
          >
            {statusType === 'warning' && (
              <motion.div
                animate={{scale: [1, 1.1, 1]}}
                transition={{repeat: Infinity, duration: 2}}
                className="flex items-center gap-1.5 text-orange-500"
              >
                <span className="text-[8px] sm:text-xs">⚠️</span>
                <span className="text-[7px] font-bold uppercase tracking-wide sm:text-[8px] lg:text-[10px]">
                  {status}
                </span>
              </motion.div>
            )}
            {statusType === 'success' && (
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-medium text-slate-400 sm:text-[8px] lg:text-[10px]">
                  Safe Level
                </span>
                <div className="flex items-center gap-1">
                  <motion.span
                    animate={{scale: [1, 1.2, 1]}}
                    transition={{repeat: Infinity, duration: 2}}
                    className="h-1 w-1 rounded-full bg-emerald-500 sm:h-1.5 sm:w-1.5"
                  />
                  <span className="text-[7px] font-bold uppercase tracking-wide text-emerald-500 sm:text-[8px] lg:text-[10px]">
                    {status}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
