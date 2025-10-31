import React from 'react'
import { ClusterUiChecker } from '@/features/cluster/ui/cluster-ui-checker'
import { AccountUiChecker } from '@/features/account/ui/account-ui-checker'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from './app-header'
import { AppFooter } from './app-footer'
import { useLocation } from 'react-router'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen relative">
        {/* Background for non-homepage */}
        {!isHomePage && (
          <>
            <div 
              className="fixed inset-0 z-0"
              style={{
                backgroundImage: 'url(/backgroundotherpage.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'repeat',
              }}
            />
            <div className="fixed inset-0 z-0 bg-white/30 dark:bg-black/30" />
          </>
        )}
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <AppHeader links={links} />
          <main className={`flex-grow ${isHomePage ? '' : 'container mx-auto p-4'}`}>
            <ClusterUiChecker>
              <AccountUiChecker />
            </ClusterUiChecker>
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
      <Toaster closeButton />
    </ThemeProvider>
  )
}
