import { useRoutes } from 'react-router'
import { lazy } from 'react'

const DashboardFeature = lazy(() => import('@/features/dashboard/dashboard-feature.tsx'))
const AccountDetailFeature = lazy(() => import('@/features/account/account-feature-detail.tsx'))
const AccountIndexFeature = lazy(() => import('@/features/account/account-feature-index.tsx'))
const CoinFeature = lazy(() => import('@/features/coin/coin-feature.tsx'))
const OathIndexFeature = lazy(() => import('@/features/oath/oath-feature-index.tsx'))
const OathCreateFeature = lazy(() => import('@/features/oath/oath-feature-create.tsx'))
const OathDetailFeature = lazy(() => import('@/features/oath/oath-feature-detail.tsx'))
const OathInitializeFeature = lazy(() => import('@/features/oath/oath-feature-initialize.tsx'))

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <DashboardFeature /> },
    { path: 'coin', element: <CoinFeature /> },
    {
      path: 'account',
      children: [
        { index: true, element: <AccountIndexFeature /> },
        { path: ':address', element: <AccountDetailFeature /> },
      ],
    },
    {
      path: 'oath',
      children: [
        { index: true, element: <OathIndexFeature /> },
        { path: 'initialize', element: <OathInitializeFeature /> },
        { path: 'create', element: <OathCreateFeature /> },
        { path: ':id', element: <OathDetailFeature /> },
      ],
    },
  ])
}
