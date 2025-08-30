'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { IconBrandGithub } from '@tabler/icons-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

export default function CtaGithub() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='ghost' asChild size='sm' className='hidden sm:flex'>
          <a
            // href='https://github.com/aljaffarsyah10/Rebo'
            rel='noopener noreferrer'
            target='_blank'
            className='dark:text-foreground'
          >
            <IconBrandGithub />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>GitHub</TooltipContent>
    </Tooltip>
  );
}
