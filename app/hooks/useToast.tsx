'use client';

import { useState, useRef, useCallback } from 'react';
import { ToastItem as ToastItemType, NotificationType } from '@/types';
import Notification from '@/components/ui/toast';

interface ToastItem extends ToastItemType {
  showIcon: boolean;
  duration?: number;
}

export function useToast() {
  const [notifications, setNotifications] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);
  const lastToastRef = useRef<{ type: NotificationType; title: string; message?: string } | null>(null);
  const isShowingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((type: NotificationType, title: string, message?: string, duration?: number) => {
    // Clear debounce timer nếu có
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Kiểm tra xem toast mới có giống với toast cuối cùng không
    const lastToast = lastToastRef.current;
    
    if (lastToast && 
        lastToast.type === type && 
        lastToast.title === title && 
        lastToast.message === message &&
        isShowingRef.current) {
      // Toast giống nhau và đang hiển thị, không tạo toast mới
      return;
    }

    const id = nextIdRef.current++;
    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      showIcon: true,
      duration,
    };

    // Lưu thông tin toast mới
    lastToastRef.current = { type, title, message };
    isShowingRef.current = true;

    // Chỉ hiển thị 1 toast - thay thế toast cũ bằng toast mới
    setNotifications([newToast]);

    // Reset flag sau khi toast tự đóng (nếu có duration)
    if (duration) {
      debounceTimerRef.current = setTimeout(() => {
        isShowingRef.current = false;
        debounceTimerRef.current = null;
      }, duration + 100); // Thêm 100ms buffer
    }
  }, []);

  const removeToast = useCallback((id: number) => {
    setNotifications(prev => {
      const filtered = prev.filter(toast => toast.id !== id);
      // Nếu không còn toast nào, reset refs
      if (filtered.length === 0) {
        lastToastRef.current = null;
        isShowingRef.current = false;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      }
      return filtered;
    });
  }, []);

  const success = useCallback((title: string, message?: string, duration = 3000) =>
    addToast('success', title, message, duration), [addToast]);

  const error = useCallback((title: string, message?: string, duration = 5000) =>
    addToast('error', title, message, duration), [addToast]);

  const warning = useCallback((title: string, message?: string, duration = 4000) =>
    addToast('warning', title, message, duration), [addToast]);

  const info = useCallback((title: string, message?: string, duration = 4000) =>
    addToast('info', title, message, duration), [addToast]);

  const loading = useCallback((title: string, message?: string) =>
    addToast('loading', title, message), [addToast]);

  const ToastContainer = useCallback(() => {
    return (
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(toast => (
          <Notification
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            showIcon={toast.showIcon}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    );
  }, [notifications, removeToast]);

  return {
    notifications,
    success,
    error,
    warning,
    info,
    loading,
    removeToast,
    ToastContainer,
  };
}











