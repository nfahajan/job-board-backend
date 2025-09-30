import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../Errors/ApiError';
import prisma from '../../../shared/prisma';
import { CreateCompanyInput } from './compnay.validation';

const createCompany = async (input: CreateCompanyInput, userId: string) => {
  const company = await prisma.company.create({
    data: {
      ...input,
      members: {
        create: {
          userId: userId,
          role: 'owner',
        },
      },
    },
  });
  return company;
};

const findAllCompanies = async (args?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = args?.page && args.page > 0 ? args.page : 1;
  const limit = args?.limit && args.limit > 0 ? args.limit : 12;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (args?.search) {
    where.OR = [
      { name: { contains: args.search, mode: 'insensitive' } },
      { description: { contains: args.search, mode: 'insensitive' } },
      { address: { contains: args.search, mode: 'insensitive' } },
      { website: { contains: args.search, mode: 'insensitive' } },
    ];
  }

  const [total, companies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        jobs: { where: { isActive: true }, select: { id: true } },
      },
    }),
  ]);

  return { data: companies, meta: { page, limit, total } };
};

const findCompanyById = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      jobs: { where: { isActive: true } },
      members: { include: { user: { select: { id: true, email: true } } } },
    },
  });

  if (!company) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found.');
  }
  return company;
};

const updateCompany = async (companyId: string, input: CreateCompanyInput) => {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...input,
    },
  });
  return company;
};

export const CompanyService = {
  createCompany,
  findAllCompanies,
  findCompanyById,
  updateCompany,
};
