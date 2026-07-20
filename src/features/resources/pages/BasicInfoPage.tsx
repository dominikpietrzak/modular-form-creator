import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '@/design-system'
import { ApiError } from '@/shared/api/client'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { PageHeader } from '@/shared/ui/PageHeader'
import { useUpdateBasicInfo } from '../api/queries'
import { BasicInfoForm } from '../forms/BasicInfoForm'
import type { BasicInfoFormValues } from '../forms/schemas'
import { usesLocalBuffer } from '../domain/rules'
import { usePendingChanges } from '../state/pending-changes-context'
import { useResourceOutletContext } from './resource-outlet-context'

export function BasicInfoPage() {
  const { resource } = useResourceOutletContext()
  const navigate = useNavigate()
  const { pending, bufferBasicInfo } = usePendingChanges()
  const updateBasicInfo = useUpdateBasicInfo(resource.resourceId)

  const isBuffered = usesLocalBuffer(resource)
  const overviewPath = `/resources/${resource.resourceId}`

  // Drafts persist immediately via the module PATCH; completed resources cannot use it, so
  // their edits go to the buffer and are submitted from the overview as one full update.
  const handleSubmit = async (values: BasicInfoFormValues) => {
    if (isBuffered) {
      bufferBasicInfo(values)
      void navigate(overviewPath)
      return
    }

    try {
      await updateBasicInfo.mutateAsync(values)
      void navigate(overviewPath)
    } catch {
      // Surfaced through the mutation error below.
    }
  }

  const serverError = updateBasicInfo.error instanceof ApiError ? updateBasicInfo.error.message : null

  return (
    <Page>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Resources', to: '/resources' },
              { label: resource.name, to: overviewPath },
              { label: 'Basic Info' },
            ]}
          />
        }
        title="Basic Info"
        description={
          isBuffered
            ? 'Changes are kept locally until you submit them from the overview.'
            : 'Saved to the resource as soon as you submit.'
        }
      />
      <BasicInfoForm
        // Buffered edits win over server state, so leaving and returning keeps them.
        defaultValues={pending.basicInfo ?? resource.basicInfo}
        onSubmit={(values) => void handleSubmit(values)}
        submitLabel={isBuffered ? 'Apply changes' : 'Save Basic Info'}
        isSubmitting={updateBasicInfo.isPending}
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
