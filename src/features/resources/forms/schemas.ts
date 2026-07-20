import { z } from 'zod'
import { CATEGORY_VALUES, PRIORITY_VALUES, TEAM_MEMBER_VALUES } from '../domain/constants'
import type { Category, Priority, TeamMember } from '../domain/constants'

// Validation mirrored field by field from the backend validators (same messages), so a local
// rejection reads like a server one. trim() runs before length/pattern checks, matching the
// backend, so parsed output is already in the shape the API expects.

const NAME_REGEX = /^[A-Za-z0-9 -]+$/
const OWNER_REGEX = /^[A-Za-z ]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INTEGER_REGEX = /^\d+$/

export const resourceNameSchema = z
  .string()
  .trim()
  .min(1, 'Resource name is required')
  .max(255, 'Resource name must be at most 255 characters long')
  .regex(NAME_REGEX, 'Resource name can contain only letters, numbers, spaces, and hyphens')

export const basicInfoSchema = z.object({
  resourceName: resourceNameSchema,
  owner: z
    .string()
    .trim()
    .min(1, 'Owner is required')
    .max(255, 'Owner must be at most 255 characters long')
    .regex(OWNER_REGEX, 'Owner can contain only letters and spaces'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(EMAIL_REGEX, 'Email must be a valid email format'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description must be at most 1000 characters long'),
  priority: z
    .string()
    .min(1, 'Priority is required')
    .refine(
      (value) => PRIORITY_VALUES.includes(value as Priority),
      'Priority must be one of: low, medium, high',
    ),
})

export const projectDetailsSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be at most 255 characters long')
    .regex(NAME_REGEX, 'Project name can contain only letters, numbers, spaces, and hyphens'),
  budget: z
    .string()
    .trim()
    .min(1, 'Budget is required')
    .regex(INTEGER_REGEX, 'Budget must contain only integers'),
  category: z
    .string()
    .min(1, 'Category is required')
    .refine(
      (value) => CATEGORY_VALUES.includes(value as Category),
      'Category must be one of: internal, external, vendor',
    ),
  options: z
    .array(z.string())
    .min(1, 'At least one team member is required')
    .refine(
      (values) => values.every((value) => TEAM_MEMBER_VALUES.includes(value as TeamMember)),
      'Unsupported team member option',
    ),
})

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
export type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>
