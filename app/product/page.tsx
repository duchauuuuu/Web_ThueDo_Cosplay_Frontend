"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/store/useCartStore";
import { Search, ChevronDown, Heart, Eye, ShoppingCart } from "lucide-react";

// Fake data cho trang phục cosplay
const FAKE_PRODUCTS = [
  {
    id: "1",
    name: "Trang phục Anime Naruto Akatsuki",
    price: 850000,
    discountPrice: null,
    category: "Anime",
    size: "M",
    condition: "Mới 95%",
    rating: 4.5,
    reviewCount: 24,
    image: "/img_clothes/anime/Akatsuki truyện naruto (4).jpg",
    hoverImage: "/img_clothes/anime/Akatsuki truyền naruto (5).jpg",
    description: "Trang phục Akatsuki chất lượng cao, chi tiết hoàn thiện"
  },
  {
    id: "2",
    name: "Trang phục cổ tích công chúa",
    price: 1200000,
    discountPrice: null,
    category: "Cổ tích",
    size: "L",
    condition: "Mới 100%",
    rating: 4.8,
    reviewCount: 18,
    image: "/img_clothes/coTich/000aa6833cdc1c0415c4b11a8495510d.jpg",
    hoverImage: "/img_clothes/coTich/4931f28604c685d4f18be7cae63cd165.jpg",
    description: "Váy công chúa sang trọng, phù hợp cho sự kiện"
  },
  {
    id: "3",
    name: "Đồng phục học sinh Nhật Bản",
    price: 650000,
    discountPrice: null,
    category: "Đồng phục",
    size: "S",
    condition: "Mới 90%",
    rating: 4.3,
    reviewCount: 32,
    image: "/img_clothes/dongPhucHocSinh/1.jpg",
    hoverImage: "/img_clothes/dongPhucHocSinh/2.jpg",
    description: "Đồng phục học sinh Nhật kiểu dáng chuẩn"
  },
  {
    id: "4",
    name: "Trang phục One Piece Boa Hancock",
    price: 950000,
    discountPrice: 750000,
    category: "Anime",
    size: "M",
    condition: "Mới 95%",
    rating: 4.6,
    reviewCount: 15,
    image: "/img_clothes/anime/Boa Hancok One Piece (4)-min.jpg",
    hoverImage: "/img_clothes/anime/Boa Hancok One Piece (6)-min (1).jpg",
    description: "Cosplay Boa Hancock đầy đủ phụ kiện"
  },
  {
    id: "5",
    name: "Trang phục cổ trang Việt Nam",
    price: 1100000,
    discountPrice: null,
    category: "Cổ trang",
    size: "M",
    condition: "Mới 100%",
    rating: 4.7,
    reviewCount: 22,
    image: "/img_clothes/coTrang/2f15ae551b1a2273725028f64955a607.jpg",
    hoverImage: "/img_clothes/coTrang/6243269c80ef4ead4e27a2b1bb317154.jpg",
    description: "Trang phục cổ trang Việt Nam truyền thống"
  },
  {
    id: "6",
    name: "Trang phục Robot AI",
    price: 1800000,
    discountPrice: 1400000,
    category: "Khoa học viễn tưởng",
    size: "L",
    condition: "Mới 100%",
    rating: 4.9,
    reviewCount: 8,
    image: "/img_clothes/anime/robot AI bó sát (2)-min.jpg",
    hoverImage: "/img_clothes/anime/robot AI bó sát (3)-min.jpg",
    description: "Trang phục Robot AI cao cấp, đèn LED"
  },
  {
    id: "7",
    name: "Kimono Nhật Bản truyền thống",
    price: 980000,
    discountPrice: null,
    category: "Cổ trang",
    size: "M",
    condition: "Mới 95%",
    rating: 4.4,
    reviewCount: 19,
    image: "/img_clothes/anime/Akatsuki truyện naruto (4).jpg",
    hoverImage: "/img_clothes/anime/Akatsuki truyền naruto (5).jpg",
    description: "Kimono Nhật Bản chất liệu cao cấp"
  },
  {
    id: "8",
    name: "Trang phục siêu anh hùng Marvel",
    price: 1350000,
    discountPrice: 1100000,
    category: "Siêu anh hùng",
    size: "L",
    condition: "Mới 90%",
    rating: 4.7,
    reviewCount: 27,
    image: "/img_clothes/coTich/000aa6833cdc1c0415c4b11a8495510d.jpg",
    hoverImage: "/img_clothes/coTich/4931f28604c685d4f18be7cae63cd165.jpg",
    description: "Bộ đồ siêu anh hùng Marvel chi tiết sắc nét"
  },
  {
    id: "9",
    name: "Hanbok Hàn Quốc",
    price: 890000,
    discountPrice: null,
    category: "Cổ trang",
    size: "S",
    condition: "Mới 100%",
    rating: 4.6,
    reviewCount: 14,
    image: "/img_clothes/dongPhucHocSinh/1.jpg",
    hoverImage: "/img_clothes/dongPhucHocSinh/2.jpg",
    description: "Hanbok Hàn Quốc đẹp, màu sắc tươi sáng"
  }
];

