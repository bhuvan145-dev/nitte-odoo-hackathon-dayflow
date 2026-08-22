import { motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const gradientVariants = [
  { from: 'from-primary-500', to: 'to-primary-700', bg: 'bg-primary-50' },
  { from: 'from-brand-500', to: 'to-brand-700', bg: 'bg-brand-50' },
  { from: 'from-blue-500', to: 'to-blue-700', bg: 'bg-blue-50' },
  { from: 'from-orange-500', to: 'to-orange-700', bg: 'bg-orange-50' },
]

export default function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  trendDirection,
  gradient = 0,
  className,
  onClick,
}) {
  const g = gradientVariants[gradient % gradientVariants.length]

  const trendConfig = {
    up: { Icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    down: { Icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    flat: { Icon: Minus, color: 'text-odoo-gray-500', bg: 'bg-odoo-gray-100' },
  }

  const dir = trendDirection || (typeof trend === 'string' && trend.startsWith('-') ? 'down' : 'up')
  const t = trendConfig[dir]

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      className={cn(
        'card p-5 relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-10 blur-2xl',
          g.bg
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="stat-label">{label}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="stat-value mt-1.5 tracking-tight"
          >
            {value}
          </motion.p>
          {trend !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', t.bg, t.color)}>
                <t.Icon className="w-3 h-3" />
                <span>{typeof trend === 'number' ? (trend > 0 ? '+' : '') + trend + '%' : trend}</span>
              </span>
              <span className="text-xs text-odoo-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md',
            g.from,
            g.to
          )}
        >
          {Icon && <Icon className="w-6 h-6 text-white" strokeWidth={2} />}
        </div>
      </div>
    </motion.div>
  )

  return onClick ? <div onClick={onClick}>{card}</div> : card
}
