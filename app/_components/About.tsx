import React from 'react'
import { Package, Gift, BadgePercent, Store } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Package,
      title: 'GIAO HÀNG NHANH',
      description: 'Miễn phí vận chuyển tiêu chuẩn'
    },
    {
      icon: Gift,
      title: 'GIÁ TỐT & ƯU ĐÃI',
      description: 'Nhiều lựa chọn quà tặng hấp dẫn'
    },
    {
      icon: BadgePercent,
      title: 'ƯU ĐÃI MỖI NGÀY',
      description: 'Đơn hàng từ 500.000đ trở lên'
    },
    {
      icon: Store,
      title: 'NHẬN TẠI CỬA HÀNG',
      description: 'Kiểm tra địa chỉ cửa hàng ngay'
    }
  ]

  return (
    <section className='w-full py-16 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-2  lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className='flex flex-col items-center text-center gap-4 p-6 rounded-lg group'
              >
                {/* Icon */}
                <div className='w-16 h-16 flex items-center justify-center'>
                  <Icon className='w-12 h-12 text-gray-700 stroke-[1.5] group-hover:text-green-600 transition-colors duration-300' />
                </div>
                
                {/* Title */}
                <h3 className='text-sm font-bold tracking-wider text-gray-900 uppercase group-hover:text-green-600 transition-colors duration-300'>
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className='text-sm text-gray-500 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default About