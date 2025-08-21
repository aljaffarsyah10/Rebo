import React from 'react';

type Props = {
  pertanyaan: any;
  buktiDukungMap: Record<string, any>;
  setBuktiDukungMap: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onUpsert?: (payload: Partial<any>, form?: HTMLFormElement) => Promise<any>;
};

export default function BuktiForm({
  pertanyaan,
  buktiDukungMap,
  setBuktiDukungMap,
  onUpsert
}: Props) {
  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const kategori = (
      form.querySelector(
        `select[name="kategori-${pertanyaan.id_pertanyaan}"]`
      ) as HTMLSelectElement | null
    )?.value;
    const link = (
      form.querySelector(
        `input[name="bukti-${pertanyaan.id_pertanyaan}"]`
      ) as HTMLInputElement | null
    )?.value;

    const payload: any = {
      id_pertanyaan: pertanyaan.id_pertanyaan,
      id_kategori: kategori || null,
      link_bukti: link || null
    };

    if (onUpsert) {
      const res = await onUpsert(payload, form);
      if (res && res.success) {
        // optionally update local map
        setBuktiDukungMap((prev) => ({
          ...prev,
          [pertanyaan.id_pertanyaan]: {
            ...(prev[pertanyaan.id_pertanyaan] || {}),
            ...payload
          }
        }));
      }
    }
  }
  return (
    <>
      <form onSubmit={handleUpdate} className='space-y-2'>
        {pertanyaan.kategoriPenilaian &&
          pertanyaan.kategoriPenilaian.length > 0 && (
            <div className='mb-2'>
              <label
                htmlFor={`kategori-${pertanyaan.id_pertanyaan}`}
                className={`block text-sm font-semibold ${buktiDukungMap[pertanyaan.id_pertanyaan] ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}
              >
                Kategori Penilaian
              </label>
              <select
                id={`kategori-${pertanyaan.id_pertanyaan}`}
                name={`kategori-${pertanyaan.id_pertanyaan}`}
                defaultValue={
                  buktiDukungMap[pertanyaan.id_pertanyaan]?.id_kategori || ''
                }
                className={`focus:ring-opacity-50 w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-blue-200`}
                onChange={(e) => {
                  const updatedMap = { ...buktiDukungMap };
                  if (!updatedMap[pertanyaan.id_pertanyaan])
                    updatedMap[pertanyaan.id_pertanyaan] = {};
                  updatedMap[pertanyaan.id_pertanyaan].id_kategori =
                    e.target.value;
                  setBuktiDukungMap(updatedMap);
                }}
              >
                <option value=''>Pilih kategori penilaian...</option>
                {pertanyaan.kategoriPenilaian.map((kategori: any) => (
                  <option
                    key={kategori.id_kategori}
                    value={kategori.id_kategori}
                  >
                    {kategori.uraian_kategori}
                  </option>
                ))}
              </select>
            </div>
          )}

        <div>
          <label
            htmlFor={`bukti-${pertanyaan.id_pertanyaan}`}
            className={`block text-sm font-semibold ${buktiDukungMap[pertanyaan.id_pertanyaan] ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}
          >
            Link Bukti Dukung
          </label>
          <div className='flex gap-2'>
            <input
              type='url'
              id={`bukti-${pertanyaan.id_pertanyaan}`}
              name={`bukti-${pertanyaan.id_pertanyaan}`}
              placeholder='https://contoh.com/dokumen-bukti'
              defaultValue={
                buktiDukungMap[pertanyaan.id_pertanyaan]?.link_bukti || ''
              }
              onChange={(e) => {
                const updatedMap = { ...buktiDukungMap };
                if (!updatedMap[pertanyaan.id_pertanyaan])
                  updatedMap[pertanyaan.id_pertanyaan] = {};
                updatedMap[pertanyaan.id_pertanyaan].link_bukti =
                  e.target.value;
                setBuktiDukungMap(updatedMap);
              }}
              className={`focus:ring-opacity-50 w-full flex-1 rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-blue-200`}
            />
            <button
              type='submit'
              className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
            >
              Update
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
