import { Badge } from '@/design-system'
import type { BadgeVariant } from '@/design-system'
import type { ResourceStatus } from '../api/types'

// Status styling lives here so every page renders the same status the same way.
const STATUS_VARIANT: Record<ResourceStatus, BadgeVariant> = {
  draft: 'neutral',
  completed: 'success',
}

const STATUS_LABEL: Record<ResourceStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
}

export function StatusBadge({ status }: { status: ResourceStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
