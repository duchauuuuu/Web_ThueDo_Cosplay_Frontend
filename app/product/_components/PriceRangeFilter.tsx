"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface PriceRangeFilterProps {
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  maxPrice?: number
  minPrice?: number
}

export default function PriceRangeFilter({ priceRange, onPriceChange, maxPrice = 10000000, minPrice = 0 }: PriceRangeFilterProps) {
  const [localRange, setLocalRange] = useState(priceRange)

  useEffect(() => {
    setLocalRange(priceRange)
  }, [priceRange])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(0, Math.min(Number(e.target.value), localRange[1] - 50000))
    setLocalRange([newMin, localRange[1]])
    onPriceChange([newMin, localRange[1]])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.min(maxPrice, Math.max(Number(e.target.value), localRange[0] + 50000))
    setLocalRange([localRange[0], newMax])
    onPriceChange([localRange[0], newMax])
  }

  return (
    <div className="space-y-6">
      {/* Range Slider */}
      <div className="relative pt-2">
        <div className="relative h-2 rounded-full bg-gray-200">
          <div
            className="absolute h-2 rounded-full bg-black"
            style={{
              left: `${(localRange[0] / maxPrice) * 100}%`,
              right: `${100 - (localRange[1] / maxPrice) * 100}%`,
            }}
          />
        </div>

        {/* Min Slider */}
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={localRange[0]}
          onChange={handleMinChange}
          className="pointer-events-none absolute top-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6B6B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF6B6B] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
        />

        {/* Max Slider */}
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={localRange[1]}
          onChange={handleMaxChange}
          className="pointer-events-none absolute top-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6B6B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF6B6B] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Price Display */}
      <div className="text-sm text-gray-600">
        Giá: {localRange[0].toLocaleString('vi-VN')}₫ — {localRange[1].toLocaleString('vi-VN')}₫
      </div>

      {/* Filter Button */}
      <button className="w-full rounded-full bg-[#FF6B6B] px-6 py-3 font-semibold text-white hover:bg-[#102937] hover:text-white transition-colors">
        Lọc
      </button>
    </div>
  )
}
