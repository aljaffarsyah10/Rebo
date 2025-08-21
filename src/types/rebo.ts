export interface KategoriPenilaian {
  id_kategori: string;
  uraian_kategori: string;
}

export interface BuktiDukung {
  id_bukti?: string;
  id_pertanyaan: string;
  link_bukti?: string | null;
  id_kategori?: string | null;
  nilai_akhir?: number | null;
  status?: string | null;
  status_kelengkapan?: string | null;
  nama_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Pertanyaan {
  id_pertanyaan: string;
  uraian_pertanyaan: string;
  uraian_singkat?: string | null;
  kategoriPenilaian?: KategoriPenilaian[];
  // other fields from DB may exist
  [key: string]: any;
}

export interface Subpilar {
  id_subpilar: string;
  nama_subpilar?: string;
  pilar?: { id_pilar: string; nama_pilar: string } | null;
  pertanyaan?: Pertanyaan[];
  [key: string]: any;
}
