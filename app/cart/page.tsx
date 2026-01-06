'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Minus, Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useCart } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from '@/app/hooks/useToast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSWRFetch } from '@/app/hooks/useSWRFetch'
import { apiClient } from '@/lib/api/fetch-with-auth'
import { Product } from '@/types'
import type { User } from '@/types/user'
import type { Address } from '@/types/address'
import type { Order } from '@/types/order'
import { Loading } from '@/app/_components/loading'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

// Districts by province (moved outside component to avoid re-creation)
const districtsByProvince: { [key: string]: string[] } = {
  'hcm': [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 
    'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Tân', 'Quận Bình Thạnh', 
    'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Thủ Đức',
    'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'
  ],
  'dongnai': [
    'Thành phố Biên Hòa', 'Thành phố Long Khánh', 'Huyện Cẩm Mỹ', 'Huyện Định Quán', 
    'Huyện Long Thành', 'Huyện Nhơn Trạch', 'Huyện Thống Nhất', 'Huyện Trảng Bom', 
    'Huyện Vĩnh Cửu', 'Huyện Xuân Lộc', 'Huyện Tân Phú'
  ],
  'khanhhoa': [
    'Thành phố Nha Trang', 'Thành phố Cam Ranh', 'Thị xã Ninh Hòa', 'Huyện Cam Lâm', 
    'Huyện Diên Khánh', 'Huyện Khánh Sơn', 'Huyện Khánh Vĩnh', 'Huyện Trường Sa', 
    'Huyện Vạn Ninh'
  ],
  'hanoi': [
    'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Tây Hồ', 'Quận Long Biên', 'Quận Cầu Giấy', 
    'Quận Đống Đa', 'Quận Hai Bà Trưng', 'Quận Hoàng Mai', 'Quận Thanh Xuân', 'Quận Hà Đông', 
    'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Huyện Ba Vì', 'Huyện Chương Mỹ', 'Huyện Đan Phượng', 
    'Huyện Đông Anh', 'Huyện Gia Lâm', 'Huyện Hoài Đức', 'Huyện Mê Linh', 'Huyện Mỹ Đức', 
    'Huyện Phú Xuyên', 'Huyện Phúc Thọ', 'Huyện Quốc Oai', 'Huyện Sóc Sơn', 'Huyện Thạch Thất', 
    'Huyện Thanh Oai', 'Huyện Thanh Trì', 'Huyện Thường Tín', 'Huyện Ứng Hòa', 'Thị xã Sơn Tây'
  ],
  'ninhthuan': [
    'Thành phố Phan Rang-Tháp Chàm', 'Huyện Bác Ái', 'Huyện Ninh Hải', 'Huyện Ninh Phước', 
    'Huyện Ninh Sơn', 'Huyện Thuận Bắc', 'Huyện Thuận Nam'
  ]
}

