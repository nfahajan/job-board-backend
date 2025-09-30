import { StatusCodes } from 'http-status-codes';
import { UploadResumeInput } from './resume.validation';
import ApiError from '../../../Errors/ApiError';
import prisma from '../../../shared/prisma';
import { FileUploadHelper } from '../../../helper/cloudinaryHelper';
import type { Express } from 'express';

const createResume = async (
  userId: string,
  input: UploadResumeInput,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Resume file is required.');
  }

  // Upload file to Cloudinary
  const uploadResult = await FileUploadHelper.uploadToCloudinary(
    file,
    'resumes'
  );
  if (!uploadResult) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to upload resume.'
    );
  }

  // If setting this resume as default, unset other defaults first
  if (input.isDefault) {
    await prisma.resume.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const resume = await prisma.resume.create({
    data: {
      title: input.title,
      isDefault:
        input.isDefault === true ||
        (typeof input.isDefault === 'string' && input.isDefault === 'true'),
      userId,
      fileUrl: uploadResult,
    },
  });

  return resume;
};

const deleteResume = async (userId: string, resumeId: string) => {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume || resume.userId !== userId) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Resume not found or you do not have permission to delete it.'
    );
  }

  // Delete from Cloudinary
  await FileUploadHelper.deleteFromCloudinary(resume.fileUrl);

  // Delete from DB
  await prisma.resume.delete({ where: { id: resumeId } });
};

const getResumesByUser = async (userId: string) => {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return resumes;
};

const getResumeById = async (userId: string, resumeId: string) => {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Resume not found');
  }
  return resume;
};

const updateResume = async (
  userId: string,
  resumeId: string,
  data: Partial<{ title: string; isDefault: boolean }>
) => {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Resume not found');
  }

  if (data.isDefault) {
    await prisma.resume.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data: {
      title: data.title ?? resume.title,
      isDefault: data.isDefault ?? resume.isDefault,
    },
  });
  return updated;
};

const setDefaultResume = async (userId: string, resumeId: string) => {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Resume not found');
  }
  await prisma.resume.updateMany({
    where: { userId },
    data: { isDefault: false },
  });
  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data: { isDefault: true },
  });
  return updated;
};

export const ResumeService = {
  createResume,
  deleteResume,
  getResumesByUser,
  getResumeById,
  updateResume,
  setDefaultResume,
};
