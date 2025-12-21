// Voucher entity types
export enum VoucherType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  expiryDate?: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VouchersResponse {
  data: Voucher[];
  total: number;
  page: number;
  limit: number;
}

