import { z } from 'zod';
import { Role } from '@prisma/client';

// Base registration schema with enhanced validation
const baseRegisterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('A valid email is required')
    .max(255, 'Email is too long')
    .transform(email => email.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: z.nativeEnum(Role, {
    errorMap: () => ({
      message: 'Invalid role specified. Must be jobSeeker, employer, or admin.',
    }),
  }),
});

// Job Seeker specific fields with enhanced validation
const jobSeekerFields = z.object({
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
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .transform(phone => phone.trim()),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters')
    .transform(bio => bio.trim()),
});

// Employer specific fields with enhanced validation
const employerFields = z.object({
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
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .transform(phone => phone?.trim() || ''),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .transform(bio => bio?.trim() || ''),
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long')
    .regex(
      /^[a-zA-Z0-9\s\-\.\,\&]+$/,
      'Company name contains invalid characters'
    )
    .transform(name => name.trim()),
  description: z
    .string()
    .min(10, 'Company description must be at least 10 characters')
    .max(1000, 'Company description must be less than 1000 characters')
    .optional()
    .transform(desc => desc?.trim() || ''),
  website: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Please enter a valid website URL (e.g., https://example.com)',
      }
    )
    .transform(website => website?.trim() || ''),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address is too long')
    .transform(address => address.trim()),
});

// Combined registration schema
export const registerSchema = z.object({
  body: z.union([
    baseRegisterSchema
      .extend({ role: z.literal(Role.jobSeeker) })
      .merge(jobSeekerFields),
    baseRegisterSchema
      .extend({ role: z.literal(Role.employer) })
      .merge(employerFields),
  ]),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
