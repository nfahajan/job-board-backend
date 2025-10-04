import express from 'express';
import { JobController } from './job.controller';
import { validate } from '../../middlewares/validation';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  getMyJobsSchema,
  searchJobsSchema,
} from './job.validation';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

// Public routes
router.get('/', JobController.getAllJobs);
router.get('/search', validate(searchJobsSchema), JobController.searchJobs);

// Admin routes
router.get('/admin/all', auth(ENUM_USER_ROLE.ADMIN), JobController.getAllJobs);
router.patch(
  '/admin/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  JobController.updateByIdFromDb
);

router.delete(
  '/admin/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  JobController.deleteByIdFromDb
);

// Employer protected routes
router.get(
  '/my-jobs',
  auth(ENUM_USER_ROLE.EMPLOYER),
  validate(getMyJobsSchema),
  JobController.getMyJobs
);

// Public routes (must come after specific routes)
router.get('/:id', JobController.getByIdFromDb);
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
