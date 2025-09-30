import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters long'),
    description: z.string().optional(),
    website: z.string().url('Must be a valid URL').optional(),
    address: z.string().optional(),
    logo: z
      .string()
      .url('Valid logo URL is required')
      .optional()
      .or(z.literal('')),
  }),
});

export const updateCompanySchema = z.object({
  body: createCompanySchema.shape.body.partial(), // All fields are optional
  params: z.object({
    companyId: z.string().uuid('A valid company ID is required'),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('A valid user email is required'),
    role: z.string().min(2, 'Member role is required'), // e.g., 'recruiter'
  }),
  params: z.object({
    companyId: z.string().uuid('A valid company ID is required'),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
