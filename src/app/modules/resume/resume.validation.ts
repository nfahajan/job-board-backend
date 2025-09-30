import { z } from 'zod';

export const uploadResumeSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Resume title must be at least 3 characters'),
    isDefault: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional()
    ),
  }),
});

export const updateResumeSchema = z.object({
    body: z.object({
        title: z.string().min(3).optional(),
        isDefault: z.boolean().optional(),
    }),
    params: z.object({
        resumeId: z.string().uuid(),
    }),
});


export type UploadResumeInput = z.infer<typeof uploadResumeSchema>['body'];
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
