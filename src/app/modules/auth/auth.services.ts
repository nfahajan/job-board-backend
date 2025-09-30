import { Role } from '@prisma/client';
import prisma from '../../../shared/prisma';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import { jwtHelpers } from '../../../helper/jwtHelpers';
import { ILoginResponse, ILoginUser } from './auth.interface';
import ApiError from '../../../Errors/ApiError';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';

const insertIntoDb = async (userData: any) => {
  try {
    const { role, ...userFields } = userData;

    // Validate required fields based on role
    if (role === 'jobSeeker') {
      const requiredFields = ['firstName', 'lastName', 'phone', 'bio'];
      for (const field of requiredFields) {
        if (!userFields[field] || userFields[field].trim() === '') {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `${field} is required for job seekers`
          );
        }
      }
    } else if (role === 'employer') {
      const requiredFields = ['companyName', 'address'];
      for (const field of requiredFields) {
        if (!userFields[field] || userFields[field].trim() === '') {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `${field} is required for employers`
          );
        }
      }
    }

    // Hash password with proper salt rounds
    const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
    const hashedPassword = await bcrypt.hash(userFields.password, saltRounds);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userFields.email },
    });

    if (existingUser) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'User already exists with this email'
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async tx => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: userFields.email,
          password: hashedPassword,
          role: role as Role,
        },
      });

      if (role === 'jobSeeker') {
        // Create profile for job seeker
        await tx.profile.create({
          data: {
            firstName: userFields.firstName,
            lastName: userFields.lastName,
            phone: userFields.phone,
            bio: userFields.bio,
            userId: user.id,
          },
        });

        // Create resume if provided
        if (userFields.resumeUrl && userFields.resumeUrl.trim() !== '') {
          await tx.resume.create({
            data: {
              title: 'Default Resume',
              fileUrl: userFields.resumeUrl,
              userId: user.id,
              isDefault: true,
            },
          });
        }
      } else if (role === 'employer') {
        // Create company for employer
        const company = await tx.company.create({
          data: {
            name: userFields.companyName,
            website:
              userFields.website && userFields.website.trim() !== ''
                ? userFields.website
                : null,
            address: userFields.address,
          },
        });

        // Create company member with owner role
        await tx.companyMember.create({
          data: {
            role: 'owner',
            userId: user.id,
            companyId: company.id,
          },
        });
      }

      return user;
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Log the error for debugging
    console.error('Registration error:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Registration failed. Please try again later.'
    );
  }
};

const loginUser = async (payload: ILoginUser): Promise<ILoginResponse> => {
  const { email, password } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      profile: true,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const isMatchPass = await bcrypt.compare(password, isUserExist?.password);
  if (isUserExist?.password && !isMatchPass) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Incorrect password!');
  }

  const id = isUserExist?.id;
  const role = isUserExist?.role;

  const token = jwtHelpers.createToken(
    { id, role, email: isUserExist.email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as number | string
  );

  const refreshToken = jwtHelpers.createToken(
    { id, role, email: isUserExist.email },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as number | string
  );

  return {
    token,
    refreshToken,
  };
};

const refreshToken = async (
  refreshToken: string
): Promise<{ token: string }> => {
  try {
    const decoded = jwtHelpers.verifyToken(
      refreshToken,
      config.jwt.refresh_secret as Secret
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    const token = jwtHelpers.createToken(
      { id: user.id, role: user.role, email: user.email },
      config.jwt.secret as Secret,
      config.jwt.expires_in as number | string
    );

    return { token };
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
};

export const AuthService = {
  insertIntoDb,
  loginUser,
  refreshToken,
};
