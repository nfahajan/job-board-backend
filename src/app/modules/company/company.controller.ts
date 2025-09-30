import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import { CompanyService } from './company.services';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';

const getAllCompanies = catchAsync(async (req: Request, res: Response) => {
  const { search, page, limit } = req.query as {
    search?: string;
    page?: string;
    limit?: string;
  };
  const { data, meta } = await CompanyService.findAllCompanies({
    search: search || undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Companies fetched successfully',
    success: true,
    meta,
    data,
  });
});

const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.findCompanyById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Company fetched successfully',
    success: true,
    data: result,
  });
});

const createInDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await CompanyService.createCompany(req.body, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Company created successfully',
    success: true,
    data: result,
  });
});

const updateByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  // Handle company logo upload if file is provided
  if (req.file) {
    try {
      const imageUrl = await FileUploadHelper.uploadToCloudinary(
        req.file,
        'company-logos'
      );
      if (imageUrl) {
        payload.logo = imageUrl;
      }
    } catch (error) {
      sendResponse(res, {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to upload company logo',
        data: null,
      });
      return;
    }
  }

  const result = await CompanyService.updateCompany(req.params.id, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Company updated successfully',
    success: true,
    data: result,
  });
});

export const CompanyController = {
  getAllCompanies,
  getByIdFromDb,
  createInDb,
  updateByIdFromDb,
};
