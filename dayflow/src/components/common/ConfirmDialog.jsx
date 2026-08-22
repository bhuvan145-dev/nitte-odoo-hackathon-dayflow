import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { AlertTriangle, CheckCircle2, Trash2, AlertCircle, X } from 'lucide-react'

const iconMap = {
  danger: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-100' },
  warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
  info: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
}

export default function ConfirmDialog({
  open = false,
  title = 'Confirm action',
  message = 'Are you sure you want to proceed with this action?',
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  icon,
  className,
}) {
  const style = iconMap[variant] || iconMap.danger
  const Icon = icon || style.icon

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
      if (e.key === 'Enter') onConfirm?.()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onConfirm, onCancel])

  if (typeof document === 'undefined') return null

  const confirmBtnClass =
    variant === 'danger'
      ? 'btn-danger'
      : variant === 'warning'
      ? 'btn-warning'
      : variant === 'success'
      ? 'btn-success'
      : 'btn-primary'

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-odoo-gray-900/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-card-hover border border-odoo-gray-100 overflow-hidden',
                className
              )}
            >
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-start gap-4">
                  <div className={cn('flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center', style.bg)}>
                    <Icon className={cn('w-6 h-6', style.color)} />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-semibold text-odoo-gray-800">{title}</h3>
                    <p className="mt-1 text-sm text-odoo-gray-500">{message}</p>
                  </div>
                  <button
                    onClick={onCancel}
                    className="p-1 rounded-lg text-odoo-gray-400 hover:text-odoo-gray-600 hover:bg-odoo-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 flex items-center justify-end gap-3 bg-odoo-gray-50 border-t border-odoo-gray-100">
                <button onClick={onCancel} className="btn-secondary">
                  {cancelLabel}
                </button>
                <button onClick={onConfirm} className={confirmBtnClass}>
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
