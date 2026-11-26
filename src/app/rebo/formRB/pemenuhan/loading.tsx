import { PemenuhanDataSkeleton } from '@/components/rebo/rebo-skeletons';

export default function PemenuhanLoading() {
  return (
    <div className='mx-auto w-full max-w-7xl min-w-0 space-y-6 p-4 md:p-6'>
      <PemenuhanDataSkeleton />
    </div>
  );
}
