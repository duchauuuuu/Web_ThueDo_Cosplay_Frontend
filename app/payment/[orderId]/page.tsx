'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSWRFetch } from '@/app/hooks/useSWRFetch'
import type { Order } from '@/types/order'
import { PaymentMethod, PaymentStatus } from '@/types/order'
import { CheckCircle, Copy, ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/app/hooks/useToast'
import { Loading } from '@/app/_components/loading'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [copied, setCopied] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null) // Thời gian còn lại (giây)
  const [hasShownPaymentToast, setHasShownPaymentToast] = useState(false)
  const { success, error: showError, ToastContainer } = useToast()

  // Fetch order detail
  const { data: orderData, error, isLoading } = useSWRFetch<Order>(
    orderId ? `${API_URL}/orders/${orderId}` : null,
    undefined,
    {
      refreshInterval: 5000 // Auto refresh mỗi 5s để check payment status
    }
  )

  const order = orderData

  // Fetch payment cho order này
  const { data: paymentsData } = useSWRFetch<any[]>(
    orderId ? `${API_URL}/payments/order/${orderId}` : null,
    undefined,
    {
      refreshInterval: 5000
    }
  )

  // Lấy payment đầu tiên (thường chỉ có 1 payment cho 1 order)
  const payment = paymentsData && paymentsData.length > 0 ? paymentsData[0] : null

  // Tính toán và đếm ngược thời gian thanh toán (10 phút)
  // Luôn bắt đầu từ 10 phút khi vào trang, không phụ thuộc vào createdAt
  useEffect(() => {
    // Bắt đầu từ 10 phút (600 giây)
    setTimeLeft(10 * 60)

    let currentTime = 10 * 60 // Bắt đầu từ 10 phút

    // Cập nhật mỗi giây
    const interval = setInterval(() => {
      currentTime = Math.max(0, currentTime - 1)
      setTimeLeft(currentTime)

      // Nếu hết thời gian, hiển thị thông báo
      if (currentTime === 0) {
        showError('Hết thời gian thanh toán', 'Thời gian thanh toán đã hết. Vui lòng tạo đơn hàng mới.')
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [showError])

  // Thông báo & redirect khi thanh toán thành công hoặc thất bại (chỉ 1 lần)
  useEffect(() => {
    if (!payment || hasShownPaymentToast) return

    // Kiểm tra payment status thay vì order paymentStatus
    if (payment.status === 'completed') {
      success(
        'Thanh toán thành công',
        'Đơn hàng của bạn đã được thanh toán thành công. Cảm ơn bạn đã mua sắm tại Haucosplay!'
      )

      setHasShownPaymentToast(true)
      // Redirect ngay sau 2 giây thay vì 4 giây
      setTimeout(() => {
        router.push(`/orders`)
      }, 2000)
      return
    }

    if (payment.status === 'failed' || payment.status === 'refunded') {
      const isTimeout = timeLeft === 0

      showError(
        isTimeout ? 'Thanh toán quá hạn' : 'Thanh toán thất bại',
        isTimeout
          ? 'Giao dịch chuyển khoản đã quá thời gian cho phép (hơn 10 phút). Vui lòng tạo đơn mới và thanh toán lại.'
          : 'Số tiền bạn chuyển không đủ so với số tiền yêu cầu. Vui lòng kiểm tra lại số tiền và tạo đơn mới và thanh toán lại. Về việc hoàn tiền đã chuyển thiếu vui lòng liên hệ admin'
      )

      setHasShownPaymentToast(true)
      setTimeout(() => {
        router.push('/orders')
      }, 5000)
    }
  }, [payment, router, success, showError, timeLeft, hasShownPaymentToast])

  // Format thời gian còn lại (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyContent = () => {
    if (payment?.transactionId) {
      navigator.clipboard.writeText(payment.transactionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Lấy QR code từ payment (backend đã trả về qrCode hoặc qrCodeUrl)
  const getPaymentUrl = () => {
    // Ưu tiên dùng qrCode hoặc qrCodeUrl từ backend
    if (payment?.qrCode) return payment.qrCode
    if (payment?.qrCodeUrl) return payment.qrCodeUrl
    
    // Fallback: parse từ sepayResponse nếu backend chưa trả về
    if (!payment?.sepayResponse) return null
    try {
      const sepayData = typeof payment.sepayResponse === 'string' 
        ? JSON.parse(payment.sepayResponse) 
        : payment.sepayResponse
      return sepayData?.qrCode || sepayData?.paymentUrl || sepayData?.qrCodeUrl || null
    } catch {
      return null
    }
  }

  // Lấy nội dung chuyển khoản từ payment (orderInfo từ backend)
  const getPaymentContent = () => {
    // Ưu tiên dùng orderInfo từ backend response
    if (payment?.orderInfo) return payment.orderInfo
    
    // Fallback: parse từ sepayResponse
    if (!payment?.sepayResponse) return null
    try {
      const sepayData = typeof payment.sepayResponse === 'string' 
        ? JSON.parse(payment.sepayResponse) 
        : payment.sepayResponse
      return sepayData?.orderInfo || null
    } catch {
      return null
    }
  }

  const paymentUrl = getPaymentUrl()
  const paymentContent = getPaymentContent()

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    success('Đã sao chép!', `${label} đã được sao chép vào clipboard.`)
  }

  const handleCancel = () => {
    setShowCancelModal(true)
  }

  const handleConfirmCancel = () => {
    setShowCancelModal(false)
    success('Hủy thành công', 'Giao dịch đã được hủy.')
    setTimeout(() => {
      router.push('/orders')
    }, 1000)
  }

  const handleCloseModal = () => {
    setShowCancelModal(false)
  }

  if (isLoading) {
    return <Loading variant="fullpage" />
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 sm:mb-4">Lỗi tải thông tin đơn hàng</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error.message}</p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-green-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-full hover:bg-green-700 transition-colors"
          >
            Quay lại đơn hàng
          </button>
        </div>
      </div>
    )
  }

  if (!order) return null

  // Nếu payment đã completed, redirect ngay không hiển thị gì
  if (payment && payment.status === 'completed') {
    return <Loading variant="fullpage" />
  }

  // Kiểm tra payment - chỉ hiển thị trang thanh toán nếu có payment với method SEPAY và có QR code
  if (!payment || payment.method !== 'sepay' || !paymentUrl) {
    // Nếu chưa có payment, hiển thị loading
    if (!payment) {
      return <Loading variant="fullpage" />
    }
    
    // Nếu có payment nhưng không phải sepay hoặc không có QR code, redirect về orders
    if (payment && (payment.method !== 'sepay' || !paymentUrl)) {
      // Nếu payment đã failed hoặc refunded, chỉ redirect không hiển thị thông báo
      if (payment.status === 'failed' || payment.status === 'refunded') {
        return <Loading variant="fullpage" />
      }
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Đơn hàng không cần thanh toán online hoặc chưa có QR code
            </h2>
            {payment.method === 'cash' && (
              <button
                onClick={() => router.push('/orders')}
                className="bg-green-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-full hover:bg-green-700 transition-colors"
              >
                Xem đơn hàng
              </button>
            )}
          </div>
        </div>
      )
    }
    
    return <Loading variant="fullpage" />
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Countdown Timer */}
        {timeLeft !== null && (
          <div className={`mb-4 sm:mb-6 rounded-lg border-2 p-3 sm:p-4 ${
            timeLeft < 120 
              ? 'bg-red-50 border-red-300' 
              : timeLeft < 300 
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {timeLeft < 120 ? (
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-700">
                    {timeLeft === 0 ? 'Hết thời gian thanh toán' : 'Thời gian còn lại để thanh toán'}
                  </div>
                  {timeLeft > 0 && (
                    <div className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                      Vui lòng hoàn tất thanh toán trong thời gian này
                    </div>
                  )}
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold font-mono flex-shrink-0 ${
                timeLeft < 120 
                  ? 'text-red-600' 
                  : timeLeft < 300 
                    ? 'text-orange-600' 
                    : 'text-blue-600'
              }`}>
                {timeLeft > 0 ? formatTime(timeLeft) : '00:00'}
              </div>
            </div>
          </div>
        )}

        {/* Instruction */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3">
          <div className="text-xl sm:text-2xl flex-shrink-0">💡</div>
          <div className="text-xs sm:text-sm text-gray-700">
            Mở App Ngân hàng bất kỳ để <strong>quét mã VietQR</strong> hoặc{' '}
            <strong>chuyển khoản</strong> chính xác số tiền, nội dung bên dưới
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - QR Code */}
            <div className="flex flex-col items-center justify-center">
              {/* QR Code */}
              <div className="relative w-full max-w-xs sm:max-w-sm">
                {paymentUrl ? (
                  <Image
                    src={paymentUrl}
                    alt="QR Code"
                    width={320}
                    height={320}
                    className="rounded-lg w-full h-auto"
                    unoptimized
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Loading variant="inline" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div className="space-y-3 sm:space-y-4">
              {/* Bank Info Header */}
              <div className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">ICB</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Ngân hàng</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-800">{order.bankName || 'Ngân hàng TMCP Công Thương Việt Nam'}</div>
                </div>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Chủ tài khoản:</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-800">{order.accountName || 'NGUYEN DUC HAU'}</div>
                </div>
                <button
                  onClick={() => handleCopy(order.accountName || 'NGUYEN DUC HAU', 'Tên chủ tài khoản')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-green-200 flex-shrink-0"
                >
                  Sao chép
                </button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Số tài khoản:</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-800">{order.accountNo || '109876820087'}</div>
                </div>
                <button
                  onClick={() => handleCopy(order.accountNo || '109876820087', 'Số tài khoản')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-green-200 flex-shrink-0"
                >
                  Sao chép
                </button>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Số tiền:</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-800">{payment.amount?.toLocaleString('vi-VN') || (order.totalAmount || 0).toLocaleString('vi-VN')} vnd</div>
                </div>
                <button
                  onClick={() => handleCopy(payment.amount?.toString() || (order.totalAmount || 0).toString(), 'Số tiền')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-green-200 flex-shrink-0"
                >
                  Sao chép
                </button>
              </div>

              {/* Content */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Nội dung:</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-800 break-all">{paymentContent || payment.transactionId || order.orderNumber}</div>
                </div>
                <button
                  onClick={() => handleCopy(paymentContent || payment.transactionId || order.orderNumber || '', 'Nội dung')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-green-200 flex-shrink-0"
                >
                  Sao chép
                </button>
              </div>
            </div>
          </div>

          {/* Note Below */}
          <div className="mt-4 sm:mt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Lưu ý :</strong> Nhập chính xác số tiền <strong>{(payment.amount || order.totalAmount || 0).toLocaleString('vi-VN')}</strong>, nội dung{' '}
                <strong>{paymentContent || payment.transactionId || order.orderNumber}</strong> khi chuyển khoản
              </p>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={handleCancel}
              className="w-full sm:w-auto px-8 sm:px-16 py-2.5 sm:py-3 text-sm sm:text-base bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-full transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Payment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(72, 72, 72, 0.3)' }}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg border border-gray-300 shadow-xl p-4 sm:p-6 w-full max-w-md">
            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center">
              HỦY
            </h3>
            
            {/* Message */}
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 text-center">
              Quý khách có chắc chắn muốn hủy giao dịch này?
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-5 sm:px-6 py-2 text-sm sm:text-base bg-gray-100 border border-gray-400 text-gray-700 font-normal rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-5 sm:px-6 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white font-normal rounded-full transition-colors cursor-pointer"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

