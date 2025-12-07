import React from 'react'
import Image from 'next/image'

const CateGories = () => {
  const categories = [
    {
      id: 1,
      name: "Các nước",
      svg: "/icon/svg1.svg"
    },
    {
      id: 2,
      name: "Đồng phục", 
      svg: "/icon/svg2.svg"
    },
    {
      id: 3,
      name: "Harry Potter",
      svg: "/icon/svg3.svg"
    },
    {
      id: 4,
      name: "Halloween",
      svg: "/icon/svg4.svg"
    },
    {
      id: 5,
      name: "Cổ tích",
      svg: "/icon/svg5.svg"
    },
    {
      id: 6,
      name: "Siêu nhân",
      svg: "/icon/svg6.svg"
    },
    {
      id: 7,
      name: "Cổ trang",
      svg: "/icon/svg7.svg"
    },
    {
      id: 8,
      name: "Anime",
      svg: "/icon/svg8.svg"
    }
  ]

  return (
    <div className="py-16 px-[30px]" style={{backgroundColor: '#f9f5f0'}}>
        <div className='flex justify-between items-center mb-12'>
            <h1 className="text-4xl font-bold text-gray-900">Danh mục hàng đầu</h1>
            <button className="flex items-center gap-2 px-6 py-3 text-black bg-[#f9f5f0] hover:text-white hover:bg-green-600 rounded-full transition-all duration-300 group border border-gray-300 hover:border-green-600 cursor-pointer">
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