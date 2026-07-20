import type { BasicInfo, ProjectDetails, Resource } from '../api/types'

// Completion and transition rules mirrored from resource.service.ts, so the UI can show
// progress and disable impossible actions rather than surface them as 400s. Keep in sync.

export function isBasicInfoComplete(basicInfo: BasicInfo): boolean {
  return Boolean(
    basicInfo.resourceName &&
      basicInfo.owner &&
      basicInfo.email &&
      basicInfo.description &&
      basicInfo.priority,
  )
}

export function isProjectDetailsComplete(projectDetails: ProjectDetails): boolean {
  return Boolean(
    projectDetails.projectName &&
      projectDetails.budget &&
      projectDetails.category &&
      projectDetails.options.length > 0,
  )
}

export function areModulesComplete(resource: Resource): boolean {
  return isBasicInfoComplete(resource.basicInfo) && isProjectDetailsComplete(resource.projectDetails)
}

export const TOTAL_MODULES = 2

export function countCompletedModules(resource: Resource): number {
  return (
    (isBasicInfoComplete(resource.basicInfo) ? 1 : 0) +
    (isProjectDetailsComplete(resource.projectDetails) ? 1 : 0)
  )
}

// Gate applies to drafts only: completed resources are edited through one full update.
export function isProjectDetailsUnlocked(resource: Resource): boolean {
  return resource.status === 'completed' || isBasicInfoComplete(resource.basicInfo)
}

export function canProvision(resource: Resource): boolean {
  return resource.status === 'draft' && areModulesComplete(resource)
}

// Drafts PATCH each module immediately; completed resources buffer edits for a later PUT.
export function usesLocalBuffer(resource: Resource): boolean {
  return resource.status === 'completed'
}
