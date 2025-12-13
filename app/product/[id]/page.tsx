"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Heart, Minus, Plus, Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/store/useCartStore"
import Image from "next/image"
import { useSWRFetch } from "@/app/hooks/useSWRFetch"
import { Product } from "@/types"
import ReviewSection from "@/app/product/_components/ReviewSection"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
const DEFAULT_IMAGE = '/img_clothes/anime/Akatsuki truyện naruto (4).jpg'

// Backup data nếu API fail
const BACKUP_PRODUCTS = [
  {
    id: "1",
    name: "Trang phục Anime Naruto Akatsuki",
    price: 850000,
    discountPrice: null,
    category: "Anime",
    size: "M",
    condition: "Mới 95%",
    rating: 4.5,
    reviewCount: 24,
    image: "/img_clothes/anime/Akatsuki truyện naruto (4).jpg",
    hoverImage: "/img_clothes/anime/Akatsuki truyền naruto (5).jpg",
    description: "Trang phục Akatsuki chất lượng cao, chi tiết hoàn thiện. Được làm từ chất liệu cao cấp, phù hợp cho cosplay và các sự kiện anime. Bao gồm áo choàng đen với họa tiết mây đỏ đặc trưng, phụ kiện đầy đủ."
  },
  {
    id: "2",
    name: "Trang phục cổ tích công chúa",
    price: 1200000,
    discountPrice: null,
    category: "Cổ tích",
    size: "L",
    condition: "Mới 100%",
    rating: 4.8,
    reviewCount: 18,
    image: "/img_clothes/coTich/000aa6833cdc1c0415c4b11a8495510d.jpg",
    hoverImage: "/img_clothes/coTich/4931f28604c685d4f18be7cae63cd165.jpg",
    description: "Váy công chúa sang trọng, phù hợp cho sự kiện. Thiết kế tinh tế với nhiều lớp vải, trang trí ren và sequin lấp lánh. Chất liệu cao cấp, thoải mái khi mặc."
  },
  {
    id: "3",
    name: "Đồng phục học sinh Nhật Bản",
    price: 650000,
    discountPrice: null,
    category: "Đồng phục",
    size: "S",
    condition: "Mới 90%",
    rating: 4.3,
    reviewCount: 32,
    image: "/img_clothes/dongPhucHocSinh/1.jpg",
    hoverImage: "/img_clothes/dongPhucHocSinh/2.jpg",
    description: "Đồng phục học sinh Nhật kiểu dáng chuẩn. Bao gồm áo sơ mi trắng, váy xếp ly và cà vạt. Chất liệu cotton thoáng mát, form dáng chuẩn Nhật Bản."
  },
  {
    id: "4",
    name: "Trang phục One Piece Boa Hancock",
    price: 950000,
    discountPrice: 750000,
    category: "Anime",
    size: "M",
    condition: "Mới 95%",
    rating: 4.6,
    reviewCount: 15,
    image: "/img_clothes/anime/Boa Hancok One Piece (4)-min.jpg",
    hoverImage: "/img_clothes/anime/Boa Hancok One Piece (6)-min (1).jpg",
    description: "Cosplay Boa Hancock đầy đủ phụ kiện. Bao gồm trang phục chính, phụ kiện tóc, và các chi tiết trang trí. Chất lượng cao, chi tiết sắc nét."
  },
  {
    id: "5",
    name: "Trang phục cổ trang Việt Nam",
    price: 1100000,
    discountPrice: null,
    category: "Cổ trang",
    size: "M",
    condition: "Mới 100%",
    rating: 4.7,
    reviewCount: 22,
    image: "/img_clothes/coTrang/2f15ae551b1a2273725028f64955a607.jpg",
    hoverImage: "/img_clothes/coTrang/6243269c80ef4ead4e27a2b1bb317154.jpg",
    description: "Trang phục cổ trang Việt Nam truyền thống. Thiết kế theo phong cách hoàng gia, chất liệu lụa cao cấp, thêu tay tinh xảo. Phù hợp cho các sự kiện văn hóa."
  },
  {
    id: "6",
    name: "Trang phục Robot AI",
    price: 1800000,
    discountPrice: 1400000,
    category: "Khoa học viễn tưởng",
    size: "L",
    condition: "Mới 100%",
    rating: 4.9,
    reviewCount: 8,
    image: "/img_clothes/anime/robot AI bó sát (2)-min.jpg",
    hoverImage: "/img_clothes/anime/robot AI bó sát (3)-min.jpg",
    description: "Trang phục Robot AI cao cấp, đèn LED. Thiết kế futuristic với hiệu ứng ánh sáng LED, chất liệu cao cấp, form dáng ôm sát. Bao gồm mặt nạ và phụ kiện công nghệ."
  }
];

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  
  const { addItem, openMiniCart } = useCart()
  
  // Fetch product từ backend
  const { data: backendProduct, error, isLoading } = useSWRFetch<Product>(
    productId ? `${API_URL}/products/${productId}` : null
  )

  // Transform backend data sang format UI
  const product = useMemo(() => {
    if (!backendProduct) return null

    const sortedImages = backendProduct.productImages
      ?.filter(img => img.isActive)
      .sort((a, b) => a.order - b.order) || []
    
    const images = sortedImages.map(img => img.url).filter(Boolean)
    if (images.length === 0) {
      images.push(backendProduct.images?.[0] || DEFAULT_IMAGE)
    }

    return {
      id: backendProduct.id,
      name: backendProduct.name,
      price: Number(backendProduct.price),
      discountPrice: null, // TODO: Add discount logic nếu cần
      category: backendProduct.category?.name || 'Chưa phân loại',
      size: backendProduct.size || 'M',
      condition: backendProduct.isAvailable ? 'Còn hàng' : 'Hết hàng',
      rating: backendProduct.averageRating || 0,
      reviewCount: backendProduct.reviewCount || 0,
      image: images[0] || DEFAULT_IMAGE,
      hoverImage: images[1],
      description: backendProduct.description || 'Chưa có mô tả',
      images: images,
      quantity: backendProduct.quantity || 0,
      deposit: backendProduct.deposit || 0,
      brand: backendProduct.brand || '',
      color: backendProduct.color || '',
    }
  }, [backendProduct])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  // Error state - Fallback to backup data
  if (error || !product) {
    const backupProduct = BACKUP_PRODUCTS.find(p => p.id === productId)
    
    if (!backupProduct) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h1>
            <button 
              onClick={() => router.push('/product')}
              className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-black transition-colors"
            >
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      )
    }
    
    // Sử dụng backup data nếu API fail
    console.warn('⚠️ Sử dụng backup data do API error:', error)
  }

  // Tạo mảng hình ảnh (product đã được check ở trên)
  const productImages = (product?.images || [product?.image, product?.hoverImage]).filter((img): img is string => Boolean(img))

  const handleAddToCart = () => {
    if (!product) return
    
    addItem({ 
      id: product.id,
      name: product.name, 
      image: product.image,
      originalPrice: product.price,
      salePrice: product.discountPrice || product.price,
      quantity: quantity
    })
    openMiniCart()
  }

  const handleBuyNow = () => {
    if (!product) return
    
    addItem({ 
      id: product.id,
      name: product.name, 
      image: product.image,
      originalPrice: product.price,
      salePrice: product.discountPrice || product.price,
      quantity: quantity
    })
    // Redirect to cart or checkout page
    router.push('/cart')
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Early return if no product after all checks
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h1>
          <button 
            onClick={() => router.push('/product')}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-black transition-colors"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    )
  }

  // Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Product Detail Section */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center">
                <Image 
                  src={productImages[selectedImage] || product.image} 
                  alt={product.name} 
                  width={600}
                  height={750}
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((src: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition ${
                      idx === selectedImage ? "border-green-600" : "border-gray-200 hover:border-green-400"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} view ${idx + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg px-8 pb-8 pt-0 space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-gray-600 text-sm">({product.reviewCount} đánh giá)</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Thông tin sản phẩm</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Danh mục:</span>
                  <span className="text-gray-800">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Kích thước:</span>
                  <span className="text-gray-800">{product.size}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-600">Tình trạng:</span>
                  <span className="text-gray-800">{product.condition}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-lg">Mô tả</h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {product.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Số lượng:</span>
                {/* Quantity Selector */}
                <div className="flex items-center gap-0 bg-green-700 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-white hover:cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 py-2 text-white font-semibold text-lg bg-green-700 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-white hover:cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-3 bg-gray-100 border border-gray-200 rounded-full transition-all duration-300 hover:bg-gray-200 group"
                >
                  <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 hover:bg-black text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Promo Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full fill-green-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  ✨ Miễn phí giao hàng cho đơn hàng trên 1.000.000₫
                </p>
                <p className="text-xs text-green-600">
                  Đổi trả trong 7 ngày • Bảo hành chất lượng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <ReviewSection productId={productId} />
      </div>
    </div>
  )
}
