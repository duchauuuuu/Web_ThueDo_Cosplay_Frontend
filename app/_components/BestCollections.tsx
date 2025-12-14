"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const BestCollections = () => {
  const router = useRouter()
  
  const cosplayImages = [
    {
      src: "/ImgPoster/0046a61ff890bcf411e9c789e677c6d9.jpg",
      alt: "Cosplay Collection 1",
      title: "COLLECTION 1",
    },
    {
      src: "/ImgPoster/20234ae514f7ad175ce763c3216caf86.jpg",
      alt: "Cosplay Collection 2",
      title: "COLLECTION 2",
    },
    {
      src: "/ImgPoster/2bf6a928d87bd2fa92c3217c0f4a4294.jpg",
      alt: "Cosplay Collection 3",
      title: "COLLECTION 3",
    },
    {
      src: "/ImgPoster/2ebbb19db7b510925bfc4c793f94c035.jpg",
      alt: "Cosplay Collection 4",
      title: "COLLECTION 4",
    },
    {
      src: "/ImgPoster/302285545349db76b11995bc9724d867.jpg",
      alt: "Cosplay Collection 5",
      title: "COLLECTION 5",
    },
    {
      src: "/ImgPoster/47eefc76342a0215d377d42c2003ab14.jpg",
      alt: "Cosplay Collection 6",
      title: "COLLECTION 6",
    },
    {
      src: "/ImgPoster/4efadc2852a6a8e3c147a8f46743968c.jpg",
      alt: "Cosplay Collection 7",
      title: "COLLECTION 7",
    },
    {
      src: "/ImgPoster/6f5b6ba13d26fbf5fe187aec2f55d826.jpg",
      alt: "Cosplay Collection 8",
      title: "COLLECTION 8",
    },
    {
      src: "/ImgPoster/75a14fb4342836aee511c1535852c628.jpg",
      alt: "Cosplay Collection 9",
      title: "COLLECTION 9",
    },
    {
      src: "/ImgPoster/dffcea799a3b219fb2747882583ddc94.jpg",
      alt: "Cosplay Collection 10",
      title: "COLLECTION 10",
    },
  ]

  return (
    <section 
      className="relative overflow-hidden mx-7 rounded-lg bg-cover bg-center bg-no-repeat" 
      style={{ 
        height: '450px', 
        backgroundImage: 'url("/ImgPoster/h1-banner01-1.jpg")'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute"></div>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-3 max-w-lg" style={{ marginLeft: '60px' }}>
              <div className="space-y-1">
                <p className="font-medium tracking-wide uppercase text-sm" style={{ color: '#ced73b' }}>Bộ Sưu Tập Cosplay.</p>
                <h1 className="font-bold text-white leading-tight tracking-tight text-3xl">
                  TRANG PHỤC COSPLAY
                  <br />
                  <span className="text-balance">ĐƯỢC YÊU THÍCH NHẤT</span>
                </h1>
              </div>

              <p className="text-slate-300 leading-relaxed font-light max-w-md text-sm">
                Khám phá những bộ đồ cosplay hot nhất, được nhiều bạn trẻ lựa chọn.
                Thuê ngay hôm nay để hóa thân thành nhân vật bạn yêu thích!
              </p>

              <Button
                size="sm"
                onClick={() => router.push('/product')}
                className="bg-white text-black hover:bg-green-600 hover:text-white font-semibold px-6 py-2 text-sm rounded-full group transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden cursor-pointer"
              >
                <span className="flex items-center">
                  <span className="relative overflow-hidden">
                    <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">
                      Thuê Ngay
                    </span>
                    <span className="absolute top-0 left-0 block transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      Thuê Ngay
                    </span>
                  </span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>

            {/* Right Images Grid */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-lg">
                {/* Grid container */}
                <div className="grid grid-cols-3 gap-4 transform rotate-12 scale-95 origin-center group cursor-pointer transition-all duration-500 hover:scale-105 hover:rotate-[20deg]">
                  {/* Row 1 - 3 images */}
                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[0].src}
                          alt={cosplayImages[0].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[1].src}
                          alt={cosplayImages[1].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[2].src}
                          alt={cosplayImages[2].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 - 3 images */}
                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[3].src}
                          alt={cosplayImages[3].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[4].src}
                          alt={cosplayImages[4].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[5].src}
                          alt={cosplayImages[5].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3 - 3 images */}
                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[6].src}
                          alt={cosplayImages[6].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[7].src}
                          alt={cosplayImages[7].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="transform translate-y-0">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <img
                          src={cosplayImages[8].src}
                          alt={cosplayImages[8].alt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BestCollections