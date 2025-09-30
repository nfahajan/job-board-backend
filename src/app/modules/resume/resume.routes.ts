import { Router } from 'express';
import { uploadResumeSchema } from './resume.validation';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';
import { validate } from '../../middlewares/validation';
import { ResumeController } from './resume.controller';

const router = Router();

router.post(
  '/',
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  FileUploadHelper.upload.single('resumeFile'), // 'resumeFile' must match the field name in the form-data
  validate(uploadResumeSchema),
  ResumeController.uploadResumeHandler
);

router.delete('/:resumeId',  auth(ENUM_USER_ROLE.JOB_SEEKER),
 ResumeController.deleteResumeHandler);

router.get('/', auth(ENUM_USER_ROLE.JOB_SEEKER, ENUM_USER_ROLE.EMPLOYER), ResumeController.getAllResumesHandler);

router.get('/:resumeId', auth(ENUM_USER_ROLE.JOB_SEEKER, ENUM_USER_ROLE.EMPLOYER), ResumeController.getResumeByIdHandler);


// Routes for getting and updating resumes would go here

export const ResumeRoutes = router;
