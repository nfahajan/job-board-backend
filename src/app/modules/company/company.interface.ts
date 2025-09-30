import { Job, User } from '@prisma/client';

export type CompanyData = {
  id: number;
  userId: number;
  user?: User | null;
  name: string;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  logo?: string | null;
  jobs: Job[];
};
