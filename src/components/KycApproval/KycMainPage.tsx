import {useState} from 'react';
import {KYCList} from './KYCList';
import {KYCDetail} from './KYCDetail';
import {KYCRequest} from './kyctypes';
import {motion, AnimatePresence} from 'framer-motion';

export default function KycMainPage() {
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <AnimatePresence mode="wait">
        {!selectedRequest ? (
          <motion.div
            key="list"
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.2}}
          >
            <KYCList onSelectRequest={setSelectedRequest} />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.2}}
          >
            <KYCDetail
              request={selectedRequest}
              onBack={() => setSelectedRequest(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
