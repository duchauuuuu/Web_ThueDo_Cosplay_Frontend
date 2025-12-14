"use client"

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from './ProductCard'
import { ProductItem, ProductsResponse } from '@/types'
import { useSWRFetch } from '@/app/hooks/useSWRFetch'
import { useCartStore } from '@/store/useCartStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
const DEFAULT_IMAGE = '/img_clothes/anime/Akatsuki truyện naruto (4).jpg'

const ClothesWeekHighlight = () => {
  const router = useRouter()
  const { addItem, openMiniCart } = useCartStore()

  // Fetch products từ BE - Sản phẩm được yêu thích nhiều nhất
  const { data, error, isLoading } = useSWRFetch<ProductsResponse>(
    `${API_URL}/products?page=1&limit=6&sortBy=mostFavorited`,
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

      return {
        id: product.id,
        title: product.name,
        price: Number(product.price),
        rating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        image: primaryImage,
        hoverImage: hoverImage,
      }
    })
  }, [data])

  // Event handlers
  const handleViewProduct = (id: string | number) => {
    router.push(`/product/${id}`)
  }

  const handleAddToCart = (id: string | number) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    
    addItem({
      id: product.id,
      name: product.title,
      image: product.image,
      originalPrice: product.originalPrice || product.price,
      salePrice: product.price,
      quantity: 1,
    })
    
    // Mở MiniCart sau khi thêm
    openMiniCart()
  }

  const handleFavorite = (id: string | number) => {
    // TODO: Implement favorite functionality
    console.log('Add to favorite:', id)
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 px-[30px] max-w-none mx-0">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Yêu thích nhiều nhất tuần</h2>
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
          <h2 className="text-4xl font-bold text-gray-900">Yêu thích nhiều nhất tuần</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-[30px] max-w-none mx-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900">
          Yêu thích nhiều nhất tuần
        </h2>
        <button 
          onClick={() => router.push('/product?sortBy=mostFavorited')}
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

export default ClothesWeekHighlight