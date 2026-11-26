'use client';
import { navItems } from '@/constants/data';
import { useUser } from '@clerk/nextjs';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useUser();

  const userRole = user?.publicMetadata?.role as string | undefined;
  const canAccessAdmin = !!user && (userRole === 'admin' || userRole === 'tpi');

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string) => {
      router.push(url);
    };

    const isAdminUrl = (url: string) =>
      url.startsWith('/rebo/admin') || url.includes('/admin');

    const visibleNavItems = navItems.filter((navItem) => {
      const isTitleAdmin =
        navItem.title === 'Admin' || navItem.title === 'Admin Dashboard';
      const isUrlAdmin = isAdminUrl(navItem.url);
      const hasAdminSub = navItem.items?.some((sub) => isAdminUrl(sub.url));

      if (isTitleAdmin || isUrlAdmin || hasAdminSub) {
        return canAccessAdmin;
      }
      return true;
    });

    return visibleNavItems.flatMap((navItem) => {
      // Only include base action if the navItem has a real URL and is not just a container
      const baseAction =
        navItem.url !== '#' && (!isAdminUrl(navItem.url) || canAccessAdmin)
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      // Filter and map child items into actions
      const visibleChildren =
        navItem.items?.filter((childItem) => {
          if (isAdminUrl(childItem.url)) {
            return canAccessAdmin;
          }
          return true;
        }) ?? [];

      const childActions = visibleChildren.map((childItem) => ({
        id: `${childItem.title.toLowerCase()}Action`,
        name: childItem.title,
        shortcut: childItem.shortcut,
        keywords: childItem.title.toLowerCase(),
        section: navItem.title,
        subtitle: `Go to ${childItem.title}`,
        perform: () => navigateTo(childItem.url)
      }));

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, canAccessAdmin]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
