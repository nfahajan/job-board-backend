import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ProfileController } from './profile.controller';
import { validate } from '../../middlewares/validation';
import { createProfileSchema, updateProfileSchema } from './profile.validation';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';

const router = express.Router();

router.use(auth());

router
  .route('/')
  .get(ProfileController.getProfile)
  .post(
    FileUploadHelper.upload.single('profileImage'),
    validate(createProfileSchema),
    ProfileController.upsertProfile
  )
  .patch(
    FileUploadHelper.upload.single('profileImage'),
    validate(updateProfileSchema),
    ProfileController.upsertProfile
  );

export const ProfileRoutes = router;
