import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendRespons';
import { ProfileService } from './profile.services';
import { JwtPayload } from 'jsonwebtoken';


const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await ProfileService.upsertProfile(user.id as string, req.body);
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