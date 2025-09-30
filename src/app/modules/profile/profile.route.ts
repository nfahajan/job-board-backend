import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ProfileController } from './profile.controller';
import { validate } from '../../middlewares/validation';
import { createProfileSchema, updateProfileSchema } from './profile.validation';

const router = express.Router();


router.use( auth(ENUM_USER_ROLE.JOB_SEEKER,));

router
  .route('/')
  .get(ProfileController.getProfile)
  .post(validate(createProfileSchema), ProfileController.upsertProfile)
  .patch(validate(updateProfileSchema), ProfileController.upsertProfile);

export const ProfileRoutes = router;