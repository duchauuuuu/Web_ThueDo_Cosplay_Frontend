import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button'

const DeXuat = () => {
  const products = [
    {
      id: 1,
      productImage: '/img_clothes/anime/Shenhe-Cosplay-1.jpg',
      backgroundImage: '/imgDeXuat/1.jpg',
      category: 'Anime Cosplay',
      title: 'ANIME COLLECTION'
    },
    {
      id: 2,
      productImage: '/img_clothes/coTrang/chup-anh-co-trang__19__a149e2bce3964e148f53715104946b15.jpg',
      backgroundImage: '/imgDeXuat/2.jpg',
      category: 'Cổ Trang',
      title: 'TRADITIONAL COSTUME'
    },
    {
      id: 3,
      productImage: '/img_clothes/dongPhucHocSinh/đồng phục nữ sinh hàn quốc (1)-min.jpg',
      backgroundImage: '/imgDeXuat/3.jpg',
      category: 'Đồng Phục Học Sinh',
      title: 'SCHOOL UNIFORM'
    }
  ]

  return (
    <div className='container mx-auto px-4 py-12'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {products.map((product) => (
          <div 
            key={product.id} 
            className="relative rounded-xl overflow-hidden h-[280px]"
          >
            {/* Background Image */}
            <div className='absolute inset-0'>
              <Image
                src={product.backgroundImage}
                alt={`${product.title} background`}
                fill
                className='object-cover'
              />
            </div>
            
            {/* Dark overlay for better text readability */}
            <div className='absolute inset-0 bg-black/40'></div>

            {/* Flex container cho ảnh và nội dung - layout ngang */}
            <div className='flex flex-row h-full relative z-10 items-center'>
              {/* Khối ảnh bên trái */}
              <div className='flex-shrink-0 p-6'>
                <div className='w-28 h-36 relative overflow-hidden rounded-lg shadow-2xl transform perspective-1000 rotate-y-12 hover:scale-110 transition-transform duration-300' style={{transform: 'perspective(1000px) rotateY(-15deg)'}}>
                  <Image
                    src={product.productImage}
                    alt={product.title}
                    fill
                    className='object-cover'
                  />
                </div>
              </div>
              
              {/* Khối nội dung bên phải */}
              <div className='flex-1 px-4 py-6 flex flex-col justify-center text-white'>
                <p className='text-sm font-medium mb-3 opacity-80 text-cyan-400'>
                  {product.category}
                </p>
                <h1 className='text-xl md:text-2xl font-bold leading-tight'>
                  {product.title}
                </h1>
              </div>
            </div>
            
            {/* Button Shop Now ở góc dưới phải */}
            <Button 
              className='absolute bottom-4 right-4 bg-white/90 hover:bg-white text-black font-medium px-3 py-1.5 text-sm rounded-full border-0 transition-all duration-300 hover:scale-105'
            >
              Shop Now
              <svg 
                className='ml-1.5 w-3 h-3' 
                fill='none' 
                stroke='currentColor' 
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeXuat