'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSWRFetch } from '@/app/hooks/useSWRFetch'
import type { Order } from '@/types/order'
import { PaymentMethod, PaymentStatus } from '@/types/order'
import { CheckCircle, Copy, ArrowLeft, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/app/hooks/useToast'

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
  useEffect(() => {
    if (!order?.createdAt) return

    const calculateTimeLeft = () => {
      const createdAt = new Date(order.createdAt).getTime()
      const now = new Date().getTime()
      const elapsed = Math.floor((now - createdAt) / 1000) // Thời gian đã trôi qua (giây)
      const totalTime = 10 * 60 // 10 phút = 600 giây
      const remaining = Math.max(0, totalTime - elapsed)
      return remaining
    }

    // Tính thời gian còn lại ngay lập tức
    setTimeLeft(calculateTimeLeft())

    // Cập nhật mỗi giây
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      // Nếu hết thời gian, hiển thị thông báo
      if (remaining === 0) {
        showError('Hết thời gian thanh toán', 'Thời gian thanh toán đã hết. Vui lòng tạo đơn hàng mới.')
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [order?.createdAt, showError])

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
      setTimeout(() => {
        router.push(`/orders`)
      }, 4000)
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

  // Parse QR code URL từ sepayResponse (nếu có)
  const getPaymentUrl = () => {
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

  const paymentUrl = getPaymentUrl()

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi tải thông tin đơn hàng</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors"
          >
            Quay lại đơn hàng
          </button>
        </div>
      </div>
    )
  }

  if (!order) return null

  // Kiểm tra payment - chỉ hiển thị trang thanh toán nếu có payment với method SEPAY và có QR code
  if (!payment || payment.method !== 'sepay' || !paymentUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {!payment ? 'Đang tải thông tin thanh toán...' : 'Đơn hàng không cần thanh toán online hoặc chưa có QR code'}
          </h2>
          {payment && payment.method === 'cash' && (
            <button
              onClick={() => router.push('/orders')}
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors"
            >
              Xem đơn hàng
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Countdown Timer */}
        {timeLeft !== null && (
          <div className={`mb-6 rounded-lg border-2 p-4 ${
            timeLeft < 120 
              ? 'bg-red-50 border-red-300' 
              : timeLeft < 300 
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {timeLeft < 120 ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <Clock className="h-6 w-6 text-blue-600" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {timeLeft === 0 ? 'Hết thời gian thanh toán' : 'Thời gian còn lại để thanh toán'}
                  </div>
                  {timeLeft > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      Vui lòng hoàn tất thanh toán trong thời gian này
                    </div>
                  )}
                </div>
              </div>
              <div className={`text-3xl font-bold font-mono ${
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
          <div className="text-2xl">💡</div>
          <div className="text-sm text-gray-700">
            Mở App Ngân hàng bất kỳ để <strong>quét mã VietQR</strong> hoặc{' '}
            <strong>chuyển khoản</strong> chính xác số tiền, nội dung bên dưới
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - QR Code */}
            <div className="flex flex-col items-center justify-center">
              {/* QR Code */}
              <div className="relative">
                {paymentUrl ? (
                  <Image
                    src={paymentUrl}
                    alt="QR Code"
                    width={320}
                    height={320}
                    className="rounded-lg"
                    unoptimized
                  />
                ) : (
                  <div className="w-80 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Đang tải QR code...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div className="space-y-4">
              {/* Bank Info Header */}
              <div className="flex items-start gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">ICB</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Ngân hàng</div>
                  <div className="font-semibold text-gray-800">{order.bankName || 'Ngân hàng TMCP Công Thương Việt Nam'}</div>
                </div>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Chủ tài khoản:</div>
                  <div className="font-semibold text-gray-800">{order.accountName || 'NGUYEN DUC HAU'}</div>
                </div>
                <button
                  onClick={() => handleCopy(order.accountName || 'NGUYEN DUC HAU', 'Tên chủ tài khoản')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border border-green-200"
                >
                  Sao chép
                </button>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Số tài khoản:</div>
                  <div className="font-semibold text-gray-800">{order.accountNo || '109876820087'}</div>
                </div>
                <button
                  onClick={() => handleCopy(order.accountNo || '109876820087', 'Số tài khoản')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border border-green-200"
                >
                  Sao chép
                </button>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Số tiền:</div>
                  <div className="font-semibold text-gray-800">{payment.amount?.toLocaleString('vi-VN') || order.totalAmount.toLocaleString('vi-VN')} vnd</div>
                </div>
                <button
                  onClick={() => handleCopy(payment.amount?.toString() || order.totalAmount.toString(), 'Số tiền')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border border-green-200"
                >
                  Sao chép
                </button>
              </div>

              {/* Content */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Nội dung:</div>
                  <div className="font-semibold text-gray-800 break-all">{payment.transactionId || order.orderNumber}</div>
                </div>
                <button
                  onClick={() => handleCopy(payment.transactionId || order.orderNumber || '', 'Nội dung')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium transition-colors ml-2 cursor-pointer border border-green-200"
                >
                  Sao chép
                </button>
              </div>
            </div>
          </div>

          {/* Note Below */}
          <div className="mt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Lưu ý :</strong> Nhập chính xác số tiền <strong>{(payment.amount || order.totalAmount).toLocaleString('vi-VN')}</strong>, nội dung{' '}
                <strong>{payment.transactionId || order.orderNumber}</strong> khi chuyển khoản
              </p>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleCancel}
              className="px-16 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-full transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Payment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(72, 72, 72, 0.3)' }}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg border border-gray-300 shadow-xl p-6 w-full max-w-md mx-4">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              HỦY
            </h3>
            
            {/* Message */}
            <p className="text-gray-700 mb-6 text-center">
              Quý khách có chắc chắn muốn hủy giao dịch này?
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-100 border border-gray-400 text-gray-700 font-normal rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-normal rounded-full transition-colors cursor-pointer"
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

