import express from 'express';
import { UserController } from './user.controller';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';

const router = express.Router();

router.get('/me', auth(), UserController.getMe);
router.get('/', auth(ENUM_USER_ROLE.ADMIN), UserController.getAllFromDb);
router.get('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.getByIdFromDb);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  UserController.deleteByIdFromDb
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  FileUploadHelper.upload.single('file'),
  UserController.updateByIdFromDb
);

export const UserRoutes = router;
