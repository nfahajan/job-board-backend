import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

export const createProfileSchema = z.object({
  body: profileSchema,
});

export const updateProfileSchema = z.object({
  body: profileSchema.partial(), // All fields are optional for updates
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
