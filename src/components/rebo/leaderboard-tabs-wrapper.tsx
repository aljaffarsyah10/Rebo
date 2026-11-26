'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardPilarClient } from '@/components/rebo/leaderboard-pilar-client';
import { AchievementBadgesClient } from '@/components/rebo/achievement-badges-client';
import { type LeaderboardSummary } from '@/lib/gamification/leaderboard-types';
import { type AchievementBadge } from '@/lib/gamification/badge-types';
import { Trophy, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaderboardTabsWrapperProps {
  initialLeaderboardSummary: LeaderboardSummary;
  initialBadgeData: {
    badges: AchievementBadge[];
    summary: {
      totalBadges: number;
      totalUnlocked: number;
      totalLocked: number;
      platinumUnlocked: number;
      goldUnlocked: number;
      silverUnlocked: number;
      bronzeUnlocked: number;
      pilars: {
        pilar_id: string;
        pilar_nama: string;
        pilar_kode: string;
        koordinator_name: string;
        unlocked_count: number;
        total_count: number;
      }[];
    };
  };
}

export function LeaderboardTabsWrapper({
  initialLeaderboardSummary,
  initialBadgeData
}: LeaderboardTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <div className='space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full space-y-6'
      >
        <div className='flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <Badge className='border-amber-300 bg-amber-500/15 text-xs font-bold text-amber-800 dark:border-amber-700 dark:text-amber-300'>
                ✨ RECOGNITION &amp; GAMIFIKASI ZI
              </Badge>
              <span className='text-xs text-slate-500'>BPS Sitaro 2026</span>
            </div>
            <h1 className='mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Papan Peringkat &amp; Lencana Kehormatan 6 Pilar
            </h1>
          </div>

          <TabsList className='grid h-10 w-full grid-cols-2 bg-slate-100 p-1 sm:w-auto dark:bg-slate-800/80'>
            <TabsTrigger
              value='leaderboard'
              className='flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100'
            >
              <Trophy className='h-3.5 w-3.5 text-amber-500' />
              <span>Leaderboard 6 Pilar</span>
            </TabsTrigger>
            <TabsTrigger
              value='badges'
              className='flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100'
            >
              <Award className='h-3.5 w-3.5 text-cyan-500' />
              <span>
                Galeri Lencana ({initialBadgeData.summary.totalUnlocked})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value='leaderboard'
          className='mt-0 focus-visible:outline-hidden'
        >
          <LeaderboardPilarClient initialSummary={initialLeaderboardSummary} />
        </TabsContent>

        <TabsContent
          value='badges'
          className='mt-0 focus-visible:outline-hidden'
        >
          <AchievementBadgesClient
            initialBadges={initialBadgeData.badges}
            initialSummary={initialBadgeData.summary}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
