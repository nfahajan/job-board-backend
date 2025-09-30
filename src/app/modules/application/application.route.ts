import express from 'express';
import { ApplicationController } from './application.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get('/:id', ApplicationController.getByIdFromDb);
router.get('/job/:jobId', auth(ENUM_USER_ROLE.EMPLOYER),ApplicationController.getJobApplicationsHandler);
router.post('/',auth(ENUM_USER_ROLE.JOB_SEEKER), ApplicationController.createInDb);
router.get('/my-applications', auth(ENUM_USER_ROLE.JOB_SEEKER), ApplicationController.getMyApplicationsHandler);

router.patch('/:id', ApplicationController.updateByIdFromDb);
router.delete('/:id', ApplicationController.deleteByIdFromDb);

export const ApplicationRoutes = router; 