"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState("VI")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  const menuItems = [
    { name: "TRANG CHỦ", href: "/trang-chu" },
    { name: "TRANG PHỤC", href: "/trang-phuc" },
    { name: "PHỤ KIỆN", href: "/phu-kien" },
    { name: "GIỚI THIỆU", href: "/gioi-thieu" },
    { name: "DỊCH VỤ", href: "/dich-vu" },
    { name: "FAQ", href: "/faq" },
    { name: "BLOG", href: "/blog" },
    { name: "LIÊN HỆ", href: "/lien-he" },
  ]

  const languages = [
    { code: "VI", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "EN", name: "English", flag: "🇺🇸" }
  ]

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <header className={`relative ${isDarkMode ? "bg-slate-900" : "bg-white"} transition-colors duration-300`}>
      {isDarkMode && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-800 opacity-95"></div>
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{ top: "20%", left: "10%", animationDelay: "0s" }}
            ></div>
            <div
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{ top: "60%", left: "80%", animationDelay: "1s" }}
            ></div>
            <div
              className="absolute w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"
              style={{ top: "40%", left: "60%", animationDelay: "2s" }}
            ></div>
          </div>
        </>
      )}

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${isDarkMode ? "bg-gradient-to-br from-pink-400 to-purple-500" : "bg-gradient-to-br from-indigo-600 to-purple-600"} rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300`}
            >
              <div className="text-2xl font-bold text-white">Y</div>
            </div>
            <div className={isDarkMode ? "text-white" : "text-slate-800"}>
              <h1 className="text-xl font-bold tracking-wide">YUN COSPLAY</h1>
              <p className="text-sm opacity-90">THẾ GIỚI COSPLAY CỦA BẠN</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${isDarkMode ? "text-white hover:text-pink-300" : "text-slate-700 hover:text-indigo-600"} font-medium transition-all duration-300 relative group hover:scale-105`}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDarkMode ? "bg-gradient-to-r from-pink-400 to-purple-400" : "bg-gradient-to-r from-indigo-500 to-purple-500"} transition-all duration-300 group-hover:w-full`}
                ></span>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} transition-all duration-300 p-2 rounded-lg`}
            >
              {isDarkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} transition-all duration-300 p-2 rounded-lg flex items-center space-x-1`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language dropdown menu */}
              {isLanguageMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 ${isDarkMode ? "bg-slate-800/95 border-purple-500/30 backdrop-blur-sm" : "bg-white border-indigo-200"} border rounded-xl shadow-xl z-50`}
                >
                  <div className="py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code)
                          setIsLanguageMenuOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm ${isDarkMode ? "text-white hover:bg-purple-700/50" : "text-slate-700 hover:bg-indigo-50"} transition-colors duration-200 ${currentLanguage === lang.code ? (isDarkMode ? "bg-purple-600/30" : "bg-indigo-100") : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                          {currentLanguage === lang.code && (
                            <svg
                              className="w-4 h-4 ml-auto text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon - enhanced styling */}
            <button
              className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} transition-all duration-300 p-2 rounded-lg relative transform hover:scale-105`}
            >
          <ShoppingCart/>
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                1
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} transition-all duration-300 p-2 rounded-lg transform hover:scale-105`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 ${isDarkMode ? "bg-slate-800/95 border-purple-500/30 backdrop-blur-sm" : "bg-white border-indigo-200"} border rounded-xl shadow-xl z-50`}
                >
                  <div className="py-2">
                    <Link
                      href="/dang-nhap"
                      className={`block px-4 py-3 text-sm ${isDarkMode ? "text-white hover:bg-purple-700/50" : "text-slate-700 hover:bg-indigo-50"} transition-colors duration-200`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="font-medium">Đăng nhập</span>
                      </div>
                    </Link>
                    <Link
                      href="/dang-ky"
                      className={`block px-4 py-3 text-sm ${isDarkMode ? "text-white hover:bg-purple-700/50" : "text-slate-700 hover:bg-indigo-50"} transition-colors duration-200`}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        <span className="font-medium">Đăng ký</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden ${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} transition-all duration-300 p-2 rounded-lg`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`lg:hidden py-4 border-t ${isDarkMode ? "border-white/20" : "border-indigo-200"}`}>
            <nav className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} font-medium transition-all duration-300 py-3 px-4 rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile user menu */}
              <div className={`border-t ${isDarkMode ? "border-white/20" : "border-indigo-200"} pt-3 mt-3`}>
                <Link
                  href="/dang-nhap"
                  className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} font-medium transition-all duration-300 py-3 px-4 rounded-lg block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className={`${isDarkMode ? "text-white hover:text-pink-300 hover:bg-white/10" : "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"} font-medium transition-all duration-300 py-3 px-4 rounded-lg block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Decorative wave at bottom - enhanced with gradient */}
      {isDarkMode && (
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-4 text-white opacity-20"
            fill="currentColor"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
            ></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      )}
    </header>
  )
}

export default Header
