'use client'

import React from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useFavorite } from '@/store/useFavoriteStore'
import { useCart } from '@/store/useCartStore'
import Link from 'next/link'

const FavoritesPage = () => {
  const { 
    items, 
    totalItems,
    removeItem,
    formatAddedDate 
  } = useFavorite()

  const { addItem: addToCart, isInCart } = useCart()

  const handleRemoveItem = (petId: string) => {
    removeItem(petId)
  }

  const handleAddToCart = (item: typeof items[0]) => {
    const cartItem = {
      pet: item.pet,
      quantity: 1,
      img: item.img
    }
    addToCart(cartItem)
  }

  return (
    <div className="min-h-screen bg-white">
        {/* Favorites Title */}
        <div className="relative py-24">
          <div className="absolute inset-0">
            <Image 
              src="/assets/imgs/imgBackgroundTitle/bc-blog-listing.jpg"
              alt="Favorites Background"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 
              className="text-center font-bold text-6xl text-white drop-shadow-lg"
            >
              Danh sách yêu thích
            </h1>
          </div>
        </div>

      {items.length === 0 ? (
        // Empty favorites - hiển thị SVG và text
        <div className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="flex flex-col items-center justify-center">
            {/* Heart Icon */}
            <div className="mb-8">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="120" 
                height="120" 
                fill="none"
                className="text-[#A0694B]"
                viewBox="0 0 24 24"
              >
                <path 
                  fill="currentColor" 
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  opacity="0.3"
                />
              </svg>
            </div>
            
            {/* Empty Favorites Text */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-600 mb-4">Danh sách yêu thích trống</h2>
              <p className="text-gray-500 text-lg mb-8">Bạn chưa có thú cưng nào trong danh sách yêu thích</p>
              <Link href="/pets">
                <button className="bg-[#7B4F35] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#A0694B] transition-colors shadow-lg">
                  Khám phá thú cưng
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Favorites có sản phẩm
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Favorites Count */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#7B4F35]">
              {totalItems} thú cưng trong danh sách yêu thích
            </h2>
          </div>

          {/* Favorites Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Table Header */}
            <div className="bg-[#7B4F35] text-white grid grid-cols-12 gap-4 px-6 py-4 font-bold text-xl">
              <div className="col-span-1 pr-6 whitespace-nowrap">Sản phẩm</div>
              <div className="col-span-7 border-l border-white/30 px-6">Chi tiết</div>
              <div className="col-span-4 text-center border-l border-white/30 pl-6">Thao tác</div>
            </div>

            {/* Favorites Items */}
            {items.map(item => {
              const pet = item.pet
              const currentPrice = pet.discountPrice || pet.price
              const hasDiscount = pet.discountPrice && pet.discountPrice < pet.price
              const alreadyInCart = isInCart(pet.petId)
              
              return (
                <div key={pet.petId} className="grid grid-cols-12 gap-4 px-6 py-6 border-b border-gray-200 items-start">
                  {/* Product Image */}
                  <div className="col-span-1 flex items-start pr-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative group">
                      <Image
                        src={item.img || pet.mainImageUrl || '/assets/imgs/placeholder.png'}
                        alt={pet.name}
                        width={80}
                        height={80}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="col-span-7 border-l border-gray-200 px-6 flex flex-col justify-between">
                    <div>
                      <Link href={`/pets/${pet.petId}`}>
                        <h3 className="text-xl font-bold text-[#7B4F35] mb-2 cursor-pointer hover:underline transition-all" style={{ textUnderlineOffset: '3px' }}>
                          {pet.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        {hasDiscount && (
                          <span className="text-gray-500 line-through text-base">
                            {pet.price.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                        <span className="text-gray-800 font-semibold text-lg">
                          {currentPrice.toLocaleString('vi-VN')}₫
                        </span>
                        {hasDiscount && pet.discountPrice && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            -{Math.round(((pet.price - pet.discountPrice) / pet.price) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {pet.categoryName && (
                          <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">
                            {pet.categoryName}
                          </span>
                        )}
                        {pet.gender && (
                          <span className="text-gray-600 text-sm">
                            • {pet.gender === 'MALE' ? 'Đực' : 'Cái'}
                          </span>
                        )}
                        {pet.status && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            pet.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                            pet.status === 'SOLD' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {pet.status === 'AVAILABLE' ? 'Còn hàng' : 
                             pet.status === 'SOLD' ? 'Đã bán' : 
                             'Đã đặt trước'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">
                        Thêm vào: {formatAddedDate(item.addedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-4 border-l border-gray-200 pl-6 flex flex-col items-center justify-center gap-3">
                    {/* Add to Cart Button */}
                    {alreadyInCart ? (
                      <Link href="/carts" className="w-full">
                        <button
                          className="w-full bg-gray-400 text-white px-6 py-3 rounded-full font-semibold text-base flex items-center justify-center gap-2 cursor-not-allowed"
                          disabled
                        >
                          <ShoppingCart size={18} />
                          Đã có trong giỏ
                        </button>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-[#7B4F35] text-white px-6 py-3 rounded-full font-semibold text-base hover:bg-[#C46C2B] transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Thêm vào giỏ
                      </button>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(pet.petId)}
                      className="w-full text-[#7B4F35] hover:text-red-500 transition-colors text-sm font-medium relative group flex items-center justify-center gap-2 py-2 border-2 border-[#7B4F35] hover:border-red-500 rounded-full"
                    >
                      <Heart size={16} className="fill-current" />
                      <span>Xóa khỏi yêu thích</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 justify-between items-center">
            <Link href="/pets">
              <button className="bg-white text-[#7B4F35] px-8 py-3 rounded-full font-semibold text-base hover:bg-gray-100 transition-colors shadow-md border-2 border-[#7B4F35]">
                Tiếp tục khám phá
              </button>
            </Link>
            
            <Link href="/carts">
              <button className="bg-[#7B4F35] text-white px-8 py-3 rounded-full font-semibold text-base hover:bg-[#C46C2B] transition-colors shadow-lg">
                Xem giỏ hàng
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage

