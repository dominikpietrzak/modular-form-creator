import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export interface Crumb {
  label: string
  // Omitted on the last crumb (the current page), which renders as plain text.
  to?: string
}

// Trail back up the hierarchy so no sub-page is reachable only through the top bar.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <Nav aria-label="Breadcrumb">
      <List>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li>
                {item.to && !isLast ? (
                  <CrumbLink to={item.to}>{item.label}</CrumbLink>
                ) : (
                  <Current aria-current={isLast ? 'page' : undefined}>{item.label}</Current>
                )}
              </li>
              {isLast ? null : <Separator aria-hidden="true">/</Separator>}
            </Fragment>
          )
        })}
      </List>
    </Nav>
  )
}

const Nav = styled.nav`
  font-size: 0.875rem;
`

const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`

// Primary colour + underline so links read as clickable, not muted plain text.
const CrumbLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryStrong};
  }
`

const Current = styled.span`
  color: ${({ theme }) => theme.colors.ink};
  font-weight: 600;
`

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.border};
`
