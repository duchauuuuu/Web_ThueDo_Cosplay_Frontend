"use client";
import React, { useMemo } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCartStore";
import { Search, ChevronDown } from "lucide-react";
import ProductCard from "@/app/_components/ProductCard";
import { useSWRFetch } from "@/app/hooks/useSWRFetch";
import { ProductsResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// Backup fake data (sử dụng nếu API lỗi)
const BACKUP_PRODUCTS = [
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
  const pageSize = 9; // Hiển thị 9 sản phẩm mỗi trang
  const [page, setPage] = React.useState(1);
  const router = useRouter();
  const { addItem, openMiniCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Build API URL with query params
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', pageSize.toString()); // Gửi limit=9 lên backend
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    return `${API_URL}/products?${params.toString()}`;
  }, [page, pageSize, selectedCategory, searchQuery]);

  // Fetch products from API
  const { data, error, isLoading } = useSWRFetch<ProductsResponse>(apiUrl);

  // Calculate max price from data or use default (2 triệu)
  const maxPrice = useMemo(() => {
    if (!data?.data || data.data.length === 0) return 2000000;
    const prices = data.data.map(p => Number(p.price));
    return Math.max(...prices, 2000000); // Ít nhất là 2 triệu
  }, [data]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);

  // Update price range max when maxPrice changes
  React.useEffect(() => {
    if (priceRange[1] < maxPrice) {
      setPriceRange([priceRange[0], maxPrice]);
    }
  }, [maxPrice]);

  // Transform and filter products
  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = data.data;

    // Client-side price filter (because backend might not support it)
    filtered = filtered.filter(product => {
      const price = Number(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Client-side sorting (because backend might not support all sort options)
    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      // Backend doesn't have rating yet, skip for now
    } else if (sortBy === "latest") {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [data, priceRange, sortBy]);

  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const pagedProducts = filteredProducts;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== null ||
      searchQuery !== "" ||
      sortBy !== "default" ||
      priceRange[0] !== 0 ||
      priceRange[1] !== maxPrice
    );
  }, [selectedCategory, searchQuery, sortBy, priceRange, maxPrice]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setSortBy("default");
    setPriceRange([0, maxPrice]);
    setPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - use backup data
  const productsToDisplay = error ? BACKUP_PRODUCTS : pagedProducts;

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Section */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">⚠️ Không thể kết nối server. Hiển thị dữ liệu mẫu.</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <div className="mb-6">
                <button
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-all duration-300 font-medium group"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              </div>
            )}

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
              {productsToDisplay.length > 0 ? (
                productsToDisplay.map((product) => {
                  // Transform backend data to ProductCard format
                  const isBackendData = 'categoryId' in product;
                  
                  if (isBackendData) {
                    // Backend product
                    const backendProduct = product as any;
                    const sortedImages = backendProduct.productImages
                      ?.filter((img: any) => img.isActive)
                      .sort((a: any, b: any) => a.order - b.order) || [];
                    
                    return (
                      <ProductCard
                        key={backendProduct.id}
                        id={backendProduct.id}
                        title={backendProduct.name}
                        price={Number(backendProduct.price)}
                        rating={4.5}
                        reviewCount={0}
                        image={sortedImages[0]?.url || '/img_clothes/anime/Akatsuki truyện naruto (4).jpg'}
                        hoverImage={sortedImages[1]?.url}
                        onAddToCart={() => {
                          addItem({
                            id: parseInt(backendProduct.id) || 0,
                            name: backendProduct.name,
                            image: sortedImages[0]?.url || '/img_clothes/anime/Akatsuki truyện naruto (4).jpg',
                            originalPrice: Number(backendProduct.price),
                            salePrice: Number(backendProduct.price),
                            quantity: 1
                          });
                          openMiniCart();
                        }}
                        onView={() => router.push(`/product/${backendProduct.id}`)}
                      />
                    );
                  }
                  
                  // Backup fake product
                  return (
                <ProductCard
                  key={product.id}
                  id={parseInt(product.id)}
                  title={product.name}
                  price={product.discountPrice || product.price}
                  originalPrice={product.discountPrice ? product.price : undefined}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  image={product.image}
                  hoverImage={product.hoverImage}
                  discount={product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : undefined}
                  onAddToCart={() => {
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
                  onFavorite={() => {
                    console.log('Add to wishlist:', product.id);
                  }}
                  onView={() => {
                    router.push(`/product/${product.id}`);
                  }}
                />
              );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào.</p>
                </div>
              )}
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