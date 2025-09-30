import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().uuid('A valid job ID is required'),
    resumeId: z.string().uuid('A valid resume ID is required'),
    coverLetter: z.string().max(2000, 'Cover letter cannot exceed 2000 characters').optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ApplicationStatus),
  }),
  params: z.object({
    applicationId: z.string().uuid(),
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>['body'];
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