const CartPage = () => {
  const { 
    items, 
    subtotal, 
    updateQuantity, 
    removeItem,
    calculateItemTotal,
    calculateItemSavings,
    clearCart
  } = useCart()

  // Auth state
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const { error, success, ToastContainer } = useToast()

  // Customer Info State
  const [customerInfo, setCustomerInfo] = useState({
    gender: 'male',
    fullName: '',
    phone: '',
    email: '',
    deliveryType: 'home',
    province: '',
    district: '',
    address: '',
    note: '',
    recipientGender: 'male',
    recipientName: '',
    recipientPhone: '',
    saveRecipient: false,
    paymentMethod: 'cash', // cash or bank
    selectedAddressId: '' // ID của địa chỉ được chọn (nếu có)
  })

  // Fetch user profile
  // Backend endpoint: GET /users/profile trả về User object trực tiếp
  const { data: userProfile, error: profileError, isLoading: profileLoading } = useSWRFetch<User>(
    isAuthenticated ? `${API_URL}/users/profile` : null
  )

  // Fetch user addresses
  // Backend endpoint: GET /addresses trả về Address[] trực tiếp
  const { data: userAddresses, error: addressesError, isLoading: addressesLoading } = useSWRFetch<Address[]>(
    isAuthenticated ? `${API_URL}/addresses` : null
  )

  // Track giá trị userProfile cũ để phát hiện khi user đã chỉnh sửa thủ công
  const previousUserProfileRef = React.useRef<User | null>(null)

  // Auto-fill thông tin khách hàng khi có data từ API
  // Cập nhật động khi userProfile thay đổi (ví dụ: cập nhật ở trang profile)
  useEffect(() => {
    if (userProfile && isAuthenticated) {
      setCustomerInfo(prev => {
        const previousProfile = previousUserProfileRef.current
        
        // Nếu userProfile thay đổi, sync các trường mà user chưa chỉnh sửa thủ công
        // Kiểm tra xem giá trị hiện tại có khác với giá trị cũ của userProfile không
        const wasManuallyEdited = previousProfile && (
          (prev.fullName && prev.fullName !== previousProfile.fullName) ||
          (prev.phone && prev.phone !== previousProfile.phone) ||
          (prev.email && prev.email !== previousProfile.email)
        )

        return {
          ...prev,
          // Nếu user chưa chỉnh sửa thủ công, luôn sync với userProfile mới
          // Nếu đã chỉnh sửa, chỉ sync khi trường còn trống
          fullName: wasManuallyEdited && prev.fullName ? prev.fullName : (userProfile.fullName || prev.fullName || ''),
          phone: wasManuallyEdited && prev.phone ? prev.phone : (userProfile.phone || prev.phone || ''),
          email: wasManuallyEdited && prev.email ? prev.email : (userProfile.email || prev.email || '')
        }
      })
      
      // Lưu userProfile hiện tại để so sánh lần sau
      previousUserProfileRef.current = userProfile
    }
  }, [userProfile, isAuthenticated])

  // Parse địa chỉ từ string thành province, district, address
  const parseAddress = (addressString: string | undefined): { province: string; district: string; address: string } => {
    if (!addressString) {
      return { province: '', district: '', address: '' }
    }

    // Format: "Tên đường, Phường/Xã, Tỉnh thành"
    const parts = addressString.split(',').map(p => p.trim())
    
    if (parts.length >= 3) {
      const address = parts[0]
      const district = parts[1]
      const province = parts[2]
      
      // Map province name to value
      const provinceValue = mapProvinceToValue(province)
      
      // Tìm district match (case-insensitive) trong danh sách
      const availableDistricts = districtsByProvince[provinceValue] || []
      const matchedDistrict = availableDistricts.find(d => 
        d.toLowerCase() === district.toLowerCase()
      ) || district
      
      return {
        province: provinceValue,
        district: matchedDistrict,
        address: address
      }
    }
    
    return { province: '', district: '', address: addressString }
  }

  // Track giá trị userProfile.address cũ để phát hiện khi user đã chỉnh sửa thủ công
  const previousAddressRef = React.useRef<string | undefined>(undefined)

  // Auto-fill địa chỉ từ userProfile.address khi có data từ API
  // Cập nhật động khi userProfile.address thay đổi (ví dụ: cập nhật ở trang profile)
  useEffect(() => {
    if (userProfile?.address && isAuthenticated) {
      const parsedAddress = parseAddress(userProfile.address)
      const previousAddress = previousAddressRef.current
      
      setCustomerInfo(prev => {
        // Kiểm tra xem user đã chỉnh sửa địa chỉ thủ công chưa
        const wasManuallyEdited = previousAddress && (
          (prev.province && prev.province !== parseAddress(previousAddress).province) ||
          (prev.district && prev.district !== parseAddress(previousAddress).district) ||
          (prev.address && prev.address !== parseAddress(previousAddress).address)
        )

        // Nếu user chưa chỉnh sửa thủ công, luôn sync với userProfile.address mới
        // Nếu đã chỉnh sửa, chỉ sync khi trường còn trống
        return {
          ...prev,
          province: wasManuallyEdited && prev.province ? prev.province : (parsedAddress.province || prev.province || ''),
          district: wasManuallyEdited && prev.district ? prev.district : (parsedAddress.district || prev.district || ''),
          address: wasManuallyEdited && prev.address ? prev.address : (parsedAddress.address || prev.address || ''),
          // Reset selectedAddressId khi sync từ profile
          selectedAddressId: wasManuallyEdited ? prev.selectedAddressId : ''
        }
      })
      
      // Lưu address hiện tại để so sánh lần sau
      previousAddressRef.current = userProfile.address
    }
  }, [userProfile?.address, isAuthenticated])

  // Auto-fill địa chỉ mặc định khi có data từ API (chỉ điền khi trường còn trống)
  // Chỉ dùng khi không có địa chỉ từ userProfile.address
  useEffect(() => {
    if (userAddresses && userAddresses.length > 0 && isAuthenticated && !userProfile?.address) {
      // Tìm địa chỉ mặc định hoặc lấy địa chỉ đầu tiên
      const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0]
      
      if (defaultAddress) {
        const provinceValue = mapProvinceToValue(defaultAddress.province || '')
        
        // Tìm district match (case-insensitive) trong danh sách
        const availableDistricts = districtsByProvince[provinceValue] || []
        const matchedDistrict = availableDistricts.find(d => 
          d.toLowerCase() === (defaultAddress.district || '').toLowerCase()
        ) || defaultAddress.district || ''
        
        setCustomerInfo(prev => ({
          ...prev,
          // Chỉ điền nếu trường còn trống để không ghi đè dữ liệu user đã nhập
          selectedAddressId: prev.selectedAddressId || defaultAddress.id,
          province: prev.province || provinceValue,
          district: prev.district || matchedDistrict,
          address: prev.address || defaultAddress.street || ''
        }))
      }
    }
  }, [userAddresses, isAuthenticated, userProfile?.address])

  // Helper function để map tên tỉnh thành value
  const mapProvinceToValue = (provinceName: string): string => {
    const provinceMap: { [key: string]: string } = {
      'Thành phố Hồ Chí Minh': 'hcm',
      'Đồng Nai': 'dongnai',
      'Khánh Hòa': 'khanhhoa',
      'Hà Nội': 'hanoi',
      'Ninh Thuận': 'ninhthuan'
    }
    return provinceMap[provinceName] || 'hcm'
  }

  // Helper function để map value thành tên tỉnh
  const mapValueToProvince = (value: string): string => {
    const valueMap: { [key: string]: string } = {
      'hcm': 'Thành phố Hồ Chí Minh',
      'dongnai': 'Đồng Nai',
      'khanhhoa': 'Khánh Hòa',
      'hanoi': 'Hà Nội',
      'ninhthuan': 'Ninh Thuận'
    }
    return valueMap[value] || 'Thành phố Hồ Chí Minh'
  }

  // Voucher state (User nhập mã - CHỈ 1 VOUCHER)
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{
    voucherId: string
    code: string
    description: string
    discountType: string
    discountValue: number
    discountAmount: number
  } | null>(null)
  const [voucherError, setVoucherError] = useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)

  // Promotion state - tạm thời bỏ qua vì có thể không có trong backend này
  const [showPromotions, setShowPromotions] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null)

  // Tự động bỏ chọn voucher khi không còn đủ điều kiện
  useEffect(() => {
    if (appliedVoucher && appliedVoucher.discountAmount > 0) {
      // Tính lại discount với subtotal mới
      let newDiscountAmount = 0
      const discountType = (appliedVoucher.discountType || '').toUpperCase()
      
      if (discountType === 'PERCENTAGE') {
        newDiscountAmount = (subtotal * (appliedVoucher.discountValue || 0)) / 100
      } else if (discountType === 'FIXED_AMOUNT') {
        newDiscountAmount = appliedVoucher.discountValue || 0
      }
      
      // Cập nhật lại discountAmount
      if (newDiscountAmount !== appliedVoucher.discountAmount) {
        setAppliedVoucher({
          ...appliedVoucher,
          discountAmount: newDiscountAmount
        })
      }
    }
  }, [subtotal, appliedVoucher])

  // Tính giảm giá từ Promotion đã chọn - tạm thời bỏ qua
  const promotionDiscount: number = 0

  // Tính tổng giảm giá từ Voucher đã apply
  const voucherDiscount = appliedVoucher ? appliedVoucher.discountAmount : 0

  // Tổng discount = promotion đã chọn + voucher
  const totalDiscount = promotionDiscount + voucherDiscount

  const handleApplyVoucher = async () => {
    setVoucherError('')
    
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã voucher')
      return
    }

    // Check nếu đã có voucher
    if (appliedVoucher) {
      setVoucherError('Chỉ được áp dụng 1 voucher. Vui lòng xóa voucher hiện tại trước.')
      return
    }

    setIsApplyingVoucher(true)
    
    try {
      // Fetch voucher by code
      const vouchers = await apiClient.get(`/vouchers`)
      const voucher = vouchers.find((v: any) => v.code === voucherCode.trim().toUpperCase())
      
      if (!voucher || !voucher.id) {
        setVoucherError('Mã voucher không tồn tại')
        return
      }

      // Check min order value
      if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
        setVoucherError(`Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng voucher này`)
        return
      }

      // Check expiry
      if (voucher.endDate && new Date(voucher.endDate) < new Date()) {
        setVoucherError('Voucher đã hết hạn')
        return
      }

      // Check usage limit
      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        setVoucherError('Voucher đã hết lượt sử dụng')
        return
      }

      // Check active
      if (!voucher.isActive) {
        setVoucherError('Voucher không còn hoạt động')
        return
      }
      
      // Tính discountAmount
      let discountAmount = 0
      const discountType = (voucher.discountType || '').toLowerCase()
      
      if (discountType === 'percent') {
        discountAmount = (subtotal * (voucher.discountValue || 0)) / 100
        // Apply max discount if exists
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount
        }
      } else if (discountType === 'fixed') {
        discountAmount = voucher.discountValue || 0
      }
      
      // Lưu voucher (chỉ 1)
      setAppliedVoucher({
        voucherId: voucher.id,
        code: voucher.code,
        description: voucher.description || '',
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount: discountAmount
      })
      
      setVoucherCode('')
      setVoucherError('')
      success('Thành công', `Đã áp dụng voucher ${voucher.code}`)
      
    } catch (err: any) {
      console.error('Error applying voucher:', err)
      setVoucherError(err.message || 'Mã voucher không hợp lệ. Vui lòng kiểm tra lại.')
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
  }

  const handleSelectPromotion = (_promoCode: string) => {
    // Tạm thời bỏ qua promotions
  }

  const shippingFee: number = 0 // Miễn phí vận chuyển
  const finalTotal = Math.max(0, subtotal - totalDiscount + shippingFee)

  // Handle checkout
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      error('Chưa đăng nhập', 'Vui lòng đăng nhập để tiếp tục')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return
    }

    // Validate thông tin
    if (!customerInfo.fullName.trim()) {
      error('Lỗi', 'Vui lòng nhập họ và tên')
      return
    }

    if (!customerInfo.phone.trim()) {
      error('Lỗi', 'Vui lòng nhập số điện thoại')
      return
    }

    if (!customerInfo.email.trim()) {
      error('Lỗi', 'Vui lòng nhập email')
      return
    }

    if (customerInfo.deliveryType === 'home') {
      if (!customerInfo.province) {
        error('Lỗi', 'Vui lòng chọn tỉnh thành')
        return
      }
      if (!customerInfo.district) {
        error('Lỗi', 'Vui lòng chọn phường xã')
        return
      }
      if (!customerInfo.address.trim()) {
        error('Lỗi', 'Vui lòng nhập địa chỉ')
        return
      }
    }

    if (customerInfo.saveRecipient) {
      if (!customerInfo.recipientName.trim()) {
        error('Lỗi', 'Vui lòng nhập tên người nhận')
        return
      }
      if (!customerInfo.recipientPhone.trim()) {
        error('Lỗi', 'Vui lòng nhập số điện thoại người nhận')
        return
      }
    }

    if (items.length === 0) {
      error('Lỗi', 'Giỏ hàng trống')
      return
    }

    try {
      // Validate và chuẩn bị product IDs
      const validItems = items.filter(item => {
        if (!item.id) {
          console.error('❌ Cart item missing ID:', item)
          return false
        }
        return true
      })

      if (validItems.length === 0) {
        error('Lỗi', 'Giỏ hàng không có sản phẩm hợp lệ')
        return
      }

      if (validItems.length < items.length) {
        // Xóa các items không hợp lệ khỏi cart
        items.forEach(item => {
          if (!item.id) {
            removeItem(item.id)
          }
        })
        error('Lỗi', 'Đã xóa các sản phẩm không hợp lệ khỏi giỏ hàng. Vui lòng thử lại.')
        return
      }

      // Chuẩn bị data để gửi lên backend
      const rentalStartDate = new Date()
      const rentalEndDate = new Date()
      rentalEndDate.setDate(rentalEndDate.getDate() + 7) // Mặc định thuê 7 ngày

      const orderData = {
        items: validItems.map(item => ({
          productId: String(item.id), // Đảm bảo convert sang string
          quantity: item.quantity
        })),
        rentalStartDate: rentalStartDate.toISOString(),
        rentalEndDate: rentalEndDate.toISOString(),
        rentalAddress: customerInfo.deliveryType === 'home' 
          ? `${customerInfo.address}, ${customerInfo.district}, ${mapValueToProvince(customerInfo.province)}`
          : 'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, Quận Gò Vấp, Thành phố Hồ Chí Minh',
        notes: customerInfo.note || '',
        paymentMethod: customerInfo.paymentMethod // Thêm paymentMethod để backend xử lý
      }

      console.log('📦 Creating order with data:', {
        itemsCount: orderData.items.length,
        paymentMethod: customerInfo.paymentMethod,
        items: orderData.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      })

      // Gửi request tạo đơn hàng lên backend (LUÔN LUÔN tạo đơn hàng, cho cả COD và bank)
      const orderResult = await apiClient.post('/orders', orderData) as Order

      console.log('✅ Order created successfully:', orderResult.id)

      // Nếu payment method là bank, tạo payment và redirect đến trang thanh toán
      if (customerInfo.paymentMethod === 'bank') {
        // Clear giỏ hàng
        clearCart()
        
        // Hiển thị thông báo "Đang hiển thị mã QR" ngay lập tức
        success('Đặt hàng thành công', 'Đang hiển thị mã QR...')
        
        // Redirect ngay đến trang thanh toán (dù payment có tạo thành công hay không)
        console.log('🔄 Redirecting to payment page:', `/payment/${orderResult.id}`)
        router.push(`/payment/${orderResult.id}`)
        
        // Tạo payment trong background (không chặn redirect)
        apiClient.post('/payments', {
          orderId: orderResult.id,
          method: 'sepay' // Backend dùng 'sepay' thay vì 'bank_transfer'
        }).then((paymentResult) => {
          console.log('✅ Payment created successfully:', paymentResult)
        }).catch((paymentError: any) => {
          console.error('❌ Payment Creation Error:', paymentError)
          console.error('❌ Payment Error Details:', paymentError?.response?.data || paymentError?.message)
          // Payment sẽ được tạo lại khi user vào trang payment
        })
        
        return // Đảm bảo không chạy code phía dưới
      } else {
        // Nếu là cash (COD - Cash on Delivery)
        // Đơn hàng đã được tạo ở trên, chỉ cần clear cart và redirect
        console.log('✅ COD order created, clearing cart and redirecting')
        
        // Clear giỏ hàng
        clearCart()

        // Hiển thị thông báo thành công
        success('Đặt hàng thành công', 'Đơn hàng của bạn đã được tạo thành công. Vui lòng thanh toán khi nhận hàng.')
        
        // Redirect đến trang đơn hàng
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      }

    } catch (err: any) {
      console.error('❌ Checkout Error:', err)
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại sau'
      
      if (err.response?.status === 401 || err.message?.includes('401') || err.message?.includes('unauthorized')) {
        error('Lỗi xác thực', 'Vui lòng đăng nhập lại')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else if (errorMessage.includes('Không tìm thấy sản phẩm')) {
        // Nếu lỗi là product không tồn tại, xóa item đó khỏi cart
        const productIdMatch = errorMessage.match(/ID: ([^\s]+)/)
        if (productIdMatch) {
          const invalidProductId = productIdMatch[1]
          console.warn('⚠️ Removing invalid product from cart:', invalidProductId)
          // Thử xóa với cả string và number
          removeItem(invalidProductId)
          // Cũng thử tìm và xóa item có id này
          const invalidItem = items.find(item => String(item.id) === invalidProductId || String(item.id) === String(invalidProductId))
          if (invalidItem) {
            removeItem(invalidItem.id)
          }
          error('Lỗi', `Sản phẩm không còn tồn tại trong hệ thống (ID: ${invalidProductId}). Đã tự động xóa khỏi giỏ hàng. Vui lòng kiểm tra lại và thử lại.`)
        } else {
          error('Lỗi', errorMessage)
        }
      } else {
        error('Lỗi', errorMessage)
      }
    }
  }

  // Loading state - hiển thị loading khi đang fetch user data (chỉ khi đã đăng nhập)
  // Phải đặt sau tất cả hooks để tuân thủ Rules of Hooks
  if (isAuthenticated && (profileLoading || addressesLoading)) {
    return <Loading variant="fullpage" />;
  }

  const getDistricts = () => {
    if (customerInfo.deliveryType === 'store') {
      return ['P. Hạnh Thông']
    }
    return districtsByProvince[customerInfo.province] || []
  }

  // Check xem có đang chọn địa chỉ mặc định không (để hiển thị label)
  const isDefaultAddressSelected = customerInfo.deliveryType === 'home' && 
    customerInfo.selectedAddressId !== '' &&
    !!(userAddresses?.find((addr: Address) => addr.id === customerInfo.selectedAddressId)?.isDefault)

  // Check xem có đang chọn 1 địa chỉ có sẵn không (để disable các trường)
  // CHỈ enable khi chọn "Nhập địa chỉ khác" (selectedAddressId = '')
  const isAddressFieldsDisabled = customerInfo.deliveryType === 'home' && customerInfo.selectedAddressId !== ''

  const handleUpdateQuantity = (productId: string | number, change: number) => {
    const item = items.find(i => i.id === productId)
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change)
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: string | number) => {
    removeItem(productId)
  }

  const handleClearAll = () => {
    if (items.length === 0) return
    clearCart()
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white">
        {/* Cart Title */}
        <div className="relative py-16 sm:py-20 md:py-24">
          <div className="absolute inset-0">
            <img 
              src="/ImgPoster/h1-banner01-1.jpg"
              alt="Cart Background"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 
              className="text-center font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg"
            >
              Giỏ hàng
            </h1>
          </div>
        </div>

      {items.length === 0 ? (
        // Empty cart - hiển thị SVG và text
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-7xl">
          <div className="flex flex-col items-center justify-center">
            {/* Sad Face Icon */}
            <div className="mb-6 sm:mb-8">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 text-green-600"
                fill="none"
              >
                <path 
                  fill="currentColor" 
                  d="M60 0C26.863 0 0 26.863 0 60s26.863 60 60 60 60-26.863 60-60S93.137 0 60 0Zm19.355 40.645a7.742 7.742 0 0 1 7.742 7.742 7.742 7.742 0 0 1-7.742 7.742 7.742 7.742 0 0 1-7.742-7.742 7.742 7.742 0 0 1 7.742-7.742ZM36.774 98.71c-6.41 0-11.613-5.081-11.613-11.355 0-4.84 6.892-14.606 10.065-18.806a1.927 1.927 0 0 1 3.096 0c3.173 4.2 10.065 13.966 10.065 18.806 0 6.274-5.203 11.355-11.613 11.355Zm3.871-42.581a7.742 7.742 0 0 1-7.742-7.742 7.742 7.742 0 0 1 7.742-7.742 7.742 7.742 0 0 1 7.742 7.742 7.742 7.742 0 0 1-7.742 7.742Zm41.161 37.29A28.403 28.403 0 0 0 60 83.226c-5.129 0-5.129-7.742 0-7.742a36.013 36.013 0 0 1 27.742 13.032c3.337 3.968-2.71 8.826-5.936 4.903Z"
                />
              </svg>
            </div>
            
            {/* Empty Cart Text */}
            <div className="text-center px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-3 sm:mb-4">Giỏ hàng rỗng</h2>
              <p className="text-gray-500 text-base sm:text-lg mb-6 sm:mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link href="/product">
                <button className="bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-green-700 transition-colors shadow-lg w-full sm:w-auto">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Cart có sản phẩm - hiển thị đầy đủ
        <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 max-w-7xl">
          {/* Cart Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 sm:mb-8">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-green-600 text-white grid-cols-12 gap-4 px-6 py-4 font-bold text-base xl:text-xl">
              <div className="col-span-1 pr-6 whitespace-nowrap">Sản phẩm</div>
              <div className="col-span-7 border-l border-white/30 px-6">Chi tiết</div>
              <div className="col-span-4 text-center border-l border-white/30 pl-6">Tổng</div>
            </div>

            {/* Cart Items */}
            {items.map(item => {
              const currentPrice = item.salePrice
              const hasDiscount = item.originalPrice && item.originalPrice > item.salePrice
              
              return (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 items-start">
                  {/* Product */}
                  <div className="lg:col-span-1 flex items-start lg:pr-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.image || '/assets/imgs/placeholder.png'}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="lg:col-span-7 lg:border-l lg:border-gray-200 lg:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
                    <div>
                      <Link href={`/product/${item.id}`}>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-green-600 mb-1 sm:mb-2 cursor-pointer hover:underline transition-all line-clamp-2" style={{ textUnderlineOffset: '3px' }}>
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-gray-500 line-through text-sm sm:text-base">
                            {item.originalPrice!.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                        <span className="text-gray-800 font-semibold text-sm sm:text-base">
                          {currentPrice.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                    
                    {/* Quantity Controls and Remove */}
                    <div className="flex flex-row lg:flex-col items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-0 bg-green-600 rounded-full overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-white  hover:cursor-pointer  "
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="w-10 sm:w-12 py-1.5 sm:py-2 text-white font-semibold text-base sm:text-lg text-center flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-white hover:cursor-pointer"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-green-600 hover:text-green-700 transition-colors text-sm font-medium relative group"
                      >
                        <span className="relative">
                          Xóa sản phẩm
                          <span className="absolute left-1/2 bottom-[-7px] w-full h-[1px] bg-green-600 -translate-x-1/2 group-hover:w-0 transition-all duration-300 ease-in-out"></span>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-4 border-l border-gray-200 pl-6 flex items-center justify-center">
                    {/* Price and Savings */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {calculateItemTotal(item).toLocaleString('vi-VN')}₫
                      </div>
                      {hasDiscount && (
                        <div className="text-red-500 font-bold text-sm">
                          TIẾT KIỆM {calculateItemSavings(item).toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Clear All Button - Below Items */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 text-base font-semibold cursor-pointer shadow-md hover:shadow-lg"
                  title="Xóa tất cả sản phẩm"
                >
                  <Trash2 size={20} />
                  <span>Xóa tất cả</span>
                </button>
              </div>
            )}

            {/* Subtotal Summary */}
            <div className="bg-white px-6 py-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Tạm tính ({items.length} sản phẩm):</span>
                <span className="text-gray-800 font-bold text-xl">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Customer Information Section */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="font-bold text-lg sm:text-xl text-gray-800">THÔNG TIN KHÁCH HÀNG</h2>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              {/* Gender */}
              <div className="flex items-center gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={customerInfo.gender === 'male'}
                    onChange={(e) => setCustomerInfo({...customerInfo, gender: e.target.value})}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 accent-green-600"
                  />
                  <span className="text-base sm:text-lg">Anh</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={customerInfo.gender === 'female'}
                    onChange={(e) => setCustomerInfo({...customerInfo, gender: e.target.value})}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 accent-green-600"
                  />
                  <span className="text-base sm:text-lg">Chị</span>
                </label>
              </div>

              {/* Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Delivery Method Section */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="font-bold text-lg sm:text-xl text-gray-800">HÌNH THỨC GIAO HÀNG</h2>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              {/* Delivery Type */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="home"
                    checked={customerInfo.deliveryType === 'home'}
                    onChange={(e) => setCustomerInfo({...customerInfo, deliveryType: e.target.value})}
                    className="w-5 h-5 text-green-600 accent-green-600"
                  />
                  <span className="text-lg">Giao hàng tận nơi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="store"
                    checked={customerInfo.deliveryType === 'store'}
                    onChange={(e) => setCustomerInfo({...customerInfo, deliveryType: e.target.value})}
                    className="w-5 h-5 text-green-600 accent-green-600"
                  />
                  <span className="text-lg">Nhận hàng tại cửa hàng</span>
                </label>
              </div>

              {/* Chọn địa chỉ có sẵn (chỉ hiển thị khi giao hàng tận nơi và có địa chỉ) */}
              {customerInfo.deliveryType === 'home' && userAddresses && userAddresses.length > 0 && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    Chọn địa chỉ giao hàng
                    {isDefaultAddressSelected && (
                      <span className="text-green-600 font-semibold"> - Địa chỉ mặc định</span>
                    )}
                  </label>
                  <select
                    value={customerInfo.selectedAddressId}
                    onChange={(e) => {
                      const selectedAddr = userAddresses.find((addr: Address) => addr.id === e.target.value)
                      if (selectedAddr) {
                        const provinceValue = mapProvinceToValue(selectedAddr.province)
                        
                        // Tìm district match (case-insensitive) trong danh sách
                        const availableDistricts = districtsByProvince[provinceValue] || []
                        const matchedDistrict = availableDistricts.find(d => 
                          d.toLowerCase() === (selectedAddr.district || '').toLowerCase()
                        ) || selectedAddr.district || ''
                        
                        setCustomerInfo({
                          ...customerInfo,
                          selectedAddressId: selectedAddr.id,
                          province: provinceValue,
                          district: matchedDistrict,
                          address: selectedAddr.street || ''
                        })
                      } else {
                        // Chọn "Nhập địa chỉ mới"
                        setCustomerInfo({
                          ...customerInfo,
                          selectedAddressId: '',
                          province: '',
                          district: '',
                          address: ''
                        })
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                  >
                    {userAddresses.map((addr: Address) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.district}, {addr.province}
                        {addr.isDefault ? ' (Mặc định)' : ''}
                      </option>
                    ))}
                    <option value="">+ Nhập địa chỉ khác</option>
                  </select>
                </div>
              )}

                  {/* Province and District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Tỉnh thành <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={customerInfo.deliveryType === 'store' ? 'hcm' : customerInfo.province}
                        onChange={(e) => setCustomerInfo({...customerInfo, province: e.target.value, district: '', selectedAddressId: ''})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={customerInfo.deliveryType === 'store' || isAddressFieldsDisabled}
                      >
                        <option value="">Chọn tỉnh thành</option>
                        <option value="hcm">Thành phố Hồ Chí Minh</option>
                        {customerInfo.deliveryType === 'home' && (
                          <>
                            <option value="dongnai">Đồng Nai</option>
                            <option value="khanhhoa">Khánh Hòa</option>
                            <option value="ninhthuan">Ninh Thuận</option>
                            <option value="hanoi">Hà Nội</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Phường xã <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={customerInfo.deliveryType === 'store' ? 'Quận Gò Vấp' : customerInfo.district}
                        onChange={(e) => setCustomerInfo({...customerInfo, district: e.target.value, selectedAddressId: ''})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={customerInfo.deliveryType === 'store' || isAddressFieldsDisabled}
                      >
                        {customerInfo.deliveryType === 'store' ? (
                          <option value="Quận Gò Vấp">Quận Gò Vấp</option>
                        ) : (
                          <>
                            <option value="">Chọn phường / xã</option>
                            {getDistricts().map((district) => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Tên đường số nhà <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên đường / số nhà"
                      value={customerInfo.deliveryType === 'store' ? 'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông' : customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value, selectedAddressId: ''})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={customerInfo.deliveryType === 'store' || isAddressFieldsDisabled}
                    />
                  </div>              {/* Note */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                  Yêu cầu khác (nếu có)
                </label>
                <input
                  type="text"
                  placeholder="Nhập yêu cầu"
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Save Recipient Checkbox */}
              <div className="flex items-start gap-2 p-3 sm:p-4">
                <input
                  type="checkbox"
                  id="saveRecipient"
                  checked={customerInfo.saveRecipient}
                  onChange={(e) => setCustomerInfo({...customerInfo, saveRecipient: e.target.checked})}
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-green-600 accent-green-600 cursor-pointer"
                />
                <label htmlFor="saveRecipient" className="text-gray-700 cursor-pointer text-sm sm:text-base">
                  Gọi người khác nhận hàng (Nếu có)
                </label>
              </div>

              {/* Recipient Info (conditional) */}
              {customerInfo.saveRecipient && (
                <div className="p-4 space-y-4 border-2 border-gray-200 rounded-lg">
                  {/* Recipient Gender */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recipientGender"
                        value="male"
                        checked={customerInfo.recipientGender === 'male'}
                        onChange={(e) => setCustomerInfo({...customerInfo, recipientGender: e.target.value})}
                        className="w-5 h-5 text-green-600 accent-green-600"
                      />
                      <span className="text-lg">Anh</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recipientGender"
                        value="female"
                        checked={customerInfo.recipientGender === 'female'}
                        onChange={(e) => setCustomerInfo({...customerInfo, recipientGender: e.target.value})}
                        className="w-5 h-5 text-green-600 accent-green-600"
                      />
                      <span className="text-lg">Chị</span>
                    </label>
                  </div>

                  {/* Recipient Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Họ và tên người nhận <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={customerInfo.recipientName}
                        onChange={(e) => setCustomerInfo({...customerInfo, recipientName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={customerInfo.recipientPhone}
                        onChange={(e) => setCustomerInfo({...customerInfo, recipientPhone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="px-6 py-4">
              <h2 className="font-bold text-xl text-gray-800">Hình thức thanh toán</h2>
            </div>
            <div className="px-6 pb-6 space-y-4">
              {/* Cash Payment */}
              <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={customerInfo.paymentMethod === 'cash'}
                  onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                  className="w-5 h-5 mt-0.5 text-green-600 accent-green-600 cursor-pointer"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-gray-800">Thanh toán tiền mặt khi nhận hàng</span>
                </div>
              </label>

              {/* Bank Transfer */}
              <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={customerInfo.paymentMethod === 'bank'}
                  onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                  className="w-5 h-5 mt-0.5 text-green-600 accent-green-600 cursor-pointer"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-gray-800">Chuyển khoản ngân hàng</span>
                </div>
              </label>
            </div>

            {/* Cart Totals Section */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="font-bold text-lg sm:text-xl text-gray-800">CHI TIẾT THANH TOÁN</h2>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Tiền hàng */}
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="text-gray-700 text-sm sm:text-base">Tiền hàng:</span>
                <span className="text-gray-800 font-semibold text-sm sm:text-base">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>

              {/* Phí vận chuyển */}
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="text-gray-700 text-sm sm:text-base">Phí vận chuyển:</span>
                <span className="text-gray-800 font-semibold text-sm sm:text-base">{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}</span>
              </div>

              {/* Khuyến mãi (Promotions) - Tạm thời ẩn vì chưa có trong backend */}

              {/* Mã giảm giá Voucher (User tự nhập) */}
              <div className="py-3 border-b border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">🎟️ Mã giảm giá (Voucher):</span>
                  <span className="text-red-600 font-semibold">-{voucherDiscount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Nhập mã voucher"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase())
                      setVoucherError('')
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isApplyingVoucher && !appliedVoucher) {
                        handleApplyVoucher()
                      }
                    }}
                    disabled={isApplyingVoucher || !!appliedVoucher}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !!appliedVoucher}
                    className="bg-[#FF6B6B] text-white px-6 py-2 rounded font-semibold hover:bg-[#FF5555] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    {isApplyingVoucher ? 'Đang xử lý...' : 'Áp dụng'}
                  </button>
                </div>

                {/* Voucher đã áp dụng */}
                {appliedVoucher && (
                  <div className="mb-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-green-800 font-bold text-sm">{appliedVoucher.code}</p>
                            <button
                              onClick={handleRemoveVoucher}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Xóa
                            </button>
                          </div>
                          <p className="text-green-700 text-xs mt-1">{appliedVoucher.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {voucherError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-red-800 text-sm">{voucherError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tổng cộng */}
              <div className="flex justify-between items-center py-3 sm:py-4">
                <span className="text-gray-800 font-bold text-base sm:text-lg">Tổng cộng:</span>
                <span className="text-red-600 font-bold text-xl sm:text-2xl">{finalTotal.toLocaleString('vi-VN')} đ</span>
              </div>

              {/* Terms Notice */}
              <div className="py-4 border-t border-gray-200">
                <div className="text-gray-700 text-sm">
                  <span className="inline-flex items-start gap-1">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>
                      Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-800">Điều khoản sử dụng</a>
                      {' '}và{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-800">Chính sách xử lý dữ liệu</a>
                      {' '}của Haucosplay.
                    </span>
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-4">
                <button 
                  onClick={handleCheckout}
                  className="w-full px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg uppercase tracking-wide transition-colors bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-lg"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default CartPage