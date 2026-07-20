import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Button, Card } from '@/design-system'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ModuleProgress } from '../components/ModuleProgress'
import { StatusBadge } from '../components/StatusBadge'
import { formatCategory, formatPriority } from '../domain/constants'
import { isBasicInfoComplete, isProjectDetailsComplete, usesLocalBuffer } from '../domain/rules'
import { usePendingChanges } from '../state/pending-changes-context'
import { useResourceOutletContext } from './resource-outlet-context'

const EMPTY_PLACEHOLDER = '—'

// Read-only summary of both modules. Deliberately shows server state, not buffered edits —
// it reports what the resource actually is, and flags unsaved changes separately.
export function ResourceDetailsPage() {
  const { resource } = useResourceOutletContext()
  const navigate = useNavigate()
  const { hasPendingChanges } = usePendingChanges()

  const { basicInfo, projectDetails } = resource

  return (
    <Page>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Resources', to: '/resources' },
              { label: resource.name, to: `/resources/${resource.resourceId}` },
              { label: 'Details' },
            ]}
          />
        }
        title="Details"
        description={`Summary of ${resource.name}`}
        actions={
          <Button variant="secondary" onClick={() => void navigate(`/resources/${resource.resourceId}`)}>
            Back to overview
          </Button>
        }
      />

      <Summary>
        <StatusBadge status={resource.status} />
        <ModuleProgress resource={resource} />
      </Summary>

      {usesLocalBuffer(resource) && hasPendingChanges ? (
        <Notice role="status">
          This summary shows the saved resource. You have unsaved changes that are not included
          here until you submit them from the overview.
        </Notice>
      ) : null}

      <Section>
        <SectionHead>
          <SectionTitle>Basic Info</SectionTitle>
          <Badge variant={isBasicInfoComplete(basicInfo) ? 'success' : 'neutral'}>
            {isBasicInfoComplete(basicInfo) ? 'Complete' : 'Incomplete'}
          </Badge>
        </SectionHead>
        <Card variant="outline">
          <Definitions>
            <Field label="Resource name" value={basicInfo.resourceName} />
            <Field label="Owner" value={basicInfo.owner} />
            <Field label="Email" value={basicInfo.email} />
            <Field label="Priority" value={formatPriority(basicInfo.priority)} />
            <Field label="Description" value={basicInfo.description} span />
          </Definitions>
        </Card>
      </Section>

      <Section>
        <SectionHead>
          <SectionTitle>Project Details</SectionTitle>
          <Badge variant={isProjectDetailsComplete(projectDetails) ? 'success' : 'neutral'}>
            {isProjectDetailsComplete(projectDetails) ? 'Complete' : 'Incomplete'}
          </Badge>
        </SectionHead>
        <Card variant="outline">
          <Definitions>
            <Field label="Project name" value={projectDetails.projectName} />
            <Field label="Budget" value={projectDetails.budget} />
            <Field label="Category" value={formatCategory(projectDetails.category)} />
            <Field
              label="Team members"
              value={projectDetails.options.join(', ')}
              span
            />
          </Definitions>
        </Card>
      </Section>
    </Page>
  )
}

function Field({ label, value, span = false }: { label: string; value: string; span?: boolean }) {
  return (
    <Definition $span={span}>
      <Term>{label}</Term>
      <Value $isEmpty={!value}>{value || EMPTY_PLACEHOLDER}</Value>
    </Definition>
  )
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

const Notice = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accentSoft};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.875rem;
`

const Section = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const SectionTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Definitions = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};
`

const Definition = styled.div<{ $span: boolean }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  grid-column: ${({ $span }) => ($span ? '1 / -1' : 'auto')};
`

const Term = styled.dt`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Value = styled.dd<{ $isEmpty: boolean }>`
  margin: 0;
  color: ${({ theme, $isEmpty }) => ($isEmpty ? theme.colors.inkMuted : theme.colors.ink)};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`
