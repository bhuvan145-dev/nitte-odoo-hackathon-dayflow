import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext()

const toastConfig = {
  success: {
    icon: CheckCircle2,
    border: 'border-l-green-500',
    iconColor: 'text-green-500',
    progressBg: 'bg-green-500',
  },
  error: {
    icon: XCircle,
    border: 'border-l-red-500',
    iconColor: 'text-red-500',
    progressBg: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-orange-500',
    iconColor: 'text-orange-500',
    progressBg: 'bg-orange-500',
  },
  info: {
    icon: Info,
    border: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    progressBg: 'bg-blue-500',
  },
}

function ToastItem({ toast, onRemove }) {
  const config = toastConfig[toast.type] || toastConfig.info
  const Icon = config.icon

  useEffect(() => {
    if (toast.duration === Infinity) return
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={cn(
        'relative w-full max-w-sm bg-white rounded-xl shadow-card-hover border border-odoo-gray-100 border-l-4 overflow-hidden',
        config.border
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn('flex-shrink-0 w-5 h-5 mt-0.5', config.iconColor)} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-semibold text-odoo-gray-800">{toast.title}</h4>
          )}
          {toast.message && (
            <p className={cn('text-sm text-odoo-gray-500', toast.title && 'mt-0.5')}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 -mr-1 -mt-1 rounded-lg text-odoo-gray-400 hover:text-odoo-gray-600 hover:bg-odoo-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {toast.duration !== Infinity && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
          className={cn('h-0.5 absolute bottom-0 left-0', config.progressBg)}
        />
      )}
    </motion.li>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm pointer-events-none">
      <ul className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </ul>
    </div>,
    document.body
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const pushToast = useCallback((options) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast = typeof options === 'string'
      ? { id, type: 'info', message: options }
      : { id, type: 'info', ...options }
    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const toast = {
    success: (options) => pushToast({ ...(typeof options === 'string' ? { message: options } : options), type: 'success' }),
    error: (options) => pushToast({ ...(typeof options === 'string' ? { message: options } : options), type: 'error' }),
    warning: (options) => pushToast({ ...(typeof options === 'string' ? { message: options } : options), type: 'warning' }),
    info: (options) => pushToast({ ...(typeof options === 'string' ? { message: options } : options), type: 'info' }),
    dismiss: removeToast,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function Toast() {
  return null
}
