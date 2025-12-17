"use client"

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from './ProductCard'
import { ProductItem, ProductsResponse } from '@/types'
import { useSWRFetch } from '@/app/hooks/useSWRFetch'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useToast } from '@/app/hooks/useToast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
const DEFAULT_IMAGE = '/img_clothes/anime/Akatsuki truyện naruto (4).jpg'

const CurrentSellClothes = () => {
  const router = useRouter()
  const { addItem, openMiniCart } = useCartStore()
  const { isAuthenticated, token } = useAuthStore()
  const { addFavorite, removeFavorite } = useFavoriteStore()
  const { success, error: showError, ToastContainer } = useToast()

  // Fetch products từ BE - Sản phẩm được đặt hàng nhiều nhất trong tuần
  const { data, error, isLoading } = useSWRFetch<ProductsResponse>(
    `${API_URL}/products?page=1&limit=6&sortBy=mostOrdered`,
    undefined,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  )

  // Transform dữ liệu từ BE sang format của FE
  const products: ProductItem[] = useMemo(() => {
    if (!data?.data) return []

    return data.data.map((product) => {
      // Lấy ảnh: ưu tiên productImages, fallback là images array, cuối cùng là default
      const sortedImages = product.productImages
        ?.filter(img => img.isActive)
        .sort((a, b) => a.order - b.order) || []
      
      const primaryImage = sortedImages[0]?.url || product.images?.[0] || DEFAULT_IMAGE
      const hoverImage = sortedImages[1]?.url || product.images?.[1] || undefined

      const finalPrice = product.discountPrice && product.discountPrice > 0 
        ? Number(product.discountPrice) 
        : Number(product.price)
      
      return {
        id: product.id,
        title: product.name,
        price: finalPrice,
        originalPrice: product.discountPrice && product.discountPrice > 0 
          ? Number(product.price) 
          : undefined,
        rating: product.averageRating || 0, // Dynamic from backend
        reviewCount: product.reviewCount || 0, // Dynamic from backend
        image: primaryImage,
        hoverImage: hoverImage,
      }
    })
  }, [data])

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 px-[30px] max-w-none mx-0">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Thuê nhiều nhất tuần</h2>
        </div>
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(16.666%-20px)] h-96 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 px-[30px] max-w-none mx-0">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Thuê nhiều nhất tuần</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
        </div>
      </section>
    )
  }

  const handleViewProduct = (id: string | number) => {
    router.push(`/product/${id}`)
  }

  const handleAddToCart = (id: string | number) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    
    // Tìm product từ backend data để lấy discountPrice
    const backendProduct = data?.data?.find(p => p.id === id)
    const finalPrice = backendProduct?.discountPrice && backendProduct.discountPrice > 0
      ? Number(backendProduct.discountPrice)
      : Number(backendProduct?.price || product.price)
    
    addItem({
      id: product.id,
      name: product.title,
      image: product.image,
      originalPrice: Number(backendProduct?.price || product.price),
      salePrice: finalPrice,
      quantity: 1,
    })
    
    // Mở MiniCart sau khi thêm
    openMiniCart()
  }

  const handleFavorite = async (id: string | number) => {
    if (!isAuthenticated) {
      showError("Chưa đăng nhập", "Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    try {
      const { favoritesAPI } = await import("@/lib/api/favorites");
      const result = await favoritesAPI.toggle(id.toString(), token!);

      if (result.action === 'Added') {
        const product = products.find(p => p.id === id);
        if (product) {
          addFavorite({
            id: product.id.toString(),
            name: product.title,
            image: product.image,
            price: product.price,
            createdAt: new Date().toISOString(),
          });
        }
        success("Đã thêm vào yêu thích");
      } else {
        removeFavorite(id.toString());
        success("Đã xóa khỏi yêu thích");
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
      showError("Lỗi", error.message || "Không thể thực hiện thao tác");
    }
  }

  return (
    <section className="py-16 px-[30px] max-w-none mx-0">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900">
          Thuê nhiều nhất tuần
        </h2>
        <button 
          onClick={() => router.push('/product?sortBy=mostOrdered')}
          className="flex items-center gap-2 px-6 py-3 text-black bg-white hover:text-white hover:bg-green-600 rounded-full transition-all duration-300 group border border-gray-300 hover:border-green-600 cursor-pointer"
        >
          <span className="text-lg font-medium">Xem tất cả</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Products Flex */}
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(16.666%-20px)]"
              onView={handleViewProduct}
              onAddToCart={handleAddToCart}
              onFavorite={handleFavorite}
            />
          ))
        ) : (
          <div className="w-full text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có sản phẩm nào.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CurrentSellClothes