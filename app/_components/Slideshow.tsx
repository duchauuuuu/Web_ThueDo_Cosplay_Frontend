"use client"
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'

const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { theme } = useTheme()

  const slides = [
    {
      id: 1,
      subtitle: "Bộ sưu tập cổ trang mới nhất.",
      title: "THẾ GIỚI CỦA\nTRANG PHỤC CỔ TRANG",
      description: "Thuê ngay các trang phục cổ trang đẹp nhất với giá ưu đãi 15%.",
      bgColor: {
        light: "from-blue-200 via-purple-100 to-yellow-100",
        dark: "from-blue-900 via-purple-900 to-gray-800"
      },
      discount: "15%",
      discountColor: "from-orange-400 to-red-500",
      images: [
        "/img_clothes/coTrang/ad2968417d9ba21effc2bcf68ee9f506.jpg",
        "/img_clothes/coTrang/2f15ae551b1a2273725028f64955a607.jpg"
      ],
      decorativeShape: "M102.497 517.5C-31.9027 620.3 -5.836 754.333 23.9973 808.5L1212 845L1187.5 -39H528.997C415.497 -18 339.497 125.5 321.497 249C303.497 372.5 270.497 389 102.497 517.5Z"
    },
    {
      id: 2,
      subtitle: "Hóa thân thành nhân vật yêu thích.",
      title: "TRANG PHỤC CỔ TÍCH\nVÀ HÓA THÂN\nCÔNG CHÚA",
      description: "Khám phá bộ sưu tập trang phục cổ tích với ưu đãi lên tới 20%",
      bgColor: {
        light: "from-teal-200 via-blue-100 to-green-100",
        dark: "from-teal-900 via-slate-800 to-emerald-900"
      },
      discount: "20%",
      discountColor: "from-green-400 to-emerald-500",
      images: [
        "/img_clothes/coTich/92ffb19f91216e9b0efe8f276e159bac.jpg",
        "/img_clothes/coTich/4931f28604c685d4f18be7cae63cd165.jpg"
      ],
      decorativeShape: "M102.497 517.5C-31.9027 620.3 -5.836 754.333 23.9973 808.5L1212 845L1187.5 -39H528.997C415.497 -18 339.497 125.5 321.497 249C303.497 372.5 270.497 389 102.497 517.5Z"
    },
    {
      id: 3,
      subtitle: "Cosplay như thần tượng anime.",
      title: "TRANG PHỤC ANIME\nVÀ MANGA\nCHẤT LƯỢNG CAO",
      description: "Bộ sưu tập trang phục anime độc quyền với ưu đãi đặc biệt 25%",
      bgColor: {
        light: "from-pink-200 via-purple-100 to-blue-100",
        dark: "from-pink-900 via-purple-900 to-slate-800"
      },
      discount: "25%",
      discountColor: "from-purple-400 to-pink-500",
      images: [
        "/img_clothes/anime/1.png",
        "/img_clothes/anime/2.png"
      ],
      decorativeShape: "M102.497 517.5C-31.9027 620.3 -5.836 754.333 23.9973 808.5L1212 845L1187.5 -39H528.997C415.497 -18 339.497 125.5 321.497 249C303.497 372.5 270.497 389 102.497 517.5Z"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides.length, currentSlide]) // Thêm currentSlide vào dependency để reset timer

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${
            theme === 'dark' 
              ? slides[currentSlide].bgColor.dark 
              : slides[currentSlide].bgColor.light
          }`}
        >
          {/* Background decorative shape */}
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute bottom-0 right-0 w-full h-full"
              viewBox="0 0 1040 670"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={slides[currentSlide].decorativeShape}
                fill={theme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)"}
              />
            </svg>
          </div>

          <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className={`text-lg font-medium ${
                    theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                  }`}
                >
                  {slides[currentSlide].subtitle}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`text-4xl lg:text-6xl font-bold leading-tight whitespace-pre-line ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {slides[currentSlide].title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className={`text-lg max-w-md ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {slides[currentSlide].description}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700' 
                      : 'bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Khám Phá Ngay
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>

              {/* Right Content - Images */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative flex justify-center items-center"
              >
                {/* Discount Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 1.2, type: "spring" }}
                  className="absolute top-8 left-8 z-20"
                >
                  <div className={`bg-gradient-to-r ${slides[currentSlide].discountColor} text-white rounded-full w-24 h-24 flex items-center justify-center font-bold shadow-lg transform rotate-12`}>
                    <div className="text-center">
                      <div className="text-xl font-bold">{slides[currentSlide].discount}</div>
                      <div className="text-sm">OFF</div>
                    </div>
                  </div>
                </motion.div>

                {/* Images Container - Layout giống ảnh mẫu */}
                <div className="relative w-full max-w-2xl">
                  {/* Background decorative elements */}
                  <div className={`absolute inset-0 rounded-3xl transform -rotate-1 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-yellow-600/10 via-transparent to-transparent' 
                      : 'bg-gradient-to-r from-yellow-200/30 via-transparent to-transparent'
                  }`}></div>
                  
                  {/* Main images layout */}
                  <div className="relative grid grid-cols-2 gap-6 p-8">
                    {slides[currentSlide].images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ 
                          opacity: 0, 
                          y: 60, 
                          rotate: index % 2 === 0 ? -8 : 8,
                          scale: 0.8
                        }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          rotate: index % 2 === 0 ? -3 : 3,
                          scale: 1
                        }}
                        transition={{ 
                          duration: 0.8, 
                          delay: 0.6 + index * 0.3,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.05, 
                          rotate: 0,
                          zIndex: 10
                        }}
                        className={`relative ${index === 0 ? 'z-10' : 'z-5'}`}
                        style={{
                          transform: index === 1 ? 'translateY(-20px)' : 'translateY(20px)'
                        }}
                      >
                        <div className={`p-3 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}>
                          <Image
                            src={image}
                            alt={`Slide ${currentSlide + 1} - Image ${index + 1}`}
                            width={280}
                            height={400}
                            className="rounded-xl object-cover w-full h-[400px]"
                          />
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-pink-400 rounded-full opacity-40"></div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional decorative floating elements */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-blue-400/30 rounded-full"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                    className="absolute bottom-8 right-12 w-6 h-6 bg-purple-400/40 rounded-full"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.1, duration: 0.5 }}
                    className="absolute top-16 left-4 w-5 h-5 bg-green-400/35 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? (theme === 'dark' ? 'bg-teal-400 scale-125' : 'bg-teal-600 scale-125')
                : (theme === 'dark' ? 'bg-gray-400/60 hover:bg-gray-300/80' : 'bg-white/60 hover:bg-white/80')
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  )
}

export default Slideshow