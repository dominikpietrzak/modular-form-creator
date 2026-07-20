import { useOutletContext } from 'react-router-dom'
import type { Resource } from '../api/types'

export interface ResourceOutletContext {
  resource: Resource
}

// Provided by ResourceLayout, which already gates on loading and errors, so pages get a
// guaranteed resource rather than Resource | undefined.
export function useResourceOutletContext(): ResourceOutletContext {
  return useOutletContext<ResourceOutletContext>()
}
