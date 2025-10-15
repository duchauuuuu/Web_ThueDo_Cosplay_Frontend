import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

const DeXuat = () => {
  const products = [
    {
      id: 1,
      productImage: '/img_clothes/anime/Shenhe-Cosplay-1.jpg',
      backgroundImage: '/imgDeXuat/1.jpg',
      category: 'Anime Cosplay',
      title: 'Bộ sưu tập Anime',
      categoryColor: '#11b6ca'
    },
    {
      id: 2,
      productImage: '/img_clothes/coTrang/chup-anh-co-trang__19__a149e2bce3964e148f53715104946b15.jpg',
      backgroundImage: '/imgDeXuat/2.jpg',
      category: 'Cổ Trang',
      title: 'Bộ sưu tập cổ trang',
      categoryColor: '#fcf9c4'
    },
    {
      id: 3,
      productImage: '/img_clothes/dongPhucHocSinh/đồng phục nữ sinh hàn quốc (1)-min.jpg',
      backgroundImage: '/imgDeXuat/3.jpg',
      category: 'Đồng Phục Học Sinh',
      title: 'Bộ sưu tập học sinh',
      categoryColor: '#86e751'
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
            <div className='flex flex-row h-full relative z-10 items-center py-[30px]'>
              {/* Khối ảnh bên trái */}
              <div className='flex-shrink-0 p-6'>
                <div className='w-36 h-44 relative overflow-hidden rounded-lg shadow-2xl hover:scale-110 transition-transform duration-300'>
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
                <p className='text-sm font-medium mb-3 opacity-80' style={{color: product.categoryColor}}>
                  {product.category}
                </p>
                <h1 className='text-xl md:text-2xl font-bold leading-tight'>
                  {product.title}
                </h1>
              </div>
            </div>
            
            {/* Button Shop Now ở góc dưới phải */}
            <div className="absolute bottom-4 right-4 z-20">
              <Button 
                size="sm"
                className='bg-white text-black hover:bg-green-600 hover:text-white font-semibold px-6 py-2 text-sm rounded-full group transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden'
              >
              <span className="flex items-center">
                <span className="relative overflow-hidden">
                  <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">
                    Mua ngay
                  </span>
                  <span className="absolute top-0 left-0 block transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    Mua ngay
                  </span>
                </span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeXuat