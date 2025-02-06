import { motion } from 'framer-motion';

export function LoadingAnimation() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="relative w-64 h-64">
        {/* Love Card (Right) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-lg"
          animate={{
            x: [0, 200, 0],
            rotate: [0, 15, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
        >
          <div className="absolute bottom-4 right-4 text-green-500 text-2xl">❤️</div>
        </motion.div>

        {/* Neat Card (Up) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-lg"
          animate={{
            y: [0, -200, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
        >
          <div className="absolute bottom-4 right-4 text-yellow-500 text-2xl">👍</div>
        </motion.div>

        {/* Meh Card (Left) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-2xl shadow-lg"
          animate={{
            x: [0, -200, 0],
            rotate: [0, -15, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
        >
          <div className="absolute bottom-4 right-4 text-red-500 text-2xl">🤷</div>
        </motion.div>

        {/* Static Card (Base) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white/50 rounded-2xl shadow-lg" />
      </div>
    </div>
  );
} 