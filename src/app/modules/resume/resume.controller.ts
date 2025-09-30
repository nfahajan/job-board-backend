import { Request, Response } from 'express';
import { UploadResumeInput } from './resume.validation';
import catchAsync from '../../../shared/catchAsync';
import { ResumeService } from './resume.service';
import type { Express } from 'express';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';

 const uploadResumeHandler = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const file = req.file as Express.Multer.File;
  const input: UploadResumeInput = req.body;

  // Call the service to handle resume upload
  const result = await ResumeService.createResume(userId, input, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Jobs fetched successfully',
    success: true,
    data: result,
  });
});

const deleteResumeHandler = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { resumeId } = req.params;

  // Call the service to handle resume deletion
  await ResumeService.deleteResume(userId, resumeId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Resume deleted successfully',
    success: true,
    data: null,
  });
});

const getAllResumesHandler = catchAsync(async (req: Request, res: Response) => {
  // Call the service to get all resumes
  const result = await ResumeService.getAllResumes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Resumes fetched successfully',
    success: true,
    data: result,
  });
});

const getResumeByIdHandler = catchAsync(async (req: Request, res: Response) => {
  const { resumeId } = req.params;
    // Call the service to get resume by ID
    const result = await ResumeService.getDefaultResume(resumeId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Resume fetched successfully',
        success: true,
        data: result,
        });
});

export const ResumeController = {
  uploadResumeHandler,
  deleteResumeHandler,
  getAllResumesHandler,
    getResumeByIdHandler,
};