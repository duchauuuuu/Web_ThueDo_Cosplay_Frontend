"use client"

import React from 'react'
import ProductCard from './ProductCard'
import { ProductItem } from '@/types'

const CurrentSellClothes = () => {

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

  return (
    <section className="py-16 px-[30px] max-w-none mx-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900">
          Thuê nhiều nhất hiện tại
        </h2>
  <button className="flex items-center gap-2 px-6 py-3 text-black bg-white hover:text-white hover:bg-green-600 rounded-full transition-all duration-300 group border border-gray-300 hover:border-green-600 cursor-pointer">
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
          <ProductCard
            key={product.id}
            {...product}
            className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(16.666%-20px)]"
          />
        ))}
      </div>
    </section>
  )
}

export default CurrentSellClothes