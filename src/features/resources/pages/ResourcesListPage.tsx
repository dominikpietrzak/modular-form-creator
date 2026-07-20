import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card, Input, Select } from '@/design-system'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StateMessage } from '@/shared/ui/StateMessage'
import { useResources } from '../api/queries'
import type { Resource, ResourceStatus } from '../api/types'
import { CreateResourceDrawer } from '../components/CreateResourceDrawer'
import { DeleteResourceDrawer } from '../components/DeleteResourceDrawer'
import { ModuleProgress } from '../components/ModuleProgress'
import { StatusBadge } from '../components/StatusBadge'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const SEARCH_DEBOUNCE_MS = 300

// Filtering, sorting and pagination are backend-driven, and their state lives in the URL so a
// filtered view survives a refresh and works with the back button.
export function ResourcesListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)

  const page = Number(searchParams.get('page') ?? '1')
  const status = (searchParams.get('status') ?? '') as ResourceStatus | ''
  const name = searchParams.get('name') ?? ''
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'

  // Local, immediate mirror of the `name` URL param, debounced back into the URL on typing.
  const [searchInput, setSearchInput] = useState(name)
  // Resync the input when `name` changes from outside typing (back button, cleared filter).
  // The render-phase adjustment is React's documented alternative to a setState effect here.
  const [lastSyncedName, setLastSyncedName] = useState(name)
  if (name !== lastSyncedName) {
    setLastSyncedName(name)
    setSearchInput(name)
  }

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(patch)) {
            if (!value) {
              next.delete(key)
            } else {
              next.set(key, value)
            }
          }
          if (resetPage) {
            next.delete('page')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Typing should not fire a request per keystroke, and it should reset paging.
  useEffect(() => {
    if (searchInput === name) return

    const timeout = setTimeout(() => updateParams({ name: searchInput }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [searchInput, name, updateParams])

  const { data, isPending, isError, error, refetch } = useResources({
    page,
    status: status || undefined,
    name: name || undefined,
    sortOrder,
  })

  return (
    <Page>
      <PageHeader
        title="Resources"
        description="Create resources, track their module progress and complete them once both modules are filled in."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            New resource
          </Button>
        }
      />

      <Filters>
        <Input
          label="Search by name"
          placeholder="Payments"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => updateParams({ status: event.target.value })}
        />
        <Select
          label="Sort"
          options={SORT_OPTIONS}
          value={sortOrder}
          onChange={(event) => updateParams({ sortOrder: event.target.value })}
        />
      </Filters>

      {isPending ? <StateMessage title="Loading resources…" /> : null}

      {isError ? (
        <StateMessage
          tone="error"
          title="Could not load resources"
          description={error.message}
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : null}

      {data && data.items.length === 0 ? (
        <StateMessage
          title="No resources found"
          description={
            name || status
              ? 'No resource matches the current filters.'
              : 'Create your first resource to get started.'
          }
          action={
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              New resource
            </Button>
          }
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <List>
            {data.items.map((resource) => (
              <li key={resource._id}>
                <Card variant="outline">
                  <Row>
                    <Main>
                      <TopLine>
                        <NameLink to={`/resources/${resource.resourceId}`}>{resource.name}</NameLink>
                        <StatusBadge status={resource.status} />
                      </TopLine>
                      <Meta>
                        {resource.basicInfo.owner
                          ? `Owner: ${resource.basicInfo.owner}`
                          : 'No owner yet'}
                      </Meta>
                      <ModuleProgress resource={resource} />
                    </Main>
                    <RowActions>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/resources/${resource.resourceId}`)}
                      >
                        Open
                      </Button>
                      <DeleteButton
                        variant="ghost"
                        size="small"
                        onClick={() => setResourceToDelete(resource)}
                      >
                        Delete
                      </DeleteButton>
                    </RowActions>
                  </Row>
                </Card>
              </li>
            ))}
          </List>

          <Pager>
            {/*
              Paging is driven by the page the backend actually returned, not the URL value.
              The backend clamps out-of-range pages, so trusting the URL here would leave the
              buttons pointing at pages that no longer exist.
            */}
            <Button
              variant="secondary"
              size="small"
              state={data.pagination.page <= 1 ? 'disabled' : 'normal'}
              onClick={() => updateParams({ page: String(data.pagination.page - 1) }, false)}
            >
              Previous
            </Button>
            <PageInfo>
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.totalItems}{' '}
              resources
            </PageInfo>
            <Button
              variant="secondary"
              size="small"
              state={data.pagination.page >= data.pagination.totalPages ? 'disabled' : 'normal'}
              onClick={() => updateParams({ page: String(data.pagination.page + 1) }, false)}
            >
              Next
            </Button>
          </Pager>
        </>
      ) : null}

      <CreateResourceDrawer
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(resource) => {
          setCreateOpen(false)
          // Straight into the workflow: a new resource has both modules still to fill in.
          navigate(`/resources/${resource.resourceId}`)
        }}
      />

      <DeleteResourceDrawer
        resource={resourceToDelete}
        onClose={() => setResourceToDelete(null)}
      />
    </Page>
  )
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(140px, 1fr) minmax(140px, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;

  /* Match select height to the input, as native <select> renders ~2px shorter. App-level only. */
  & input,
  & select {
    height: 44px;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const Main = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`

const TopLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const NameLink = styled(Link)`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.0625rem;
  color: ${({ theme }) => theme.colors.inkStrong};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const RowActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`

// Destructive action: recolour the ghost button to the warning tone so it does not read
// as a positive/primary link. Double class to win over the design system's own colour.
const DeleteButton = styled(Button)`
  && {
    color: ${({ theme }) => theme.colors.warning};
  }
`

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const PageInfo = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`
