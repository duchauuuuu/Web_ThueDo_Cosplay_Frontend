"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ClipboardList,
  Package,
  Truck,
  CheckCircle2,
  Star,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/app/_components/loading";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/app/hooks/useToast";
import { useSWRFetch } from "@/app/hooks/useSWRFetch";
import type { Order, OrderItem } from "@/types/order";

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

const paymentMethodLabel: Record<string, string> = {
  cash: "Thanh toán khi nhận hàng",
  sepay: "Chuyển khoản ngân hàng",
  cod: "Thanh toán khi nhận hàng",
  bank_transfer: "Chuyển khoản ngân hàng",
};

const paymentStatusLabel: Record<string, string> = {
  pending: "Chờ thanh toán",
  completed: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

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

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

// Lấy thumbnail ảnh sản phẩm
const getItemImage = (productImage?: string | null, product?: any) => {
  if (productImage) {
    if (productImage.startsWith("http://") || productImage.startsWith("https://")) {
      return productImage;
    }
    if (productImage.startsWith("/")) {
      return productImage;
    }
  }
  // Try to get from product.images or product.productImages
  if (product?.images?.[0]) return product.images[0];
  if (product?.productImages?.[0]?.url) return product.productImages[0].url;
  return "/assets/imgs/imgPet/cat-6593947_1280.jpg";
};

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params?.orderId;

  const orderEndpoint = orderId ? `${API_URL}/orders/${orderId}` : null;
  const {
    data: order,
    error,
    isLoading,
    mutate,
  } = useSWRFetch<Order>(orderEndpoint);

  // Debug: Log order data
  useMemo(() => {
    if (order) {
      console.log('📦 Order Detail Data:', order);
      console.log('📦 Order totalPrice:', order.totalPrice);
      console.log('📦 Order user:', order.user);
      console.log('📦 Order orderItems:', order.orderItems);
      console.log('📦 Order rentalAddress:', order.rentalAddress);
    }
  }, [order]);

  const { ToastContainer, warning } = useToast();

  // Review states
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const orderItems: OrderItem[] = useMemo(() => order?.orderItems ?? [], [order?.orderItems]);

  // Available products for review (show when payment is completed or order is confirmed/returned)
  const canReview = useMemo(() => {
    if (!order) return false;
    // Kiểm tra payment status (backend có thể trả về "completed" hoặc "paid")
    const paymentStatus = order.paymentStatus?.toLowerCase();
    const paymentCompleted = paymentStatus === "completed" || paymentStatus === "paid";
    // Kiểm tra order status - cho phép review khi đơn hàng đã được xác nhận trở lên
    const orderConfirmed = ["confirmed", "rented", "returned"].includes(order.status?.toLowerCase() || "");
    // Cho phép review nếu thanh toán thành công HOẶC đơn hàng đã được xác nhận
    return paymentCompleted || orderConfirmed;
  }, [order]);

  const availableProductsForReview = useMemo(() => {
    if (!canReview) return [];
    return orderItems.map((item) => ({
      id: item.productId,
      name: item.product?.name || `Sản phẩm ${item.productId}`,
    }));
  }, [canReview, orderItems]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        warning("Kích thước ảnh quá lớn", "Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        warning("Định dạng không hợp lệ", "Vui lòng chọn file ảnh hợp lệ");
        return;
      }
      setReviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setReviewImage(null);
    setImagePreview(null);
  };

  // Handle submit review (placeholder - chưa có backend)
  const handleSubmitReview = () => {
    if (!selectedProductId) {
      warning("Thiếu thông tin", "Vui lòng chọn sản phẩm để đánh giá");
      return;
    }
    if (!comment.trim()) {
      warning("Thiếu thông tin", "Vui lòng nhập nội dung đánh giá");
      return;
    }
    if (comment.trim().length < 10) {
      warning("Nội dung không hợp lệ", "Nội dung đánh giá phải có ít nhất 10 ký tự");
      return;
    }
    warning("Chức năng đang phát triển", "Tính năng đánh giá đang được phát triển, vui lòng thử lại sau!");
  };

  const subtotal = useMemo(() => {
    if (!order?.orderItems) return 0;
    return order.orderItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
      const itemQty = item.quantity || 1;
      return sum + (itemPrice * itemQty);
    }, 0);
  }, [order?.orderItems]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <Loading />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-4 text-lg font-semibold text-red-500">
          Không thể tải chi tiết đơn hàng
        </p>
        {error && <p className="mb-6 text-gray-600">{error.message || 'Lỗi không xác định'}</p>}
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push("/orders")} variant="outline" className="rounded-full">
            Về danh sách
          </Button>
          <Button onClick={() => mutate()} className="rounded-full bg-green-600 hover:bg-green-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const shippingFee = order.shippingFee ?? 0;
  const paymentMethodText = order.paymentMethod
    ? paymentMethodLabel[order.paymentMethod] || "Chưa cập nhật"
    : "Chưa cập nhật";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative py-24">
        <div className="absolute inset-0">
          <img 
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="Order Detail Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-center font-bold text-6xl text-white drop-shadow-lg">
            Chi tiết đơn hàng
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 text-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Đơn hàng</p>
            <h2 className="text-2xl font-semibold text-gray-900">
              #{order.orderNumber || order.id}
            </h2>
            <p className="text-sm text-gray-600">
              Tạo lúc {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge
            className={`${statusColor[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'} border-0 px-4 py-2 text-sm font-semibold rounded-full`}
          >
            {statusLabel[order.status?.toLowerCase()] || order.status}
          </Badge>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          Đơn hàng đang ở trạng thái{" "}
          <span className="font-semibold text-gray-900">
            {statusLabel[order.status?.toLowerCase()] || order.status}
          </span>
          .
        </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 text-sm font-semibold uppercase text-slate-500">
            <span>Sản phẩm</span>
            <span>Tổng</span>
          </div>

          {orderItems.length === 0 ? (
            <p className="py-6 text-sm text-gray-500">
              Đơn hàng chưa có sản phẩm.
            </p>
          ) : (
            orderItems.map((item) => {
              const product = item.product;
              const imgSrc = getItemImage(
                product?.images?.[0] || product?.productImages?.[0]?.url,
                product
              );
              const productName = product?.name || `Sản phẩm ${item.productId}`;
              return (
                <div
                  key={`${item.productId}-${item.id}`}
                  className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 text-sm text-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={imgSrc}
                        alt={productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-gray-900">
                      {productName}{" "}
                      <span className="text-gray-500">
                        × {item.quantity}
                      </span>
                    </span>
                  </div>
                  <span className="text-right font-semibold text-gray-900">
                    {(() => {
                      const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
                      return formatCurrency(itemPrice * (item.quantity || 1));
                    })()}
                  </span>
                </div>
              );
            })
          )}

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tạm tính:</span>
              <span className="text-right font-semibold text-slate-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Phí vận chuyển:</span>
              <span className="text-right font-semibold text-slate-900">
                {formatCurrency(shippingFee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.totalPrice || order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Thông tin giao hàng
            </h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                {order.user?.fullName || "Chưa cập nhật"}
                <br />
                {order.user?.phone || "Chưa cập nhật"}
                <br />
                {order.rentalAddress || order.user?.address || "Chưa cập nhật địa chỉ"}
              </p>
              {(order.rentalStartDate || order.rentalEndDate) && (
                <div className="mt-3 space-y-1">
                  {order.rentalStartDate && (
                    <p>
                      <span className="font-semibold text-slate-800">Ngày bắt đầu:</span>{" "}
                      {formatDateTime(order.rentalStartDate)}
                    </p>
                  )}
                  {order.rentalEndDate && (
                    <p>
                      <span className="font-semibold text-slate-800">Ngày kết thúc:</span>{" "}
                      {formatDateTime(order.rentalEndDate)}
                    </p>
                  )}
                </div>
              )}
              {order.notes && (
                <p className="mt-3">
                  <span className="font-semibold text-slate-800">
                    Ghi chú:
                  </span>{" "}
                  <span>{order.notes}</span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Thanh toán
            </h2>
            <p className="text-sm text-slate-600">
              Phương thức:{" "}
              <span className="font-semibold text-slate-900">
                {paymentMethodText}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              Trạng thái:{" "}
              <span className="font-semibold text-slate-900">
                {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
              </span>
            </p>
            {order.transactionId && (
              <p className="text-sm text-slate-600">
                Mã giao dịch:{" "}
                <span className="font-semibold text-slate-900">
                  {order.transactionId}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          className="rounded-full border-green-600 text-green-600 hover:bg-green-50"
          onClick={() => router.push("/orders")}
        >
          Quay lại đơn hàng
        </Button>
      </div>
      </div>

      {/* Review Section - Hiển thị khi thanh toán thành công hoặc đơn hàng đã được xác nhận */}
      {canReview && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Đánh giá sản phẩm
            </h2>
          </div>

          <div className="space-y-6">
            {/* Chọn sản phẩm */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Chọn sản phẩm để đánh giá <span className="text-red-500">*</span>
              </label>
              {availableProductsForReview.length === 0 ? (
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Không có sản phẩm để đánh giá.
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {availableProductsForReview.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Đánh giá sao */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Đánh giá <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {rating === 5 && "Tuyệt vời"}
                {rating === 4 && "Rất tốt"}
                {rating === 3 && "Tốt"}
                {rating === 2 && "Tạm được"}
                {rating === 1 && "Không hài lòng"}
              </p>
            </div>

            {/* Nội dung đánh giá */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nội dung đánh giá <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                className="min-h-[120px] resize-none border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                Tối thiểu 10 ký tự
              </p>
            </div>

            {/* Upload ảnh */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ảnh đánh giá (tùy chọn)
              </label>
              {!imagePreview ? (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 transition-colors hover:border-green-300 hover:bg-green-50">
                  <Upload className="h-5 w-5" />
                  <span>Chọn ảnh để đính kèm</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative inline-block">
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-slate-300">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Kích thước tối đa 5MB
              </p>
            </div>

            {/* Nút submit */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProductId("");
                  setRating(5);
                  setComment("");
                  setReviewImage(null);
                  setImagePreview(null);
                }}
                disabled={isSubmitting}
                className="rounded-full"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || !selectedProductId || !comment.trim()}
                className="rounded-full bg-green-600 px-8 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
