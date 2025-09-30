import express from 'express';
import { CompanyController } from './company.controller';
import { createCompanySchema } from './compnay.validation';
import { validate } from '../../middlewares/validation';
import auth from '../../middlewares/auth';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getByIdFromDb);

// Admin routes
router.get(
  '/admin/all',
  auth(ENUM_USER_ROLE.ADMIN),
  CompanyController.getAllCompanies
);
router.patch(
  '/admin/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  CompanyController.updateByIdFromDb
);
router.post('/', auth(), CompanyController.createInDb);
router.patch(
  '/:id',
  auth(),
  FileUploadHelper.upload.single('logo'),
  CompanyController.updateByIdFromDb
);

export const CompanyRoutes = router;
