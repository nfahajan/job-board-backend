import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';
import multer from 'multer';
import type { Express } from 'express';

// This helper is designed to be easily swappable with an S3 upload function in the future.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'general'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      reject(
        new Error(
          'Cloudinary configuration is missing. Please check your environment variables.'
        )
      );
      return;
    }

    // Determine file type and folder
    const fileType = file.mimetype.startsWith('image/')
      ? 'images'
      : 'documents';
    const uploadFolder = `${folder}/${fileType}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: uploadFolder,
        resource_type: fileType === 'images' ? 'image' : 'raw',
        public_id: `${Date.now()}_${file.originalname.replace(
          /\.[^/.]+$/,
          ''
        )}`,
        overwrite: true,
        transformation:
          fileType === 'images'
            ? [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
            : undefined,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`File upload failed: ${error.message}`));
          return;
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(
            new Error('Cloudinary upload failed - no secure URL returned')
          );
        }
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (
  secureUrl: string
): Promise<UploadApiResponse | undefined> => {
  return new Promise((resolve, reject) => {
    const parts = secureUrl.split('/');
    if (parts.length > 0) {
      const publicId = parts.pop()?.replace(/\.[^/.]+$/, '');
      if (publicId) {
        cloudinary.uploader.destroy(
          publicId,
          (error: Error, result: UploadApiResponse) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      } else {
        reject(new Error('Failed to extract publicId'));
      }
    } else {
      reject(new Error('Invalid secureUrl format'));
    }
  });
};

// Multer instance for file upload middleware
const upload = multer();

export const FileUploadHelper = {
  uploadToCloudinary,
  deleteFromCloudinary,
  upload,
};
