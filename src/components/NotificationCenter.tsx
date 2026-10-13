import { useNotifications } from '@/context/NotificationContext';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'error':
        return <FiAlertCircle className="text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" />;
      case 'info':
        return <FiInfo className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`flex items-center gap-3 p-4 rounded-lg border ${getBgColor(notification.type)} shadow-lg`}
          >
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <FiX size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
