'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useCart } from '@/store/useCartStore'

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
}

const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, totalItems, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <>      
      {/* Mini Cart - không có overlay, chỉ có shadow */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Giỏ hàng</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Giỏ hàng của bạn đang trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Nhà bán:</span>
                      <span className="text-xs text-gray-600">HAUCOSPLAY</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-800">
                          {item.quantity} ×
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {item.salePrice.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-800">Tạm tính:</span>
              <span className="text-lg font-semibold text-green-600">
                {subtotal.toLocaleString('vi-VN')}₫
              </span>
            </div>

            {/* Action Buttons */}
            <div>
              <Link href="/cart" onClick={onClose}>
                <button className="w-full py-2 px-4 rounded-md font-medium transition-all duration-300 text-gray-800 hover:text-white bg-[#f9f5f0] hover:bg-green-600 group relative overflow-hidden">
                  <span className="relative overflow-hidden block h-6">
                    <span className="absolute inset-0 flex items-center justify-center transform transition-transform duration-300 group-hover:-translate-y-full">
                      Xem giỏ hàng
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      Xem giỏ hàng
                    </span>
                  </span>
                </button>
              </Link>
              <button 
                onClick={() => {
                 
                }}
                className="w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 bg-green-600 text-white hover:bg-black mt-4"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MiniCart
