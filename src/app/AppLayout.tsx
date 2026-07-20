import { Link, Outlet } from 'react-router-dom'
import styled from 'styled-components'

// Page frame shared by every route.
export function AppLayout() {
  return (
    <Shell>
      <TopBar>
        <Brand to="/resources">Resources Management</Brand>
      </TopBar>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

// No background here: GlobalStyles already paints the page gradient on the body.
const Shell = styled.div`
  min-height: 100vh;
`

const TopBar = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

const Brand = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.0625rem;
  color: ${({ theme }) => theme.colors.inkStrong};
  text-decoration: none;
`

const Main = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`
