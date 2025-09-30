import express from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validation';
import { loginSchema, registerSchema } from './auth.validation';

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.insertIntoDb);
router.post('/login', validate(loginSchema), AuthController.loginUser);
router.post('/refresh', AuthController.refreshToken);

export const AuthRoutes = router;
