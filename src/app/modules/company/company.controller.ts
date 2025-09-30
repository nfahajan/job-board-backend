import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendRespons';
import httpStatus from 'http-status';
import { CompanyService } from './company.services';



const getAllCompanies = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.findAllCompanies();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Companies fetched successfully',
    success: true,
    data: result,
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
   const {id} = req.user as any;
  const result = await CompanyService.createCompany(req.body, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Company created successfully',
    success: true,
    data: result,
  });
});

const updateByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.updateCompany(req.params.id, req.body);
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