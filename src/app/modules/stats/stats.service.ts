import prisma from '../../../shared/prisma';

const getAdminStats = async () => {
  const [
    totalUsers,
    totalCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    recentUsers,
    recentJobs,
    recentApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.job.count(),
    prisma.job.count({ where: { isActive: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, role: true, createdAt: true },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        location: true,
        isActive: true,
        createdAt: true,
        company: { select: { id: true, name: true, logo: true } },
      },
    }),
    prisma.application.findMany({
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { id: true, name: true, logo: true } },
          },
        },
        user: { select: { email: true, profile: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    recentUsers,
    recentJobs,
    recentApplications,
  };
};

export const StatsService = {
  getAdminStats,
};
