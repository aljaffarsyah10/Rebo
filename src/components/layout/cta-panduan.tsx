'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

export default function CtaPanduan() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='ghost' asChild size='sm' className='hidden sm:flex'>
          <a
            href='https://youtu.be/8Q5mt4glAd4'
            rel='noopener noreferrer'
            target='_blank'
            className='dark:text-foreground'
          >
            <Icons.video />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>video panduan</TooltipContent>
    </Tooltip>
  );
}
