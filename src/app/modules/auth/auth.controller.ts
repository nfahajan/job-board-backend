import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import { AuthService } from './auth.services';

const insertIntoDb = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  // Extract files based on role
  let resumeFile = null;
  let logoFile = null;

  if (files) {
    if (files.resume && files.resume[0]) {
      resumeFile = files.resume[0];
    }
    if (files.logo && files.logo[0]) {
      logoFile = files.logo[0];
    }
  }

  // Determine which file to use based on role
  const fileToUpload = req.body.role === 'jobSeeker' ? resumeFile : logoFile;

  const result = await AuthService.insertIntoDb(req.body, fileToUpload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully!',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await AuthService.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token refreshed successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
    return;
  }

  const result = await AuthService.changePassword(
    userId,
    currentPassword,
    newPassword
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

export const AuthController = {
  insertIntoDb,
  loginUser,
  refreshToken,
  changePassword,
};
