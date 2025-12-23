"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart, Sparkles, Shield, Shirt } from "lucide-react";

export default function AboutPage() {
  // const { data: services } = trpc.service.getAll.useQuery(); // Sử dụng khi có API
  
  // Gallery state và refs
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [userInteracting, setUserInteracting] = useState(false);
  
  // Danh sách ảnh từ thư mục img_clothes
  const galleryImages = [
    { src: "/img_clothes/coTich/c46d5df0999df54df2c6a65223c6eaa5.jpg", alt: "Trang phục cosplay 1" },
    { src: "/img_clothes/anime/37854368327e17567928ca168adb7f11.jpg", alt: "Trang phục cosplay 2" },
    { src: "/img_clothes/anime/8178677ac6e0e8a063e8a0468af6636d.jpg", alt: "Trang phục cosplay 3" },
    { src: "/img_clothes/anime/Shenhe-Cosplay-1.jpg", alt: "Trang phục cosplay 4" },
    { src: "/img_clothes/coTich/000aa6833cdc1c0415c4b11a8495510d.jpg", alt: "Trang phục cosplay 5" },
    { src: "/img_clothes/coTrang/2f15ae551b1a2273725028f64955a607.jpg", alt: "Trang phục cosplay 6" },
    { src: "/img_clothes/dongPhucHocSinh/0430f42f54c83df341e3bc667e210891.jpg", alt: "Trang phục cosplay 7" },
    { src: "/img_clothes/anime/songoku-min.jpg", alt: "Trang phục cosplay 8" },
  ];
  
  // Tạo vòng lặp vô tận bằng cách nhân đôi mảng
  const infiniteImages = [...galleryImages, ...galleryImages, ...galleryImages];
  
  // Chiều rộng ảnh gallery (px) gồm cả gap để auto-scroll mượt
  const IMAGE_WIDTH = 272; // 256px (w-64) + 16px (gap-4)

  // Tự động chuyển ảnh chỉ khi không có tương tác
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && !userInteracting && galleryRef.current) {
        const container = galleryRef.current;
        container.scrollLeft += IMAGE_WIDTH;
      }
    }, 3000); // Chuyển ảnh mỗi 3 giây
    
    return () => clearInterval(interval);
  }, [isDragging, userInteracting]);
  
  // Xử lý kéo chuột với hiệu ứng mượt mà hơn
  const handleMouseDown = (e: React.MouseEvent) => {
    if (galleryRef.current) {
      setIsDragging(true);
      setUserInteracting(true);
      setStartX(e.pageX - galleryRef.current.offsetLeft);
      setScrollLeft(galleryRef.current.scrollLeft);
      galleryRef.current.style.cursor = 'grabbing';
      galleryRef.current.style.scrollBehavior = 'auto'; // Tắt smooth scroll khi kéo
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 1.2; // Tốc độ kéo tối ưu
    
    // Sử dụng requestAnimationFrame để smooth hơn
    requestAnimationFrame(() => {
      if (galleryRef.current) {
        galleryRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    if (galleryRef.current) {
      galleryRef.current.style.cursor = 'grab';
      galleryRef.current.style.scrollBehavior = 'smooth'; // Bật lại smooth scroll
    }
    // Đặt timeout để user có thể tiếp tục kéo mà không bị auto scroll ngay
    setTimeout(() => setUserInteracting(false), 5000); // Tăng lên 5 giây
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    if (galleryRef.current) {
      galleryRef.current.style.cursor = 'grab';
      galleryRef.current.style.scrollBehavior = 'smooth';
    }
    // Đặt timeout để user có thể tiếp tục kéo mà không bị auto scroll ngay
    setTimeout(() => setUserInteracting(false), 5000); // Tăng lên 5 giây
  };

  // Touch events cho mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (galleryRef.current) {
      setIsDragging(true);
      setUserInteracting(true);
      setStartX(e.touches[0].pageX - galleryRef.current.offsetLeft);
      setScrollLeft(galleryRef.current.scrollLeft);
      galleryRef.current.style.scrollBehavior = 'auto';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !galleryRef.current) return;
    const x = e.touches[0].pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    
    // Sử dụng requestAnimationFrame để smooth hơn
    requestAnimationFrame(() => {
      if (galleryRef.current) {
        galleryRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (galleryRef.current) {
      galleryRef.current.style.scrollBehavior = 'smooth';
    }
    // Đặt timeout để user có thể tiếp tục kéo mà không bị auto scroll ngay
    setTimeout(() => setUserInteracting(false), 5000); // Tăng lên 5 giây
  };
  
  // Xử lý vòng lặp vô tận mượt mà - chỉ khi auto scroll, không khi user tương tác
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!galleryRef.current) return;
      
      // Chỉ xử lý vòng lặp khi không có tương tác từ user
      if (isDragging || userInteracting) return;
      
      const container = galleryRef.current;
      const imageWidth = IMAGE_WIDTH;
      const totalOriginalWidth = imageWidth * galleryImages.length;
      
      // Debounce để tránh gọi quá nhiều lần
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!container || isDragging || userInteracting) return;
        
        // Nếu scroll gần về đầu
        if (container.scrollLeft <= imageWidth / 2) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = totalOriginalWidth + container.scrollLeft;
          setTimeout(() => {
            if (container) container.style.scrollBehavior = 'smooth';
          }, 50);
        }
        // Nếu scroll gần đến cuối
        else if (container.scrollLeft >= totalOriginalWidth * 2 - imageWidth / 2) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = container.scrollLeft - totalOriginalWidth;
          setTimeout(() => {
            if (container) container.style.scrollBehavior = 'smooth';
          }, 50);
        }
      }, 100);
    };
    
    const container = galleryRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Set vị trí ban đầu ở giữa (set thứ 2)
      setTimeout(() => {
        if (container && !userInteracting) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = IMAGE_WIDTH * galleryImages.length;
          container.style.scrollBehavior = 'smooth';
        }
      }, 200);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [galleryImages.length, isDragging, userInteracting]);


  return (
    <div className="min-h-screen">
      {/* Title Section with Background */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="About Background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 
            className="text-center font-bold text-6xl text-white drop-shadow-lg"
          >
            Về Chúng Tôi
          </h1>
        </div>
      </div>
 
      <div className="about-container mx-auto py-8 px-10 space-y-12">
        {/* Our Story Section */}
        <section className="relative py-16 px-4 md:px-8 lg:px-16 overflow-hidden ">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 right-10 w-32 h-32 "></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 "></div>
            {/* Diagonal stripes pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
              <div className="w-full h-full transform rotate-45 translate-x-32 -translate-y-32"></div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Images */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  {/* Woman with dogs image */}
                  <div className="relative ">
                    <div className=" p-6 relative ">
                      <Image
                        src="/img_clothes/coTich/c46d5df0999df54df2c6a65223c6eaa5.jpg"
                        alt="Trang phục cosplay chất lượng cao"
                        width={300}
                        height={600}
                        className="rounded-2xl object-cover w-full h-[28rem]"
                      />
                    </div>
                  </div>

                  {/* Cat image */}
                  <div className="relative mt-8">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl overflow-hidden">
                      <Image
                        src="/img_clothes/coTich/000aa6833cdc1c0415c4b11a8495510d.jpg"
                        alt="Bộ sưu tập trang phục cosplay đa dạng"
                        width={280}
                        height={500}
                        className="object-cover w-full h-96"
                      />
                    </div>
                  </div>
                </div>

                {/* Cosplay Badge - positioned between the two images */}
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 z-20"
                  style={{ left: "40%" }} // dịch trái thêm để nằm giữa hai ảnh
                >
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Vòng tròn xoay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <Image
                        src="/imgSection/123456.png"
                        alt="Vòng tròn xoay"
                        fill
                        sizes="96px"
                        className="object-contain animate-[spin_8s_linear_infinite]"
                        priority
                      />
                    </div>
                    {/* Icon đứng yên */}
                    <Image
                      src="/icon/icons8-kuromi-40.png"
                      alt="Kuromi cosplay icon"
                      width={50}
                      height={50}
                      className="object-contain z-10"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <p className="text-green-600 font-semibold text-sm tracking-wider uppercase">CÂU CHUYỆN CỦA CHÚNG TÔI</p>
                  <h2 className="text-4xl lg:text-5xl font-bold text-green-900 leading-tight">
                    Biến Ước Mơ Cosplay Thành Hiện Thực: Câu Chuyện, Sứ Mệnh & Giá Trị Của Chúng Tôi
                  </h2>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-lg leading-relaxed">
                  Chúng tôi tự hào mang đến dịch vụ thuê trang phục cosplay chất lượng cao với đa dạng mẫu mã từ Anime, Cổ tích, Đồng phục đến các nhân vật nổi tiếng.
                  Mỗi bộ trang phục đều được chọn lọc kỹ lưỡng và chăm sóc cẩn thận để mang đến trải nghiệm cosplay hoàn hảo nhất cho bạn.
                </p>

                {/* Feature list */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 flex-shrink-0 shadow-sm">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">
                        Địa chỉ tin cậy cho những cosplayer đam mê và khó tính
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full p-3 flex-shrink-0 shadow-sm">
                      <Shirt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Trang Phục Chất Lượng Cao Được Chăm Sóc Cẩn Thận</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-lime-500 to-green-500 rounded-full p-3 flex-shrink-0 shadow-sm">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Trải Nghiệm Cosplay Hoàn Hảo Bắt Đầu Từ Đây</h3>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                    Đọc Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section - Redesigned */}
        <section className="py-16 px-4  relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Statistics Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 flex-1">
                {/* Stat 1 - Jagged star shape - Color #f2be8f */}
                <div className="relative flex justify-center group">
                  <div
                    className="relative w-36 h-28 lg:w-44 lg:h-32 flex items-center justify-center transition-all duration-500 animate-bounce hover:scale-110"
                    style={{
                      backgroundColor: "#bbf7d0",
                      border: "2px solid #86efac",
                      clipPath: "polygon(0% 20%, 20% 0%, 80% 0%, 100% 20%, 95% 40%, 100% 60%, 80% 100%, 20% 100%, 0% 80%, 5% 60%, 0% 40%)",
                      animationDelay: "0s"
                    }}
                  >
                    <div className="text-center px-2">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">500+</div>
                      <div className="text-xs lg:text-sm font-semibold text-slate-600 tracking-wide leading-tight">
                        TRANG PHỤC<br/>COSPLAY
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat 2 - Scalloped oval - Color #ffb4a2 */}
                <div className="relative flex justify-center group">
                  <div
                    className="relative w-36 h-28 lg:w-44 lg:h-32 flex items-center justify-center transition-all duration-500 animate-bounce hover:scale-110"
                    style={{
                      backgroundColor: "#a5f3fc",
                      border: "2px solid #67e8f9",
                      clipPath: "polygon(10% 0%, 90% 0%, 100% 15%, 95% 35%, 100% 55%, 90% 70%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 10% 70%, 0% 55%, 5% 35%, 0% 15%)",
                      animationDelay: "0.3s"
                    }}
                  >
                    <div className="text-center px-2">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">25+</div>
                      <div className="text-xs lg:text-sm font-semibold text-slate-600 tracking-wide leading-tight">
                        THÀNH VIÊN<br/>ĐỘI NGŨ
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat 3 - Wavy oval - Color #f2be8f */}
                <div className="relative flex justify-center group">
                  <div
                    className="relative w-36 h-28 lg:w-44 lg:h-32 flex items-center justify-center transition-all duration-500 animate-bounce hover:scale-110"
                    style={{
                      backgroundColor: "#bef264",
                      border: "2px solid #84cc16",
                      clipPath: "polygon(15% 0%, 85% 0%, 100% 25%, 90% 50%, 100% 75%, 85% 100%, 15% 100%, 0% 75%, 10% 50%, 0% 25%)",
                      animationDelay: "0.6s"
                    }}
                  >
                    <div className="text-center px-2">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">5K+</div>
                      <div className="text-xs lg:text-sm font-semibold text-slate-600 tracking-wide leading-tight">
                        ĐƠN HÀNG<br/>THÀNH CÔNG
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat 4 - Complex jagged - Color #ffb4a2 */}
                <div className="relative flex justify-center group">
                  <div
                    className="relative w-36 h-28 lg:w-44 lg:h-32 flex items-center justify-center transition-all duration-500 animate-bounce hover:scale-110"
                    style={{
                      backgroundColor: "#99f6e4",
                      border: "2px solid #5eead4",
                      clipPath: "polygon(0% 15%, 15% 0%, 85% 0%, 100% 15%, 95% 30%, 100% 45%, 85% 60%, 100% 75%, 85% 100%, 15% 100%, 0% 85%, 5% 70%, 0% 55%, 15% 40%, 0% 30%)",
                      animationDelay: "0.9s"
                    }}
                  >
                    <div className="text-center px-2">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">50+</div>
                      <div className="text-xs lg:text-sm font-semibold text-slate-600 tracking-wide leading-tight">
                        NHÂN VẬT<br/>NỔI TIẾNG
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200/30 rounded-full blur-xl animate-pulse delay-300"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200/30 rounded-full blur-lg animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-emerald-100/30 rounded-full blur-xl animate-pulse delay-700"></div>
          </div>
          

        </section>
       {/* Photo Gallery Section - Smooth draggable gallery */}
       <section className="py-8">
         <div className="container mx-auto px-2 md:px-4">
          {/* Gallery Container */}
          <div className="w-full flex justify-center">
            <div 
              ref={galleryRef}
              className="gallery-container inline-flex gap-3 md:gap-4 overflow-x-auto pb-4"
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {infiniteImages.map((image, index) => (
                <div
                  key={`${image.src}-${index}`}
                  className="gallery-image flex-shrink-0 w-[230px] md:w-[260px] h-[240px] md:h-[260px] rounded-2xl overflow-hidden bg-white"
                  style={{
                    transition: 'transform 0.4s ',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={512}
                    height={352}
                    className="w-full h-full object-cover object-top"
                    draggable={false}
                    priority={index < 8}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
       </section>
      </div>
    </div>
  );
}