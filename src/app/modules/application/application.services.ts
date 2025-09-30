import prisma from '../../../shared/prisma';
import { ApplicationData } from './application.interface';
import { Application } from '@prisma/client';
import { CreateApplicationInput } from './application.validation';
import ApiError from '../../../Errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getAllFromDb =  async (userId: string) => {
   const result = await prisma.application.findMany({
        where: { userId },
        include: {
            job: {
                select: { title: true, company: { select: { name: true } } }
            }
        },
        orderBy: { appliedAt: 'desc' },
    });

    return result;
};

const findByIdFromDb = async (id:string) => {
    // Verify the employer has the right to view these applications
    const job = await prisma.job.findUnique({
        where: {
            id: id,
        }
    });
return job;
};


 const findJobApplications = async (employerId: string, jobId: string) => {
    // Verify the employer has the right to view these applications
    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            company: {
                members: { some: { userId: employerId } }
            }
        }
    });

    if (!job) {
        throw new ApiError(  StatusCodes.FORBIDDEN ,"Job not found or you don't have permission to view its applications.");
    }

    return prisma.application.findMany({
        where: { jobId },
        include: {
            user: { select: { email: true, profile: true } },
            resume: { select: { title: true, fileUrl: true } },
        },
        orderBy: { appliedAt: 'asc' },
    });
};


const createInDb = async (userId: string, input: CreateApplicationInput) => {
  const { jobId, resumeId, coverLetter } = input;

  const job = await prisma.job.findFirst({
    where: { id: jobId, isActive: true },
  });
  if (!job) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Job not found or is no longer active. Please check the job ID.');
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Resume not found or does not belong to you.', );
  }

  const existingApplication = await prisma.application.findFirst({
    where: { userId, jobId },
  });
  if (existingApplication) {
    throw new ApiError( StatusCodes.CONFLICT, 'You have already applied for this job.',);
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      userId,
      resumeId,
      coverLetter,
      status: 'PENDING',
    },
  });

  return application;
};

const updateByIdFromDb = async (id: string, payload: Partial<Application>): Promise<ApplicationData | null> => {
  const res =  await prisma.application.update({
    where: { id: id },
    data: payload,
    include: {
      user: true,
      job: true,
    },
  });
   return res;
};

const deleteByIdFromDb = async (id: string): Promise<ApplicationData | null> => {
  const res = prisma.application.delete({
    where: { id: id },
    include: {
      user: true,
      job: true,
    },
  });
  return res;
};

export const ApplicationService = {
  getAllFromDb,
  findByIdFromDb,
  findJobApplications,
  createInDb,
  updateByIdFromDb,
  deleteByIdFromDb,
}; 