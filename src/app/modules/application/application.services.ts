import prisma from '../../../shared/prisma';
import { ApplicationData } from './application.interface';
import { Application, ApplicationStatus } from '@prisma/client';
import { CreateApplicationInput } from './application.validation';
import ApiError from '../../../Errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getAllFromDb = async (
  userId: string,
  filters?: { page?: number; limit?: number; status?: string }
) => {
  const page = Number(filters?.page) > 0 ? Number(filters?.page) : 1;
  const limit = Number(filters?.limit) > 0 ? Number(filters?.limit) : 10;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (filters?.status) {
    const normalized = String(filters.status).toUpperCase();
    const mapToEnum: Record<string, ApplicationStatus> = {
      PENDING: ApplicationStatus.PENDING,
      REVIEWED: ApplicationStatus.REVIEWED,
      INTERVIEWING: ApplicationStatus.INTERVIEWING,
      OFFERED: ApplicationStatus.OFFERED,
      REJECTED: ApplicationStatus.REJECTED,
      HIRED: ApplicationStatus.HIRED,
      // Frontend alias → Prisma enum
      ACCEPTED: ApplicationStatus.HIRED,
    };
    if (mapToEnum[normalized]) {
      where.status = mapToEnum[normalized];
    }
  }

  const [total, result] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            salary: true,
            type: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
            isDefault: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return { data: result, meta: { page, limit, total } };
};

const findByIdFromDb = async (id: string) => {
  // Verify the employer has the right to view these applications
  const job = await prisma.job.findUnique({
    where: {
      id: id,
    },
  });
  return job;
};

const findJobApplications = async (employerId: string, jobId: string) => {
  // Verify the employer has the right to view these applications
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      company: {
        members: { some: { userId: employerId } },
      },
    },
  });

  if (!job) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Job not found or you don't have permission to view its applications."
    );
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

const findEmployerApplications = async (employerId: string) => {
  return prisma.application.findMany({
    where: {
      job: {
        company: {
          members: { some: { userId: employerId } },
        },
      },
    },
    include: {
      user: { select: { email: true, profile: true } },
      resume: { select: { title: true, fileUrl: true } },
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          company: { select: { id: true, name: true, logo: true } },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });
};

const createInDb = async (userId: string, input: CreateApplicationInput) => {
  const { jobId, resumeId, coverLetter } = input;

  const job = await prisma.job.findFirst({
    where: { id: jobId, isActive: true },
  });
  if (!job) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Job not found or is no longer active. Please check the job ID.'
    );
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Resume not found or does not belong to you.'
    );
  }

  const existingApplication = await prisma.application.findFirst({
    where: { userId, jobId },
  });
  if (existingApplication) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'You have already applied for this job.'
    );
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      userId,
      resumeId,
      coverLetter,
      status: 'PENDING',
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          salary: true,
          type: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
      resume: {
        select: {
          id: true,
          title: true,
          fileUrl: true,
          isDefault: true,
        },
      },
    },
  });

  return application;
};

const updateByIdFromDb = async (
  id: string,
  payload: Partial<Application>
): Promise<ApplicationData | null> => {
  const res = await prisma.application.update({
    where: { id: id },
    data: payload,
    include: {
      user: true,
      job: true,
    },
  });
  return res;
};

const deleteByIdFromDb = async (
  id: string
): Promise<ApplicationData | null> => {
  const res = prisma.application.delete({
    where: { id: id },
    include: {
      user: true,
      job: true,
    },
  });
  return res;
};

const getStatsForUser = async (userId: string) => {
  const [total, pending, interviewing, offered, rejected, hired, recent] =
    await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.PENDING },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.INTERVIEWING },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.OFFERED },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.REJECTED },
      }),
      prisma.application.count({
        where: { userId, status: ApplicationStatus.HIRED },
      }),
      prisma.application.findMany({
        where: { userId },
        orderBy: { appliedAt: 'desc' },
        take: 5,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              company: { select: { id: true, name: true, logo: true } },
            },
          },
          resume: { select: { id: true, title: true } },
        },
      }),
    ]);

  return {
    totalApplications: total,
    pendingApplications: pending,
    interviewingApplications: interviewing,
    offeredApplications: offered,
    rejectedApplications: rejected,
    acceptedApplications: hired,
    recentApplications: recent,
  };
};

const getStatsForEmployer = async (employerId: string) => {
  const [
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    recent,
  ] = await Promise.all([
    prisma.job.count({
      where: {
        company: { members: { some: { userId: employerId } } },
      },
    }),
    prisma.job.count({
      where: {
        isActive: true,
        company: { members: { some: { userId: employerId } } },
      },
    }),
    prisma.application.count({
      where: {
        job: { company: { members: { some: { userId: employerId } } } },
      },
    }),
    prisma.application.count({
      where: {
        status: ApplicationStatus.PENDING,
        job: { company: { members: { some: { userId: employerId } } } },
      },
    }),
    prisma.application.findMany({
      where: {
        job: { company: { members: { some: { userId: employerId } } } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: { select: { id: true, name: true, logo: true } },
          },
        },
        user: { select: { email: true, profile: true } },
      },
    }),
  ]);

  return {
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    recentApplications: recent,
  };
};

const getMonthlyApplicationStats = async (userId: string) => {
  // Get application counts grouped by month for the current year
  const currentYear = new Date().getFullYear();

  const monthlyStats = await prisma.$queryRaw<
    Array<{ month: number; count: number }>
  >`
    SELECT 
      EXTRACT(MONTH FROM "appliedAt") as month,
      COUNT(*)::int as count
    FROM "Application"
    WHERE "userId" = ${userId}
      AND EXTRACT(YEAR FROM "appliedAt") = ${currentYear}
    GROUP BY EXTRACT(MONTH FROM "appliedAt")
    ORDER BY month ASC
  `;

  // Create array with all 12 months, filling in 0 for months with no applications
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const result = months.map((monthName, index) => {
    const monthNumber = index + 1;
    const foundStat = monthlyStats.find(stat => stat.month === monthNumber);
    return {
      month: monthName,
      count: foundStat?.count || 0,
    };
  });

  return result;
};

export const ApplicationService = {
  getAllFromDb,
  findByIdFromDb,
  findJobApplications,
  findEmployerApplications,
  createInDb,
  updateByIdFromDb,
  deleteByIdFromDb,
  getStatsForUser,
  getStatsForEmployer,
  getMonthlyApplicationStats,
};
