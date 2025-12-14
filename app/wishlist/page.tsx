"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ShoppingCart, ChevronDown } from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCart } from "@/store/useCartStore";
import { useToast } from "@/app/hooks/useToast";
import { useSWRFetch } from "@/app/hooks/useSWRFetch";
import { Category } from "@/types";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
};

// Wishlist Product Card Component
function WishlistProductCard({ 
  product, 
  onRemove, 
  onAddToCart, 
  onView,
  isLoading 
}: { 
  product: any; 
  onRemove: (id: string) => void; 
  onAddToCart: (product: any) => void;
  onView: (id: string) => void;
  isLoading: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer bg-white rounded-lg transition-all duration-300 overflow-hidden relative p-3 border border-transparent hover:border-gray-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(product.id)}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <Image
          src={hovered && product.hoverImage ? product.hoverImage : product.image}
          alt={product.name}
          fill
          className="object-cover rounded-md transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Remove Button - Show on hover */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            title="Xóa khỏi yêu thích"
            aria-label="Xóa khỏi yêu thích"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(product.id);
            }}
            disabled={isLoading}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-500 [&:hover>svg]:text-white cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-green-600">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart Button - Show on hover */}
        <button
          className="w-full bg-green-600 hover:bg-black text-white font-medium py-2 px-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <ShoppingCart size={18} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const { removeFavorite: removeFromStore, setFavorites } = useFavoriteStore();
  const { isAuthenticated, token } = useAuthStore();
  const { addItem, openMiniCart } = useCart();
  const { success, error: showError, ToastContainer } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Filter and pagination states
  const pageSize = 9;
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch favorites from backend
  const shouldFetch = isAuthenticated && token;
  const { data: favoritesData, error: favoritesError, isLoading: favoritesLoading, mutate } = useSWRFetch<any[]>(
    shouldFetch ? `${API_URL}/favorites` : null,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  // Fetch categories from API
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useSWRFetch<Category[]>(`${API_URL}/categories`);

  // Transform backend favorites to local format and sync with store
  const favorites = useMemo(() => {
    if (!favoritesData) return [];
    
    const transformed = favoritesData.map((fav: any) => {
      const sortedImages = fav.product?.productImages
        ?.filter((img: any) => img.isActive)
        .sort((a: any, b: any) => a.order - b.order) || [];
      
      return {
        id: fav.product?.id || fav.productId,
        name: fav.product?.name || '',
        image: sortedImages[0]?.url || '/img_clothes/anime/Akatsuki truyện naruto (4).jpg',
        hoverImage: sortedImages[1]?.url || sortedImages[0]?.url || '/img_clothes/anime/Akatsuki truyện naruto (4).jpg',
        price: Number(fav.product?.price || 0),
        categoryId: fav.product?.categoryId,
        createdAt: fav.createdAt,
      };
    });

    // Sync with local store
    setFavorites(transformed);
    
    return transformed;
  }, [favoritesData, setFavorites]);

  const totalFavorites = favorites.length;

  useEffect(() => {
    if (!isAuthenticated) {
      showError("Chưa đăng nhập", "Vui lòng đăng nhập để xem danh sách yêu thích");
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  }, [isAuthenticated, router, showError]);

  // Tính max price từ favorites
  const maxPrice = useMemo(() => {
    if (favorites.length === 0) return 10000000;
    return Math.max(...favorites.map(p => p.price));
  }, [favorites]);

  // Update price range when maxPrice changes
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...favorites];

    // Lọc theo category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Lọc theo thời gian (sử dụng createdAt từ backend)
    if (sortBy === "day-1" || sortBy === "day-7") {
      const now = new Date();
      const daysLimit = sortBy === "day-1" ? 1 : 7;
      const timeLimit = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(product => {
        if (!product.createdAt) return false;
        const createdDate = new Date(product.createdAt);
        return createdDate >= timeLimit;
      });
    }

    // Lọc theo giá
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sắp xếp
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Already sorted by createdAt DESC from backend
        break;
    }

    return filtered;
  }, [favorites, sortBy, priceRange, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const pagedProducts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, page, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [sortBy, priceRange, selectedCategory]);

  // Transform categories data with product count
  const categories = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) return [];
    
    // Chỉ hiển thị categories có ít nhất 1 sản phẩm active
    return categoriesData
      .map(category => ({
        id: category.id,
        name: category.name,
        count: category.products?.filter(p => p.isActive).length || 0
      }))
      .filter(category => category.count > 0); // Ẩn categories không có sản phẩm
  }, [categoriesData]);

  const handleClearFilters = () => {
    setSortBy("newest");
    setPriceRange([0, maxPrice]);
    setSelectedCategory(null);
    setPage(1);
  };

  const handleRemove = async (productId: string) => {
    if (!token) return;

    try {
      setIsLoading(true);
      const { favoritesAPI } = await import("@/lib/api/favorites");
      await favoritesAPI.remove(productId, token);
      removeFromStore(productId);
      // Refetch to update the list
      mutate();
      success("Đã xóa", "Sản phẩm đã được xóa khỏi danh sách yêu thích");
    } catch (error: any) {
      console.error("Remove favorite error:", error);
      showError("Lỗi", error.message || "Không thể xóa sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: parseInt(product.id) || 0,
      name: product.name,
      image: product.image,
      originalPrice: product.price,
      salePrice: product.price,
      quantity: 1,
    });
    openMiniCart();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      
      {/* Banner Header */}
      <div className="relative py-24">
        <div className="absolute inset-0">
          <img 
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="Wishlist Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="font-bold text-6xl text-white drop-shadow-lg">
              Danh sách yêu thích
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white" style={{ height: '60px' }}></div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 pb-12 -mt-8">
        {/* Loading state */}
        {favoritesLoading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </aside>
            <main className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </main>
          </div>
        ) : favoritesError ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-red-500 text-lg mb-4">Không thể tải danh sách yêu thích</p>
            <button
              onClick={() => mutate()}
              className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-black transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm những sản phẩm bạn thích!
            </p>
            <button
              onClick={() => router.push('/product')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-black transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
              {/* Categories */}
              <div className="mb-8">
                <h2 className="mb-4 rounded-2xl bg-[#fcf2e8] px-6 py-3 text-lg font-bold text-gray-800">
                  Danh mục trang phục
                </h2>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : categoriesError ? (
                  <div className="text-red-500 text-sm p-4">
                    Không thể tải danh mục
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                        className={`group w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                          selectedCategory === category.id
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-700 hover:bg-black hover:text-white border border-gray-200"
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        <span className={`text-sm transition-colors ${selectedCategory === category.id ? "text-white" : "text-gray-500 group-hover:text-white"}`}>
                          ({category.count})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h2 className="mb-4 rounded-2xl bg-[#fcf2e8] px-6 py-3 text-lg font-bold text-gray-800">
                  Khoảng giá
                </h2>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  {/* Price display */}
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

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-full hover:bg-black transition-colors font-medium mt-[10px]"
              >
                Xóa tất cả lọc
              </button>
            </aside>

            {/* Products Grid */}
            <main className="lg:col-span-3">
              {/* Top Bar */}
              <div className="mb-8 flex items-center justify-between rounded-2xl bg-[#fcf2e8] px-6 py-4">
                <span className="text-gray-800 font-medium">
                  Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredProducts.length)} trong {filteredProducts.length} kết quả
                </span>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                    >
                      <option value="newest">Sắp xếp mặc định</option>
                      <option value="price-low">Giá: Thấp đến cao</option>
                      <option value="price-high">Giá: Cao đến thấp</option>
                      <option value="day-1">Trong 1 ngày</option>
                      <option value="day-7">Trong 7 ngày</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {pagedProducts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Không có sản phẩm nào phù hợp với bộ lọc của bạn.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-black transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {pagedProducts.map((product) => (
                      <WishlistProductCard
                        key={product.id}
                        product={product}
                        onRemove={handleRemove}
                        onAddToCart={handleAddToCart}
                        onView={(id) => router.push(`/product/${id}`)}
                        isLoading={isLoading}
                      />
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
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
