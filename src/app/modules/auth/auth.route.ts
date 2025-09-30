import express from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validation';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from './auth.validation';
import auth from '../../middlewares/auth';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';

const router = express.Router();

router.post(
  '/register',
  FileUploadHelper.upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  validate(registerSchema),
  AuthController.insertIntoDb
);
router.post('/login', validate(loginSchema), AuthController.loginUser);
router.post('/refresh', AuthController.refreshToken);
router.post(
  '/change-password',
  auth(),
  validate(changePasswordSchema),
  AuthController.changePassword
);

export const AuthRoutes = router;
