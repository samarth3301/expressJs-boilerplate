import { z } from 'zod';

// Common validation schemas
export const idSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const emailSchema = z.string().email();

export const passwordSchema = z.string()
  .min(8)
  .max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  });

export const userRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
});