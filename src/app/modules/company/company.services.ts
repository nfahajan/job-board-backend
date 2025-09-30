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

const findAllCompanies = async () => {
  return prisma.company.findMany({
    include: {
      _count: {
        select: { jobs: { where: { isActive: true } } },
      },
    },
  });
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
