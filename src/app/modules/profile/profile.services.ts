import { StatusCodes } from 'http-status-codes';
import { CreateProfileInput, UpdateProfileInput } from './profile.validation';
import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../Errors/ApiError';

const upsertProfile = async (
  userId: string,
  input: CreateProfileInput | UpdateProfileInput
) => {
  try {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      // Update existing profile
      const profile = await prisma.profile.update({
        where: { userId },
        data: input,
      });
      return profile;
    } else {
      // Create new profile - ensure required fields
      const { firstName, lastName, phone, address, bio } =
        input as CreateProfileInput;
      if (!firstName || !lastName) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'firstName and lastName are required to create a profile.'
        );
      }
      const profile = await prisma.profile.create({
        data: {
          userId,
          firstName,
          lastName,
          phone,
          address,
          bio,
          profileImage: (input as any).profileImage || null,
        },
      });
      return profile;
    }
  } catch (error) {
    // This handles a race condition where a user might try to create a profile twice quickly
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Profile already exists for this user.'
      );
    }
    throw error;
  }
};

const getProfileByUserId = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Profile not found for this user.'
    );
  }
  return profile;
};

export const ProfileService = {
  upsertProfile,
  getProfileByUserId,
};
