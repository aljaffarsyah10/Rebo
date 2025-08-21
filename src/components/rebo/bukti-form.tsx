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
    // Use values from buktiDukungMap (populated from DB by parent) so inputs reflect DB state
    const currentMap = buktiDukungMap[pertanyaan.id_pertanyaan] || {};
    const selectedKategoriValue =
      currentMap.id_kategori !== undefined && currentMap.id_kategori !== null
        ? currentMap.id_kategori
        : '';
    const linkValue = currentMap.link_bukti || '';

    if (
      (pertanyaan.kategoriPenilaian?.length || 0) > 0 &&
      !selectedKategoriValue
    ) {
      // require category for API
      alert('Pilih kategori penilaian sebelum Update.');
      return;
    }
    if (!linkValue) {
      alert('Masukkan link bukti dukung sebelum Update.');
      return;
    }

    // derive nilai_akhir from selected kategori if possible
    const selectedKategori = pertanyaan.kategoriPenilaian?.find(
      (k: any) =>
        k.id_kategori?.toString() === selectedKategoriValue?.toString()
    );
    const nilai_akhir = selectedKategori ? selectedKategori.nilai : null;

    const payload: any = {
      id_pertanyaan: pertanyaan.id_pertanyaan,
      id_kategori: selectedKategoriValue || null,
      link_bukti: linkValue || null,
      nilai_akhir,
      catatan_user: currentMap.catatan_user || null
    };

    if (onUpsert) {
      const res = await onUpsert(payload, undefined);
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
                value={
                  buktiDukungMap[pertanyaan.id_pertanyaan] &&
                  buktiDukungMap[pertanyaan.id_pertanyaan].id_kategori != null
                    ? String(
                        buktiDukungMap[pertanyaan.id_pertanyaan].id_kategori
                      )
                    : ''
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
                    value={String(kategori.id_kategori)}
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
          </div>
        </div>
        {/* Catatan user textarea */}
        <div>
          <label
            htmlFor={`catatan-${pertanyaan.id_pertanyaan}`}
            className='block text-sm font-semibold text-gray-700 dark:text-gray-300'
          >
            Catatan User
          </label>
          <textarea
            id={`catatan-${pertanyaan.id_pertanyaan}`}
            name={`catatan-${pertanyaan.id_pertanyaan}`}
            defaultValue={
              buktiDukungMap[pertanyaan.id_pertanyaan]?.catatan_user || ''
            }
            placeholder='Tambahkan catatan atau komentar...'
            onChange={(e) => {
              const updatedMap = { ...buktiDukungMap };
              if (!updatedMap[pertanyaan.id_pertanyaan])
                updatedMap[pertanyaan.id_pertanyaan] = {};
              updatedMap[pertanyaan.id_pertanyaan].catatan_user =
                e.target.value;
              setBuktiDukungMap(updatedMap);
            }}
            className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
            rows={3}
          />
        </div>

        {/* Secondary Update button below */}
        <div className='pt-1'>
          <button
            type='submit'
            className='inline-flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 hover:scale-[1.02] hover:from-indigo-700 hover:to-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={
              !(
                (pertanyaan.kategoriPenilaian?.length
                  ? Boolean(
                      buktiDukungMap[pertanyaan.id_pertanyaan]?.id_kategori
                    )
                  : true) &&
                Boolean(buktiDukungMap[pertanyaan.id_pertanyaan]?.link_bukti)
              )
            }
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4'
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z'
                clipRule='evenodd'
              />
            </svg>
            <span>Update</span>
          </button>
        </div>
      </form>
    </>
  );
}
