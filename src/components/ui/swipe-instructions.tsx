import { motion, AnimatePresence } from 'framer-motion';

interface SwipeInstructionsProps {
  show: boolean;
}

export function SwipeInstructions({ show }: SwipeInstructionsProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 left-0 right-0 flex justify-center items-center z-50 pointer-events-none px-4"
        >
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
              Swipe to vote
            </p>
            <div className="flex items-center justify-center gap-8 text-base">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ x: [-8, 0, -8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl text-red-500"
                >
                  ←
                </motion.div>
                <span className="text-red-500 font-medium">Meh</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ y: [-8, 0, -8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl text-yellow-500"
                >
                  ↑
                </motion.div>
                <span className="text-yellow-600 font-medium">Neat</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ x: [8, 0, 8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl text-green-500"
                >
                  →
                </motion.div>
                <span className="text-green-500 font-medium">Love</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 