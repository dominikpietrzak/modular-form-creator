import styled from 'styled-components'
import type { Resource } from '../api/types'
import { TOTAL_MODULES, countCompletedModules } from '../domain/rules'

// Compact "n of 2 modules complete" indicator with a matching bar.
export function ModuleProgress({ resource }: { resource: Resource }) {
  const completed = countCompletedModules(resource)
  const ratio = completed / TOTAL_MODULES

  return (
    <Wrapper>
      <Track
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_MODULES}
        aria-valuenow={completed}
        aria-label="Module progress"
      >
        <Bar $ratio={ratio} />
      </Track>
      <Label>
        {completed} of {TOTAL_MODULES} modules complete
      </Label>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 160px;
`

const Track = styled.div`
  height: 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`

const Bar = styled.div<{ $ratio: number }>`
  height: 100%;
  width: ${({ $ratio }) => `${$ratio * 100}%`};
  border-radius: inherit;
  background: ${({ theme, $ratio }) => ($ratio === 1 ? theme.colors.success : theme.colors.primary)};
  transition: width 200ms ease;
`

const Label = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`
