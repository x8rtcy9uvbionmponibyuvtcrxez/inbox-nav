"use client";

import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ShoppingCartIcon 
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  order?: {
    id: string;
    productType: string;
    businessName?: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {

  const getIcon = () => {
    switch (notification.type) {
      case 'ORDER_RECEIVED':
        return <ShoppingCartIcon className="h-5 w-5 text-blue-400" />;
      case 'ORDER_FULFILLED':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'SUBSCRIPTION_CANCELLED':
      case 'PARTIAL_CANCELLATION':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={`px-4 py-3 border-b border-gray-700 cursor-pointer transition-colors ${
        notification.isRead 
          ? 'bg-transparent hover:bg-gray-800/50' 
          : 'bg-blue-500/10 hover:bg-blue-500/20'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              notification.isRead ? 'text-gray-300' : 'text-white'
            }`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className={`text-sm mt-1 ${
            notification.isRead ? 'text-gray-400' : 'text-gray-300'
          }`}>
            {notification.message}
          </p>

          {/* Order info if available */}
          {notification.order && (
            <div className="mt-1 text-xs text-gray-500">
              Order {notification.order.id.slice(0, 8)}... • {notification.order.productType}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500">
            {formatTimeAgo(notification.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
