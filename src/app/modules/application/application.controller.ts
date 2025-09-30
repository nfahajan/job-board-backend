import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import { ApplicationService } from './application.services';
import { JwtPayload } from 'jsonwebtoken';

const getMyApplicationsHandler = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload 
  const result = await ApplicationService.getAllFromDb(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Applications fetched successfully',
    success: true,
    data: result,
  });
});

const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {

  const result = await ApplicationService.findByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Application fetched successfully',
    success: true,
    data: result,
  });
});

const getJobApplicationsHandler = catchAsync(async (req: Request, res: Response) => {
        const employerId = req.user?.id as string;
        const { jobId } = req.params;
  const result = await ApplicationService.findJobApplications(employerId, jobId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job applications fetched successfully',
    success: true,
    data: result,
  });
});

const createInDb = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await ApplicationService.createInDb(user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Application created successfully',
    success: true,
    data: result,
  });
});

const updateByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.updateByIdFromDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Application updated successfully',
    success: true,
    data: result,
  });
});

const deleteByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.deleteByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Application deleted successfully',
    success: true,
    data: result,
  });
});

export const ApplicationController = {
  getMyApplicationsHandler,
  getByIdFromDb,
  createInDb,
  updateByIdFromDb,
  getJobApplicationsHandler,
  deleteByIdFromDb,
}; 