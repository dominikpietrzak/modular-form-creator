import axios from 'axios'
import type { AxiosError } from 'axios'

const DEFAULT_BASE_URL = 'http://localhost:5001'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_BASE_URL

// Status for a request that never reached the backend (no response).
const NETWORK_ERROR_STATUS = 0

interface ApiErrorBody {
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Normalize every failure into ApiError, so callers catch one type. Cancellations are
// re-thrown untouched so React Query can tell an aborted request from a real error.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    if (error.response) {
      const { status, data } = error.response
      return Promise.reject(
        new ApiError(status, data?.message ?? `Request failed with status ${status}`, data?.details),
      )
    }

    return Promise.reject(
      new ApiError(NETWORK_ERROR_STATUS, 'Cannot reach the server. Check that the backend is running.'),
    )
  },
)
