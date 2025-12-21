"use client"

import { useState, useMemo, useEffect } from "react"
import { Star, MessageSquare, X, Filter } from "lucide-react"
import { useSWRFetch } from "@/app/hooks/useSWRFetch"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

interface Comment {
  id: string
  userId: string
  userName?: string
  productId: string
  orderId: string
  rating: number
  content: string
  imageUrl?: string | null // Backward compatibility
  imageUrls?: string[] | null // Multiple images
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CommentsResponse {
  data: Comment[]
  total: number
  page: number
  limit: number
}

interface ReviewSectionProps {
  productId: string
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [page, setPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const limit = 100 // Fetch nhiều để có thể filter ở frontend

  // Fetch comments từ backend (fetch nhiều để filter)
  const { data, error, isLoading } = useSWRFetch<CommentsResponse>(
    `${API_URL}/comments/product/${productId}?page=1&limit=${limit}`,
    undefined,
    {
      revalidateOnFocus: false,
    }
  )

  const allComments = data?.data || []
  const total = data?.total || 0

  // Filter và sort comments
  const filteredAndSortedComments = useMemo(() => {
    let filtered = [...allComments]

    // Filter theo rating
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(comment => comment.rating === ratingFilter)
    }

    // Sort theo thời gian
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [allComments, ratingFilter, sortOrder])

  // Pagination cho filtered comments
  const totalPages = Math.ceil(filteredAndSortedComments.length / 5)
  const comments = useMemo(() => {
    const startIndex = (page - 1) * 5
    const endIndex = startIndex + 5
    return filteredAndSortedComments.slice(startIndex, endIndex)
  }, [filteredAndSortedComments, page])

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    }
    
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape)
      // Ngăn scroll body khi modal mở
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1)
  }, [ratingFilter, sortOrder])

  // Tính trung bình rating từ tất cả comments
  const averageRating = useMemo(() => {
    if (allComments.length === 0) return 0
    const sum = allComments.reduce((acc, comment) => acc + comment.rating, 0)
    return Math.floor(sum / allComments.length) // Làm tròn xuống
  }, [allComments])

  // Đếm số lượng mỗi loại rating từ tất cả comments
  const ratingCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0] // Index 0-4 tương ứng với 1-5 sao
    allComments.forEach(comment => {
      if (comment.rating >= 1 && comment.rating <= 5) {
        counts[comment.rating - 1]++
      }
    })
    return counts
  }, [allComments])

  // Render stars
  const renderStars = (rating: number, size: number = 18) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-200">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          {renderStars(averageRating, 24)}
          <p className="text-sm text-gray-600 mt-3">
            {total} đánh giá
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="md:col-span-2 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star - 1] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 min-w-[80px]">
                  <span className="text-sm font-medium text-gray-700">{star}</span>
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[50px] text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter và Sort */}
      {!isLoading && allComments.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  ratingFilter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả ({allComments.length})
              </button>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star - 1] || 0
                return (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(star)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1 ${
                      ratingFilter === star
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star size={14} className={ratingFilter === star ? 'fill-white text-white' : 'fill-yellow-400 text-yellow-400'} />
                    {star} sao ({count})
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-16 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Không thể tải đánh giá. Vui lòng thử lại sau.</p>
        </div>
      ) : allComments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
          <p className="text-gray-400 text-sm mt-2">
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        </div>
      ) : filteredAndSortedComments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có đánh giá phù hợp</p>
          <p className="text-gray-400 text-sm mt-2">
            Thử chọn bộ lọc khác để xem thêm đánh giá.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {comment.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  {/* User Name and Rating */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {comment.userName || 'Người dùng ẩn danh'}
                      </h4>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    {renderStars(comment.rating, 16)}
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-700 leading-relaxed mb-3">{comment.content}</p>

                  {/* Comment Images */}
                  {(() => {
                    // Ưu tiên imageUrls, fallback về imageUrl
                    const images = comment.imageUrls && comment.imageUrls.length > 0 
                      ? comment.imageUrls 
                      : comment.imageUrl 
                        ? [comment.imageUrl] 
                        : [];
                    
                    if (images.length === 0) return null;
                    
                    return (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {images.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(imgUrl)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Image
                              src={imgUrl}
                              alt={`Review ${idx + 1}`}
                              width={128}
                              height={128}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  // Chỉ hiển thị 5 trang gần page hiện tại
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 2 && pageNum <= page + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-green-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === page - 3 || pageNum === page + 3) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ backgroundColor: 'rgba(141, 142, 144, 0.4)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            <Image
              src={selectedImage}
              alt="Review image full size"
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
