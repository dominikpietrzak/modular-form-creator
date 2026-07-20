import { api } from '@/shared/api/client'
import type {
  BasicInfo,
  ListResourcesParams,
  ProjectDetails,
  Resource,
  ResourceListResponse,
  ResourcePayload,
} from './types'

// Numeric resourceId or Mongo ObjectId — the backend accepts both.
export type ResourceId = string | number

const BASE_PATH = '/api/resources'

export async function listResources(
  params: ListResourcesParams = {},
  signal?: AbortSignal,
): Promise<ResourceListResponse> {
  const { data } = await api.get<ResourceListResponse>(BASE_PATH, { params, signal })
  return data
}

export async function getResource(id: ResourceId, signal?: AbortSignal): Promise<Resource> {
  const { data } = await api.get<Resource>(`${BASE_PATH}/${id}`, { signal })
  return data
}

export async function createResource(resourceName: string): Promise<Resource> {
  const { data } = await api.post<Resource>(BASE_PATH, { resourceName })
  return data
}

// PATCH despite the verb requires the whole module — the backend rejects partial payloads.
export async function updateBasicInfo(id: ResourceId, basicInfo: BasicInfo): Promise<Resource> {
  const { data } = await api.patch<Resource>(`${BASE_PATH}/${id}/basic-info`, basicInfo)
  return data
}

export async function updateProjectDetails(
  id: ResourceId,
  projectDetails: ProjectDetails,
): Promise<Resource> {
  const { data } = await api.patch<Resource>(`${BASE_PATH}/${id}/project-details`, projectDetails)
  return data
}

// The service wraps the result, but the controller responds with the plain resource.
export async function provisionResource(id: ResourceId): Promise<Resource> {
  const { data } = await api.patch<Resource>(`${BASE_PATH}/${id}/provisioning`)
  return data
}

export async function replaceResource(id: ResourceId, payload: ResourcePayload): Promise<Resource> {
  const { data } = await api.put<Resource>(`${BASE_PATH}/${id}`, payload)
  return data
}

export async function deleteResource(id: ResourceId): Promise<Resource> {
  const { data } = await api.delete<Resource>(`${BASE_PATH}/${id}`)
  return data
}
