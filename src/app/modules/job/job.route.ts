import express from 'express';
import { JobController } from './job.controller';
import { validate } from '../../middlewares/validation';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  getMyJobsSchema,
} from './job.validation';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

// Public routes
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getByIdFromDb);

// Employer protected routes
router.get(
  '/my-jobs/:compnayId',
  auth(ENUM_USER_ROLE.EMPLOYER),
  validate(getMyJobsSchema),
  JobController.getMyJobs
);
router.post(
  '/',
  auth(ENUM_USER_ROLE.EMPLOYER),
  validate(createJobSchema),
  JobController.createInDb
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.EMPLOYER),
  validate(updateJobSchema),
  JobController.updateByIdFromDb
);
router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.EMPLOYER),
  validate(updateJobStatusSchema),
  JobController.updateJobStatus
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.EMPLOYER),
  JobController.deleteByIdFromDb
);

export const JobRoutes = router;
