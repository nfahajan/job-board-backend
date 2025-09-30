/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import { UserService } from './user.services';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';

const getAllFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully!',
    data: result,
  });
});

const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getByIdFromDb(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully!',
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
    return;
  }

  const result = await UserService.getMe(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const updateByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  if (req.file) {
    const imageUrl = await FileUploadHelper.uploadToCloudinary(req.file);
    if (imageUrl) {
      payload.profileImage = imageUrl;
    }
  }

  const result = await UserService.updateByIdFromDb(id, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully!',
    data: result,
  });
});

const deleteByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteByIdFromDb(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully!',
    data: result,
  });
});

export const UserController = {
  getAllFromDb,
  getByIdFromDb,
  getMe,
  updateByIdFromDb,
  deleteByIdFromDb,
};