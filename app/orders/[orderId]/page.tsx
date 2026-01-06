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
import { uploadImage } from "@/lib/api/upload";
import { apiClient } from "@/lib/api/fetch-with-auth";

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

// Lấy thumbnail ảnh sản phẩm - giống logic trang cart
const getItemImage = (product?: any) => {
  // Ưu tiên lấy từ product.images (array string)
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  // Nếu không có, lấy từ product.productImages (relation với ProductImage entity)
  if (product?.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
    // Sắp xếp theo trường order (tăng dần) để lấy ảnh đầu tiên
    const sortedImages = [...product.productImages].sort((a, b) => (a.order || 0) - (b.order || 0));
    return sortedImages[0]?.url;
  }
  // Fallback image
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

  // Fetch payment cho order này
  const { data: paymentsData } = useSWRFetch<any[]>(
    orderId ? `${API_URL}/payments/order/${orderId}` : null
  );

  // Fetch comments cho order này
  const { data: commentsData, mutate: mutateComments } = useSWRFetch<any[]>(
    orderId ? `${API_URL}/comments/order/${orderId}` : null
  );

  // Lấy payment đầu tiên (thường chỉ có 1 payment cho 1 order)
  const payment = paymentsData && paymentsData.length > 0 ? paymentsData[0] : null;
  
  // Lấy danh sách comments
  const comments = commentsData || [];

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

  // Debug: Log payment data
  useMemo(() => {
    if (payment) {
      console.log('💳 Payment Data:', payment);
      console.log('💳 Payment Method:', payment.method);
      console.log('💳 Payment Status:', payment.status);
    }
  }, [payment]);

  const { ToastContainer, warning, success } = useToast();

  // Review states
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const orderItems: OrderItem[] = useMemo(() => order?.orderItems ?? [], [order?.orderItems]);

  // Tạo map để check sản phẩm nào đã được comment
  const commentedProductIds = useMemo(() => {
    return new Set(comments.map((c: any) => c.productId));
  }, [comments]);

  // Check xem đơn hàng đã comment hết chưa (tất cả sản phẩm đều có comment)
  const isOrderFullyCommented = useMemo(() => {
    if (!orderItems || orderItems.length === 0) return false;
    const allProductIds = new Set(orderItems.map(item => item.productId));
    return allProductIds.size > 0 && Array.from(allProductIds).every(id => commentedProductIds.has(id));
  }, [orderItems, commentedProductIds]);

  // Available products for review (show when payment is completed or order is confirmed/returned)
  const canReview = useMemo(() => {
    if (!order) return false;
    
    // Kiểm tra payment status từ payment hoặc order (backend có thể trả về "completed" hoặc "paid")
    const currentPaymentStatus = (payment?.status || order.paymentStatus)?.toLowerCase();
    const paymentCompleted = currentPaymentStatus === "completed" || currentPaymentStatus === "paid";
    
    // Kiểm tra order status - cho phép review khi đơn hàng đã được xác nhận trở lên
    // Với COD, đơn hàng có thể không có payment record hoặc payment status, nhưng khi order đã được xác nhận thì vẫn cho phép review
    const orderConfirmed = ["confirmed", "rented", "returned"].includes(order.status?.toLowerCase() || "");
    
    // Cho phép review nếu:
    // 1. Thanh toán thành công (cho các phương thức online) HOẶC
    // 2. Đơn hàng đã được xác nhận (bao gồm cả COD - không cần payment status)
    return paymentCompleted || orderConfirmed;
  }, [order, payment]);

  const availableProductsForReview = useMemo(() => {
    if (!canReview) return [];
    return orderItems.map((item) => ({
      id: item.productId,
      name: item.product?.name || `Sản phẩm ${item.productId}`,
    }));
  }, [canReview, orderItems]);

  // Handle multiple image selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: Kích thước quá lớn (max 10MB)`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name}: Định dạng không hợp lệ`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      warning("Một số ảnh không hợp lệ", invalidFiles.join(", "));
    }

    if (validFiles.length === 0) return;

    // Limit to 5 images max
    const filesToAdd = validFiles.slice(0, 5 - reviewImages.length);
    if (validFiles.length > filesToAdd.length) {
      warning("Giới hạn số lượng", "Chỉ có thể upload tối đa 5 ảnh");
    }

    // Add to state
    const newFiles = [...reviewImages, ...filesToAdd];
    setReviewImages(newFiles);

    // Create previews
    const newPreviews: string[] = [];
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === filesToAdd.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Upload to Cloudinary automatically
    setIsUploading(true);
    try {
      const uploadPromises = filesToAdd.map((file) => uploadImage(file, 'reviews'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url);
      setUploadedImageUrls([...uploadedImageUrls, ...newUrls]);
    } catch (error: any) {
      warning("Lỗi upload ảnh", error.message || "Không thể upload ảnh lên Cloudinary");
      // Remove failed uploads from state
      setReviewImages(reviewImages);
      setImagePreviews(imagePreviews);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
  };

  // Handle submit review
  const handleSubmitReview = async () => {
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
    
    // Nếu có ảnh chưa upload, upload trước
    if (reviewImages.length > uploadedImageUrls.length) {
      setIsUploading(true);
      try {
        const remainingFiles = reviewImages.slice(uploadedImageUrls.length);
        const uploadPromises = remainingFiles.map((file) => uploadImage(file, 'reviews'));
        const results = await Promise.all(uploadPromises);
        const newUrls = results.map((r) => r.url);
        setUploadedImageUrls([...uploadedImageUrls, ...newUrls]);
      } catch (error: any) {
        warning("Lỗi upload ảnh", error.message || "Không thể upload ảnh lên Cloudinary");
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }
    
    setIsSubmitting(true);
    try {
      // Gọi API submit review với imageUrls
      await apiClient.post('/comments', {
        productId: selectedProductId,
        orderId: orderId,
        rating,
        content: comment.trim(),
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      });
      
      success("Đánh giá thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
      
      // Reset form after success
      setSelectedProductId("");
      setRating(5);
      setComment("");
      setReviewImages([]);
      setImagePreviews([]);
      setUploadedImageUrls([]);
      
      // Refresh order data và comments để hiển thị review mới
      mutate();
      mutateComments();
    } catch (error: any) {
      warning("Lỗi", error.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
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
  
  // Lấy paymentMethod từ payment nếu có, nếu không thì từ order
  const paymentMethod = payment?.method || order.paymentMethod;
  const paymentMethodText = paymentMethod
    ? paymentMethodLabel[paymentMethod] || "Chưa cập nhật"
    : "Chưa cập nhật";
  
  // Lấy paymentStatus từ payment nếu có, nếu không thì từ order
  const paymentStatus = payment?.status || order.paymentStatus;
  const paymentStatusText = paymentStatus
    ? paymentStatusLabel[paymentStatus] || paymentStatus
    : "Chưa cập nhật";
  
  // Lấy transactionId từ payment nếu có, nếu không thì từ order
  const transactionId = payment?.transactionId || order.transactionId;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative py-16 sm:py-20 md:py-24">
        <div className="absolute inset-0">
          <img
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="Order Detail Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-center font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg">
            Chi tiết đơn hàng
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-10 text-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Đơn hàng</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              #{order.orderNumber || order.id}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Tạo lúc {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge
            className={`${statusColor[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'} border-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full ${order.status?.toLowerCase() === 'confirmed' ? 'hover:bg-green-100' : ''} cursor-default`}
          >
            {statusLabel[order.status?.toLowerCase()] || order.status}
          </Badge>
        </div>

        <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
          Đơn hàng đang ở trạng thái{" "}
          <span className="font-semibold text-gray-900">
            {statusLabel[order.status?.toLowerCase()] || order.status}
          </span>
          .
        </p>

      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 sm:mb-6 flex items-center justify-between border-b border-slate-200 pb-3 sm:pb-4 text-xs sm:text-sm font-semibold uppercase text-slate-500">
            <span>Sản phẩm</span>
            <span>Tổng</span>
          </div>

          {orderItems.length === 0 ? (
            <p className="py-4 sm:py-6 text-xs sm:text-sm text-gray-500">
              Đơn hàng chưa có sản phẩm.
            </p>
          ) : (
            orderItems.map((item) => {
              const product = item.product;
              const imgSrc = getItemImage(product);
              const productName = product?.name || `Sản phẩm ${item.productId}`;
              return (
                <div
                  key={`${item.productId}-${item.id}`}
                  className="flex items-center justify-between gap-2 sm:gap-4 border-b border-gray-100 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-gray-100">
                      <Image
                        src={imgSrc}
                        alt={productName}
                        fill
                        sizes="(max-width: 640px) 48px, 56px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-gray-900 truncate">
                      {productName}{" "}
                      <span className="text-gray-500">
                        × {item.quantity}
                      </span>
                    </span>
                  </div>
                  <span className="text-right font-semibold text-gray-900 flex-shrink-0">
                    {(() => {
                      const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : (item.price || 0);
                      return formatCurrency(itemPrice * (item.quantity || 1));
                    })()}
                  </span>
                </div>
              );
            })
          )}

          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
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
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 sm:pt-4 text-sm sm:text-base font-semibold text-gray-900">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.totalPrice || order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-slate-900">
              Thông tin giao hàng
            </h2>
            <div className="space-y-1 text-xs sm:text-sm text-slate-600">
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

          <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-slate-900">
              Thanh toán
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Phương thức:{" "}
              <span className="font-semibold text-slate-900">
                {paymentMethodText}
              </span>
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              Trạng thái:{" "}
              <span className="font-semibold text-slate-900">
                {paymentStatusText}
              </span>
            </p>
            {transactionId && (
              <p className="text-xs sm:text-sm text-slate-600">
                Mã giao dịch:{" "}
                <span className="font-semibold text-slate-900">
                  {transactionId}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Review Section - Hiển thị khi thanh toán thành công hoặc đơn hàng đã được xác nhận */}
      {canReview && (
        <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Đánh giá sản phẩm
            </h2>
            {isOrderFullyCommented && (
              <Badge className="bg-green-100 text-green-800 border-0 px-3 py-1 text-xs font-medium rounded-full">
                Đã bình luận hết
              </Badge>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Chọn sản phẩm */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium text-slate-700">
                Chọn sản phẩm để đánh giá <span className="text-red-500">*</span>
              </label>
              {availableProductsForReview.length === 0 ? (
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-600">
                  Không có sản phẩm để đánh giá.
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200">
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
              <label className="mb-2 block text-xs sm:text-sm font-medium text-slate-700">
                Đánh giá <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400 w-7 h-7 sm:w-8 sm:h-8"
                          : "text-slate-300 w-7 h-7 sm:w-8 sm:h-8"
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
              <label className="mb-2 block text-xs sm:text-sm font-medium text-slate-700">
                Nội dung đánh giá <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm resize-none border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                Tối thiểu 10 ký tự
              </p>
            </div>

            {/* Upload ảnh */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium text-slate-700">
                Ảnh đánh giá (tùy chọn, tối đa 5 ảnh)
              </label>
              {reviewImages.length === 0 ? (
                <label className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3 sm:p-4 text-xs sm:text-sm text-slate-600 transition-colors hover:border-green-300 hover:bg-green-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{isUploading ? 'Đang upload...' : 'Chọn ảnh để đính kèm'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-lg border border-slate-300">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {index < uploadedImageUrls.length && (
                            <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs text-center py-1">
                              Đã upload
                            </div>
                          )}
                          {isUploading && index >= uploadedImageUrls.length && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {reviewImages.length < 5 && (
                    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 transition-colors hover:border-green-300 hover:bg-green-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="h-4 w-4" />
                      <span>Thêm ảnh ({reviewImages.length}/5)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Kích thước tối đa 10MB mỗi ảnh. Ảnh sẽ được upload tự động khi chọn.
              </p>
            </div>

            {/* Nút submit */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProductId("");
                  setRating(5);
                  setComment("");
                  setReviewImages([]);
                  setImagePreviews([]);
                  setUploadedImageUrls([]);
                }}
                disabled={isSubmitting}
                className="rounded-full w-full sm:w-auto text-xs sm:text-sm"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || isUploading || !selectedProductId || !comment.trim()}
                className="rounded-full bg-green-600 px-6 sm:px-8 text-white hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto text-xs sm:text-sm"
              >
                {isSubmitting ? "Đang gửi..." : isUploading ? "Đang upload ảnh..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <Button
          variant="outline"
          className="rounded-full border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm w-full sm:w-auto"
          onClick={() => router.push("/orders")}
        >
          Quay lại đơn hàng
        </Button>
      </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
