<div align="center">
  <img src="/public/Homepage_rebo.png" alt="REBO Homepage" style="max-width: 600px; border-radius: 16px; box-shadow: 0 4px 24px #0001; margin-bottom: 16px;" />
</div>

<div align="center">
  <h1><strong>REBO - Reformasi Birokrasi Platform</strong></h1>
  <div>Mengelola, memantau, dan memvalidasi bukti dukung Reformasi Birokrasi secara digital</div>
  <div><em>Built for BPS Siau Tagulandang Biaro</em></div>
  <br />
  <a href="/rebo">Lihat Demo Lokal</a>
</div>

## 🚀 Tentang REBO

**REBO** (Reformasi Birokrasi) adalah platform digital modern untuk mengelola, mengumpulkan, dan memvalidasi bukti dukung Reformasi Birokrasi (RB) di lingkungan BPS Siau Tagulandang Biaro. Platform ini dirancang untuk memudahkan proses dokumentasi, monitoring, dan kolaborasi tim dalam rangka mewujudkan Zona Integritas menuju Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM).

<div align="center">
  <img src="/public/assets/logo_rebo.png" alt="Logo REBO" width="120" />
</div>

### Fitur Utama

- **Input & Validasi Link Bukti Dukung**: Form digital untuk mengumpulkan dan memvalidasi dokumen RB secara terstruktur.
- **Monitoring**: Pantau progres dan status implementasi RB secara real-time.
- **Manajemen Pilar & Area**: Kelola pilar pemenuhan dan reformasi sesuai struktur nasional.
- **Keamanan & Audit**: Otentikasi Clerk, pelacakan aktivitas, dan integrasi Sentry untuk error monitoring.

### Stack Teknologi

- **Framework**: [Next.js 15](https://nextjs.org/13) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com), [Shadcn-ui](https://ui.shadcn.com)
- **Auth**: [Clerk](https://clerk.com/)
- **Database**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)
- **Validasi**: [Zod](https://zod.dev)
- **Tabel**: [Tanstack Data Tables](https://ui.shadcn.com/docs/components/data-table)
- **Lint & Format**: [ESLint](https://eslint.org), [Prettier](https://prettier.io)
- **Error Tracking**: [Sentry](https://sentry.io/)

---

## 📚 Halaman Utama

| Halaman                     | Deskripsi                                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| **/auth/signin**            | Login aman dengan Clerk, mendukung passwordless, SSO, dan social login |
| **/dashboard**              | Dashboard overview, monitoring progres RB, dan quick actions           |
| **/rebo/formRB/area**       | Pilih area Pemenuhan atau Reform untuk input bukti dukung              |
| **/rebo/formRB/pemenuhan**  | Daftar pilar pemenuhan, input & validasi dokumen                       |
| **/rebo/formRB/reform**     | Daftar pilar reformasi, input & validasi dokumen                       |
| **/dashboard/profile**      | Manajemen akun dan pengaturan profil user                              |
| **/dashboard/kanban**       | Kanban board untuk manajemen tugas RB                                  |
| **/dashboard/notfound**     | Halaman not found custom                                               |
| **/dashboard/global-error** | Halaman error terpusat, terintegrasi Sentry                            |

---

## 🗂️ Struktur Proyek

```plaintext
src/
├── app/           # Next.js App Router (routing, API, pages)
│   ├── auth/      # Halaman autentikasi
│   ├── dashboard/ # Dashboard, overview, kanban, profile, dsb
│   └── rebo/      # Fitur utama REBO (formRB, area, pilar, dsb)
├── components/    # Komponen UI & layout global
│   ├── ui/        # Komponen UI (button, input, dsb)
│   └── layout/    # Komponen layout (header, sidebar)
├── features/      # Modul fitur berbasis domain
├── lib/           # Utilitas inti & konfigurasi
├── hooks/         # Custom React hooks
├── stores/        # Zustand stores (state management)
└── types/         # TypeScript types
```

## 🚦 Cara Memulai

> **Note:** Project ini menggunakan **Next.js 15** & **React 19**

1. Clone repo ini:
   ```bash
   git clone https://github.com/aljaffarsyah10/rebo.git
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy file environment:
   ```bash
   cp env.example.txt .env.local
   ```
4. Isi variabel environment di `.env.local` sesuai kebutuhan (lihat `env.example.txt`)
5. Jalankan development server:
   ```bash
   pnpm run dev
   ```

Setelah itu, akses aplikasi di [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Configuration

Lihat file `env.example.txt` untuk daftar environment variable yang dibutuhkan (auth, supabase, sentry, dsb).

---

## ⚠️ Catatan

Setelah clone/fork repo, pastikan untuk selalu cek perubahan terbaru sebelum melakukan pull agar terhindar dari konflik breaking changes.

---

Selamat menggunakan REBO! 🚀
