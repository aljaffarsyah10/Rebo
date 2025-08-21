// app/features/products/components/product-listing.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import type { Pertanyaan, BuktiDukung, Subpilar } from '@/types/rebo';
import {
  upsertBukti,
  sendStatus,
  approveReject,
  fetchSubpilarWithPertanyaan,
  fetchBuktiByPertanyaanIds
} from '@/lib/api/rebo';
import SubmitModal from '@/components/modal/submit-modal';
import SkorBox from '@/components/rebo/skorBox';
import BuktiForm from '@/components/rebo/bukti-form';
import PertanyaanItem from '@/components/rebo/pertanyaan-item';

type PageProps = { params: Promise<{ pilarId: string }> };

export default function Page(props: PageProps) {
  const [subpilarjoinpertanyaan, setSubpilarjoinpertanyaan] = useState<
    Subpilar[]
  >([]);
  const [buktiDukungMap, setBuktiDukungMap] = useState<
    Record<string, BuktiDukung>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [pilarId, setPilarId] = useState<string>('');
  const [namaPilar, setNamaPilar] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function getParams() {
      const params = await props.params;
      setPilarId(params.pilarId);
    }
    getParams();
  }, [props.params]);

  useEffect(() => {
    if (!pilarId) return;

    async function fetchData() {
      try {
        const data = await fetchSubpilarWithPertanyaan(pilarId);
        setSubpilarjoinpertanyaan(data || []);
        if (data && data.length > 0) {
          if (data[0].pilar) {
            setNamaPilar(data[0].pilar.nama_pilar);
          }
          // set the first subpilar as active tab
          setActiveTab(data[0].id_subpilar?.toString());
        }

        const pertanyaanIds = (data || []).flatMap(
          (subpilar: any) =>
            subpilar.pertanyaan?.map((p: any) => p.id_pertanyaan) || []
        );

        if (pertanyaanIds.length > 0) {
          const buktiData = await fetchBuktiByPertanyaanIds(pertanyaanIds);
          if (buktiData) {
            const map: Record<string, any> = {};
            buktiData.forEach((row: any) => {
              map[row.id_pertanyaan] = row;
            });
            setBuktiDukungMap(map);
          }
        }
      } catch (err) {
        setError(err);
        if (err instanceof Error) {
          console.error('Error fetching subpilar:', err.message);
        } else {
          console.error('Error fetching subpilar:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pilarId]);

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      <h1 className='mb-1 text-3xl font-bold text-gray-800 dark:text-gray-100'>
        Pilar {pilarId} : {namaPilar || 'Form RB'}
      </h1>
      <p className='mb-4 text-lg text-gray-600 dark:text-gray-400'>
        Subpilar dan Pertanyaan Evaluasi
      </p>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v)}
        className='w-full'
      >
        <TabsList className='grid h-auto w-full grid-cols-1 gap-1 border border-gray-200 bg-gray-50/50 p-1 lg:grid-cols-4 dark:border-gray-700 dark:bg-gray-800/50'>
          {subpilarjoinpertanyaan.map((subpilar: any) => (
            <TabsTrigger
              key={subpilar.id_subpilar}
              value={subpilar.id_subpilar.toString()}
              className='flex h-auto flex-col items-start justify-start p-3 text-left whitespace-normal'
            >
              <span className='mb-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
                Subpilar {subpilar.id_subpilar}
              </span>
              <span className='text-sm leading-tight font-semibold text-gray-800 dark:text-gray-200'>
                {subpilar.nama_subpilar}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {subpilarjoinpertanyaan.map((subpilar: any) => (
          <TabsContent
            key={subpilar.id_subpilar}
            value={subpilar.id_subpilar.toString()}
          >
            <div className='mt-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
              <div className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                    {subpilar.id_subpilar}
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                    {subpilar.nama_subpilar}
                  </h2>
                </div>
                <p className='ml-11 leading-relaxed text-gray-600 dark:text-gray-300'>
                  {subpilar.deskripsi_subpilar}
                </p>
              </div>

              {subpilar.pertanyaan && subpilar.pertanyaan.length > 0 && (
                <div className='relative'>
                  <div className='absolute top-8 bottom-0 left-4 w-0.5 bg-gradient-to-b from-blue-300 to-blue-100 dark:from-blue-600 dark:to-blue-400'></div>
                  <h3 className='mb-8 flex items-center gap-3 text-xl font-semibold text-gray-700 dark:text-gray-300'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white dark:bg-blue-600'>
                      Q
                    </div>
                    Pertanyaan
                  </h3>
                  <div className='ml-9 space-y-8'>
                    {subpilar.pertanyaan.map(
                      (pertanyaan: any, index: number) => (
                        <PertanyaanItem
                          key={pertanyaan.id_pertanyaan}
                          pertanyaan={pertanyaan}
                          index={index}
                          bukti={buktiDukungMap[pertanyaan.id_pertanyaan]}
                          buktiDukungMap={buktiDukungMap}
                          setBuktiDukungMap={setBuktiDukungMap}
                          onUpsert={async (
                            payload: any,
                            form?: HTMLFormElement
                          ) => {
                            const res = await upsertBukti(payload);
                            if (res && res.success && form) form.reset();
                            return res;
                          }}
                          onSendStatus={async (
                            id_pertanyaan: string,
                            status: string
                          ) => {
                            return await sendStatus(id_pertanyaan, status);
                          }}
                          onApproveReject={async (
                            id_pertanyaan: string,
                            status: string
                          ) => {
                            return await approveReject(id_pertanyaan, status);
                          }}
                          setModalMsg={setModalMsg}
                          setModalOpen={setModalOpen}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <SubmitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
    </div>
  );
}
