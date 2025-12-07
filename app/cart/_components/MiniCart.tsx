'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useCart } from '@/store/useCartStore'

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
}

const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, totalItems, removeItem, clearCart } = useCart()
  const router = useRouter()
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    // reset closing state when opened
    if (isOpen) setClosing(false)
  }, [isOpen])

  if (!isOpen && !closing) return null

  const animatedClose = () => {
    // trigger brighten / slide-out animation then call onClose after duration
    setClosing(true)
    // match transition duration used in classes (300ms)
    setTimeout(() => {
      onClose()
      setClosing(false)
    }, 300)
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        onClick={animatedClose}
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: '#000000',
          // reduce opacity so overlay is dimmer (more transparent)
          opacity: closing ? 0 : 0.7,
          transition: 'opacity 300ms ease'
        }}
      />

      {/* Mini Cart - không có overlay, chỉ có shadow */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 ${closing ? 'translate-x-96' : 'translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Giỏ hàng</h2>
          <button
            onClick={animatedClose}
            aria-label="Đóng giỏ hàng"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={32} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Giỏ hàng của bạn đang trống</p>
              <Link href="/product" onClick={onClose}>
                <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      animatedClose()
                      setTimeout(() => router.push(`/product/${item.id}`), 200)
                    }
                  }}
                  onClick={() => {
                    // start close animation and navigate shortly after so user sees transition
                    animatedClose()
                    setTimeout(() => router.push(`/product/${item.id}`), 200)
                  }}
                  className="group flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-shadow duration-150"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                    <h3 className="text-sm font-medium text-green-600 truncate transition-colors duration-150 group-hover:text-green-700 group-hover:underline">
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
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                        aria-label={`Xóa ${item.name} khỏi giỏ`}
                        className="text-base font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Nút xóa tất cả */}
              {items.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  clearCart();
                }}
                className="w-full py-2 px-4 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Xóa tất cả
              </button>
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
              <Link href="/cart" onClick={animatedClose}>
                <button className="w-full py-2 px-4 rounded-full font-medium transition-all duration-300 text-gray-800 hover:text-white bg-[#f9f5f0] hover:bg-green-600 group relative overflow-hidden cursor-pointer">
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
                  animatedClose()
                }}
                className="w-full py-2 px-4 rounded-full font-medium transition-colors duration-300 bg-green-600 text-white hover:bg-black mt-4 cursor-pointer shadow"
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
