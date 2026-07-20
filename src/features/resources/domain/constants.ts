import type { SelectOption } from '@/design-system'

// Allowed values mirrored from the backend validators. `as const` rather than enum because
// tsconfig has erasableSyntaxOnly on.
export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const

export const CATEGORY_VALUES = ['internal', 'external', 'vendor'] as const

export const TEAM_MEMBER_VALUES = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
] as const

export type Priority = (typeof PRIORITY_VALUES)[number]
export type Category = (typeof CATEGORY_VALUES)[number]
export type TeamMember = (typeof TEAM_MEMBER_VALUES)[number]

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const CATEGORY_LABELS: Record<Category, string> = {
  internal: 'Internal',
  external: 'External',
  vendor: 'Vendor',
}

export function formatPriority(value: string): string {
  return PRIORITY_LABELS[value as Priority] ?? value
}

export function formatCategory(value: string): string {
  return CATEGORY_LABELS[value as Category] ?? value
}

// Explicit empty option: Select renders only what it's given, so '' would otherwise show
// the first real option while the field is still empty.
const EMPTY_OPTION: SelectOption = { value: '', label: 'Select…' }

export const PRIORITY_OPTIONS: SelectOption[] = [
  EMPTY_OPTION,
  ...PRIORITY_VALUES.map((value) => ({ value, label: PRIORITY_LABELS[value] })),
]

export const CATEGORY_OPTIONS: SelectOption[] = [
  EMPTY_OPTION,
  ...CATEGORY_VALUES.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
]

export const TEAM_MEMBER_OPTIONS: string[] = [...TEAM_MEMBER_VALUES]
