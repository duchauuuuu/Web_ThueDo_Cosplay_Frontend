"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, MapPin, Edit2, Save, X, Camera, Package, Heart, Calendar } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useSWRFetch } from "@/app/hooks/useSWRFetch"
import { useToast } from "@/app/hooks/useToast"
import { User as UserType } from "@/types"
import type { Order } from "@/types/order"
import { uploadImage } from "@/lib/api/upload"
import { fetchWithAuth } from "@/lib/api/fetch-with-auth"
import { Loading } from "@/app/_components/loading"
import Image from "next/image"
import { mutate as globalMutate } from "swr"

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

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, token, user: authUser, updateUser } = useAuthStore()
  const { success, error: showError, ToastContainer } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    address: '',
  })

  // Fetch user profile
  const { data: userProfile, error: profileError, isLoading: profileLoading, mutate: mutateProfile } = useSWRFetch<UserType>(
    isAuthenticated && token ? `${API_URL}/users/profile` : null,
    token ? { Authorization: `Bearer ${token}` } : undefined
  )

  // Fetch orders để đếm số lượng
  const { data: ordersData } = useSWRFetch<Order[]>(
    isAuthenticated && token ? `${API_URL}/orders` : null,
    token ? { Authorization: `Bearer ${token}` } : undefined
  )

  // Fetch favorites để đếm số lượng
  const { data: favoritesData } = useSWRFetch<any[]>(
    isAuthenticated && token ? `${API_URL}/favorites` : null,
    token ? { Authorization: `Bearer ${token}` } : undefined
  )

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

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      const parsedAddress = parseAddress(userProfile.address)
      setFormData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        province: parsedAddress.province,
        district: parsedAddress.district,
        address: parsedAddress.address,
      })
    }
  }, [userProfile])

  // Handle Escape key to close avatar modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAvatar(null)
      }
    }
    
    if (selectedAvatar) {
      document.addEventListener('keydown', handleEscape)
      // Ngăn scroll body khi modal mở
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedAvatar])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!token) {
      showError("Lỗi", "Vui lòng đăng nhập lại")
      return
    }

    try {
      // Format địa chỉ đầy đủ: "Tên đường, Phường/Xã, Tỉnh thành"
      const fullAddress = formData.province && formData.district && formData.address
        ? `${formData.address}, ${formData.district}, ${mapValueToProvince(formData.province)}`
        : formData.address || ''

      const response = await fetchWithAuth(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: fullAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Cập nhật thất bại' }))
        throw new Error(errorData.message || 'Cập nhật thất bại')
      }

      const updatedUser = await response.json()
      
      // Update auth store
      updateUser({
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      })

      // Refresh profile
      await mutateProfile()
      
      // Revalidate cache trên tất cả các trang khác (ví dụ: cart page)
      const profileUrl = `${API_URL}/users/profile`
      await globalMutate(profileUrl)

      success("Thành công", "Cập nhật thông tin thành công")
      setIsEditing(false)
    } catch (error: any) {
      console.error("Update profile error:", error)
      showError("Lỗi", error.message || "Không thể cập nhật thông tin")
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      const parsedAddress = parseAddress(userProfile.address)
      setFormData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        province: parsedAddress.province,
        district: parsedAddress.district,
        address: parsedAddress.address,
      })
    }
    setIsEditing(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!token) {
      showError("Lỗi", "Vui lòng đăng nhập lại")
      return
    }

    setIsUploadingAvatar(true)
    try {
      // Upload avatar to Cloudinary
      const uploadResult = await uploadImage(file, 'avatars')
      
      // Update user profile with new avatar URL
      const response = await fetchWithAuth(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: uploadResult.url }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Cập nhật avatar thất bại' }))
        throw new Error(errorData.message || 'Cập nhật avatar thất bại')
      }

      const updatedUser = await response.json()
      
      // Update auth store
      updateUser({
        avatar: updatedUser.avatar,
      })

      // Refresh profile
      await mutateProfile()
      
      // Revalidate cache trên tất cả các trang khác (ví dụ: cart page)
      const profileUrl = `${API_URL}/users/profile`
      await globalMutate(profileUrl)

      success("Thành công", "Cập nhật avatar thành công")
    } catch (error: any) {
      console.error("Upload avatar error:", error)
      showError("Lỗi", error.message || "Không thể cập nhật avatar")
    } finally {
      setIsUploadingAvatar(false)
      // Reset input
      e.target.value = ''
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading variant="fullpage" />
      </div>
    )
  }

  if (profileError || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Không thể tải thông tin hồ sơ</p>
          <button
            onClick={() => mutateProfile()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const ordersCount = Array.isArray(ordersData) ? ordersData.length : 0
  const favoritesCount = Array.isArray(favoritesData) ? favoritesData.length : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      {/* Header Banner */}
      <div className="relative py-24">
        <div className="absolute inset-0">
          <img 
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="Profile Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="font-bold text-6xl text-white drop-shadow-lg mb-2">
              Hồ sơ
            </h1>
            <p className="text-white/90 text-lg">Quản lý thông tin cá nhân của bạn</p>
          </div>
        </div>
      </div>

      <div className="bg-white" style={{ height: '60px' }}></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
              <div className="relative inline-block">
                {userProfile.avatar ? (
                  <div 
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedAvatar(userProfile.avatar || null)}
                  >
                    <Image
                      src={userProfile.avatar}
                      alt={userProfile.fullName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold">
                      {userProfile.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                    isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Camera className="w-5 h-5 text-gray-700" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              {isUploadingAvatar && (
                <p className="text-white/80 text-sm mt-4">Đang tải ảnh lên...</p>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-8">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    
                    {/* Province and District */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh thành <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={(e) => setFormData({...formData, province: e.target.value, district: ''})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                          <option value="">Chọn tỉnh thành</option>
                          <option value="hcm">Thành phố Hồ Chí Minh</option>
                          <option value="dongnai">Đồng Nai</option>
                          <option value="khanhhoa">Khánh Hòa</option>
                          <option value="ninhthuan">Ninh Thuận</option>
                          <option value="hanoi">Hà Nội</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phường xã <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          disabled={!formData.province}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Chọn phường / xã</option>
                          {formData.province && districtsByProvince[formData.province]?.map((district) => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đường số nhà <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Nhập tên đường / số nhà"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <Save className="w-5 h-5" />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      <X className="w-5 h-5" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Email (Read-only) */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 font-medium">{userProfile.email}</p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                      <p className="text-gray-900 font-medium">{userProfile.fullName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                      <p className="text-gray-900 font-medium">{userProfile.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                      <p className="text-gray-900 font-medium">{userProfile.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Tham gia từ</p>
                      <p className="text-gray-900 font-medium">
                        {userProfile.createdAt 
                          ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Chưa có thông tin'}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Edit2 className="w-5 h-5" />
                    Chỉnh sửa thông tin
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Orders Card */}
            <div
              onClick={() => router.push('/orders')}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Đơn hàng</p>
                  <p className="text-3xl font-bold text-gray-900">{ordersCount}</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            {/* Favorites Card */}
            <div
              onClick={() => router.push('/wishlist')}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Yêu thích</p>
                  <p className="text-3xl font-bold text-gray-900">{favoritesCount}</p>
                </div>
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Avatar Modal */}
      {selectedAvatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ backgroundColor: 'rgba(141, 142, 144, 0.4)' }}
          onClick={() => setSelectedAvatar(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedAvatar(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            <Image
              src={selectedAvatar}
              alt="Avatar full size"
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

