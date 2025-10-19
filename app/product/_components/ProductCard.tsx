"use client"

import { ShoppingCart, Star, Heart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  petId: string
  name: string
  price: number
  discountPrice?: number
  rating?: number
  image: string
  isSale?: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const rating = product.rating || 4 // Default rating
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/pets/${product.petId}`)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking buy now
    router.push(`/pets/${product.petId}`)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking add to cart
    onAddToCart()
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group rounded-2xl bg-[#fff0f0] p-4 shadow-lg hover:shadow-xl hover:bg-[#FF6B6B] transition-all duration-300 relative cursor-pointer"
    >
      {/* Heart Icon - appears on hover */}
      <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer">
        <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-md hover:bg-[#102937] transition-colors duration-300">
          <Heart size={18} className="text-white" />
        </div>
      </div>

      {/* Shopping Cart Icon - appears on hover */}
      <div 
        className="absolute top-6 left-18 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
        onClick={handleAddToCart}
      >
        <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center shadow-md hover:bg-[#102937] transition-colors duration-300">
          <ShoppingCart size={18} className="text-white" />
        </div>
      </div>

      {/* Image Container */}
      <div className="relative mb-4 overflow-hidden rounded-xl bg-[#F5E6D3]">
        <Image
          src={product.image || "/assets/imgs/imgPet/animal-8165466_1280.jpg"}
          alt={product.name}
          width={300}
          height={256}
          className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {(product.discountPrice || product.isSale) && (
          <div className="absolute right-3 top-3 rounded-full bg-[#FF6B6B] px-3 py-1 text-xs font-bold text-white">
            GIẢM GIÁ
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 group-hover:text-white"}
          />
        ))}
      </div>

      {/* Product Name */}
      <h3 className="mb-2 font-bold text-[#2d2d2d] group-hover:text-white text-lg line-clamp-2 transition-colors duration-300">{product.name}</h3>

      {/* Price */}
      <div className="mb-4 flex items-center gap-2">
        {product.discountPrice ? (
          <>
            <span className="text-[#2d2d2d] group-hover:text-white font-bold text-xl transition-colors duration-300">{product.discountPrice.toLocaleString('vi-VN')}₫</span>
            <span className="text-gray-400 group-hover:text-white line-through text-sm transition-colors duration-300">{product.price.toLocaleString('vi-VN')}₫</span>
          </>
        ) : (
          <span className="text-[#2d2d2d] group-hover:text-white font-bold text-xl transition-colors duration-300">{product.price.toLocaleString('vi-VN')}₫</span>
        )}
      </div>

      {/* Buy Now Button */}
      <button 
        onClick={handleBuyNow}
        className="w-full bg-[#FF6B6B] group-hover:bg-[#102937] text-white py-3 px-4 rounded-lg transition-colors duration-300 font-semibold cursor-pointer hover:cursor-pointer"
      >
        Mua ngay
      </button>
    </div>
  )
}
