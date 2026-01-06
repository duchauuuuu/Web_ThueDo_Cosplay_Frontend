"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loading } from "@/app/_components/loading";
import { useAuthStore } from "@/store/useAuthStore";
import { useSWRFetch } from "@/app/hooks/useSWRFetch";
import type { Order, OrderStatus } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
  returned: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  rented: "Đang thuê",
  returned: "Đã trả",
  cancelled: "Đã hủy",
};

const pageSize = 10;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  minimumFractionDigits: 0,
});

const formatCurrency = (value?: number | null | string) => {
  if (value === null || value === undefined) return "—";
  // Convert string to number if needed (backend may return decimal as string)
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "—";
  return currencyFormatter.format(numValue);
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const buildSummary = (order: Order) => {
  const totalItems =
    order.orderItems?.reduce((sum, item) => sum + (item?.quantity ?? 0), 0) ??
    0;

  if (totalItems === 0) return "không có sản phẩm";
  if (totalItems === 1) return "cho 1 sản phẩm";
  return `cho ${totalItems} sản phẩm`;
};

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'commented' | 'not-commented'>('all');

  const { isAuthenticated } = useAuthStore();

  // Backend trả về Order[] trực tiếp, không phải paginated response
  const ordersEndpoint = isAuthenticated ? `${API_URL}/orders` : null;
  const { data: ordersData, error, isLoading, mutate } = useSWRFetch<Order[]>(
    ordersEndpoint
  );

  // Fetch comments của user để check trạng thái comment
  const commentsEndpoint = isAuthenticated ? `${API_URL}/comments/user/me` : null;
  const { data: commentsData } = useSWRFetch<any[]>(commentsEndpoint);

  // Debug: Log response để kiểm tra
  useMemo(() => {
    if (ordersData) {
      console.log('📦 Orders Endpoint:', ordersEndpoint);
      console.log('📦 Orders Data:', ordersData);
      console.log('📦 Is Array?', Array.isArray(ordersData));
      console.log('📦 Orders Count:', Array.isArray(ordersData) ? ordersData.length : 0);
      
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log('📦 First Order:', ordersData[0]);
        console.log('📦 First Order totalPrice:', ordersData[0]?.totalPrice);
        console.log('📦 First Order totalAmount:', ordersData[0]?.totalAmount);
        console.log('📦 First Order orderItems:', ordersData[0]?.orderItems);
      } else if (Array.isArray(ordersData) && ordersData.length === 0) {
        console.log('ℹ️ Orders array is empty - no orders found');
      }
    }
  }, [ordersData, ordersEndpoint]);

  // Log error if any
  useMemo(() => {
    if (error) {
      console.error('❌ Orders Fetch Error:', error);
      console.error('❌ Error Message:', error.message);
    }
  }, [error]);

  // Xử lý pagination ở frontend
  const allOrders = useMemo(() => {
    if (!ordersData) return [];
    
    // Nếu là array, trả về trực tiếp
    if (Array.isArray(ordersData)) {
      return ordersData;
    }
    
    // Nếu có field content (có thể backend đôi khi wrap trong object)
    if (ordersData && typeof ordersData === 'object' && 'content' in ordersData) {
      return Array.isArray((ordersData as any).content) ? (ordersData as any).content : [];
    }
    
    console.warn('⚠️ Unexpected orders data format:', ordersData);
    return [];
  }, [ordersData]);

  // Tạo map comments theo orderId và productId
  const commentsByOrder = useMemo(() => {
    if (!commentsData || !Array.isArray(commentsData)) return new Map<string, Set<string>>();
    
    const map = new Map<string, Set<string>>();
    commentsData.forEach((comment: any) => {
      if (comment.orderId && comment.productId) {
        if (!map.has(comment.orderId)) {
          map.set(comment.orderId, new Set());
        }
        map.get(comment.orderId)!.add(comment.productId);
      }
    });
    return map;
  }, [commentsData]);

  // Check xem order đã comment hết chưa (tất cả sản phẩm đều có comment)
  const isOrderFullyCommented = useMemo(() => {
    return (order: Order): boolean => {
      if (!order.orderItems || order.orderItems.length === 0) return false;
      const commentedProducts = commentsByOrder.get(order.id) || new Set();
      const allProductIds = new Set(order.orderItems.map(item => item.productId));
      return allProductIds.size > 0 && Array.from(allProductIds).every(id => commentedProducts.has(id));
    };
  }, [commentsByOrder]);

  // Filter orders theo filterType
  const orders = useMemo(() => {
    if (filterType === 'all') return allOrders;
    
    return allOrders.filter((order: Order) => {
      const fullyCommented = isOrderFullyCommented(order);
      if (filterType === 'commented') {
        return fullyCommented;
      } else if (filterType === 'not-commented') {
        return !fullyCommented;
      }
      return true;
    });
  }, [allOrders, filterType, isOrderFullyCommented]);

  // Tính toán pagination dựa trên filtered orders
  const totalElements = orders.length;
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  
  // Reset page về 0 khi filter thay đổi hoặc khi page vượt quá totalPages
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(0);
    }
  }, [filterType, totalPages, page]);
  
  // Lấy orders cho trang hiện tại
  const paginatedOrders = useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  }, [orders, page]);

  const handleRetry = () => mutate();


  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        Bạn cần đăng nhập để xem lịch sử đơn hàng.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <Loading />
      </div>
    );
  }

  if (error) {
    console.error('❌ Orders Error:', error);
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-4 text-lg font-semibold text-red-500">
          Không thể tải danh sách đơn hàng
        </p>
        <p className="mb-6 text-gray-600">{error.message || 'Có lỗi xảy ra khi tải dữ liệu'}</p>
        <Button onClick={handleRetry} className="rounded-full px-6 bg-green-600 hover:bg-green-700">
          Thử lại
        </Button>
      </div>
    );
  }

  // Debug: Log khi không có đơn hàng
  if (!isLoading && !error && orders.length === 0) {
    console.log('ℹ️ No orders found after processing. ordersData:', ordersData);
    console.log('ℹ️ isAuthenticated:', isAuthenticated);
    console.log('ℹ️ ordersEndpoint:', ordersEndpoint);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative py-16 sm:py-20 md:py-24">
        <div className="absolute inset-0">
          <img 
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="Orders Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-center font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg">
            Đơn hàng của tôi
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 md:py-10">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Tổng cộng {totalElements} đơn đã đặt
          </p>
          
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => {
                setFilterType('all');
                setPage(0);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                filterType === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({allOrders.length})
            </button>
            <button
              onClick={() => {
                setFilterType('commented');
                setPage(0);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                filterType === 'commented'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã bình luận ({allOrders.filter((o: Order) => isOrderFullyCommented(o)).length})
            </button>
            <button
              onClick={() => {
                setFilterType('not-commented');
                setPage(0);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                filterType === 'not-commented'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa bình luận ({allOrders.filter((o: Order) => !isOrderFullyCommented(o)).length})
            </button>
          </div>
        </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="px-6 py-4 text-sm font-semibold text-slate-800">
                Đơn hàng
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-slate-800">
                Ngày tạo
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-slate-800">
                Trạng thái
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-slate-800">
                Tổng tiền
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  {orders.length === 0 
                    ? "Bạn chưa có đơn hàng nào."
                    : "Không có đơn hàng nào ở trang này."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order: Order) => {
                // Tính tổng tiền từ orderItems nếu totalPrice không có
                let total: number | string | null | undefined = order.totalPrice || order.totalAmount;
                if (!total && order.orderItems && order.orderItems.length > 0) {
                  total = order.orderItems.reduce((sum: number, item) => {
                    const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
                    const itemQty = item.quantity || 1;
                    return sum + (itemPrice * itemQty);
                  }, 0);
                }

                return (
                  <TableRow key={order.id}>
                    <TableCell className="px-6 py-6 text-sm font-semibold text-gray-900">
                      #{order.orderNumber || order.id}
                    </TableCell>
                    <TableCell className="px-6 py-6 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <Badge
                        className={`${statusColor[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'} border-0 px-3 py-1 text-xs font-medium rounded-full ${order.status?.toLowerCase() === 'confirmed' ? 'hover:bg-green-100' : ''} cursor-default`}
                      >
                        {statusLabel[order.status?.toLowerCase()] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-sm text-gray-700">
                      {formatCurrency(total)}{" "}
                      <span className="text-gray-500">
                        {buildSummary(order)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                      <Button
                        asChild
                        className="rounded-full bg-green-600 px-8 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <Link href={`/orders/${order.id}`}>Xem</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-gray-500">
            {orders.length === 0 
              ? "Bạn chưa có đơn hàng nào."
              : "Không có đơn hàng nào ở trang này."}
          </div>
        ) : (
          paginatedOrders.map((order: Order) => {
            let total: number | string | null | undefined = order.totalPrice || order.totalAmount;
            if (!total && order.orderItems && order.orderItems.length > 0) {
              total = order.orderItems.reduce((sum: number, item) => {
                const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
                const itemQty = item.quantity || 1;
                return sum + (itemPrice * itemQty);
              }, 0);
            }

            return (
              <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      #{order.orderNumber || order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge
                    className={`${statusColor[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'} border-0 px-2.5 py-0.5 text-xs font-medium rounded-full cursor-default`}
                  >
                    {statusLabel[order.status?.toLowerCase()] || order.status}
                  </Badge>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <p className="text-base font-semibold text-gray-900 mb-1">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {buildSummary(order)}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full rounded-full bg-green-600 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Link href={`/orders/${order.id}`}>Xem chi tiết</Link>
                </Button>
              </div>
            );
          })
        )}
      </div>

      {orders.length > 0 && totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
          <span className="order-2 sm:order-1">
            Trang {page + 1}/{totalPages}
          </span>
          <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="rounded-full border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-4 sm:px-6"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              disabled={page + 1 >= totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              className="rounded-full border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-4 sm:px-6"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

