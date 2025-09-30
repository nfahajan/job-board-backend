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
  const {
    searchTerm,
    minSalary,
    maxSalary,
    skills,
    isActive,
    sortBy: filterSortBy,
    ...filterData
  } = filters;

  const { page, size, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andConditions = [];

  // Only show active jobs by default
  andConditions.push({ isActive: isActive !== undefined ? isActive : true });

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

  // Handle salary range filtering
  if (minSalary !== undefined || maxSalary !== undefined) {
    const salaryFilter: any = {};
    if (minSalary !== undefined) {
      salaryFilter.gte = Number(minSalary);
    }
    if (maxSalary !== undefined) {
      salaryFilter.lte = Number(maxSalary);
    }
    andConditions.push({ salary: salaryFilter });
  }

  // Handle skills filtering
  if (skills && Array.isArray(skills) && skills.length > 0) {
    andConditions.push({
      skills: {
        hasSome: skills,
      },
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

  // Handle custom sorting
  let orderBy: any = { createdAt: 'desc' };
  if (filterSortBy) {
    switch (filterSortBy) {
      case 'date':
        orderBy = { createdAt: 'desc' };
        break;
      case 'salary':
        orderBy = { salary: 'desc' };
        break;
      case 'company':
        orderBy = { company: { name: 'asc' } };
        break;
      case 'relevance':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
  } else if (sortBy && sortOrder) {
    orderBy = { [sortBy]: sortOrder };
  }

  const result = await prisma.job.findMany({
    where: whereConditions,
    skip,
    take: size,
    orderBy,
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

const getMyJobsFromDb = async (userId: string, filters: any) => {
  try {
    const { searchTerm, isActive, type, page = 1, limit = 10 } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    // Get user's companies
    const userCompanies = await prisma.companyMember.findMany({
      where: {
        userId: userId,
      },
    });

    const companyIds = userCompanies.map(company => company.companyId);

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

    if (type && type !== '') {
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
  } catch (error) {
    console.error('Error in getMyJobsFromDb:', error);
    throw error;
  }
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

const searchJobsFromDb = async (filters: any, options: IPaginationOption) => {
  const { keyword, sortBy } = filters;
  const { page, size, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.JobWhereInput[] = [];

  // Only show active jobs
  andConditions.push({ isActive: true });

  // Search in job title, location, and company name
  if (keyword) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: keyword,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          location: {
            contains: keyword,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          company: {
            name: {
              contains: keyword,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.JobWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Handle custom sorting
  let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortBy) {
    switch (sortBy) {
      case 'date':
        orderBy = { createdAt: 'desc' };
        break;
      case 'salary':
        orderBy = { salary: 'desc' };
        break;
      case 'company':
        orderBy = { company: { name: 'asc' } };
        break;
      case 'relevance':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
  }

  const result = await prisma.job.findMany({
    where: whereConditions,
    skip,
    take: size,
    orderBy,
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

export const JobService = {
  getAllFromDb,
  getByIdFromDb,
  createInDb,
  updateByIdFromDb,
  deleteByIdFromDb,
  getMyJobsFromDb,
  updateJobStatusFromDb,
  searchJobsFromDb,
};
