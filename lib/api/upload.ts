import { fetchWithAuth } from './fetch-with-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export interface UploadImageResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload một ảnh lên Cloudinary
 * @param file File ảnh cần upload
 * @param folder Folder trên Cloudinary (mặc định: 'reviews')
 * @returns Promise với thông tin ảnh đã upload
 */
export async function uploadImage(
  file: File,
  folder: string = 'reviews'
): Promise<UploadImageResponse> {
  // Validate file
  if (!file) {
    throw new Error('Không có file được chọn');
  }

  // Validate file type
  if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/i)) {
    throw new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)');
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Kích thước ảnh không được vượt quá 10MB');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);

  // Upload to backend
  const response = await fetchWithAuth(
    `${API_URL}/upload/user-image?folder=${encodeURIComponent(folder)}`,
    {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
      headers: {},
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Lỗi khi upload ảnh' }));
    throw new Error(errorData.message || 'Lỗi khi upload ảnh lên Cloudinary');
  }

  return response.json();
}

/**
 * Upload nhiều ảnh lên Cloudinary
 * @param files Mảng các file ảnh cần upload
 * @param folder Folder trên Cloudinary (mặc định: 'reviews')
 * @returns Promise với mảng thông tin các ảnh đã upload
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'reviews'
): Promise<UploadImageResponse[]> {
  if (!files || files.length === 0) {
    throw new Error('Không có file được chọn');
  }

  // Upload từng ảnh một (vì endpoint user-image chỉ nhận 1 file)
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

