"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
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
import axiosInstance from "@/lib/utils/axios";
import { Loading } from "@/app/components/loading";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hook/useToast";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "@/types/Order";
import type { Delivery } from "@/types/Delivery";
import type { Review, PageResponse } from "@/types/Review";
import { ApiResponse } from "@/types";

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

const paymentMethodLabel: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

const paymentStatusLabel: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
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

// Lấy thumbnail ảnh sản phẩm, tái sử dụng logic giống trang pets
const getItemImage = (petImage?: string | null) => {
  if (petImage) {
    if (petImage.startsWith("http://") || petImage.startsWith("https://")) {
      return petImage;
    }
    if (petImage.startsWith("/")) {
      return petImage;
    }
  }
  return "/assets/imgs/imgPet/cat-6593947_1280.jpg";
};

const fetchOrderDetail = async (orderId: string): Promise<Order> => {
  const response = await axiosInstance.get<ApiResponse<Order>>(
    `/orders/${orderId}`
  );
  const { status, message, data } = response.data;
  if (status !== 200 || !data) {
    throw new Error(message || "Không tìm thấy đơn hàng");
  }
  return data;
};

const fetchDelivery = async (orderId: string): Promise<Delivery | null> => {
  const response = await axiosInstance.get<Delivery | null>(
    `/pets/orders/${orderId}/delivery`
  );

  // BE trả 204 No Content khi chưa có delivery
  if (response.status === 204 || !response.data) {
    return null;
  }

  return response.data;
};

const DELIVERY_STEPS = [
  { key: "PREPARING", label: "Chuẩn bị", icon: ClipboardList },
  { key: "SHIPPED", label: "Đã đóng gói", icon: Package },
  { key: "IN_TRANSIT", label: "Đang giao", icon: Truck },
  { key: "DELIVERED", label: "Đã giao hàng", icon: CheckCircle2 },
] as const;

