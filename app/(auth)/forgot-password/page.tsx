"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@gmail\.com$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError("");
    
    // Validation
    if (!email) {
      setError("Email không được để trống");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Email phải có đuôi @gmail.com");
      return;
    }
    
    // TODO: Call API forgot password
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Forgot password email:", email);
      setIsSuccess(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
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
        {/* Left side - Image */}
        <div className="hidden md:block relative h-full min-h-[500px] rounded-3xl overflow-hidden">
          <Image
            src="/img_clothes/coTich/4931f28604c685d4f18be7cae63cd165.jpg"
            alt="Cosplay"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-4xl font-bold mb-3">
              Đừng lo lắng!
            </h2>
            <p className="text-lg text-white/90">
              Chúng tôi sẽ giúp bạn khôi phục mật khẩu
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-gray-200">
          {!isSuccess ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Quên mật khẩu?
                </h1>
                <p className="text-gray-600">
                  Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        error
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 focus:border-green-600"
                      }`}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
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
                      Đang xử lý...
                    </span>
                  ) : (
                    "Gửi link đặt lại mật khẩu"
                  )}
                </button>

                {/* Back to login */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </>
          ) : (
            // Success message
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Kiểm tra email của bạn
              </h2>
              
              <p className="text-gray-600 mb-2">
                Chúng tôi đã gửi link đặt lại mật khẩu đến
              </p>
              
              <p className="text-green-600 font-semibold mb-6">
                {email}
              </p>
              
              <p className="text-sm text-gray-500 mb-8">
                Link sẽ hết hạn sau 15 phút. Nếu bạn không thấy email, vui lòng kiểm tra thư mục spam.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Gửi lại email
                </button>
                
                <Link
                  href="/login"
                  className="block w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors text-center"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

