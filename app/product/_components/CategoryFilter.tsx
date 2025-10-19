"use client"

import Image from "next/image"

interface Category {
  name: string
  count: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onSelectCategory(selectedCategory === category.name ? null : category.name)}
          className={`group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
            selectedCategory === category.name
              ? "bg-[#FF6B6B] text-white"
              : "bg-white text-[#2d2d2d] hover:bg-[#102937] hover:text-white border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <Image 
              src="/assets/svg/chanmeo.svg" 
              alt="Category icon" 
              width={18} 
              height={18}
              className={`transition-all duration-300 ${
                selectedCategory === category.name 
                  ? "brightness-0 invert" 
                  : "brightness-0 group-hover:brightness-0 group-hover:invert"
              }`}
            />
            <span className="font-medium">{category.name}</span>
          </div>
          <span className="text-sm opacity-75">({category.count})</span>
        </button>
      ))}
    </div>
  )
}
