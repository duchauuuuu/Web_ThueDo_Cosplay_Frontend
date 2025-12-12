// Toast notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastItem {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
}

