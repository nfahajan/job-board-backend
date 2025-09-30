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
  const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
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
      ...input,
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

const getAllResumes = async () => {
  const resumes = await prisma.resume.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return resumes;
};

const getDefaultResume = async (userId: string) => {
  const resume = await prisma.resume.findFirst({
    where: { userId, isDefault: true },
  });
  return resume;
};

export const ResumeService = {
  createResume,
  deleteResume,
  getAllResumes,
  getDefaultResume,
};
