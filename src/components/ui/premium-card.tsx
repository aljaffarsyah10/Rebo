import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';

export default function PremiumCard({
  title,
  description,
  children,
  className
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={'w-full ' + (className ?? '')}>
      <Card className='rounded-2xl border-0 shadow-2xl'>
        <div className='-mx-6 rounded-t-2xl bg-gradient-to-r from-sky-50/80 via-white to-white px-6 py-6'>
          <CardHeader>
            <CardTitle>
              {title ? (
                <span className='bg-gradient-to-r from-sky-700 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent'>
                  {title}
                </span>
              ) : null}
            </CardTitle>
            {description ? (
              <CardDescription className='mt-1 text-sm text-slate-600'>
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>
        </div>

        <CardContent className='px-6 pt-4 pb-6'>{children}</CardContent>
      </Card>
    </div>
  );
}
