"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@gmail\.com$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: "",
    });
    
    // Validation
    let hasError = false;
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: "",
    };
    
    if (!formData.fullName) {
      newErrors.fullName = "Họ và tên không được để trống";
      hasError = true;
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Họ và tên phải có ít nhất 3 ký tự";
      hasError = true;
    }
    
    if (!formData.email) {
      newErrors.email = "Email không được để trống";
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email phải có đuôi @gmail.com";
      hasError = true;
    }
    
    if (!formData.phone) {
      newErrors.phone = "Số điện thoại không được để trống";
      hasError = true;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
      hasError = true;
    }
    
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
      hasError = true;
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      hasError = true;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      hasError = true;
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Vui lòng đồng ý với điều khoản";
      hasError = true;
    }
    
    if (hasError) {
      setErrors(newErrors);
      return;
    }
    
    // TODO: Call API register
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Register data:", formData);
      // router.push('/login');
    } catch (error) {
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Về trang chủ</span>
      </button>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Form */}
        <div className="bg-white rounded-3xl p-8 md:p-12 order-2 md:order-1 border-2 border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Đăng ký
            </h1>
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-200 focus:border-green-600"
                  }`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-200 focus:border-green-600"
                  }`}
                  placeholder="example@gmail.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.phone
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-200 focus:border-green-600"
                  }`}
                  placeholder="0123456789"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.password
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-200 focus:border-green-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm password field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-200 focus:border-green-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeTerms: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                />
                <span className="text-sm text-gray-700">
                  Tôi đồng ý với{" "}
                  <Link
                    href="/terms"
                    className="text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    className="text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng ký...
                </span>
              ) : (
                "Đăng ký"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block relative h-full min-h-[700px] rounded-3xl overflow-hidden order-1 md:order-2">
          <Image
            src="/img_clothes/anime/8178677ac6e0e8a063e8a0468af6636d.jpg"
            alt="Cosplay"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-4xl font-bold mb-3">
              Tham gia cùng chúng tôi!
            </h2>
            <p className="text-lg text-white/90">
              Trải nghiệm dịch vụ cho thuê cosplay tốt nhất
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