const CATEGORIES = [
  { name: "Anime", count: 3 },
  { name: "Cổ tích", count: 2 },
  { name: "Đồng phục", count: 1 },
  { name: "Cổ trang", count: 3 },
  { name: "Siêu anh hùng", count: 1 },
  { name: "Khoa học viễn tưởng", count: 1 },
];

export default function ProductPage() {
  const pageSize = 9;
  const [page, setPage] = React.useState(1);
  const router = useRouter();
  const { addItem, openMiniCart } = useCart();

  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Calculate max price from products data (rounded to integer)
  const maxPrice = Math.round(Math.max(...FAKE_PRODUCTS.map(product => product.discountPrice || product.price)));

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  // Filter products based on search, category and price
  const filteredProducts = React.useMemo(() => {
    let filtered = FAKE_PRODUCTS;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products
    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "latest") {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Section */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm trang phục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-[#2d2d2d] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                <button className="rounded-full bg-green-600 p-3 text-white hover:bg-black transition-colors cursor-pointer">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h2 className="mb-4 rounded-2xl bg-[#fcf2e8] px-6 py-3 text-lg font-bold text-gray-800">
                Danh mục trang phục
              </h2>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === category.name
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-black hover:text-white border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className={`text-sm transition-colors ${selectedCategory === category.name ? "text-white" : "text-gray-500 group-hover:text-white"}`}>
                      ({category.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h2 className="mb-4 rounded-2xl bg-[#fcf2e8] px-6 py-3 text-lg font-bold text-gray-800">
                Khoảng giá
              </h2>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                {/* Price display: fixed columns so the dash doesn't move */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-36 text-left text-sm font-semibold text-gray-800 overflow-hidden whitespace-nowrap">
                    {formatPrice(Math.round(priceRange[0] / 50000) * 50000)}
                  </div>
                  <div className="w-6 text-center text-sm text-gray-500">—</div>
                  <div className="w-36 text-right text-sm font-semibold text-gray-800 overflow-hidden whitespace-nowrap">
                    {formatPrice(Math.round(priceRange[1] / 50000) * 50000)}
                  </div>
                </div>
                
                {/* Dual Range Slider */}
                <div className="relative h-6">
                  {/* Track background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-lg"></div>
                  
                  {/* Active range */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-green-600 rounded-lg"
                    style={{
                      left: `${Math.round((priceRange[0] / maxPrice) * 100)}%`,
                      right: `${Math.round(100 - (priceRange[1] / maxPrice) * 100)}%`
                    }}
                  ></div>
                  
                  {/* Min slider */}
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50000}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const raw = Number(e.target.value)
                      const val = Math.round(raw / 50000) * 50000
                      const newMin = Math.min(val, Math.round(priceRange[1] / 50000) * 50000 - 50000)
                      setPriceRange([newMin, Math.round(priceRange[1] / 50000) * 50000]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-green-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
                    style={{ zIndex: priceRange[0] > maxPrice - 100000 ? 5 : 3 }}
                  />
                  
                  {/* Max slider */}
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={50000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const raw = Number(e.target.value)
                      const val = Math.round(raw / 50000) * 50000
                      const newMax = Math.max(val, Math.round(priceRange[0] / 50000) * 50000 + 50000)
                      setPriceRange([Math.round(priceRange[0] / 50000) * 50000, newMax]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-green-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
                    style={{ zIndex: 4 }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Top Bar */}
            <div className="mb-8 flex items-center justify-between rounded-2xl bg-[#fcf2e8] px-6 py-4">
              <span className="text-gray-800 font-medium">Hiển thị 1–{Math.min(pageSize, pagedProducts.length)} trong {total} kết quả</span>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="default">Sắp xếp mặc định</option>
                    <option value="price-low">Giá: Thấp đến cao</option>
                    <option value="price-high">Giá: Cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="latest">Mới nhất</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {pagedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer bg-white rounded-lg transition-all duration-300 overflow-hidden relative border border-gray-200"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {product.discountPrice && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                      </div>
                    )}
                    <Image
                      src={hoveredProduct === product.id && product.hoverImage ? product.hoverImage : product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-opacity duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Rating Overlay */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white bg-opacity-95 px-3 py-1 rounded-full z-10">
                      <div className="flex text-sm">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-xs text-gray-700 ml-1 font-medium">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist logic here
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-green-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Heart size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/product/${product.id}`);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-green-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({ 
                          id: parseInt(product.id), 
                          name: product.name, 
                          image: product.image,
                          originalPrice: product.price,
                          salePrice: product.discountPrice || product.price,
                          quantity: 1
                        });
                        openMiniCart();
                      }}
                      className="w-full bg-green-600 hover:bg-black text-white font-medium py-2.5 px-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart size={18} />
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex gap-3 justify-center">
                <button
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-green-600 hover:text-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    className={`w-10 h-10 rounded-full ${num === page ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:border-green-600 hover:text-green-600"} border-2 ${num === page ? "border-green-600" : "border-gray-300"} flex items-center justify-center transition-all duration-300 cursor-pointer`}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-green-600 hover:text-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}