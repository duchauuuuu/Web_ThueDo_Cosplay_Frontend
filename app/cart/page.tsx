'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/store/useCartStore'

const CartPage = () => {
  const { 
    items: cartItems, 
    subtotal, 
    updateQuantity: updateCartQuantity, 
    removeItem, 
    calculateItemTotal, 
    calculateItemSavings,
    clearCart 
  } = useCart()

  const updateQuantity = (id: number, change: number) => {
    const currentItem = cartItems.find(item => item.id === id)
    if (currentItem) {
      const newQuantity = Math.max(1, currentItem.quantity + change)
      updateCartQuantity(id, newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
     

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Cart Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Table Header */}
          <div className="bg-green-600 text-white grid grid-cols-12 gap-4 px-6 py-4 font-bold text-xl">
            <div className="col-span-1 border-r border-white/30 pr-4">Sản phẩm</div>
            <div className="col-span-7 border-r border-white/30 px-6">Chi tiết</div>
            <div className="col-span-4 text-center pl-6">Tổng</div>
          </div>

          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-xl mb-6">Giỏ hàng của bạn đang trống</p>
              <Link href="/product">
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 cursor-pointer">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-6 border-b border-gray-200 items-start">
                {/* Product */}
                <div className="col-span-1 flex items-start border-r border-gray-200 pr-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="col-span-7 border-r border-gray-200 px-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-green-700 mb-2 cursor-pointer hover:underline transition-all" style={{ textUnderlineOffset: '3px' }}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through text-base">
                        {item.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-gray-800 font-semibold text-base">
                        {item.salePrice.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                  
                  {/* Quantity Controls and Remove */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-0 bg-green-700 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-2 text-white cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-16 py-2 text-white font-semibold text-lg text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-2 text-white cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-green-700 hover:text-gray-500 transition-colors text-sm font-medium relative group cursor-pointer"
                    >
                      <span className="relative">
                        Xóa sản phẩm
                        <span className="absolute left-1/2 bottom-[-7px] w-full h-[1px] bg-green-700 -translate-x-1/2 group-hover:w-0 transition-all duration-300 ease-in-out"></span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-4 pl-6 flex items-center justify-center">
                  {/* Price and Savings */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {calculateItemTotal(item).toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-red-500 font-bold text-sm">
                      TIẾT KIỆM {calculateItemSavings(item).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear Cart Button */}
        {cartItems.length > 0 && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => clearCart()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={18} />
              Xóa tất cả sản phẩm
            </button>
          </div>
        )}

        {/* Cart Totals */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="font-bold text-2xl text-center">Tổng giỏ hàng</h2>
            </div>

            <div className="p-6">
              {/* Subtotal */}
              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="text-gray-700 font-semibold text-lg">Tạm tính</span>
                <span className="text-gray-800 font-bold text-xl">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-6">
                <span className="text-green-700 font-bold text-2xl">Tổng cộng</span>
                <span className="text-green-700 font-bold text-3xl">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="mt-8 flex justify-start">
            <button className="bg-green-700 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-black transition-colors shadow-lg uppercase tracking-wide cursor-pointer">
              Thanh toán
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage