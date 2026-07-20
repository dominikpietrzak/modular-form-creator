import { Navigate, createBrowserRouter } from 'react-router-dom'
import {
  BasicInfoPage,
  ProjectDetailsPage,
  ResourceDetailsPage,
  ResourceLayout,
  ResourceOverviewPage,
  ResourcesListPage,
} from '@/features/resources'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/resources" replace /> },
      { path: '/resources', element: <ResourcesListPage /> },
      {
        path: '/resources/:resourceId',
        element: <ResourceLayout />,
        children: [
          { index: true, element: <ResourceOverviewPage /> },
          { path: 'details', element: <ResourceDetailsPage /> },
          { path: 'basic-info', element: <BasicInfoPage /> },
          { path: 'project-details', element: <ProjectDetailsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
