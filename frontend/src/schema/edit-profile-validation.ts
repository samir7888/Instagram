import { z } from 'zod';

const EditProfileSchema = z.object({
  website: z.string().url().min(1, 'Website must not be empty').optional(),
  bio: z.string().min(1, 'Bio must not be empty'),
  gender: z.string().min(1, 'Gender must be selected'),
  receiveMarkettingEmails: z.boolean().optional(),
  accountType: z.string().min(1, 'Account type must be selected'),
});

export { EditProfileSchema };