const getActiveStepIndex = (delivery: Delivery | null): number => {
  if (!delivery) return -1;

  // Ưu tiên dùng currentStatus, nếu rỗng thì fallback sang timeline[0].status
  let rawStatus = delivery.currentStatus || "";
  if (!rawStatus && delivery.timeline && delivery.timeline.length > 0) {
    rawStatus = delivery.timeline[0].status || "";
  }

  const status = rawStatus.toLowerCase();

  let index = -1;
  if (status.includes("chuẩn bị")) index = 0;
  else if (status.includes("đóng gói")) index = 1;
  else if (status.includes("đang giao")) index = 2;
  else if (status.includes("đã giao")) index = 3;

  if (index === -1) {
    // Nếu có delivery mà không map được thì mặc định sáng bước 1
    index = 0;
  }

  console.log("[DeliveryStatus] resolvedStatus:", rawStatus, "=> step:", index);
  return index;
};

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params?.orderId;
  const activeTab = searchParams.get("tab");
  
  // State cho form bình luận
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: order,
    error,
    isLoading,
    mutate,
  } = useSWR<Order>(
    orderId ? `/orders/${orderId}` : null,
    async () => {
      console.log("[OrderDetail] Bắt đầu gọi API", orderId);
      const result = await fetchOrderDetail(orderId as string);
      console.log("[OrderDetail] Nhận dữ liệu", result);
      return result;
    },
    {
      revalidateOnFocus: false,
      onError(err) {
        console.error("[OrderDetail] Lỗi khi load", orderId, err);
      },
    }
  );

  const { data: delivery } = useSWR<Delivery | null>(
    orderId ? `/pets/orders/${orderId}/delivery` : null,
    () => fetchDelivery(orderId as string),
    {
      revalidateOnFocus: false,
    }
  );

  const { user } = useAuthStore();
  const userId = user?.userId;
  const { success, error: showError, warning, ToastContainer } = useToast();

  const orderItems: OrderItem[] = useMemo(() => order?.orderItems ?? [], [order?.orderItems]);
  const petIds = useMemo(() => 
    orderItems.map(item => item.petId).filter(Boolean) as string[],
    [orderItems]
  );

  // Fetch reviews của user cho các sản phẩm trong đơn hàng
  // Chỉ lấy reviews được tạo SAU thời điểm đơn hàng được tạo
  const fetchReviewsForOrder = async (petIds: string[], orderCreatedAt: string): Promise<Review[]> => {
    if (!petIds.length || !userId || !orderCreatedAt) return [];
    
    try {
      const allReviews: Review[] = [];
      const orderTime = new Date(orderCreatedAt).getTime();
      
      // Gọi API cho từng petId để lấy reviews
      for (const petId of petIds) {
        try {
          const response = await axiosInstance.get<ApiResponse<PageResponse<Review>>>(
            `/reviews?petId=${petId}&size=100`
          );
          if (response.data.status === 200 && response.data.data?.content) {
            // Lọc chỉ lấy reviews của user này và được tạo SAU thời điểm đơn hàng
            const filteredReviews = response.data.data.content.filter(review => {
              if (review.userId !== userId || review.petId !== petId) return false;
              const reviewTime = new Date(review.createdAt).getTime();
              return reviewTime >= orderTime; // Review được tạo sau hoặc cùng lúc với đơn hàng
            });
            allReviews.push(...filteredReviews);
          }
        } catch (error) {
          console.error(`[Review] Lỗi khi fetch reviews cho petId ${petId}:`, error);
        }
      }
      return allReviews;
    } catch (error) {
      console.error("[Review] Lỗi khi fetch reviews:", error);
      return [];
    }
  };

  const { data: orderReviews, mutate: mutateReviews } = useSWR<Review[]>(
    order && petIds.length > 0 && userId && order.createdAt 
      ? ["reviews-for-order", petIds, userId, order.createdAt] 
      : null,
    () => fetchReviewsForOrder(petIds, order!.createdAt),
    {
      revalidateOnFocus: false,
    }
  );

  // Lọc ra các petId đã được user đánh giá trong đơn hàng này
  // (reviews được tạo sau thời điểm đơn hàng)
  const reviewedPetIds = useMemo(() => {
    if (!orderReviews || !userId || !order?.createdAt) return new Set<string>();
    const orderTime = new Date(order.createdAt).getTime();
    
    return new Set(
      orderReviews
        .filter(review => {
          if (review.userId !== userId || !review.petId) return false;
          const reviewTime = new Date(review.createdAt).getTime();
          return reviewTime >= orderTime; // Đảm bảo review được tạo sau đơn hàng
        })
        .map(review => review.petId as string)
    );
  }, [orderReviews, userId, order?.createdAt]);

  // Lọc các sản phẩm chưa được đánh giá trong đơn hàng này
  const availableItems = useMemo(() => {
    return orderItems.filter(item => !reviewedPetIds.has(item.petId));
  }, [orderItems, reviewedPetIds]);

  const subtotal = useMemo(() => {
    if (!order?.orderItems) return 0;
    return order.orderItems.reduce(
      (sum, item) => sum + (item.totalPrice ?? item.price * item.quantity),
      0
    );
  }, [order?.orderItems]);

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
          Không thể tải chi tiết đơn hàng
        </p>
        <p className="mb-6 text-slate-600">{error.message}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push("/orders")} variant="outline">
            Về danh sách
          </Button>
          <Button onClick={() => mutate()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-600">
        Không tìm thấy đơn hàng #{orderId}
      </div>
    );
  }

  const shippingFee = order.shippingFee ?? 0;
  const voucherDiscount = order.voucherDiscountAmount ?? 0;
  const promotionDiscount = order.promotionDiscountAmount ?? 0;
  const discount = order.discountAmount ?? voucherDiscount + promotionDiscount;
  const paymentMethodText = order.paymentMethod
    ? paymentMethodLabel[order.paymentMethod]
    : "Chưa cập nhật";

  const activeStep = getActiveStepIndex(delivery || null);

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setReviewImage(null);
    setImagePreview(null);
  };

  // Submit review
  const handleSubmitReview = async () => {
    // Validation
    if (!selectedPetId) {
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
    if (rating < 1 || rating > 5) {
      warning("Đánh giá không hợp lệ", "Vui lòng chọn số sao đánh giá từ 1 đến 5");
      return;
    }

    // Validate ảnh nếu có
    if (reviewImage) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (reviewImage.size > maxSize) {
        warning("Kích thước ảnh quá lớn", "Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      // Chấp nhận mọi loại file ảnh (bất kỳ MIME type nào bắt đầu bằng "image/")
      if (!reviewImage.type || !reviewImage.type.startsWith("image/")) {
        warning("Định dạng không hợp lệ", "Vui lòng chọn file ảnh hợp lệ");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Chuẩn bị dữ liệu review
      const reviewData = {
        petId: selectedPetId,
        rating: rating,
        comment: comment.trim(),
      };

      // Tạo FormData để gửi kèm ảnh
      const formData = new FormData();
      formData.append("review", JSON.stringify(reviewData));
      
      if (reviewImage) {
        formData.append("image", reviewImage);
      }

      console.log("[Review] Đang gửi đánh giá:", {
        petId: selectedPetId,
        rating,
        hasImage: !!reviewImage,
      });

      // Gửi request đến backend
      // Xóa Content-Type để browser tự động set boundary cho FormData
      const response = await axiosInstance.post<ApiResponse<unknown>>(
        "/reviews",
        formData,
        {
          transformRequest: (data, headers) => {
            // Xóa Content-Type để browser tự động set với boundary
            delete headers["Content-Type"];
            return data;
          },
        }
      );

      console.log("[Review] Response:", response.data);

      // Kiểm tra kết quả
      if (response.data.status === 201) {
        // Thành công
        success("Đánh giá thành công!", "Cảm ơn bạn đã chia sẻ trải nghiệm.");
        
        // Reset form
        setSelectedPetId("");
        setRating(5);
        setComment("");
        setReviewImage(null);
        setImagePreview(null);
        
        // Reset file input
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        // Cập nhật lại danh sách reviews để ẩn sản phẩm đã đánh giá
        mutateReviews();

        // Scroll lên đầu form để user thấy form đã được reset
        const reviewSection = document.querySelector('[data-review-section]');
        if (reviewSection) {
          reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        throw new Error(response.data.message || "Không thể gửi đánh giá");
      }
    } catch (error: unknown) {
      console.error("[Review] Lỗi khi gửi đánh giá:", error);
      
      let errorMessage = "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.";
      
      if (error && typeof error === "object") {
        const err = error as {
          response?: {
            status?: number;
            data?: { message?: string; status?: number };
          };
          message?: string;
        };

        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;

          if (status === 400) {
            errorMessage = data?.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
          } else if (status === 401) {
            errorMessage = "Bạn cần đăng nhập để đánh giá sản phẩm.";
          } else if (status === 403) {
            errorMessage = "Bạn không có quyền thực hiện thao tác này.";
          } else if (status === 404) {
            errorMessage = "Không tìm thấy sản phẩm. Vui lòng thử lại.";
          } else if (status === 413) {
            errorMessage = "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.";
          } else if (status === 500) {
            errorMessage = "Lỗi server. Vui lòng thử lại sau.";
          } else {
            errorMessage = data?.message || `Lỗi ${status}. Vui lòng thử lại.`;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      showError("Gửi đánh giá thất bại", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Đơn hàng</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            #{order.orderId}
          </h1>
          <p className="text-sm text-slate-600">
            Tạo lúc {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge
          className={`${statusColor[order.status]} border-0 px-4 py-2 text-sm font-semibold`}
        >
          {statusLabel[order.status] || order.status}
        </Badge>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Đơn hàng đang ở trạng thái{" "}
        <span className="font-semibold text-slate-900">
          {statusLabel[order.status] || order.status}
        </span>
        .
      </p>

      <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Trạng thái giao hàng
        </h2>
        {delivery ? (
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {DELIVERY_STEPS.map((step, index) => {
              const isActive = activeStep === index;
              const isCompleted = activeStep > index;
              const Icon = step.icon;

              const colorConfig = [
                {
                  circle: "bg-blue-50 text-blue-600",
                  text: "text-blue-600",
                },
                {
                  circle: "bg-purple-50 text-purple-600",
                  text: "text-purple-600",
                },
                {
                  circle: "bg-orange-50 text-orange-600",
                  text: "text-orange-600",
                },
                {
                  circle: "bg-emerald-50 text-emerald-600",
                  text: "text-emerald-600",
                },
              ][index];

              const circleClass = isActive
                ? colorConfig.circle
                : "bg-slate-100 text-slate-400";

              const textClass = isActive
                ? colorConfig.text
                : "text-slate-400";

              return (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border ${circleClass} ${
                      isActive
                        ? "border-current shadow-sm"
                        : "border-slate-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-sm font-medium ${textClass}`}
                  >
                    {step.label}
                  </span>
                  {index < DELIVERY_STEPS.length - 1 && (
                    <span
                      className={`mx-1 ${
                        isCompleted ? "text-slate-400" : "text-slate-300"
                      }`}
                    >
                      {">"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Đơn hàng chưa có thông tin giao hàng.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 text-sm font-semibold uppercase text-slate-500">
            <span>Sản phẩm</span>
            <span>Tổng</span>
          </div>

          {orderItems.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              Đơn hàng chưa có sản phẩm.
            </p>
          ) : (
            orderItems.map((item) => {
              const imgSrc = getItemImage(item.petImage);
              return (
                <div
                  key={`${item.petId}-${item.petName}`}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 text-sm text-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={imgSrc}
                        alt={item.petName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-slate-900">
                      {item.petName}{" "}
                      <span className="text-slate-500">
                        × {item.quantity}
                      </span>
                    </span>
                  </div>
                  <span className="text-right font-semibold text-slate-900">
                    {formatCurrency(
                      item.totalPrice ?? item.price * item.quantity
                    )}
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
            {promotionDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-semibold">Giảm giá khuyến mãi:</span>
                <span className="text-right font-semibold text-emerald-600">
                  -{formatCurrency(promotionDiscount)}
                </span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-semibold">Giảm giá voucher:</span>
                <span className="text-right font-semibold text-emerald-600">
                  -{formatCurrency(voucherDiscount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
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
                {order.customerName}
                <br />
                {order.customerPhone}
                <br />
                {order.shippingAddress || "Chưa cập nhật địa chỉ"}
              </p>
              {order.note && (
                <p className="mt-3">
                  <span className="font-semibold text-slate-800">
                    Ghi chú:
                  </span>{" "}
                  <span>{order.note}</span>
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

      {/* Section Bình luận - Chỉ hiển thị khi có tab=review hoặc luôn hiển thị */}
      {(activeTab === "review" || !activeTab) && (
        <div
          data-review-section
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-rose-500" />
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
              {availableItems.length === 0 ? (
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Bạn đã đánh giá tất cả sản phẩm trong đơn hàng này.
                </div>
              ) : (
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {availableItems.map((item) => (
                    <option key={item.petId} value={item.petId}>
                      {item.petName} (×{item.quantity})
                    </option>
                  ))}
                </select>
              )}
              {reviewedPetIds.size > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Đã đánh giá {reviewedPetIds.size}/{orderItems.length} sản phẩm trong đơn hàng này
                </p>
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
                    className="focus:outline-none"
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
                className="min-h-[120px] resize-none border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {/* Upload ảnh */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ảnh đánh giá (tùy chọn)
              </label>
              {!imagePreview ? (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50">
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
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Nút submit */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPetId("");
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
                disabled={isSubmitting || !selectedPetId || !comment.trim()}
                className="rounded-full bg-rose-500 px-8 text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/orders")}
        >
          Quay lại đơn hàng
        </Button>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
