import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Button, Card } from '@/design-system'
import { ApiError } from '@/shared/api/client'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { PageHeader } from '@/shared/ui/PageHeader'
import { useProvisionResource, useReplaceResource } from '../api/queries'
import { ModuleProgress } from '../components/ModuleProgress'
import { StatusBadge } from '../components/StatusBadge'
import {
  canProvision,
  isBasicInfoComplete,
  isProjectDetailsComplete,
  isProjectDetailsUnlocked,
  usesLocalBuffer,
} from '../domain/rules'
import { usePendingChanges } from '../state/pending-changes-context'
import { useResourceOutletContext } from './resource-outlet-context'

export function ResourceOverviewPage() {
  const { resource } = useResourceOutletContext()
  const navigate = useNavigate()
  const { pending, hasPendingChanges, discard } = usePendingChanges()
  const provision = useProvisionResource(resource.resourceId)
  const replace = useReplaceResource(resource.resourceId)

  const basicInfoDone = isBasicInfoComplete(resource.basicInfo)
  const projectDetailsDone = isProjectDetailsComplete(resource.projectDetails)
  const projectDetailsUnlocked = isProjectDetailsUnlocked(resource)
  const provisionable = canProvision(resource)

  // Completed resources persist through one full PUT combining both modules.
  const submitPendingChanges = async () => {
    try {
      await replace.mutateAsync({
        name: resource.name,
        basicInfo: pending.basicInfo ?? resource.basicInfo,
        projectDetails: pending.projectDetails ?? resource.projectDetails,
      })
      discard()
    } catch {
      // Surfaced through the mutation error below.
    }
  }

  const provisionError = provision.error instanceof ApiError ? provision.error.message : null
  const replaceError = replace.error instanceof ApiError ? replace.error.message : null

  return (
    <Page>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[{ label: 'Resources', to: '/resources' }, { label: resource.name }]}
          />
        }
        title={resource.name}
        description={`Resource #${resource.resourceId}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => void navigate('details')}>
              View details
            </Button>
            {resource.status === 'draft' ? (
              <Button
                variant="primary"
                state={
                  provision.isPending ? 'disabled' : provisionable ? 'normal' : 'locked'
                }
                onClick={() => provision.mutate()}
              >
                {provision.isPending ? 'Provisioning…' : 'Provision resource'}
              </Button>
            ) : null}
          </>
        }
      />

      <Summary>
        <StatusBadge status={resource.status} />
        <ModuleProgress resource={resource} />
      </Summary>

      {resource.status === 'draft' && !provisionable ? (
        <Hint>Fill in both modules to enable provisioning.</Hint>
      ) : null}

      {resource.status === 'draft' && provisionable ? (
        <Hint>
          Provisioning marks this resource as completed. It can only be done once — a completed
          resource cannot be provisioned again.
        </Hint>
      ) : null}

      {/* Explicit confirmation, since the button itself disappears once the status flips. */}
      {provision.isSuccess ? (
        <Card variant="elevated">
          <StatusBanner role="status">
            <BannerTitle>Resource provisioned</BannerTitle>
            <BannerText>Its status is now Completed. Further edits are submitted as a full update.</BannerText>
          </StatusBanner>
        </Card>
      ) : resource.status === 'completed' ? (
        <Hint>
          This resource is provisioned and cannot be provisioned again. Module edits are kept
          locally until you submit them.
        </Hint>
      ) : null}

      {provisionError ? <ErrorText role="alert">{provisionError}</ErrorText> : null}

      {usesLocalBuffer(resource) && hasPendingChanges ? (
        <Card variant="elevated">
          <PendingBanner>
            <div>
              <BannerTitle>Unsaved changes</BannerTitle>
              <BannerText>
                {describePending(pending.basicInfo !== undefined, pending.projectDetails !== undefined)}{' '}
                They are kept in this browser tab only and will be lost if you refresh or close it.
              </BannerText>
              {replaceError ? <ErrorText role="alert">{replaceError}</ErrorText> : null}
            </div>
            <BannerActions>
              <Button
                variant="ghost"
                onClick={discard}
                state={replace.isPending ? 'disabled' : 'normal'}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                onClick={() => void submitPendingChanges()}
                state={replace.isPending ? 'disabled' : 'normal'}
              >
                {replace.isPending ? 'Submitting…' : 'Submit changes'}
              </Button>
            </BannerActions>
          </PendingBanner>
        </Card>
      ) : null}

      <Modules>
        <ModuleCard
          title="Basic Info"
          description="Owner, contact and priority of the resource."
          isComplete={basicInfoDone}
          hasPendingEdits={pending.basicInfo !== undefined}
          onOpen={() => void navigate('basic-info')}
        />
        <ModuleCard
          title="Project Details"
          description="Project scope, budget and team composition."
          isComplete={projectDetailsDone}
          hasPendingEdits={pending.projectDetails !== undefined}
          lockedReason={
            projectDetailsUnlocked ? undefined : 'Complete Basic Info first to unlock this module.'
          }
          onOpen={() => void navigate('project-details')}
        />
      </Modules>
    </Page>
  )
}

interface ModuleCardProps {
  title: string
  description: string
  isComplete: boolean
  hasPendingEdits: boolean
  // When set, the module cannot be opened and the reason is shown instead.
  lockedReason?: string
  onOpen: () => void
}

function ModuleCard({
  title,
  description,
  isComplete,
  hasPendingEdits,
  lockedReason,
  onOpen,
}: ModuleCardProps) {
  return (
    <Card variant="outline">
      <ModuleBody>
        <ModuleHead>
          <ModuleTitle>{title}</ModuleTitle>
          <Badges>
            {hasPendingEdits ? <Badge variant="warning">Unsaved</Badge> : null}
            <Badge variant={isComplete ? 'success' : 'neutral'}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          </Badges>
        </ModuleHead>
        <ModuleText>{lockedReason ?? description}</ModuleText>
        <Button
          variant="secondary"
          size="small"
          state={lockedReason ? 'locked' : 'normal'}
          onClick={onOpen}
        >
          {isComplete ? 'Edit module' : 'Fill in module'}
        </Button>
      </ModuleBody>
    </Card>
  )
}

function describePending(hasBasicInfo: boolean, hasProjectDetails: boolean): string {
  if (hasBasicInfo && hasProjectDetails) {
    return 'Basic Info and Project Details have edits that are not saved yet.'
  }
  if (hasBasicInfo) {
    return 'Basic Info has edits that are not saved yet.'
  }
  return 'Project Details has edits that are not saved yet.'
}

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.875rem;
`

const ErrorText = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.875rem;
`

const PendingBanner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
`

const StatusBanner = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  border-left: 3px solid ${({ theme }) => theme.colors.success};
`

const BannerTitle = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  color: ${({ theme }) => theme.colors.inkStrong};
`

const BannerText = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  max-width: 60ch;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const BannerActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Modules = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const ModuleBody = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  justify-items: start;
`

const ModuleHead = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ModuleTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Badges = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`

const ModuleText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`
