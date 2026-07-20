import styled from 'styled-components'
import { Button, Drawer } from '@/design-system'
import { ApiError } from '@/shared/api/client'
import { useDeleteResource } from '../api/queries'
import type { Resource } from '../api/types'

interface DeleteResourceDrawerProps {
  // The resource pending confirmation, or null when nothing is being deleted.
  resource: Resource | null
  onClose: () => void
  onDeleted?: () => void
}

// Deletion is irreversible, so it always goes through an explicit confirmation step.
export function DeleteResourceDrawer({ resource, onClose, onDeleted }: DeleteResourceDrawerProps) {
  const deleteResource = useDeleteResource()

  const confirm = async () => {
    if (!resource) return

    try {
      await deleteResource.mutateAsync(resource.resourceId)
      onDeleted?.()
      onClose()
    } catch {
      // Surfaced below through the mutation error.
    }
  }

  const serverError = deleteResource.error instanceof ApiError ? deleteResource.error.message : null

  return (
    <Drawer title="Delete resource" isOpen={resource !== null} onClose={onClose}>
      {resource ? (
        <Body>
          <p>
            Delete <strong>{resource.name}</strong>? This cannot be undone.
          </p>
          {serverError ? <Error role="alert">{serverError}</Error> : null}
          <Actions>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              state={deleteResource.isPending ? 'disabled' : 'normal'}
              onClick={confirm}
            >
              {deleteResource.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </Actions>
        </Body>
      ) : null}
    </Drawer>
  )
}

const Body = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  p {
    margin: 0;
  }
`

const Error = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.875rem;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`
