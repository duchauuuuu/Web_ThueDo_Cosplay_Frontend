"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";

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
import axiosInstance from "@/lib/utils/axios";
import { Loading } from "@/app/components/loading";
import { useAuthStore } from "@/store/useAuthStore";
import type { Order, OrderStatus } from "@/types/Order";
import type {
  Review,
  PageResponse as ReviewPageResponse,
} from "@/types/Review";
import { ApiResponse, PageResponse } from "@/types";

const statusColor: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusLabel: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPED: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const pageSize = 10;

const fetchOrders = async (page: number): Promise<PageResponse<Order>> => {
  const response = await axiosInstance.get<ApiResponse<PageResponse<Order>>>(
    `/orders/me?page=${page}&size=${pageSize}`
  );

  const { status, message, data } = response.data;
  if (status !== 200 || !data) {
    throw new Error(message || "Không thể tải danh sách đơn hàng");
  }

  return data;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  minimumFractionDigits: 0,
});

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number") return "—";
  return currencyFormatter.format(value);
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
  const [filter, setFilter] = useState<"all" | "reviewed" | "not_reviewed">(
    "all"
  );
  const [reviewStatusByOrder, setReviewStatusByOrder] = useState<
    Record<string, "reviewed" | "not_reviewed">
  >({});

  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.userId;

  const swrKey = isAuthenticated ? ["/orders/me", page] : null;
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<PageResponse<Order>>(
    swrKey,
    async ([, currentPage]) => fetchOrders(Number(currentPage)),
    { revalidateOnFocus: false }
  );

  const orders = useMemo(() => data?.content ?? [], [data?.content]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  const handleRetry = () => mutate();

  // Helper: kiểm tra 1 đơn hàng đã có review cho TẤT CẢ các pet trong đơn hay chưa
  const hasReviewForOrder = async (
    order: Order,
    userId: string
  ): Promise<boolean> => {
    const items = order.orderItems ?? [];
    const petIds = items
      .map((item) => item.petId)
      .filter((id): id is string => !!id);

    if (!petIds.length || !order.createdAt) return false;

    const orderTime = new Date(order.createdAt).getTime();

    // Kiểm tra TẤT CẢ các pet phải có review
    for (const petId of petIds) {
      try {
        const resp = await axiosInstance.get<
          ApiResponse<ReviewPageResponse<Review>>
        >(`/reviews?petId=${petId}&size=100`);

        if (resp.data.status === 200 && resp.data.data?.content) {
          const found = resp.data.data.content.some((review) => {
            if (review.userId !== userId || review.petId !== petId) return false;
            const reviewTime = new Date(review.createdAt).getTime();
            return reviewTime >= orderTime;
          });

          // Nếu một pet không có review thì return false ngay
          if (!found) return false;
        } else {
          // Không có dữ liệu review cho pet này -> chưa bình luận
          return false;
        }
      } catch (err) {
        console.error(
          `[Orders] Lỗi khi kiểm tra review cho petId ${petId} trong order ${order.orderId}:`,
          err
        );
        // Nếu có lỗi khi kiểm tra, coi như chưa bình luận
        return false;
      }
    }

    // Tất cả các pet đều có review -> đã bình luận
    return true;
  };

  // Load trạng thái review cho từng đơn trên trang hiện tại
  useEffect(() => {
    if (!userId || !orders.length) return;

    let cancelled = false;

    const loadReviewStatus = async () => {
      const statusMap: Record<string, "reviewed" | "not_reviewed"> = {};

      for (const order of orders) {
        try {
          const hasReview = await hasReviewForOrder(order, userId);
          statusMap[order.orderId] = hasReview ? "reviewed" : "not_reviewed";
        } catch (err) {
          console.error(
            `[Orders] Lỗi khi xác định trạng thái review cho order ${order.orderId}:`,
            err
          );
          statusMap[order.orderId] = "not_reviewed";
        }

        if (cancelled) return;
      }

      if (!cancelled) {
        setReviewStatusByOrder(statusMap);
      }
    };

    loadReviewStatus();

    return () => {
      cancelled = true;
    };
  }, [orders, userId]);

  // Áp dụng bộ lọc theo trạng thái bình luận
  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter(
      (order) => reviewStatusByOrder[order.orderId] === filter
    );
  }, [orders, filter, reviewStatusByOrder]);

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
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-4 text-lg font-semibold text-red-500">
          Không thể tải danh sách đơn hàng
        </p>
        <p className="mb-6 text-slate-600">{error.message}</p>
        <Button onClick={handleRetry} className="rounded-full px-6">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-slate-500">
            Tổng cộng {totalElements} đơn đã đặt
          </p>
        </div>

        {/* Bộ lọc theo trạng thái bình luận */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={filter === "all" ? "default" : "outline"}
            className="rounded-full px-4 py-1 text-sm"
            onClick={() => setFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            type="button"
            variant={filter === "reviewed" ? "default" : "outline"}
            className="rounded-full px-4 py-1 text-sm"
            onClick={() => setFilter("reviewed")}
          >
            Đã bình luận
          </Button>
          <Button
            type="button"
            variant={filter === "not_reviewed" ? "default" : "outline"}
            className="rounded-full px-4 py-1 text-sm"
            onClick={() => setFilter("not_reviewed")}
          >
            Chưa bình luận
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-slate-500"
                >
                  {orders.length === 0
                    ? "Bạn chưa có đơn hàng nào."
                    : "Không có đơn hàng phù hợp với bộ lọc hiện tại."}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="px-6 py-6 text-sm font-semibold text-slate-900">
                    #{order.orderId}
                  </TableCell>
                  <TableCell className="px-6 py-6 text-sm text-slate-600">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge
                      className={`${statusColor[order.status]} border-0 px-3 py-1 text-xs font-medium`}
                    >
                      {statusLabel[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-sm text-slate-700">
                    {formatCurrency(order.totalAmount)}{" "}
                    <span className="text-slate-500">
                      {buildSummary(order)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-right">
                    <Button
                      asChild
                      className="rounded-full bg-rose-500 px-8 text-sm font-semibold text-white hover:bg-rose-600"
                    >
                      <Link href={`/orders/${order.orderId}`}>Xem</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {orders.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>
            Trang {page + 1}/{totalPages}
          </span>
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="rounded-full"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              disabled={page + 1 >= totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              className="rounded-full"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

