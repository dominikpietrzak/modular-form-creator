import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BasicInfo, ProjectDetails, Resource } from '../api/types'
import { PendingChangesContext } from './pending-changes-context'
import type { PendingChanges } from './pending-changes-context'

interface PendingChangesProviderProps {
  resource: Resource
  children: ReactNode
}

// In-memory buffer for completed-resource edits. Deliberately never persisted — the buffer
// must be lost on refresh/close — and mounted above the module pages so edits survive moving
// between them. Mount with a key per resource so switching resources starts clean.
export function PendingChangesProvider({ resource, children }: PendingChangesProviderProps) {
  const [pending, setPending] = useState<PendingChanges>({})

  const bufferBasicInfo = useCallback(
    (basicInfo: BasicInfo) => {
      setPending((current) => ({
        ...current,
        basicInfo: isSameBasicInfo(basicInfo, resource.basicInfo) ? undefined : basicInfo,
      }))
    },
    [resource.basicInfo],
  )

  const bufferProjectDetails = useCallback(
    (projectDetails: ProjectDetails) => {
      setPending((current) => ({
        ...current,
        projectDetails: isSameProjectDetails(projectDetails, resource.projectDetails)
          ? undefined
          : projectDetails,
      }))
    },
    [resource.projectDetails],
  )

  const discard = useCallback(() => setPending({}), [])

  const value = useMemo(
    () => ({
      pending,
      bufferBasicInfo,
      bufferProjectDetails,
      discard,
      hasPendingChanges: pending.basicInfo !== undefined || pending.projectDetails !== undefined,
    }),
    [pending, bufferBasicInfo, bufferProjectDetails, discard],
  )

  return <PendingChangesContext value={value}>{children}</PendingChangesContext>
}

function isSameBasicInfo(a: BasicInfo, b: BasicInfo): boolean {
  return (
    a.resourceName === b.resourceName &&
    a.owner === b.owner &&
    a.email === b.email &&
    a.description === b.description &&
    a.priority === b.priority
  )
}

function isSameProjectDetails(a: ProjectDetails, b: ProjectDetails): boolean {
  return (
    a.projectName === b.projectName &&
    a.budget === b.budget &&
    a.category === b.category &&
    isSameOptionSet(a.options, b.options)
  )
}

// Team members are compared as a set: the checkbox group records them in click order.
function isSameOptionSet(a: string[], b: string[]): boolean {
  return a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')
}
