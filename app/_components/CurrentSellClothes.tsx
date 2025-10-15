"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
interface ProductItem {
  id: number
  title: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  hoverImage?: string
  discount?: number
}

const CurrentSellClothes = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  const products: ProductItem[] = [
    {
      id: 1,
      title: "Trang phục Anime Naruto Akatsuki",
      price: 850000,
      rating: 4.5,
      reviewCount: 24,
      image: "/img_clothes/anime/Akatsuki truyện naruto (4).jpg",
      hoverImage: "/img_clothes/anime/Akatsuki truyện naruto (5).jpg"
    },
    {
      id: 2,
      title: "Trang phục cổ tích công chúa",
      price: 1200000,
      rating: 4.8,
      reviewCount: 18,
      image: "/img_clothes/coTich/000aa6833cdc1c0415c4b11a8495510d.jpg",
      hoverImage: "/img_clothes/coTich/4931f28604c685d4f18be7cae63cd165.jpg"
    },
    {
      id: 3,
      title: "Đồng phục học sinh Nhật Bản",
      price: 650000,
      rating: 4.3,
      reviewCount: 32,
      image: "/img_clothes/dongPhucHocSinh/1.jpg",
      hoverImage: "/img_clothes/dongPhucHocSinh/2.jpg"
    },
    {
      id: 4,
      title: "Trang phục One Piece Boa Hancock",
      price: 950000,
      rating: 4.6,
      reviewCount: 15,
      image: "/img_clothes/anime/Boa Hancok One Piece (4)-min.jpg",
      hoverImage: "/img_clothes/anime/Boa Hancok One Piece (6)-min (1).jpg"
    },
    {
      id: 5,
      title: "Trang phục cổ trang Việt Nam",
      price: 1100000,
      rating: 4.7,
      reviewCount: 22,
      image: "/img_clothes/coTrang/2f15ae551b1a2273725028f64955a607.jpg",
      hoverImage: "/img_clothes/coTrang/6243269c80ef4ead4e27a2b1bb317154.jpg"
    },
    {
      id: 6,
      title: "Trang phục Robot AI",
      price: 1400000,
      originalPrice: 1800000,
      discount: 24,
      rating: 4.9,
      reviewCount: 8,
      image: "/img_clothes/anime/robot AI bó sát (2)-min.jpg",
      hoverImage: "/img_clothes/anime/robot AI bó sát (3)-min.jpg"
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">☆</span>
      )
    }

    return stars
  }

  return (
    <section className="py-16 px-[30px] max-w-none mx-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900">
          Thuê nhiều nhất hiện tại
        </h2>
        <button className="flex items-center gap-2 px-6 py-3 text-black bg-white hover:text-white hover:bg-green-600 rounded-full transition-all duration-300 group border border-gray-300 hover:border-green-600">
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
        {products.map((product) => (
          <div 
            key={product.id}
            className="group cursor-pointer bg-white rounded-lg transition-all duration-300 overflow-hidden relative w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(16.666%-20px)] p-3 border border-transparent hover:border-gray-200"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Product Image */}
            <div className="relative aspect-[3/4]  bg-gray-100">
              {product.discount && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                  -{product.discount}%
                </div>
              )}
              <Image
                src={hoveredProduct === product.id && product.hoverImage ? product.hoverImage : product.image}
                alt={product.title}
                fill
                className="object-cover rounded-md transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 16.67vw"
              />
              
               {/* Rating Overlay */}
               <div className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white bg-opacity-95 px-3 py-1 rounded-full  z-10">
                <div className="flex">
                  {renderStars(product.rating)}
                </div>
                <span className="text-xs text-gray-700 ml-1 font-medium">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Tooltip>
                  <TooltipTrigger>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#027a36] [&:hover>svg]:text-white">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Thêm vào yêu thích</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#027a36] [&:hover>svg]:text-white">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem chi tiết</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-3 line-clamp-1">
                {product.title}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button - Hidden by default, shown on hover */}
              <button className="w-full bg-green-600 hover:bg-black text-white font-medium py-2 px-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                + Thêm giỏ hàng
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CurrentSellClothes