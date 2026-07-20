import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // The data only changes through this app, so refetching on every focus adds noise
      // without adding correctness.
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // A rejected business rule or a missing resource will not start working on retry.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      // Every mutation here writes; retrying one automatically could repeat a write.
      retry: false,
    },
  },
})
