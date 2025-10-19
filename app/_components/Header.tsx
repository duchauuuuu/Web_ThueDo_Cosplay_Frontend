"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Moon, Sun, ShoppingCart, User, ChevronDown, LogIn, UserPlus, Heart } from "lucide-react"
import { useTheme } from "next-themes"
import { useCart } from "@/store/useCartStore"
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
  const { totalItems } = useCart()
  const [selectedLanguage, setSelectedLanguage] = useState("Tiếng Việt")
  const [isLoggedIn, setIsLoggedIn] = useState(false) // State để quản lý trạng thái đăng nhập
  const [userInfo, setUserInfo] = useState({
    name: "Nguyễn Văn A",
    email: "user@example.com"
  }) // Thông tin user demo
  const pathname = usePathname() // Lấy đường dẫn hiện tại
  
  const menuItems = [
    { name: "TRANG CHỦ", href: "/" },
    { name: "SẢN PHẨM", href: "/product" },
    { name: "GIỚI THIỆU", href: "/gioi-thieu" },
    { name: "LIÊN HỆ", href: "/lien-he" }
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
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          isActive 
                            ? (theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-800')
                            : (theme === 'dark' 
                                ? 'bg-gray-800 text-gray-300 hover:bg-green-800 hover:text-green-300 hover:scale-105' 
                                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 hover:scale-105')
                        }`}>
                          {item.name}
                        </NavigationMenuLink>
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
            <Button variant="ghost" size="sm" className={`h-9 w-9 p-0 relative transition-all duration-200 hover:scale-110 ${
              theme === 'dark' 
                ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
            }`}>
              <Heart className="h-5 w-5" />
              <span className="sr-only">Yêu thích</span>
            </Button>

            {/* Shopping Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className={`h-9 w-9 p-0 relative transition-all duration-200 hover:scale-110 ${
                theme === 'dark' 
                  ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                  : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
              }`}>
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
                <Button variant="ghost" size="sm" className={`h-9 w-9 p-0 transition-all duration-200 hover:scale-110 ${
                  theme === 'dark' 
                    ? 'hover:bg-green-800 hover:text-green-300 text-gray-300' 
                    : 'hover:bg-green-50 hover:text-green-700 text-gray-700'
                }`}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">Tài khoản</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-56 z-[60] ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {!isLoggedIn ? (
                  // Khi chưa đăng nhập
                  <>
                    <DropdownMenuItem onClick={() => setIsLoggedIn(true)} className={`transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Đăng nhập</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}>
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
                        {userInfo.name}
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {userInfo.email}
                      </div>
                    </div>
                    
                    {/* Menu items */}
                    <DropdownMenuItem className={`transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ của tôi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}>
                      <span className="mr-2">📦</span>
                      <span>Đơn hàng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}>
                      <span className="mr-2">❤️</span>
                      <span>Yêu thích</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-green-800 hover:text-green-300' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}>
                      <span className="mr-2">⚙️</span>
                      <span>Cài đặt</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={`transition-colors duration-200 ${
                        theme === 'dark' 
                          ? 'text-red-400 hover:bg-red-900/50 hover:text-red-300' 
                          : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      }`}
                      onClick={() => setIsLoggedIn(false)}
                    >
                      <span className="mr-2">🚪</span>
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
