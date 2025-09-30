import { Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendRespons';
import { StatsService } from './stats.service';
import catchAsync from '../../../shared/catchAsync';

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const data = await StatsService.getAdminStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin dashboard stats fetched successfully',
    data,
  });
});

export const StatsController = {
  getAdminStats,
};
