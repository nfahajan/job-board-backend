import express from 'express';
import { CompanyController } from './company.controller';
import { createCompanySchema } from './compnay.validation';
import { validate } from '../../middlewares/validation';

const router = express.Router();

router.get('/', validate(createCompanySchema), CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getByIdFromDb);
router.post('/', CompanyController.createInDb);
router.patch('/:id', CompanyController.updateByIdFromDb);

export const CompanyRoutes = router; 