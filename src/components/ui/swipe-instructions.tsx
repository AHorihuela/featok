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
          className="flex justify-center items-center mb-6"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-sm">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center">
                <motion.span
                  animate={{ x: [-5, 0, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-red-500 text-lg"
                >
                  ←
                </motion.span>
                <span className="text-red-500">Meh</span>
              </div>
              <div className="flex flex-col items-center">
                <motion.span
                  animate={{ y: [-5, 0, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-yellow-500 text-lg"
                >
                  ↑
                </motion.span>
                <span className="text-yellow-500">Neat</span>
              </div>
              <div className="flex flex-col items-center">
                <motion.span
                  animate={{ x: [5, 0, 5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-green-500 text-lg"
                >
                  →
                </motion.span>
                <span className="text-green-500">Love</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 