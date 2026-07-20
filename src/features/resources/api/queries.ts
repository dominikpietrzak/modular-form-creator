import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  updateBasicInfo,
  updateProjectDetails,
} from './resources'
import type { ResourceId } from './resources'
import type {
  BasicInfo,
  ListResourcesParams,
  ProjectDetails,
  Resource,
  ResourcePayload,
} from './types'

// Hierarchical cache keys: invalidating lists() refreshes every list variant regardless of
// filters, without touching cached single resources.
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ListResourcesParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: ResourceId) => [...resourceKeys.details(), String(id)] as const,
}

export function useResources(params: ListResourcesParams) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: ({ signal }) => listResources(params, signal),
    // Keeps the previous page visible while the next one loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
  })
}

export function useResource(id: ResourceId | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getResource(id as ResourceId, signal),
    enabled: id !== undefined,
  })
}

// Mutations return the updated resource, so write it straight into the cache and invalidate
// the lists — no extra round trip for data we already hold.
function cacheUpdatedResource(queryClient: QueryClient, resource: Resource) {
  queryClient.setQueryData(resourceKeys.detail(resource.resourceId), resource)
  queryClient.setQueryData(resourceKeys.detail(resource._id), resource)
  void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
}

export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceName: string) => createResource(resourceName),
    onSuccess: (resource) => cacheUpdatedResource(queryClient, resource),
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: ResourceId) => deleteResource(id),
    onSuccess: (resource) => {
      queryClient.removeQueries({ queryKey: resourceKeys.detail(resource.resourceId) })
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

export function useUpdateBasicInfo(id: ResourceId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (basicInfo: BasicInfo) => updateBasicInfo(id, basicInfo),
    onSuccess: (resource) => cacheUpdatedResource(queryClient, resource),
  })
}

export function useUpdateProjectDetails(id: ResourceId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectDetails: ProjectDetails) => updateProjectDetails(id, projectDetails),
    onSuccess: (resource) => cacheUpdatedResource(queryClient, resource),
  })
}

export function useProvisionResource(id: ResourceId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => provisionResource(id),
    onSuccess: (resource) => cacheUpdatedResource(queryClient, resource),
  })
}

export function useReplaceResource(id: ResourceId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ResourcePayload) => replaceResource(id, payload),
    onSuccess: (resource) => cacheUpdatedResource(queryClient, resource),
  })
}
