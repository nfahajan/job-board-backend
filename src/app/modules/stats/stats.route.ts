import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { StatsController } from './stats.controller';

const router = express.Router();

router.get('/admin', auth(ENUM_USER_ROLE.ADMIN), StatsController.getAdminStats);

export const StatsRoutes = router;
