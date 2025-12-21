"use client"

import React, { useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSWRFetch } from '@/app/hooks/useSWRFetch'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

interface BackendCategory {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
}

const CateGories = () => {
  const router = useRouter()
  
  // Fetch categories từ backend
  const { data: backendCategories } = useSWRFetch<BackendCategory[]>(`${API_URL}/categories`)

  // Hardcoded categories với icon
  const categoriesWithIcons = [
    { name: "Các nước", svg: "/icon/svg1.svg" },
    { name: "Đồng phục", svg: "/icon/svg2.svg" },
    { name: "Harry Potter", svg: "/icon/svg3.svg" },
    { name: "Halloween", svg: "/icon/svg4.svg" },
    { name: "Cổ tích", svg: "/icon/svg5.svg" },
    { name: "Siêu nhân", svg: "/icon/svg6.svg" },
    { name: "Cổ trang", svg: "/icon/svg7.svg" },
    { name: "Anime", svg: "/icon/svg8.svg" }
  ]

  // Merge backend categories với icons
  const categories = useMemo(() => {
    if (!backendCategories) return []
    
    return categoriesWithIcons.map(catWithIcon => {
      const backendCat = backendCategories.find(bc => bc.name === catWithIcon.name)
      return {
        id: backendCat?.id || '',
        name: catWithIcon.name,
        svg: catWithIcon.svg,
        isActive: backendCat?.isActive || false
      }
    }).filter(cat => cat.id && cat.isActive) // Chỉ hiện categories có trong backend và đang active
  }, [backendCategories])

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/product?categoryId=${categoryId}`)
  }

  const handleViewAll = () => {
    router.push('/product')
  }

  return (
    <div className="py-16 px-[30px]" style={{backgroundColor: '#f9f5f0'}}>
        <div className='flex justify-between items-center mb-12'>
            <h1 className="text-4xl font-bold text-gray-900">Danh mục hàng đầu</h1>
            <button 
              onClick={handleViewAll}
              className="flex items-center gap-2 px-6 py-3 text-black bg-[#f9f5f0] hover:text-white hover:bg-green-600 rounded-full transition-all duration-300 group border border-gray-300 hover:border-green-600 cursor-pointer"
            >
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
        <div className='flex flex-wrap gap-6 justify-center lg:justify-between'>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="flex flex-col items-center p-8 bg-transparent hover:bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group min-w-[160px] flex-1 max-w-[180px]"
            >
              {/* Icon */}
              <div className="mb-6  transition-transform duration-300">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <Image 
                    src={category.svg} 
                    alt={category.name} 
                    width={64} 
                    height={64} 
                    className="w-16 h-16  transition-all duration-300" 
                  />
                </div>
              </div>
              
              {/* Category Name */}
              <h3 className="text-gray-700 font-medium text-center transition-colors duration-300">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
    </div>
  )
}

export default CateGories