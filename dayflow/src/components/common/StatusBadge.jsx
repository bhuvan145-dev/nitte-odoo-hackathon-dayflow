import { cn } from '../../utils/cn.js'
import { CheckCircle2, XCircle, Clock, UserCheck, UserX, CalendarDays, Moon, AlertCircle } from 'lucide-react'

const statusConfig = {
  Pending: {
    variant: 'warning',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    icon: Clock,
  },
  Approved: {
    variant: 'success',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  Rejected: {
    variant: 'danger',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  Present: {
    variant: 'success',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: UserCheck,
  },
  Absent: {
    variant: 'danger',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: UserX,
  },
  'Half-day': {
    variant: 'warning',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    icon: Moon,
  },
  Leave: {
    variant: 'info',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    icon: CalendarDays,
  },
  Weekend: {
    variant: 'secondary',
    bg: 'bg-odoo-gray-100',
    text: 'text-odoo-gray-600',
    dot: 'bg-odoo-gray-400',
    icon: CalendarDays,
  },
  Active: {
    variant: 'success',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  Inactive: {
    variant: 'danger',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  Error: {
    variant: 'danger',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: AlertCircle,
  },
}

export default function StatusBadge({ status, showIcon = true, showDot = false, className }) {
  const config = statusConfig[status] || statusConfig.Pending
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />}
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      <span>{status}</span>
    </span>
  )
}
