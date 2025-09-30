import express from 'express';
import { ApplicationController } from './application.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

// Specific routes should come before dynamic ":id" to avoid conflicts
router.get(
  '/my-applications',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ApplicationController.getMyApplicationsHandler
);
router.get(
  '/my-stats',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ApplicationController.getMyStatsHandler
);
router.get(
  '/monthly-stats',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ApplicationController.getMonthlyStatsHandler
);
router.get(
  '/employer/stats',
  auth(ENUM_USER_ROLE.EMPLOYER),
  ApplicationController.getEmployerStatsHandler
);
router.get(
  '/job/:jobId',
  auth(ENUM_USER_ROLE.EMPLOYER),
  ApplicationController.getJobApplicationsHandler
);
router.get(
  '/employer/my-applications',
  auth(ENUM_USER_ROLE.EMPLOYER),
  ApplicationController.getEmployerApplicationsHandler
);
router.post(
  '/',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ApplicationController.createInDb
);

router.get('/:id', ApplicationController.getByIdFromDb);
router.patch('/:id', ApplicationController.updateByIdFromDb);
router.delete('/:id', ApplicationController.deleteByIdFromDb);

export const ApplicationRoutes = router;
