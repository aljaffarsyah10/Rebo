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
        <div className='bg-background mb-3 overflow-hidden rounded-lg border'>
          <AccordionTrigger className='w-full px-4 py-3 text-left'>
            <div className='flex w-full items-center justify-between'>
              <span className='font-medium'>{title}</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-4 pt-2 pb-4 text-sm'>
            {children}
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
