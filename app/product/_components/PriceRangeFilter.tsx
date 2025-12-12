"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PriceRangeFilterProps } from "@/types"

export default function PriceRangeFilter({ priceRange, onPriceChange, maxPrice = 10000000, minPrice = 0 }: PriceRangeFilterProps) {
  const [localRange, setLocalRange] = useState<[number, number]>([Math.round(priceRange[0]), Math.round(priceRange[1])])

  useEffect(() => {
    setLocalRange([Math.round(priceRange[0]), Math.round(priceRange[1])])
  }, [priceRange])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value)
    const val = Math.round(raw / 50000) * 50000
    const newMin = Math.max(0, Math.min(val, localRange[1] - 50000))
    const roundedMax = Math.round(localRange[1] / 50000) * 50000
    setLocalRange([newMin, roundedMax])
    onPriceChange([newMin, roundedMax])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value)
    const val = Math.round(raw / 50000) * 50000
    const newMax = Math.min(maxPrice, Math.max(val, localRange[0] + 50000))
    const roundedMin = Math.round(localRange[0] / 50000) * 50000
    setLocalRange([roundedMin, newMax])
    onPriceChange([roundedMin, newMax])
  }

  return (
    <div className="space-y-6">
      {/* Range Slider */}
      <div className="relative pt-2">
        <div className="relative h-2 rounded-full bg-gray-200">
          <div
            className="absolute h-2 rounded-full bg-black"
            style={{
              left: `${Math.round((localRange[0] / maxPrice) * 100)}%`,
              right: `${Math.round(100 - (localRange[1] / maxPrice) * 100)}%`,
            }}
          />
        </div>

        {/* Min Slider */}
        <input
          type="range"
          min="0"
          max={maxPrice}
          step={50000}
          value={localRange[0]}
          onChange={handleMinChange}
          className="pointer-events-none absolute top-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6B6B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF6B6B] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
        />

        {/* Max Slider */}
        <input
          type="range"
          min="0"
          max={maxPrice}
          step={50000}
          value={localRange[1]}
          onChange={handleMaxChange}
          className="pointer-events-none absolute top-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6B6B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF6B6B] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Price Display */}
        {/* Price Display - fixed columns so the dash doesn't move */}
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <div className="w-36 text-left overflow-hidden whitespace-nowrap">
            {Math.round(localRange[0]).toLocaleString('vi-VN')}₫
          </div>
          <div className="w-6 text-center text-gray-500">—</div>
          <div className="w-36 text-right overflow-hidden whitespace-nowrap">
            {Math.round(localRange[1]).toLocaleString('vi-VN')}₫
          </div>
        </div>

      {/* Filter Button */}
  <button className="w-full rounded-full bg-[#FF6B6B] px-6 py-3 font-semibold text-white hover:bg-[#102937] hover:text-white transition-colors cursor-pointer">
        Lọc
      </button>
    </div>
  )
}
