import { z } from 'zod';
import { JobType } from '@prisma/client';

export const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  location: z.string(),
  salary: z.number().int().positive().optional(),
  type: z.nativeEnum(JobType).optional(),
  companyId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
  skills: z.array(z.string()).optional(),
});

export const createJobSchema = z.object({
  body: jobSchema,
});

export const updateJobSchema = z.object({
  body: jobSchema.partial(),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateJobStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getMyJobsSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    isActive: z.boolean().optional(),
    type: z.nativeEnum(JobType).optional().or(z.literal('')),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const searchJobsSchema = z.object({
  query: z.object({
    keyword: z.string().min(1, 'Search keyword is required'),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.enum(['date', 'salary', 'company', 'relevance']).optional(),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
export type GetMyJobsInput = z.infer<typeof getMyJobsSchema>;
export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
