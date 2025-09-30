import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import multer from 'multer';
import type { Express } from 'express';

// This helper is designed to be easily swappable with an S3 upload function in the future.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'resumes' },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (result && result.secure_url) return resolve(result.secure_url);
        reject(new Error('Cloudinary upload failed'));
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
