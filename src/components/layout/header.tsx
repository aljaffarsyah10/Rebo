import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import CtaPanduan from './cta-panduan';
import CtaGithub from './cta-github';
import PeriodeSwitcher from './periode-switcher';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-200/40 bg-blue-50/80 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80'>
      <div className='flex items-center gap-2 px-3 sm:px-4'>
        <SidebarTrigger className='-ml-1 size-9 min-h-[36px] min-w-[36px] touch-manipulation sm:size-8 sm:min-h-[32px] sm:min-w-[32px]' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-2 px-3 sm:px-4'>
        <PeriodeSwitcher />
        <CtaPanduan />
        <CtaGithub />
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <UserNav />
        <ModeToggle />
        <ThemeSelector />
      </div>
    </header>
  );
}
