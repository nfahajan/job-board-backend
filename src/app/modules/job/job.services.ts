import { paginationHelper } from '../../../helper/paginationHelper';
import IPaginationOption from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  jobRelationalFields,
  jobRelationalFieldsMapper,
  jobSearchableFields,
} from './job.constant';
import { IJobFilterRequest } from './job.interface';
import { Job, Prisma } from '@prisma/client';
import { CreateJobInput } from './job.validation';
import ApiError from '../../../Errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getAllFromDb = async (
  filters: IJobFilterRequest,
  options: IPaginationOption
) => {
  const { searchTerm, ...filterData } = filters;

  const { page, size, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: jobSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => {
        if (jobRelationalFields.includes(field)) {
          return {
            [jobRelationalFieldsMapper[field]]: {
              id: value as string,
            },
          };
        } else {
          return {
            [field]: value,
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.JobWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.job.findMany({
    where: whereConditions,
    skip,
    take: size,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    include: {
      company: true,
      applications: true,
    },
  });

  const total = await prisma.job.count({ where: whereConditions });

  return {
    meta: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    },
    data: result,
  };
};

const getByIdFromDb = async (id: string) => {
  return await prisma.job.findUnique({
    where: { id: id },
    include: {
      company: true,
      applications: true,
    },
  });
};

const createInDb = async (input: CreateJobInput, userId: string) => {
  const member = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId: userId,
        companyId: input.companyId,
      },
    },
  });

  if (!member) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not a member of this company.'
    );
  }

  // Create the job with skills as string array
  const result = await prisma.job.create({
    data: {
      ...input,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
    include: {
      company: true,
      applications: true,
    },
  });

  return result;
};

const updateByIdFromDb = async (id: string, payload: Partial<Job>) => {
  return prisma.job.update({
    where: { id: id },
    data: payload,
    include: {
      company: true,
      applications: true,
    },
  });
};

const deleteByIdFromDb = async (id: string, userId: string) => {
  // Check if user is authorized to delete this job
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!job) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Job not found');
  }

  if (!job.company.members.length) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this job'
    );
  }

  return await prisma.job.delete({
    where: { id: id },
    include: {
      company: true,
      applications: true,
    },
  });
};

const getMyJobsFromDb = async (compnayId: string, filters: any) => {
  const { searchTerm, isActive, type, page = 1, limit = 10 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  // Get user's companies
  const userCompanies = await prisma.companyMember.findUnique({
    where: {
      id: compnayId,
    },
  });

  if (!userCompanies) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
  }

  const companyIds = userCompanies.companyId;

  const andConditions: any[] = [{ companyId: { in: companyIds } }];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (isActive !== undefined) {
    andConditions.push({ isActive });
  }

  if (type) {
    andConditions.push({ type });
  }

  const whereConditions = { AND: andConditions };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: whereConditions,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
        applications: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    }),
    prisma.job.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: jobs,
  };
};

const updateJobStatusFromDb = async (
  id: string,
  isActive: boolean,
  userId: string
) => {
  // Check if user is authorized to update this job
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!job) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Job not found');
  }

  if (!job.company.members.length) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this job'
    );
  }

  return await prisma.job.update({
    where: { id },
    data: { isActive },
    include: {
      company: true,
      applications: true,
    },
  });
};

export const JobService = {
  getAllFromDb,
  getByIdFromDb,
  createInDb,
  updateByIdFromDb,
  deleteByIdFromDb,
  getMyJobsFromDb,
  updateJobStatusFromDb,
};
