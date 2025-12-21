// Order entity types
import { User } from './user';
import { Product } from './product';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RENTED = 'rented',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  VNPAY = 'vnpay',
  MOMO = 'momo',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  deposit: number;
  rentalDays: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  orderItems?: OrderItem[];
  orderNumber?: string; // Mã đơn hàng
  totalPrice?: number; // Từ backend
  totalAmount?: number; // Alias cho totalPrice
  totalDeposit?: number; // Từ backend
  depositAmount?: number; // Alias cho totalDeposit
  shippingAddress?: string;
  rentalAddress?: string; // Địa chỉ giao hàng
  shippingFee?: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  notes?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  createdAt: string;
  updatedAt: string;
  // Payment fields (optional - deprecated, nên dùng payment entity riêng)
  paymentUrl?: string;
  transactionId?: string;
  bankName?: string;
  accountName?: string;
  accountNo?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

