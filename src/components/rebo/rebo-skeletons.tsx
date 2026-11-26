import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton untuk widget ringkas di halaman Overview (Leaderboard & Paperless)
 */
export function OverviewWidgetSkeleton() {
  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:bg-slate-900/70'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-48 rounded-full' />
          <Skeleton className='h-5 w-72' />
        </div>
        <Skeleton className='h-8 w-44 rounded-lg' />
      </div>
      <div className='mt-4 grid gap-2.5 sm:grid-cols-3'>
        <Skeleton className='h-16 rounded-xl' />
        <Skeleton className='h-16 rounded-xl' />
        <Skeleton className='h-16 rounded-xl' />
      </div>
    </div>
  );
}

/**
 * Skeleton halaman Overview
 */
export function OverviewPageSkeleton() {
  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      <Skeleton className='h-56 w-full rounded-3xl' />
      <Skeleton className='h-40 w-full rounded-2xl' />
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-16 rounded-xl' />
        ))}
      </div>
      <OverviewWidgetSkeleton />
      <OverviewWidgetSkeleton />
    </div>
  );
}

/**
 * Skeleton halaman Monitoring Dashboard
 */
export function MonitoringPageSkeleton() {
  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-72' />
          <Skeleton className='h-4 w-96 max-w-full' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-40 rounded-lg' />
          <Skeleton className='h-9 w-28 rounded-lg' />
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-28 rounded-2xl' />
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Skeleton className='h-80 rounded-2xl lg:col-span-2' />
        <Skeleton className='h-80 rounded-2xl' />
      </div>

      <Skeleton className='h-64 rounded-2xl' />
    </div>
  );
}

/**
 * Skeleton halaman Leaderboard & Lencana Penghargaan
 */
export function LeaderboardPageSkeleton() {
  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-80 max-w-full' />
          <Skeleton className='h-4 w-96 max-w-full' />
        </div>
        <Skeleton className='h-9 w-48 rounded-lg' />
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <Skeleton className='h-44 rounded-2xl' />
        <Skeleton className='h-48 rounded-2xl' />
        <Skeleton className='h-44 rounded-2xl' />
      </div>

      <div className='space-y-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-20 rounded-2xl' />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton halaman Executive Command Center (Mode TV Kiosk)
 */
export function CommandCenterPageSkeleton() {
  return (
    <div className='min-h-screen space-y-6 bg-slate-950 p-4 text-slate-100 md:p-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-72 bg-slate-800' />
          <Skeleton className='h-4 w-96 max-w-full bg-slate-800' />
        </div>
        <Skeleton className='h-10 w-40 rounded-xl bg-slate-800' />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-28 rounded-2xl bg-slate-900' />
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Skeleton className='h-96 rounded-2xl bg-slate-900 lg:col-span-2' />
        <Skeleton className='h-96 rounded-2xl bg-slate-900' />
      </div>
    </div>
  );
}

/**
 * Skeleton konten data halaman Pilar Pemenuhan
 */
export function PemenuhanDataSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='rounded-3xl border border-blue-200/60 bg-white/70 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/70'>
        <div className='space-y-3'>
          <Skeleton className='h-5 w-44 rounded-full' />
          <Skeleton className='h-8 w-80 max-w-full' />
          <Skeleton className='h-4 w-full max-w-2xl' />
        </div>
        <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <Skeleton className='h-24 rounded-xl' />
          <Skeleton className='h-24 rounded-xl' />
          <Skeleton className='h-24 rounded-xl' />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-56' />
          <Skeleton className='hidden h-4 w-64 sm:block' />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-24 w-full rounded-2xl' />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton halaman Generator Slide Paparan ZI (Presentation)
 */
export function PresentationPageSkeleton() {
  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-80 max-w-full' />
          <Skeleton className='h-4 w-96 max-w-full' />
        </div>
        <Skeleton className='h-10 w-48 rounded-xl' />
      </div>

      <div className='grid gap-6 lg:grid-cols-12'>
        <Skeleton className='h-[420px] rounded-2xl lg:col-span-4' />
        <Skeleton className='h-[420px] rounded-2xl lg:col-span-8' />
      </div>
    </div>
  );
}

/**
 * Skeleton halaman Kanban Tindak Lanjut RB
 */
export function KanbanPageSkeleton() {
  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96 max-w-full' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-40 rounded-lg' />
          <Skeleton className='h-9 w-40 rounded-lg' />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div
            key={colIdx}
            className='space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50'
          >
            <Skeleton className='h-6 w-36' />
            <Skeleton className='h-28 w-full rounded-xl' />
            <Skeleton className='h-28 w-full rounded-xl' />
            <Skeleton className='h-28 w-full rounded-xl' />
          </div>
        ))}
      </div>
    </div>
  );
}
