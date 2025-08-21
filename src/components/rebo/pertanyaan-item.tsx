'use client';

import React from 'react';
import SkorBox from '@/components/rebo/skorBox';
import BuktiForm from '@/components/rebo/bukti-form';
import StatusControls from '@/components/rebo/status-controls';
import type { Pertanyaan, BuktiDukung } from '@/types/rebo';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
  pertanyaan: Pertanyaan;
  index: number;
  bukti?: BuktiDukung | null;
  buktiDukungMap: Record<string, BuktiDukung>;
  setBuktiDukungMap: Dispatch<SetStateAction<Record<string, BuktiDukung>>>;
  onUpsert: (
    payload: Partial<BuktiDukung>,
    form?: HTMLFormElement
  ) => Promise<any>;
  onSendStatus: (id_pertanyaan: string, status: string) => Promise<any>;
  onApproveReject: (id_pertanyaan: string, status: string) => Promise<any>;
  setModalMsg: (msg: string) => void;
  setModalOpen: (v: boolean) => void;
};

export default function PertanyaanItem({
  pertanyaan,
  index,
  bukti,
  buktiDukungMap,
  setBuktiDukungMap,
  onUpsert,
  onSendStatus,
  onApproveReject,
  setModalMsg,
  setModalOpen
}: Props) {
  return (
    <div className='relative rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:shadow-lg'>
      <SkorBox
        nilaiAkhir={buktiDukungMap[pertanyaan.id_pertanyaan]?.nilai_akhir}
      />
      <div className='mb-4 flex items-start justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white dark:bg-blue-600'>
            {index + 1}
          </div>
          <p className='m-0 text-lg leading-relaxed font-medium text-gray-800 dark:text-gray-100'>
            {pertanyaan.pertanyaan}
          </p>
        </div>
        <SkorBox
          nilaiAkhir={buktiDukungMap[pertanyaan.id_pertanyaan]?.nilai_akhir}
          nilaiMaks={
            pertanyaan.kategoriPenilaian?.length
              ? Math.max(
                  ...pertanyaan.kategoriPenilaian.map((k: any) => k.nilai)
                )
              : undefined
          }
          className='relative static top-0 right-0'
        />
      </div>

      {pertanyaan.deskripsi_pertanyaan && (
        <p className='mb-6 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3 text-sm leading-relaxed text-gray-600 dark:border-blue-500 dark:bg-blue-900/30 dark:text-gray-300'>
          {pertanyaan.deskripsi_pertanyaan}
        </p>
      )}

      {pertanyaan.uraian_buktidukung && (
        <div className='mb-6 rounded-lg border-l-4 border-green-200 bg-green-50 p-4 dark:border-green-500 dark:bg-green-900/30'>
          <h4 className='mb-2 text-sm font-semibold text-green-800 dark:text-green-300'>
            Uraian Bukti Dukung:
          </h4>
          <p className='text-sm leading-relaxed text-green-700 dark:text-green-200'>
            {pertanyaan.uraian_buktidukung}
          </p>
        </div>
      )}

      <BuktiForm
        pertanyaan={pertanyaan}
        buktiDukungMap={buktiDukungMap}
        setBuktiDukungMap={setBuktiDukungMap}
        onUpsert={onUpsert}
      />

      <StatusControls
        pertanyaanId={pertanyaan.id_pertanyaan}
        bukti={bukti}
        onSendStatus={async (status) => {
          const res = await onSendStatus(pertanyaan.id_pertanyaan, status);
          if (res && res.success) {
            setModalMsg('Status berhasil dikirim!');
            setModalOpen(true);
            setBuktiDukungMap((prev) => ({
              ...prev,
              [pertanyaan.id_pertanyaan]: {
                ...(prev[pertanyaan.id_pertanyaan] || {}),
                ...(res.data || {}),
                status: res.data?.status ?? status
              }
            }));
          } else {
            setModalMsg(
              'Gagal mengirim status: ' + (res?.error || 'Unknown error')
            );
            setModalOpen(true);
          }
        }}
        onApprove={async () => {
          // use localized status so server mapping picks it up and sets status_kelengkapan=2
          const status = 'Disetujui';
          const res = await onApproveReject(pertanyaan.id_pertanyaan, status);
          if (res && res.success) {
            setModalMsg('Status Approve berhasil dikirim!');
            setModalOpen(true);
            setBuktiDukungMap((prev) => ({
              ...prev,
              [pertanyaan.id_pertanyaan]: {
                ...(prev[pertanyaan.id_pertanyaan] || {}),
                ...(res.data || {}),
                status: res.data?.status ?? status
              }
            }));
          } else {
            setModalMsg(
              'Gagal mengirim Approve: ' + (res?.error || 'Unknown error')
            );
            setModalOpen(true);
          }
        }}
        onReject={async () => {
          // use localized status for rejected
          const status = 'Ditolak';
          const res = await onApproveReject(pertanyaan.id_pertanyaan, status);
          if (res && res.success) {
            setModalMsg('Status Reject berhasil dikirim!');
            setModalOpen(true);
            setBuktiDukungMap((prev) => ({
              ...prev,
              [pertanyaan.id_pertanyaan]: {
                ...(prev[pertanyaan.id_pertanyaan] || {}),
                ...(res.data || {}),
                status: res.data?.status ?? status
              }
            }));
          } else {
            setModalMsg(
              'Gagal mengirim Reject: ' + (res?.error || 'Unknown error')
            );
            setModalOpen(true);
          }
        }}
      />
    </div>
  );
}
