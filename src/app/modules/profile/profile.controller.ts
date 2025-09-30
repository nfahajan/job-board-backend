import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendRespons';
import { ProfileService } from './profile.services';
import { JwtPayload } from 'jsonwebtoken';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';

const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const payload = req.body;

  // Handle profile image upload if file is provided
  if (req.file) {
    try {
      const imageUrl = await FileUploadHelper.uploadToCloudinary(
        req.file,
        'profile-images'
      );
      if (imageUrl) {
        payload.profileImage = imageUrl;
      }
    } catch (error) {
      sendResponse(res, {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to upload profile image',
        data: null,
      });
      return;
    }
  }

  const result = await ProfileService.upsertProfile(user.id as string, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await ProfileService.getProfileByUserId(user.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

export const ProfileController = { upsertProfile, getProfile };
