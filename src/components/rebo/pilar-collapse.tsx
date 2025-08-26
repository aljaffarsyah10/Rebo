import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';

export default function PilarCollapse({
  title,
  children,
  value,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  value?: string;
  defaultOpen?: boolean;
}) {
  const id = value ?? title.replace(/\s+/g, '-').toLowerCase();

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className='w-full'
    >
      <AccordionItem value={id}>
        <div className='mb-4 overflow-hidden rounded-2xl border border-transparent bg-gradient-to-b from-white/80 to-slate-50/80 shadow-lg'>
          <div className='rounded-t-2xl bg-gradient-to-r from-sky-50/40 via-white to-white p-[1px]'>
            <AccordionTrigger className='flex w-full items-center justify-between rounded-t-2xl bg-white/60 px-5 py-4 text-left hover:bg-sky-50/40 focus:outline-none'>
              <div>
                <div className='text-base font-semibold text-slate-800'>
                  {title}
                </div>
              </div>
            </AccordionTrigger>
          </div>

          <AccordionContent className='px-5 pt-3 pb-5 text-sm text-slate-700'>
            {children}
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
