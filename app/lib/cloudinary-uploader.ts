import type { VideoData } from '@/components/ui/form/gait-video-input';
import type { ImageData } from '@/components/ui/form/image-picker-input';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_VIDEO_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadToCloudinary(
  imageData: ImageData
): Promise<UploadResult> {
  if (!imageData.base64) {
    return {
      success: false,
      error: 'No image data provided',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${imageData.base64}`);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('folder', 'patients');

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.secure_url) {
      console.log('Image uploaded to Cloudinary:', data.secure_url);
      return {
        success: true,
        url: data.secure_url,
      };
    } else {
      console.error('Cloudinary upload error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to upload image',
      };
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: 'Network error while uploading image',
    };
  }
}

export async function uploadVideoToCloudinary(
  videoData: VideoData
): Promise<UploadResult> {
  if (!videoData.base64) {
    return {
      success: false,
      error: 'No video data provided',
    };
  }

  try {
    if (videoData.size) {
      const sizeInMB = (videoData.size / (1024 * 1024)).toFixed(2);
      console.log(`Uploading video to Cloudinary. Size: ${sizeInMB} MB`);
    }

    const formData = new FormData();
    formData.append('file', `data:video/mp4;base64,${videoData.base64}`);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('folder', 'gait-sessions');

    console.log('Uploading video to Cloudinary...');
    const response = await fetch(CLOUDINARY_VIDEO_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.secure_url) {
      console.log('Video uploaded to Cloudinary:', data.secure_url);
      return {
        success: true,
        url: data.secure_url,
      };
    } else {
      console.error('Cloudinary upload error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to upload video',
      };
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: 'Network error while uploading video',
    };
  }
}
