import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles, theme } from '@/design-system'
import { queryClient } from '@/shared/api/query-client'

// Wires the design-system theme and the server-state cache around the app.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
