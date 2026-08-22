import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { ChevronRight, Home } from 'lucide-react'

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actionLabel,
  onAction,
  actionIcon,
  className,
}) {
  const showBreadcrumbs = Array.isArray(breadcrumbs) && breadcrumbs.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6',
        className
      )}
    >
      <div className="min-w-0">
        {showBreadcrumbs && (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-odoo-gray-500 mb-2 flex-wrap">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-odoo-gray-400" />
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        isLast
                          ? 'text-primary-600 font-semibold'
                          : 'text-odoo-gray-500'
                      )}
                    >
                      {crumb.label}
                    </span>
                  )}
                </div>
              )
            })}
          </nav>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-odoo-gray-800 tracking-tight">{title}</h1>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-odoo-gray-500">{subtitle}</p>
        )}
      </div>

      {(action || (actionLabel && onAction)) && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action || (
            <button onClick={onAction} className="btn-primary">
              {actionIcon}
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
