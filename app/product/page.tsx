"use client";
import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { Search, ChevronDown } from "lucide-react";
import ProductCard from "@/app/_components/ProductCard";
import { useSWRFetch } from "@/app/hooks/useSWRFetch";
import { useToast } from "@/app/hooks/useToast";
import { ProductsResponse, Category } from "@/types";
import { Loading } from "@/app/_components/loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

const DEFAULT_IMAGE = '/img_clothes/anime/Akatsuki truyện naruto (4).jpg';

export default function ProductPage() {
  const pageSize = 9;
  const [page, setPage] = React.useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, openMiniCart } = useCart();
  const { isAuthenticated, token } = useAuthStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const { success, error: showError, ToastContainer } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Đọc sortBy và categoryId từ URL khi component mount
  useEffect(() => {
    const sortByParam = searchParams.get('sortBy');
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    
    const categoryIdParam = searchParams.get('categoryId');
    if (categoryIdParam) {
      setSelectedCategory(categoryIdParam);
    }
  }, [searchParams]);

  // Handle search submit (Enter or button click)
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle favorite
  const handleFavorite = async (productId: string | number, productData?: any) => {
    if (!isAuthenticated) {
      showError("Chưa đăng nhập", "Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    try {
      const { favoritesAPI } = await import("@/lib/api/favorites");
      const result = await favoritesAPI.toggle(productId.toString(), token!);

      // Refresh favorites list from backend
      if (mutateFavorites) {
        await mutateFavorites();
      }

      if (result.action === 'Added') {
        // Add to local store
        if (productData) {
          const sortedImages = productData.productImages
            ?.filter((img: any) => img.isActive)
            .sort((a: any, b: any) => a.order - b.order) || [];
          
          addFavorite({
            id: productData.id,
            name: productData.name,
            image: sortedImages[0]?.url || DEFAULT_IMAGE,
            hoverImage: sortedImages[1]?.url || sortedImages[0]?.url || DEFAULT_IMAGE,
            price: Number(productData.price),
            categoryId: productData.categoryId,
            createdAt: new Date().toISOString(),
          });
        }
        success("Đã thêm vào yêu thích", "Sản phẩm đã được thêm vào danh sách yêu thích của bạn");
      } else {
        // Remove from local store
        removeFavorite(productId.toString());
        success("Đã xóa khỏi yêu thích", "Sản phẩm đã được xóa khỏi danh sách yêu thích");
      }
    } catch (error: any) {
      console.error("Favorite error:", error);
      showError("Lỗi", error.message || "Không thể thực hiện thao tác");
    }
  };

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  // Build API URL with query params
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', pageSize.toString());
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy && sortBy !== 'default') params.set('sortBy', sortBy);
    return `${API_URL}/products?${params.toString()}`;
  }, [page, pageSize, selectedCategory, searchQuery, sortBy]);

  // Fetch products from API
  const { data, error: fetchError, isLoading } = useSWRFetch<ProductsResponse>(apiUrl);

  // Fetch categories from API
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useSWRFetch<Category[]>(`${API_URL}/categories`);

  // Fetch favorites from backend
  const { data: favoritesData, mutate: mutateFavorites } = useSWRFetch<any[]>(
    isAuthenticated && token ? `${API_URL}/favorites` : null,
    token ? { Authorization: `Bearer ${token}` } : undefined
  );

  // Create a Set of favorite product IDs for quick lookup
  const favoriteProductIds = useMemo(() => {
    if (!favoritesData) return new Set<string>();
    return new Set(favoritesData.map((fav: any) => fav.productId || fav.product?.id));
  }, [favoritesData]);

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

    // Filter chỉ lấy sản phẩm còn số lượng
    filtered = filtered.filter(product => {
      return product.quantity > 0 && product.isAvailable === true;
    });

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
    setSearchInput(""); // Also clear search input
    setSortBy("default");
    setPriceRange([0, maxPrice]);
    setPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Loading variant="skeleton" skeletonCount={9} />
        </div>
      </div>
    );
  }

  // Error state - show error message but don't use backup data
  if (fetchError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-800 text-lg font-semibold">⚠️ Không thể kết nối đến server</p>
            <p className="text-red-600 mt-2">Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No products found
  if (!pagedProducts || pagedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 text-lg font-semibold">Không tìm thấy sản phẩm nào</p>
            <p className="text-yellow-600 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters} 
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-black transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      {/* Main Content Section */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm trang phục..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-[#2d2d2d] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button 
                  onClick={handleSearch}
                  className="rounded-full bg-green-600 p-3 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

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

            {/* Clear All Filters Button */}
            <button 
              onClick={handleClearFilters}
              className="w-full rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-black hover:text-white transition-colors cursor-pointer mt-[10px]"
            >
              Xóa tất cả lọc
            </button>
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
                    <option value="mostFavorited">Yêu thích nhiều nhất tuần</option>
                    <option value="mostOrdered">Thuê nhiều nhất tuần</option>
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
              {pagedProducts.map((backendProduct) => {
                    const sortedImages = backendProduct.productImages
                      ?.filter((img: any) => img.isActive)
                      .sort((a: any, b: any) => a.order - b.order) || [];
                    
                    return (
                      <ProductCard
                        key={backendProduct.id}
                        id={backendProduct.id}
                        title={backendProduct.name}
                        price={backendProduct.discountPrice && backendProduct.discountPrice > 0 
                          ? Number(backendProduct.discountPrice) 
                          : Number(backendProduct.price)}
                        originalPrice={backendProduct.discountPrice && backendProduct.discountPrice > 0 
                          ? Number(backendProduct.price) 
                          : undefined}
                        rating={backendProduct.averageRating || 0}
                        reviewCount={backendProduct.reviewCount || 0}
                        image={sortedImages[0]?.url || DEFAULT_IMAGE}
                        hoverImage={sortedImages[1]?.url}
                        onAddToCart={() => {
                          const finalPrice = backendProduct.discountPrice && backendProduct.discountPrice > 0 
                            ? Number(backendProduct.discountPrice) 
                            : Number(backendProduct.price);
                          addItem({
                            id: backendProduct.id,
                            name: backendProduct.name,
                            image: sortedImages[0]?.url || DEFAULT_IMAGE,
                            originalPrice: Number(backendProduct.price),
                            salePrice: finalPrice,
                            quantity: 1
                          });
                          openMiniCart();
                        }}
                        isFavorite={favoriteProductIds.has(backendProduct.id)}
                        onFavorite={() => handleFavorite(backendProduct.id, backendProduct)}
                        onView={() => router.push(`/product/${backendProduct.id}`)}
                      />
                    );
                  })}
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