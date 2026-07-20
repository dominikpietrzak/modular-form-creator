import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '@/design-system'
import { ApiError } from '@/shared/api/client'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StateMessage } from '@/shared/ui/StateMessage'
import { useUpdateProjectDetails } from '../api/queries'
import { isProjectDetailsUnlocked, usesLocalBuffer } from '../domain/rules'
import { ProjectDetailsForm } from '../forms/ProjectDetailsForm'
import type { ProjectDetailsFormValues } from '../forms/schemas'
import { usePendingChanges } from '../state/pending-changes-context'
import { useResourceOutletContext } from './resource-outlet-context'

export function ProjectDetailsPage() {
  const { resource } = useResourceOutletContext()
  const navigate = useNavigate()
  const { pending, bufferProjectDetails } = usePendingChanges()
  const updateProjectDetails = useUpdateProjectDetails(resource.resourceId)

  const isBuffered = usesLocalBuffer(resource)
  const overviewPath = `/resources/${resource.resourceId}`
  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: 'Resources', to: '/resources' },
        { label: resource.name, to: overviewPath },
        { label: 'Project Details' },
      ]}
    />
  )

  // The backend rejects this module until Basic Info is complete, so the gate is enforced here
  // too rather than letting a direct URL produce a 400.
  if (!isProjectDetailsUnlocked(resource)) {
    return (
      <Page>
        {breadcrumb}
        <StateMessage
          title="Project Details is locked"
          description="Complete the Basic Info module first. The backend rejects Project Details updates until then."
          action={
            <Button
              variant="primary"
              onClick={() => void navigate(`/resources/${resource.resourceId}/basic-info`)}
            >
              Go to Basic Info
            </Button>
          }
        />
      </Page>
    )
  }

  const handleSubmit = async (values: ProjectDetailsFormValues) => {
    if (isBuffered) {
      bufferProjectDetails(values)
      void navigate(overviewPath)
      return
    }

    try {
      await updateProjectDetails.mutateAsync(values)
      void navigate(overviewPath)
    } catch {
      // Surfaced through the mutation error below.
    }
  }

  const serverError =
    updateProjectDetails.error instanceof ApiError ? updateProjectDetails.error.message : null

  return (
    <Page>
      <PageHeader
        breadcrumb={breadcrumb}
        title="Project Details"
        description={
          isBuffered
            ? 'Changes are kept locally until you submit them from the overview.'
            : 'Saved to the resource as soon as you submit.'
        }
      />
      <ProjectDetailsForm
        defaultValues={pending.projectDetails ?? resource.projectDetails}
        onSubmit={(values) => void handleSubmit(values)}
        submitLabel={isBuffered ? 'Apply changes' : 'Save Project Details'}
        isSubmitting={updateProjectDetails.isPending}
        serverError={serverError}
        secondaryAction={
          <Button type="button" variant="ghost" onClick={() => void navigate(overviewPath)}>
            Cancel
          </Button>
        }
      />
    </Page>
  )
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 640px;
`
