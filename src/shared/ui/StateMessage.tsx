import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Card } from '@/design-system'

interface StateMessageProps {
  title: string
  description?: string
  action?: ReactNode
  tone?: 'neutral' | 'error'
}

// Placeholder for loading, empty and error states, so every page reports them the same way.
export function StateMessage({ title, description, action, tone = 'neutral' }: StateMessageProps) {
  return (
    <Card variant="outline">
      <Content role={tone === 'error' ? 'alert' : undefined}>
        <Title $tone={tone}>{title}</Title>
        {description ? <Description>{description}</Description> : null}
        {action}
      </Content>
    </Card>
  )
}

const Content = styled.div`
  display: grid;
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const Title = styled.p<{ $tone: 'neutral' | 'error' }>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.125rem;
  color: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.warning : theme.colors.inkStrong)};
`

const Description = styled.p`
  margin: 0;
  max-width: 48ch;
  color: ${({ theme }) => theme.colors.inkMuted};
`
