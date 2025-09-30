import { Router } from 'express';
import { uploadResumeSchema } from './resume.validation';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';
import { validate } from '../../middlewares/validation';
import { ResumeController } from './resume.controller';

const router = Router();

// Upload a resume
router.post(
  '/',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  FileUploadHelper.upload.single('resumeFile'),
  validate(uploadResumeSchema),
  ResumeController.uploadResumeHandler
);

// List resumes for current user
router.get(
  '/',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ResumeController.getMyResumesHandler
);

// Get single resume by id (owner only)
router.get(
  '/:resumeId',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ResumeController.getResumeByIdHandler
);

// Update resume (title, isDefault)
router.put(
  '/:resumeId',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ResumeController.updateResumeHandler
);

// Set a resume as default
router.put(
  '/:resumeId/default',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ResumeController.setDefaultResumeHandler
);

// Delete a resume
router.delete(
  '/:resumeId',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  ResumeController.deleteResumeHandler
);

export const ResumeRoutes = router;
