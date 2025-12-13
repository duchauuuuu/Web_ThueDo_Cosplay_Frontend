"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { ProductCardProps } from "@/types";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  hoverImage,
  discount,
  className,
  onAddToCart,
  onFavorite,
  onView,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const renderStars = (value: number) => {
    const stars = [];
    const full = Math.floor(value);
    const half = value % 1 !== 0;
    for (let i = 0; i < full; i++) stars.push(<span key={`f-${i}`} className="text-yellow-400">★</span>);
    if (half) stars.push(<span key="h" className="text-yellow-400">☆</span>);
    const empty = 5 - Math.ceil(value);
    for (let i = 0; i < empty; i++) stars.push(<span key={`e-${i}`} className="text-gray-300">☆</span>);
    return stars;
  };

  return (
    <div
      className={clsx(
        "group cursor-pointer bg-white rounded-lg transition-all duration-300 overflow-hidden relative p-3 border border-transparent hover:border-gray-200",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView?.(id)}
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        {discount ? (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            -{discount}%
          </div>
        ) : null}

        <Image
          src={hovered && hoverImage ? hoverImage : image}
          alt={title}
          fill
          className="object-cover rounded-md transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 16.67vw"
        />

        <div className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white/95 px-3 py-1 rounded-full z-10">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-xs text-gray-700 ml-1 font-medium">({reviewCount})</span>
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            title="Thêm vào yêu thích"
            aria-label="Thêm vào yêu thích"
            onClick={(e) => { e.stopPropagation(); onFavorite?.(id); }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#027a36] [&:hover>svg]:text-white cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            title="Xem chi tiết"
            aria-label="Xem chi tiết"
            onClick={(e) => { e.stopPropagation(); onView?.(id); }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#027a36] [&:hover>svg]:text-white cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-1">{title}</h3>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-green-600">{formatPrice(price)}</span>
          {originalPrice ? (
            <span className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}</span>
          ) : null}
        </div>

        <button
          className="w-full bg-green-600 hover:bg-black text-white font-medium py-2 px-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onAddToCart?.(id); }}
        >
          <ShoppingCart size={18} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

export default ProductCard;

