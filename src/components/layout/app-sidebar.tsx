'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useUser } from '@clerk/nextjs';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
export const company = {
  name: 'BPS Siau Tagulandang Biaro',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

const tenants = [{ id: '1', name: 'BPS Siau Tagulandang Biaro' }];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user } = useUser();
  const router = useRouter();
  const handleSwitchTenant = (_tenantId: string) => {
    // Tenant switching functionality would be implemented here
  };

  const activeTenant = tenants[0];

  const userRole = user?.publicMetadata?.role as string | undefined;
  const canAccessAdmin = !!user && (userRole === 'admin' || userRole === 'tpi');

  const isAdminUrl = (url: string) =>
    url.startsWith('/rebo/admin') || url.includes('/admin');

  const filteredNavItems = React.useMemo(() => {
    return navItems
      .filter((item) => {
        const isTitleAdmin =
          item.title === 'Admin' || item.title === 'Admin Dashboard';
        const isUrlAdmin = isAdminUrl(item.url);
        const hasAdminSub = item.items?.some((sub) => isAdminUrl(sub.url));
        if (isTitleAdmin || isUrlAdmin || hasAdminSub) {
          return canAccessAdmin;
        }
        return true;
      })
      .map((item) => {
        if (!item.items || item.items.length === 0) return item;
        const visibleSubItems = item.items.filter((sub) => {
          if (isAdminUrl(sub.url)) {
            return canAccessAdmin;
          }
          return true;
        });
        return {
          ...item,
          items: visibleSubItems
        };
      });
  }, [canAccessAdmin]);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const isChildActive = item.items?.some(
                (sub) =>
                  pathname === sub.url ||
                  (sub.url !== '#' && pathname.startsWith(sub.url))
              );
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive || isChildActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url || isChildActive}
                      >
                        {item.icon && <Icon className='size-4 shrink-0' />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const SubIcon = subItem.icon
                            ? Icons[subItem.icon]
                            : null;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  {SubIcon && (
                                    <SubIcon className='size-4 shrink-0' />
                                  )}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link
                      href={item.url}
                      className='flex w-full items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <Icon className='size-4 shrink-0' />
                        <span>{item.title}</span>
                      </div>
                      {item.title === 'Agenda & Rencana Kerja' && (
                        <span className='relative mr-1 flex h-2 w-2'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75'></span>
                          <span className='relative inline-flex h-2 w-2 rounded-full bg-blue-500'></span>
                        </span>
                      )}
                      {item.title === 'Notulen Rapat Digital' && (
                        <span className='relative mr-1 flex h-2 w-2'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75'></span>
                          <span className='relative inline-flex h-2 w-2 rounded-full bg-cyan-500'></span>
                        </span>
                      )}
                      {item.title === 'Kanban Tindak Lanjut' && (
                        <span className='relative mr-1 flex h-2 w-2'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75'></span>
                          <span className='relative inline-flex h-2 w-2 rounded-full bg-amber-500'></span>
                        </span>
                      )}
                      {item.title === 'Monitoring' && (
                        <span className='relative mr-1 flex h-2 w-2'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60'></span>
                          <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span>
                        </span>
                      )}
                      {item.title === 'Inovasi Layanan' && (
                        <span className='relative mr-1 flex h-2 w-2'>
                          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75'></span>
                          <span className='relative inline-flex h-2 w-2 rounded-full bg-purple-500'></span>
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/rebo/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profil & Notifikasi WA
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconCreditCard className='mr-2 h-4 w-4' />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconBell className='mr-2 h-4 w-4' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconLogout className='mr-2 h-4 w-4' />
                  <SignOutButton redirectUrl='/auth/sign-in' />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
