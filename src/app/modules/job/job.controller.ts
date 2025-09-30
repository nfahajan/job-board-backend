import { Request, Response } from 'express';
import { JobService } from './job.services';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { jobFilterableFields } from './job.constant';

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, jobFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await JobService.getAllFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Jobs fetched successfully',
    success: true,
    data: result,
  });
});

const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job fetched successfully',
    success: true,
    data: result,
  });
});

const createInDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as { id: string };
  const result = await JobService.createInDb(req.body, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job created successfully',
    success: true,
    data: result,
  });
});

const updateByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await JobService.updateByIdFromDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job updated successfully',
    success: true,
    data: result,
  });
});

const deleteByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as { id: string };
  const result = await JobService.deleteByIdFromDb(req.params.id, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job deleted successfully',
    success: true,
    data: result,
  });
});

const getMyJobs = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as { id: string };
  const result = await JobService.getMyJobsFromDb(id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My jobs fetched successfully',
    success: true,
    data: result,
  });
});

const updateJobStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as { id: string };
  const result = await JobService.updateJobStatusFromDb(
    req.params.id,
    req.body.isActive,
    id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job status updated successfully',
    success: true,
    data: result,
  });
});

const searchJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['keyword', 'sortBy']);
  const options = pick(req.query, paginationFields);
  const result = await JobService.searchJobsFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Jobs searched successfully',
    success: true,
    data: result,
  });
});

export const JobController = {
  getAllJobs,
  getByIdFromDb,
  createInDb,
  updateByIdFromDb,
  deleteByIdFromDb,
  getMyJobs,
  updateJobStatus,
  searchJobs,
};
