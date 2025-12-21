"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Moon, Sun, ShoppingCart, User, ChevronDown, LogIn, UserPlus, Heart, Package, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useCart } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"
import { useToast } from "@/app/hooks/useToast"
import MiniCart from "../cart/_components/MiniCart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
const Header = () => {
  const { theme, setTheme } = useTheme()
  const { totalItems, isMiniCartOpen, closeMiniCart } = useCart()
  const { totalFavorites } = useFavoriteStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const { error, ToastContainer } = useToast()
  const [selectedLanguage, setSelectedLanguage] = useState("Tiếng Việt")
  const pathname = usePathname() // Lấy đường dẫn hiện tại
  
  // Handle wishlist click
  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      error("Chưa đăng nhập", "Vui lòng đăng nhập để xem danh sách yêu thích")
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      router.push('/wishlist')
    }
  }
  
  // Handle logout
  const handleLogout = () => {
    logout()
    router.push('/')
  }
  
  const menuItems = [
    { name: "TRANG CHỦ", href: "/" },
    { name: "SẢN PHẨM", href: "/product" },
    { name: "GIỚI THIỆU", href: "/abouts" },
    { name: "LIÊN HỆ", href: "/contacts" }
  ]

  const languages = [
    { name: "Tiếng Việt" },
    { name: "English" }
  ]

  return (
    <header className={`w-full sticky top-0 z-50 ${
      theme === 'dark' 
        ? 'bg-gray-900 border-b border-gray-800' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="HAUCOSPLAY Logo" 
                width={50} 
                height={50}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-wide ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600 '
              }`}>
                HAUCOSPLAY
              </h1>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-green-300' : 'text-[#09331a]'
              }`}>THẾ GIỚI COSPLAY CHO BẠN</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link 
                        href={item.href}
                        className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          isActive 
                            ? (theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-800')
                            : (theme === 'dark' 
                                ? 'bg-gray-800 text-gray-300 hover:bg-green-800 hover:text-green-300 hover:scale-105' 
                                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 hover:scale-105')
                        }`}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Utilities */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`h-9 w-9 p-0 transition-all duration-200 hover:scale-110 ${
                  theme === 'dark' 
                    ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                    : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
                }`}>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`z-[60] ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <DropdownMenuItem onClick={() => setTheme("light")} className={`transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Sáng</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className={`transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Tối</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className={`transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}>
                  <span className="mr-2">💻</span>
                  <span>Hệ thống</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`h-9 px-3 transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                    : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
                }`}>
                  <span className="text-sm font-medium">
                    {selectedLanguage}
                  </span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`z-[60] ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {languages.map((language) => (
                  <DropdownMenuItem 
                    key={language.name}
                    onClick={() => setSelectedLanguage(language.name)}
                    className={`transition-colors duration-200 ${
                      selectedLanguage === language.name 
                        ? (theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-800')
                        : (theme === 'dark' 
                            ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                            : 'text-gray-700 hover:bg-green-50 hover:text-green-700')
                    }`}
                  >
                    <span>{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleWishlistClick}
              className={`h-9 w-9 p-0 relative transition-all duration-200 hover:scale-110 ${
                theme === 'dark' 
                  ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                  : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
              }`}
            >
              <Heart className="h-5 w-5" />
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
              <span className="sr-only">Yêu thích</span>
            </Button>

            {/* Shopping Cart */}
            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-9 w-9 p-0 relative transition-all duration-200 hover:scale-110 ${
                  theme === 'dark' 
                    ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                    : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
                <span className="sr-only">Giỏ hàng</span>
              </Button>
            </Link>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`h-9 px-2 transition-all duration-200 hover:scale-105 flex items-center gap-1.5 ${
                  theme === 'dark' 
                    ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                    : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
                }`}>
                  {isAuthenticated && user ? (
                    user.avatar ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={user.avatar}
                          alt={user.fullName || "User"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : user.fullName ? (
                      <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-xs">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <User className="h-5 w-5" />
                    )
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Tài khoản</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" alignOffset={-150} className={`w-56 z-[60] ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {!isAuthenticated ? (
                  // Khi chưa đăng nhập
                  <>
                    <DropdownMenuItem 
                      onClick={() => router.push('/login')} 
                      className={`transition-colors duration-200 cursor-pointer ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Đăng nhập</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/register')} 
                      className={`transition-colors duration-200 cursor-pointer ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Đăng ký</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Khi đã đăng nhập
                  <>
                    {/* Thông tin user */}
                    <div className={`px-3 py-2 border-b ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-100'
                    }`}>
                      <div className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {user?.fullName || "User"}
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {user?.email || ""}
                      </div>
                    </div>
                    
                    {/* Menu items */}
                    <DropdownMenuItem 
                      className={`transition-colors duration-200 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                      onClick={() => router.push('/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`transition-colors duration-200 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                      onClick={() => router.push('/orders')}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      <span>Đơn hàng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`transition-colors duration-200 ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mini Cart */}
      <MiniCart isOpen={isMiniCartOpen} onClose={closeMiniCart} />
      
      {/* Toast Container */}
      <ToastContainer />
    </header>
  )
}

export default Header
