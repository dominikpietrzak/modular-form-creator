import type { ReactNode } from 'react'
import styled from 'styled-components'

interface PageHeaderProps {
  title: string
  description?: string
  // Rendered above the title, typically a back link.
  breadcrumb?: ReactNode
  // Rendered on the right, typically primary actions.
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <Header>
      {breadcrumb ? <Breadcrumb>{breadcrumb}</Breadcrumb> : null}
      <Row>
        <Titles>
          <Title>{title}</Title>
          {description ? <Description>{description}</Description> : null}
        </Titles>
        {actions ? <ActionGroup>{actions}</ActionGroup> : null}
      </Row>
    </Header>
  )
}

const Header = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Breadcrumb = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const Titles = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`
