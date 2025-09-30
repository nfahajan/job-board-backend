import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .transform(name => name.trim()),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .transform(name => name.trim()),
  phone: z
    .string()
    .optional()
    .transform(phone => phone?.trim() || '')
    .refine(
      phone => phone === '' || phone.length >= 10,
      'Phone number must be at least 10 digits'
    )
    .refine(
      phone => phone === '' || phone.length <= 15,
      'Phone number is too long'
    )
    .refine(
      phone => phone === '' || /^[\+]?[1-9][\d]{0,15}$/.test(phone),
      'Please enter a valid phone number'
    ),
  address: z
    .string()
    .optional()
    .transform(address => address?.trim() || '')
    .refine(
      address => address === '' || address.length >= 5,
      'Address must be at least 5 characters'
    )
    .refine(
      address => address === '' || address.length <= 200,
      'Address is too long'
    ),
  bio: z
    .string()
    .optional()
    .transform(bio => bio?.trim() || '')
    .refine(
      bio => bio === '' || bio.length >= 10,
      'Bio must be at least 10 characters'
    )
    .refine(
      bio => bio === '' || bio.length <= 500,
      'Bio cannot exceed 500 characters'
    ),
  profileImage: z
    .string()
    .url('Valid profile image URL is required')
    .optional()
    .or(z.literal('')),
});

export const createProfileSchema = z.object({
  body: profileSchema,
});

export const updateProfileSchema = z.object({
  body: profileSchema.partial(), // All fields are optional for updates
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
