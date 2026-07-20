import { createContext, useContext } from 'react'
import type { BasicInfo, ProjectDetails } from '../api/types'

// A module is absent from the buffer when it matches the server, so presence always means
// "changed from the server".
export interface PendingChanges {
  basicInfo?: BasicInfo
  projectDetails?: ProjectDetails
}

export interface PendingChangesValue {
  pending: PendingChanges
  bufferBasicInfo: (basicInfo: BasicInfo) => void
  bufferProjectDetails: (projectDetails: ProjectDetails) => void
  discard: () => void
  hasPendingChanges: boolean
}

export const PendingChangesContext = createContext<PendingChangesValue | null>(null)

export function usePendingChanges(): PendingChangesValue {
  const value = useContext(PendingChangesContext)

  if (!value) {
    throw new Error('usePendingChanges must be used within a PendingChangesProvider')
  }

  return value
}
