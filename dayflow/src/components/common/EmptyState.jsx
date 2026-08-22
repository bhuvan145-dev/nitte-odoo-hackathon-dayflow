import { motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  subtitle = 'There is nothing to display here yet.',
  action,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-brand-100 rounded-full blur-2xl opacity-60" />
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-brand-50 border border-odoo-gray-100"
        >
          <Icon className="w-10 h-10 text-gradient" strokeWidth={1.5} />
        </motion.div>
      </div>
      <h3 className="text-lg font-semibold text-odoo-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-odoo-gray-500 max-w-sm mb-6">{subtitle}</p>
      {(action || (actionLabel && onAction)) && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action || (
            <button onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
