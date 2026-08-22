import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <div>
          <p className="text-lg font-bold text-odoo-gray-800">Dayflow</p>
          <p className="text-xs text-odoo-gray-400 mt-1 text-center">Loading your workspace...</p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
