import React, {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import DisplayMasterBroker from './DisplayMasterBoker';
import {useGetAllMasterBrocker} from '@/lib/react-query/masterbroker';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

const MasterBrokerflow = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleBrokerAdded = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-screen w-full"
    >
      <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between p-4">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Master Broker Management
        </h1>
        <button
          onClick={() => navigate({to: '/companybroker/add-masterbroker'})}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white transition-all hover:from-orange-600 hover:to-red-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Master Broker
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DisplayMasterBroker refreshTrigger={refreshTrigger} />
      </motion.div>
    </motion.div>
  );
};

export default MasterBrokerflow;
