import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import { ApplicationService } from './application.services';
import { JwtPayload } from 'jsonwebtoken';

const getMyApplicationsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { page, limit, status } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
    };
    const { data, meta } = await ApplicationService.getAllFromDb(user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status || undefined,
    });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Applications fetched successfully',
      success: true,
      meta,
      data,
    });
  }
);

const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.findByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Application fetched successfully',
    success: true,
    data: result,
  });
});

const getJobApplicationsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const employerId = req.user?.id as string;
    const { jobId } = req.params;
    const result = await ApplicationService.findJobApplications(
      employerId,
      jobId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Job applications fetched successfully',
      success: true,
      data: result,
    });
  }
);

const getEmployerApplicationsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const employerId = req.user?.id as string;
    const result = await ApplicationService.findEmployerApplications(
      employerId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Employer applications fetched successfully',
      success: true,
      data: result,
    });
  }
);

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
  const result = await ApplicationService.updateByIdFromDb(
    req.params.id,
    req.body
  );
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

const getMyStatsHandler = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const stats = await ApplicationService.getStatsForUser(user.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dashboard stats fetched successfully',
    success: true,
    data: stats,
  });
});

const getEmployerStatsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const employerId = req.user?.id as string;
    const stats = await ApplicationService.getStatsForEmployer(employerId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Employer dashboard stats fetched successfully',
      success: true,
      data: stats,
    });
  }
);

const getMonthlyStatsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const monthlyStats = await ApplicationService.getMonthlyApplicationStats(
      user.id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Monthly application stats fetched successfully',
      success: true,
      data: monthlyStats,
    });
  }
);

export const ApplicationController = {
  getMyApplicationsHandler,
  getByIdFromDb,
  createInDb,
  updateByIdFromDb,
  getJobApplicationsHandler,
  getEmployerApplicationsHandler,
  deleteByIdFromDb,
  getMyStatsHandler,
  getEmployerStatsHandler,
  getMonthlyStatsHandler,
};
