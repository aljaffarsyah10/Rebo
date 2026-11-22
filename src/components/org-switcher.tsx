'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

interface Tenant {
  id: string;
  name: string;
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch
}: {
  tenants: Tenant[];
  defaultTenant: Tenant;
  onTenantSwitch?: (tenantId: string) => void;
}) {
  const [selectedTenant, setSelectedTenant] = React.useState<
    Tenant | undefined
  >(defaultTenant || (tenants.length > 0 ? tenants[0] : undefined));

  const handleTenantSwitch = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    if (onTenantSwitch) {
      onTenantSwitch(tenant.id);
    }
  };

  if (!selectedTenant) {
    return null;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group'
            >
              <div className='relative flex aspect-square size-8.5 items-center justify-center rounded-lg bg-gradient-to-br from-[#023047] via-[#034469] to-[#0f4c75] text-white shadow-md ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105'>
                <svg
                  className='size-4 text-amber-300'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M8 2v20h2V2H8zm6 0v20h2V2h-2zM2 6v12h2V6H2zm18 0v12h2V6h-2zM5 9v6h2V9H5zm12 0v6h2V9h-2z' />
                </svg>
                {/* Live beacon indicator dot */}
                <span className='absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 dark:border-slate-900'></span>
                </span>
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <div className='flex items-center space-x-1.5'>
                  <span className='truncate font-black tracking-tight text-[#023047] dark:text-[#ffb703]'>
                    REBO
                  </span>
                  <span className='py-0.2 rounded border border-amber-500/30 bg-amber-500/15 px-1 text-[9px] font-bold text-amber-600 dark:text-amber-400'>
                    V2
                  </span>
                </div>
                <span className='truncate text-[11px] font-medium text-[#023047]/75 dark:text-[#ffb703]/75'>
                  BPS Sitaro
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4 text-[#023047]/60 dark:text-[#ffb703]/60' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onSelect={() => handleTenantSwitch(tenant)}
              >
                {tenant.name}{' '}
                {tenant.id === selectedTenant.id && (
                  <Check className='ml-auto' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
