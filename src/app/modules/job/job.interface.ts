import { Company, Application } from '@prisma/client';

export type JobData = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: number;
  type?: string;
  companyId: string;
  company: Company;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  applications: Application[];
  skills: string[];
};

export type IJobFilterRequest = {
  searchTerm?: string;
  title?: string;
  location?: string;
  type?: string;
  salary?: number;
  companyId?: number;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
  isActive?: boolean;
  sortBy?: string;
};
