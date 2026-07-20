import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/design-system'
import { ApiError } from '@/shared/api/client'
import { StateMessage } from '@/shared/ui/StateMessage'
import { useResource } from '../api/queries'
import { PendingChangesProvider } from '../state/PendingChangesProvider'

// Shared shell for a single resource: fetches it once for every child page and hosts the
// pending-changes buffer, so the buffer survives navigation between the module pages.
export function ResourceLayout() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { data: resource, isPending, isError, error, refetch } = useResource(resourceId)

  if (isPending) {
    return <StateMessage title="Loading resource…" />
  }

  if (isError) {
    const isMissing = error instanceof ApiError && error.status === 404

    return (
      <StateMessage
        tone="error"
        title={isMissing ? 'Resource not found' : 'Could not load resource'}
        description={error.message}
        action={
          isMissing ? (
            <Button variant="secondary" onClick={() => void navigate('/resources')}>
              Back to resources
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          )
        }
      />
    )
  }

  return (
    // Keyed by resource so switching resources never carries a buffer across.
    <PendingChangesProvider key={resource._id} resource={resource}>
      {/* Navigation lives in each page's breadcrumb; the layout only owns data and the buffer. */}
      <Outlet context={{ resource }} />
    </PendingChangesProvider>
  )
}
