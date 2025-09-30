// Extend Express Request interface to include 'user'

import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../Errors/ApiError';
import { jwtHelpers } from '../../helper/jwtHelpers';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // Extract token from "Bearer <token>" format
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // verify token
      let verifiedUser = null;

      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

      req.user = {
        id: verifiedUser.id,
        role: verifiedUser.role,
        email: verifiedUser.email,
      }; // role  , userid

      // role diye guard korar jnno
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action.'
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
