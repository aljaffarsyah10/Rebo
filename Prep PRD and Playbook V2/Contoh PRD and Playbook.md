# PROJECT_PRD_AND_PLAYBOOK.md

# BookEase — Online Booking & Appointment Management SaaS

MVP Specification

10 Development Phases

Web Application

Product: BookEase\
Category: Appointment Booking & Scheduling Platform\
Document Type: Product Requirements Document (PRD) & Sequential Development Playbook\
Target Platform: Web Application\
Development Model: Solo Developer + AI Coding Assistant / Vibe Coding\
Version: 1.0.0\
Status: Ready for Development\
Date: 5 November 2026

# PART A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

# 1. Product Information

## 1.1 Product Identity

| Item                 | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| Product Name         | BookEase                                                    |
| Product Type         | Online Booking & Appointment Management SaaS                |
| Platform             | Responsive Web Application                                  |
| Target Users         | Public customers, service providers, business owners, staff |
| Business Model       | Freemium / Subscription (future)                            |
| Development Approach | MVP First                                                   |
| Architecture         | Modular Monolith                                            |
| Deployment           | Managed Hosting / VPS                                       |
| Primary Language     | TypeScript                                                  |

## 1.2 Product Description

BookEase adalah platform booking online yang memungkinkan bisnis jasa menerima dan mengelola reservasi pelanggan secara digital.

Platform ini ditujukan untuk berbagai jenis bisnis yang menggunakan sistem janji temu, seperti:

- Salon dan barbershop.
- Klinik kecantikan.
- Klinik kesehatan non-emergency.
- Konsultan profesional.
- Psikolog dan layanan konsultasi.
- Fotografer.
- Bengkel.
- Terapis.
- Personal trainer.
- Jasa profesional lainnya.

Setiap penyedia layanan dapat membuat halaman booking publik yang berisi informasi bisnis, daftar layanan, harga, staf, jadwal operasional, dan ketersediaan waktu.

Pelanggan dapat membuka halaman tersebut, memilih layanan, menentukan jadwal, mengisi informasi kontak, dan menyelesaikan booking tanpa harus membuat akun.

Pemilik bisnis mengelola booking melalui dashboard khusus.

## 1.3 Tech Stack

### Frontend

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| Next.js App Router | Web framework                |
| TypeScript         | Type safety                  |
| Tailwind CSS       | Styling                      |
| shadcn/ui          | UI components                |
| Zustand            | Client state jika diperlukan |
| React Hook Form    | Form management              |
| Zod                | Validation                   |
| Lucide React       | Icons                        |

### Backend

| Technology             | Purpose                |
| ---------------------- | ---------------------- |
| Next.js Route Handlers | REST API               |
| TypeScript             | Backend implementation |
| Prisma ORM             | Database access        |
| PostgreSQL             | Relational database    |
| Zod                    | Request validation     |
| Auth.js                | Authentication         |

### Infrastructure

| Technology          | Purpose             |
| ------------------- | ------------------- |
| Vercel              | Next.js hosting     |
| Supabase PostgreSQL | Managed database    |
| Resend              | Transactional email |
| GitHub              | Version control     |
| GitHub Actions      | CI pipeline         |

Catatan keputusan teknis:

BookEase membutuhkan database karena menyimpan data bisnis, layanan, jadwal, pelanggan, dan reservasi secara persisten.

PostgreSQL dipilih karena relasi data booking cukup kompleks dan membutuhkan transaksi serta konsistensi jadwal.

Supabase digunakan sebagai managed PostgreSQL, bukan karena aplikasi harus menggunakan seluruh fitur Supabase.

Backend tetap berada dalam Next.js Route Handlers. Tidak diperlukan backend service terpisah pada MVP.

# 2. Product Overview

## 2.1 Problem Statement

Banyak bisnis jasa masih menggunakan metode manual dalam menerima reservasi.

Contoh permasalahan:

1. Pelanggan harus menghubungi bisnis melalui WhatsApp untuk menanyakan jadwal.
2. Pemilik bisnis harus memeriksa kalender secara manual.
3. Terjadi benturan jadwal karena beberapa pelanggan memesan waktu yang sama.
4. Informasi layanan dan harga tidak tersusun dengan baik.
5. Riwayat booking sulit dilacak.
6. Pelanggan tidak memiliki halaman khusus untuk melakukan reservasi.
7. Pengelolaan jadwal staf membutuhkan komunikasi berulang.

## 2.2 Proposed Solution

BookEase menyediakan sistem reservasi online yang dapat digunakan oleh berbagai bisnis jasa.

Setiap bisnis memiliki halaman booking publik dengan URL unik.

Contoh:

```
bookease.com/book/beauty-studio
bookease.com/book/medan-barbershop
bookease.com/book/consultant-john
```

Pelanggan dapat melakukan reservasi melalui halaman tersebut.

Pemilik bisnis dapat mengelola seluruh aktivitas booking melalui dashboard.

## 2.3 How It Works

## BookEase workflow

1. Business registration

   Pemilik bisnis membuat akun dan mendaftarkan bisnis.

2. Service configuration

   Pemilik menambahkan layanan, harga, durasi, staf, dan jam operasional.

3. Public booking page

   Sistem menghasilkan URL booking khusus untuk bisnis.

4. Customer reservation

   Pelanggan memilih layanan, staf (opsional), tanggal, dan slot waktu.

5. Booking confirmation

   Sistem menyimpan reservasi dan memberikan nomor booking.

6. Business management

   Pemilik mengelola reservasi melalui dashboard.

## 2.4 Core Value Proposition

- Memudahkan pelanggan melakukan reservasi kapan saja.
- Mengurangi komunikasi manual melalui WhatsApp.
- Mengurangi risiko double booking.
- Membantu bisnis mengatur jadwal layanan.
- Memberikan tampilan profesional melalui halaman booking publik.
- Memusatkan informasi layanan dan reservasi.

# 3. Product Goals

## 3.1 MVP Goals

| Goal                                        | Success Metric                                     |
| ------------------------------------------- | -------------------------------------------------- |
| Memungkinkan bisnis mendaftar               | Akun dapat dibuat dan login                        |
| Memungkinkan bisnis mengatur layanan        | CRUD layanan berjalan                              |
| Memungkinkan bisnis membuat halaman booking | Public page dapat diakses                          |
| Memungkinkan pelanggan melakukan booking    | Booking berhasil tersimpan                         |
| Mencegah double booking                     | Slot yang sudah terisi tidak dapat dipesan kembali |
| Memungkinkan bisnis mengelola booking       | Booking dapat dilihat dan diperbarui               |
| Menyediakan pengalaman responsif            | Berfungsi pada mobile dan desktop                  |

## 3.2 Product Principles

1. Simplicity over complexity.
2. Booking process harus mudah bagi pengguna publik.
3. Mobile-first experience.
4. Data booking harus konsisten.
5. Business owner memiliki kontrol atas jadwal.
6. Tidak memerlukan akun pelanggan untuk booking MVP.
7. Sistem harus mendukung berbagai kategori bisnis jasa.

# 4. Target Users

## 4.1 Business Owner

Pemilik salon, klinik, konsultan, dan bisnis jasa lainnya.

Kebutuhan:

- Mendaftarkan bisnis.
- Mengelola informasi bisnis.
- Mengatur layanan dan harga.
- Mengatur jam operasional.
- Melihat daftar booking.
- Mengubah status reservasi.
- Mengelola staf jika diperlukan.

## 4.2 Staff / Service Provider

Pegawai atau tenaga profesional yang memberikan layanan.

Kebutuhan:

- Melihat jadwal reservasi.
- Mengetahui layanan yang harus diberikan.
- Melihat detail pelanggan.
- Melihat jadwal kerja.

Pada MVP, staff management dibuat sederhana dan akun staf tidak wajib tersedia. Pemilik dapat mengelola informasi staf dan menghubungkan staf dengan layanan.

## 4.3 Customer / Public User

Pelanggan yang ingin melakukan reservasi.

Kebutuhan:

- Menemukan informasi bisnis.
- Melihat layanan dan harga.
- Melihat jadwal tersedia.
- Memilih waktu reservasi.
- Mengisi informasi kontak.
- Mendapatkan konfirmasi booking.
- Membatalkan booking melalui mekanisme yang disediakan.

## 4.4 Platform Administrator

Untuk MVP, administrasi platform dilakukan melalui pengelolaan database dan tooling internal yang aman.

Dashboard superadmin lengkap belum menjadi bagian dari MVP.

# 5. Scope & Feature Priorities

## 5.1 P0 — Core MVP

Must Have

| Feature                    | Description                    |
| -------------------------- | ------------------------------ |
| Authentication             | Register, login, logout        |
| Business Profile           | Pengaturan identitas bisnis    |
| Service Management         | CRUD layanan                   |
| Operating Hours            | Pengaturan jam operasional     |
| Staff Management           | Data staf dan ketersediaannya  |
| Public Booking Page        | Halaman reservasi publik       |
| Service Selection          | Pemilihan layanan              |
| Date Selection             | Pemilihan tanggal              |
| Available Slots            | Menampilkan slot yang tersedia |
| Booking Creation           | Membuat reservasi              |
| Double Booking Prevention  | Mencegah benturan jadwal       |
| Booking Dashboard          | Melihat semua reservasi        |
| Booking Detail             | Detail reservasi               |
| Booking Status             | Mengubah status booking        |
| Basic Customer Information | Nama, email, nomor telepon     |
| Responsive UI              | Mobile dan desktop             |

## 5.2 P1 — Supporting Features

Should Have

| Feature              | Description               |
| -------------------- | ------------------------- |
| Email Confirmation   | Email konfirmasi booking  |
| Email Reminder       | Pengingat sebelum jadwal  |
| Booking Cancellation | Pembatalan oleh pelanggan |
| Booking Rescheduling | Perubahan jadwal          |
| Calendar View        | Tampilan kalender         |
| Booking Search       | Pencarian reservasi       |
| Dashboard Statistics | Statistik booking         |
| Custom Business Slug | Pengaturan URL booking    |
| Booking Buffer Time  | Jeda antarreservasi       |
| Business Logo Upload | Upload logo bisnis        |

## 5.3 P2 — Future Development

| Feature                     | Description                        |
| --------------------------- | ---------------------------------- |
| Online Payment              | Pembayaran melalui payment gateway |
| Subscription Billing        | Paket berlangganan                 |
| Multi-Branch                | Banyak cabang bisnis               |
| Advanced Staff Roles        | Role dan permission kompleks       |
| WhatsApp Integration        | Notifikasi WhatsApp                |
| Google Calendar Integration | Sinkronisasi kalender              |
| Customer Accounts           | Akun pelanggan                     |
| Loyalty Program             | Program loyalitas                  |
| Reviews & Ratings           | Ulasan pelanggan                   |
| Analytics                   | Analitik bisnis lanjutan           |
| Multi-language              | Bahasa tambahan                    |
| Custom Domain               | Domain khusus bisnis               |

## 5.4 MVP Scope Restrictions

Tidak termasuk dalam MVP:

- Marketplace untuk menemukan seluruh bisnis.
- Payment gateway.
- Aplikasi mobile native.
- Subscription management.
- Multi-branch.
- Integrasi WhatsApp API.
- AI scheduling.
- Google Calendar synchronization.
- Complex role-based access control.
- Advanced reporting.

Keputusan penting: BookEase MVP berfokus pada model SaaS multi-tenant sederhana. Setiap business owner mempunyai satu workspace bisnis. Struktur database tetap menggunakan `business_id` agar ekspansi multi-tenant dapat dilakukan dengan baik.

# 6. Functional Requirements

## FR-01 — User Registration

Description: Pengguna dapat membuat akun sebagai business owner.

Behavior:

- Pengguna mengisi nama, email, dan password.
- Sistem melakukan validasi.
- Password di-hash menggunakan mekanisme autentikasi yang aman.
- Sistem membuat akun.
- Pengguna diarahkan ke dashboard atau onboarding.

Acceptance Criteria:

- Email harus valid.
- Email tidak boleh duplikat.
- Password memenuhi kebijakan minimum.
- Password tidak disimpan dalam bentuk plaintext.
- Registrasi gagal menampilkan pesan yang jelas.

## FR-02 — User Login

Behavior:

- Pengguna memasukkan email dan password.
- Sistem memvalidasi kredensial.
- Sistem membuat session.
- Pengguna diarahkan ke dashboard.

Acceptance Criteria:

- Kredensial benar menghasilkan session.
- Kredensial salah ditolak.
- Dashboard tidak dapat diakses tanpa autentikasi.

## FR-03 — Business Profile Management

Behavior:

- Owner dapat mengatur nama bisnis.
- Mengatur deskripsi.
- Mengatur kategori.
- Mengatur alamat.
- Mengatur nomor telepon.
- Mengatur slug publik.

Acceptance Criteria:

- Nama bisnis wajib.
- Slug harus unik.
- Slug hanya mengandung karakter yang diizinkan.
- Informasi tersimpan secara persisten.

## FR-04 — Service Management

Behavior:

- Owner dapat membuat layanan.
- Mengedit layanan.
- Menghapus atau menonaktifkan layanan.
- Menentukan harga.
- Menentukan durasi.
- Menghubungkan layanan dengan staf.

Acceptance Criteria:

- Nama layanan wajib.
- Harga tidak boleh negatif.
- Durasi harus lebih besar dari nol.
- Layanan nonaktif tidak muncul di halaman booking publik.

## FR-05 — Staff Management

Behavior:

- Owner dapat menambahkan staf.
- Mengedit nama dan informasi staf.
- Menghubungkan staf dengan layanan.
- Menonaktifkan staf.

Acceptance Criteria:

- Staf hanya dapat diakses dalam bisnis pemiliknya.
- Staf nonaktif tidak tersedia untuk booking baru.
- Layanan dapat memiliki lebih dari satu staf.

## FR-06 — Operating Hours

Behavior:

- Owner mengatur jam buka dan tutup setiap hari.
- Owner dapat menentukan hari libur.
- Owner dapat menentukan hari ketika bisnis tidak menerima booking.

Acceptance Criteria:

- Jam tutup harus lebih besar daripada jam buka.
- Sistem dapat menyimpan jadwal mingguan.
- Hari tutup tidak menghasilkan slot booking.

## FR-07 — Public Booking Page

Behavior:

- Pelanggan mengakses `/book/[slug]`.
- Sistem menampilkan profil bisnis.
- Sistem menampilkan layanan aktif.
- Sistem menampilkan harga dan durasi.
- Sistem menampilkan staf jika tersedia.

Acceptance Criteria:

- Halaman dapat diakses tanpa login.
- Slug tidak valid menampilkan halaman 404.
- Hanya data publik yang ditampilkan.

## FR-08 — Available Slot Calculation

Behavior:

- Pelanggan memilih layanan.
- Pelanggan memilih tanggal.
- Sistem mengambil jam operasional.
- Sistem menghitung slot berdasarkan durasi layanan.
- Sistem mengecualikan waktu yang sudah dipesan.
- Sistem memperhitungkan buffer time jika diaktifkan.

Acceptance Criteria:

- Slot tidak melewati jam tutup.
- Slot yang bertabrakan dengan booking aktif tidak tersedia.
- Slot masa lalu tidak tersedia.
- Staf yang tidak dapat memberikan layanan tidak ditampilkan.
- Perhitungan dilakukan menggunakan timezone bisnis.

## FR-09 — Booking Creation

Behavior:

- Pelanggan memilih layanan.
- Memilih staf atau opsi tanpa preferensi staf.
- Memilih tanggal dan waktu.
- Mengisi nama, email, dan nomor telepon.
- Mengonfirmasi booking.
- Sistem menyimpan reservasi.

Acceptance Criteria:

- Semua field wajib tervalidasi.
- Booking memiliki unique reference.
- Booking tersimpan dalam database.
- Booking tidak boleh overlap dengan reservasi aktif.
- Konflik slot menghasilkan respons yang dapat dipahami.

## FR-10 — Booking Management

Behavior:

- Owner melihat daftar booking.
- Owner melihat detail booking.
- Owner mengubah status booking.

Status:

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`
- `NO_SHOW`

Acceptance Criteria:

- Owner hanya melihat booking bisnisnya.
- Status hanya dapat diubah melalui transisi yang diizinkan.
- Perubahan tersimpan di database.

## FR-11 — Booking Detail

Behavior:

- Menampilkan informasi pelanggan.
- Menampilkan layanan.
- Menampilkan staf.
- Menampilkan tanggal.
- Menampilkan jam.
- Menampilkan status.

Acceptance Criteria:

- Informasi sesuai dengan data database.
- Data tidak dapat diakses oleh business owner lain.

## FR-12 — Booking Cancellation

Behavior:

- Owner dapat membatalkan booking.
- Pembatalan tidak menghapus record.
- Slot yang dibatalkan dapat tersedia kembali.

Acceptance Criteria:

- Status berubah menjadi `CANCELLED`.
- Booking tetap tersimpan untuk histori.
- Slot tersedia kembali setelah pembatalan berhasil.

## FR-13 — Booking Confirmation

Behavior:

- Sistem menampilkan confirmation page.
- Sistem menampilkan booking reference.
- Sistem menampilkan detail reservasi.

Acceptance Criteria:

- Reference dapat digunakan untuk menemukan booking melalui mekanisme yang aman.
- Pelanggan melihat status reservasi yang benar.

## FR-14 — Business Dashboard

Behavior:

- Menampilkan ringkasan booking.
- Menampilkan booking hari ini.
- Menampilkan jumlah booking mendatang.
- Menampilkan jumlah booking selesai.

Acceptance Criteria:

- Statistik berasal dari database.
- Data hanya mencakup bisnis yang sedang login.

## FR-15 — Data Isolation

Behavior:

- Semua data bisnis diisolasi menggunakan business ownership.
- API memvalidasi akses berdasarkan session pengguna.

Acceptance Criteria:

- Pengguna A tidak dapat mengakses data bisnis B.
- Mengganti ID pada URL tidak memberikan akses tanpa otorisasi.
- Validasi dilakukan di server, bukan hanya frontend.

# 7. Non-Functional Requirements

## 7.1 Performance

- Halaman publik harus cepat dimuat.
- Gunakan Server Components untuk data yang tidak membutuhkan interaksi client.
- Hindari fetch berulang.
- Gunakan pagination untuk daftar booking.
- Gunakan database index pada kolom pencarian dan relasi.
- Slot calculation harus menggunakan query database yang efisien.

Target awal:

| Metric                 | Target                                        |
| ---------------------- | --------------------------------------------- |
| Initial page load      | Diupayakan di bawah 3 detik                   |
| API response           | Diupayakan di bawah 500 ms untuk operasi umum |
| Lighthouse Performance | Target 85+                                    |
| Booking conflict check | Dilakukan secara transaksional                |

Target tersebut merupakan sasaran optimasi, bukan jaminan untuk seluruh kondisi jaringan dan infrastruktur.

## 7.2 Security

- Password hashing.
- Secure session.
- Server-side authorization.
- Input validation.
- SQL injection prevention melalui ORM.
- Rate limiting.
- Secure cookies.
- CSRF protection sesuai mekanisme autentikasi.
- No secrets in frontend.
- Public endpoint hanya mengembalikan data yang memang boleh dipublikasikan.

## 7.3 Reliability

- Database transactions untuk pembuatan booking.
- Error handling konsisten.
- Tidak menghapus booking yang sudah dibatalkan.
- Database backup berkala.
- Menghindari double booking.

## 7.4 Maintainability

- TypeScript strict mode.
- Modular folder structure.
- Reusable components.
- Separation of concerns.
- Consistent naming.
- Shared validation schemas.
- Tidak membuat abstraksi yang tidak diperlukan.

## 7.5 Accessibility

- Semantic HTML.
- Keyboard navigation.
- Label pada form.
- Accessible dialog.
- Contrast yang memadai.
- Focus indicator.

## 7.6 Compatibility

- Chrome.
- Edge.
- Firefox.
- Safari.
- Android browser.
- iOS Safari.

## 7.7 Privacy

- Hanya menyimpan data pelanggan yang diperlukan.
- Tidak menampilkan email dan nomor telepon pelanggan secara publik.
- Membatasi akses detail booking.
- Menyediakan kebijakan privasi.
- Memiliki mekanisme penghapusan akun dan data sesuai kebijakan yang berlaku.

## 7.8 SEO

SEO terutama diterapkan pada:

- Homepage.
- Halaman fitur.
- Public business booking page.

Dashboard tidak perlu diindeks mesin pencari.

# 8. Application Structure & Navigation

## 8.1 Public Routes

| Route                  | Description          |
| ---------------------- | -------------------- |
| `/`                    | Homepage             |
| `/features`            | Product features     |
| `/pricing`             | Pricing information  |
| `/login`               | Login                |
| `/register`            | Registration         |
| `/book/[slug]`         | Public booking page  |
| `/book/[slug]/success` | Booking confirmation |
| `/privacy`             | Privacy policy       |
| `/terms`               | Terms of service     |

## 8.2 Dashboard Routes

| Route                      | Description        |
| -------------------------- | ------------------ |
| `/dashboard`               | Overview           |
| `/dashboard/business`      | Business profile   |
| `/dashboard/services`      | Service management |
| `/dashboard/staff`         | Staff management   |
| `/dashboard/schedule`      | Operating hours    |
| `/dashboard/bookings`      | Booking list       |
| `/dashboard/bookings/[id]` | Booking detail     |
| `/dashboard/settings`      | Account settings   |

## 8.3 Navigation Structure

Public navigation:

- Home
- Features
- Pricing
- Login
- Get Started

Dashboard navigation:

- Overview
- Bookings
- Services
- Staff
- Schedule
- Business Profile
- Settings

## 8.4 Reusable Components

| Component        | Responsibility       |
| ---------------- | -------------------- |
| Navbar           | Public navigation    |
| Footer           | Public footer        |
| DashboardSidebar | Dashboard navigation |
| DashboardHeader  | Dashboard heading    |
| StatCard         | Dashboard statistics |
| BookingCard      | Booking summary      |
| BookingTable     | Booking listing      |
| ServiceCard      | Service display      |
| ServiceForm      | Service input        |
| StaffCard        | Staff information    |
| BookingWizard    | Booking process      |
| DatePicker       | Date selection       |
| TimeSlotPicker   | Time selection       |
| StatusBadge      | Booking status       |
| ConfirmDialog    | Confirmation         |
| EmptyState       | Empty data           |
| LoadingState     | Loading              |
| ErrorState       | Error display        |

# 9. User Flow

## 9.1 Business Owner Flow

\#chatgpt-mermaid-\_r_16l\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_16l\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_16l\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_16l\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_16l\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_16l\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_16l\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_16l\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_16l\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_16l\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16l\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16l\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_16l\_ p{margin:0;}#chatgpt-mermaid-\_r_16l\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_16l\_ .label text,#chatgpt-mermaid-\_r_16l\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ .node rect,#chatgpt-mermaid-\_r_16l\_ .node circle,#chatgpt-mermaid-\_r_16l\_ .node ellipse,#chatgpt-mermaid-\_r_16l\_ .node polygon,#chatgpt-mermaid-\_r_16l\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .rough-node .label text,#chatgpt-mermaid-\_r_16l\_ .node .label text,#chatgpt-mermaid-\_r_16l\_ .image-shape .label,#chatgpt-mermaid-\_r_16l\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_16l\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .rough-node .label,#chatgpt-mermaid-\_r_16l\_ .node .label,#chatgpt-mermaid-\_r_16l\_ .image-shape .label,#chatgpt-mermaid-\_r_16l\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_16l\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_16l\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16l\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16l\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_16l\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_16l\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_16l\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_16l\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_16l\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_16l\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16l\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_16l\_ .icon-shape,#chatgpt-mermaid-\_r_16l\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_16l\_ .icon-shape p,#chatgpt-mermaid-\_r_16l\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_16l\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_16l\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_16l\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_16l\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_16l\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_16l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_16l\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_16l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_16l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16l\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_16l\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16l\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_16l\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_16l\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_16l\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_16l\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .node rect,#chatgpt-mermaid-\_r_16l\_ .node circle,#chatgpt-mermaid-\_r_16l\_ .node ellipse,#chatgpt-mermaid-\_r_16l\_ .node polygon,#chatgpt-mermaid-\_r_16l\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_16l\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_16l\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_16l\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_16l\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16l\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Open BookEaseRegister AccountLoginBusiness OnboardingConfigure Business ProfileAdd ServicesConfigure StaffSet Operating HoursPublish Booking PageOpen DashboardManage Bookings

## 9.2 Customer Booking Flow

\#chatgpt-mermaid-\_r_16s\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_16s\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_16s\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_16s\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_16s\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_16s\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_16s\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_16s\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_16s\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_16s\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16s\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16s\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_16s\_ p{margin:0;}#chatgpt-mermaid-\_r_16s\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_16s\_ .label text,#chatgpt-mermaid-\_r_16s\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ .node rect,#chatgpt-mermaid-\_r_16s\_ .node circle,#chatgpt-mermaid-\_r_16s\_ .node ellipse,#chatgpt-mermaid-\_r_16s\_ .node polygon,#chatgpt-mermaid-\_r_16s\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .rough-node .label text,#chatgpt-mermaid-\_r_16s\_ .node .label text,#chatgpt-mermaid-\_r_16s\_ .image-shape .label,#chatgpt-mermaid-\_r_16s\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_16s\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .rough-node .label,#chatgpt-mermaid-\_r_16s\_ .node .label,#chatgpt-mermaid-\_r_16s\_ .image-shape .label,#chatgpt-mermaid-\_r_16s\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_16s\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_16s\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16s\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16s\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_16s\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_16s\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_16s\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_16s\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_16s\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_16s\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_16s\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_16s\_ .icon-shape,#chatgpt-mermaid-\_r_16s\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_16s\_ .icon-shape p,#chatgpt-mermaid-\_r_16s\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_16s\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_16s\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_16s\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_16s\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_16s\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_16s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_16s\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_16s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_16s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16s\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_16s\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_16s\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_16s\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_16s\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_16s\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_16s\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .node rect,#chatgpt-mermaid-\_r_16s\_ .node circle,#chatgpt-mermaid-\_r_16s\_ .node ellipse,#chatgpt-mermaid-\_r_16s\_ .node polygon,#chatgpt-mermaid-\_r_16s\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_16s\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_16s\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_16s\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_16s\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_16s\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Open Business Booking URLView Business ProfileSelect ServiceSelect Staff or Any AvailableSelect DateView Available SlotsSelect TimeEnter Customer InformationReview BookingSubmit BookingSlot Available?Show Slot ConflictSave BookingShow ConfirmationNoYes

## 9.3 Booking State Flow

\#chatgpt-mermaid-\_r_173\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_173\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_173\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_173\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_173\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_173\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_173\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_173\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_173\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_173\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_173\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_173\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_173\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_173\_ p{margin:0;}#chatgpt-mermaid-\_r_173\_ defs [id$="-barbEnd"]{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_173\_ g.stateGroup text{fill:rgb(83, 154, 248);stroke:none;font-size:10px;}#chatgpt-mermaid-\_r_173\_ g.stateGroup text{fill:rgb(13, 13, 13);stroke:none;font-size:10px;}#chatgpt-mermaid-\_r_173\_ g.stateGroup .state-title{font-weight:bolder;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ g.stateGroup rect{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_173\_ g.stateGroup line{stroke:rgb(143, 143, 143);stroke-width:1;}#chatgpt-mermaid-\_r_173\_ .transition{stroke:rgb(143, 143, 143);stroke-width:1;fill:none;}#chatgpt-mermaid-\_r_173\_ .stateGroup .composit{fill:transparent;border-bottom:1px;}#chatgpt-mermaid-\_r_173\_ .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#chatgpt-mermaid-\_r_173\_ .state-note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_173\_ .state-note text{fill:rgb(13, 13, 13);stroke:none;font-size:10px;}#chatgpt-mermaid-\_r_173\_ .stateLabel .box{stroke:none;stroke-width:0;fill:rgb(222, 234, 251);opacity:0.5;}#chatgpt-mermaid-\_r_173\_ .edgeLabel .label rect{fill:rgb(222, 234, 251);opacity:0.5;}#chatgpt-mermaid-\_r_173\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_173\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_173\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_173\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ .label div .edgeLabel{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ .stateLabel text{fill:rgb(13, 13, 13);font-size:10px;font-weight:bold;}#chatgpt-mermaid-\_r_173\_ .node circle.state-start{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_173\_ .node .fork-join{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_173\_ .node circle.state-end{fill:rgb(83, 154, 248);stroke:transparent;stroke-width:1.5;}#chatgpt-mermaid-\_r_173\_ .end-state-inner{fill:transparent;stroke-width:1.5;}#chatgpt-mermaid-\_r_173\_ .node rect{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_173\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_173\_ [id$="-barbEnd"]{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_173\_ .statediagram-cluster rect{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_173\_ .cluster-label,#chatgpt-mermaid-\_r_173\_ .nodeLabel{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ .statediagram-cluster rect.outer{rx:5px;ry:5px;}#chatgpt-mermaid-\_r_173\_ .statediagram-state .divider{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_173\_ .statediagram-state .title-state{rx:5px;ry:5px;}#chatgpt-mermaid-\_r_173\_ .statediagram-cluster.statediagram-cluster .inner{fill:transparent;}#chatgpt-mermaid-\_r_173\_ .statediagram-cluster.statediagram-cluster-alt .inner{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_173\_ .statediagram-cluster .inner{rx:0;ry:0;}#chatgpt-mermaid-\_r_173\_ .statediagram-state rect.basic{rx:5px;ry:5px;}#chatgpt-mermaid-\_r_173\_ .statediagram-state rect.divider{stroke-dasharray:10,10;fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_173\_ .note-edge{stroke-dasharray:5;}#chatgpt-mermaid-\_r_173\_ .statediagram-note rect{fill:rgb(243, 243, 243);stroke:rgb(107, 198, 127);stroke-width:1px;rx:0;ry:0;}#chatgpt-mermaid-\_r_173\_ .statediagram-note rect{fill:rgb(243, 243, 243);stroke:rgb(107, 198, 127);stroke-width:1px;rx:0;ry:0;}#chatgpt-mermaid-\_r_173\_ .statediagram-note text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ .statediagram-note .nodeLabel{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ .statediagram .edgeLabel{color:red;}#chatgpt-mermaid-\_r_173\_ [id$="-dependencyStart"],#chatgpt-mermaid-\_r_173\_ [id$="-dependencyEnd"]{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);stroke-width:1;}#chatgpt-mermaid-\_r_173\_ .statediagramTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].statediagram-cluster rect{fill:rgb(222, 234, 251);stroke:url(#chatgpt-mermaid-\_r_173\_-gradient);stroke-width:1;}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].statediagram-cluster rect.outer{rx:5px;ry:5px;filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_173\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_173\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_173\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_173\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_173\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_173\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_173\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_173\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_173\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}PENDINGCONFIRMEDCANCELLEDCOMPLETEDNO_SHOW

# 10. UI/UX Requirements

## 10.1 Design Direction

BookEase menggunakan desain modern, minimalis, dan profesional.

Referensi karakter visual:

- Clean SaaS dashboard.
- Modern booking interface.
- Rounded cards.
- Subtle shadows.
- Clear typography.
- Spacious layout.
- Mobile-first.

## 10.2 Color System

| Token         | Suggested Color  | Usage          |
| ------------- | ---------------- | -------------- |
| Primary       | Indigo `#4F46E5` | Primary action |
| Primary Hover | Indigo `#4338CA` | Hover          |
| Background    | `#F8FAFC`        | Page           |
| Surface       | `#FFFFFF`        | Cards          |
| Text          | `#0F172A`        | Main text      |
| Muted         | `#64748B`        | Secondary text |
| Success       | `#16A34A`        | Success        |
| Warning       | `#D97706`        | Warning        |
| Danger        | `#DC2626`        | Error          |

## 10.3 Typography

- Font: Inter atau Geist.
- Heading: Semibold.
- Body: Regular.
- Label: Medium.
- Gunakan ukuran font yang konsisten.

## 10.4 Layout

Public:

- Full-width hero.
- Clear CTA.
- Feature sections.
- Footer.

Dashboard:

- Sidebar.
- Header.
- Main content.
- Responsive navigation.

Booking page:

- Business information.
- Service cards.
- Booking form.
- Available time slots.
- Booking summary.

## 10.5 Responsive Behavior

| Device        | Behavior                   |
| ------------- | -------------------------- |
| Mobile        | Single column              |
| Tablet        | Adaptive 2 columns         |
| Desktop       | Sidebar + content          |
| Large Desktop | Centered max-width content |

## 10.6 UI States

Setiap komponen data-driven harus mendukung:

Loading:

- Skeleton.
- Spinner bila diperlukan.
- Disabled submit button.

Empty:

- Tidak ada booking.
- Belum ada layanan.
- Belum ada staf.

Error:

- Pesan yang dapat dimengerti.
- Retry jika relevan.

Success:

- Toast.
- Confirmation page.
- Success indicator.

# 11. Error Handling

| Error               | Cause                 | Expected Response       |
| ------------------- | --------------------- | ----------------------- |
| Invalid email       | Format email salah    | Tampilkan validasi      |
| Duplicate email     | Email sudah digunakan | Berikan pesan           |
| Invalid login       | Kredensial salah      | Login gagal             |
| Unauthorized        | Belum login           | Redirect login          |
| Forbidden           | Tidak memiliki akses  | HTTP 403                |
| Business not found  | Slug tidak valid      | HTTP 404                |
| Service unavailable | Layanan nonaktif      | Tampilkan pesan         |
| Invalid date        | Tanggal tidak valid   | HTTP 400                |
| Slot unavailable    | Slot telah dipesan    | Minta pilih ulang       |
| Booking conflict    | Concurrent booking    | HTTP 409                |
| Database failure    | Database error        | Generic error + logging |
| Rate limit exceeded | Request berlebihan    | HTTP 429                |
| Network error       | Koneksi terputus      | Retry/manual reload     |

## 11.1 Standard API Response

Success:

```
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error:

```
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Selected time is no longer available"
  }
}
```

Gunakan HTTP status code yang sesuai.

Jangan mengembalikan detail internal database kepada pengguna.

# 12. Technical Architecture

## 12.1 Architecture Decision

Selected Architecture: Modular Monolith

BookEase menggunakan Next.js sebagai fullstack application.

Alasan:

1. Frontend dan backend dapat berada dalam satu repository.
2. Booking membutuhkan operasi database yang relatif ringan.
3. Tidak ada kebutuhan komputasi berat.
4. Tidak membutuhkan background worker kompleks pada MVP.
5. Deployment lebih sederhana.
6. Cocok untuk solo developer.

## 12.2 Architecture Overview

\#chatgpt-mermaid-\_r_17k\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_17k\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_17k\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_17k\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_17k\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_17k\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_17k\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_17k\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_17k\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_17k\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_17k\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_17k\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_17k\_ p{margin:0;}#chatgpt-mermaid-\_r_17k\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_17k\_ .label text,#chatgpt-mermaid-\_r_17k\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ .node rect,#chatgpt-mermaid-\_r_17k\_ .node circle,#chatgpt-mermaid-\_r_17k\_ .node ellipse,#chatgpt-mermaid-\_r_17k\_ .node polygon,#chatgpt-mermaid-\_r_17k\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .rough-node .label text,#chatgpt-mermaid-\_r_17k\_ .node .label text,#chatgpt-mermaid-\_r_17k\_ .image-shape .label,#chatgpt-mermaid-\_r_17k\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_17k\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .rough-node .label,#chatgpt-mermaid-\_r_17k\_ .node .label,#chatgpt-mermaid-\_r_17k\_ .image-shape .label,#chatgpt-mermaid-\_r_17k\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_17k\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_17k\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_17k\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_17k\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_17k\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_17k\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_17k\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_17k\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_17k\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_17k\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_17k\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_17k\_ .icon-shape,#chatgpt-mermaid-\_r_17k\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_17k\_ .icon-shape p,#chatgpt-mermaid-\_r_17k\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_17k\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_17k\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_17k\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_17k\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_17k\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_17k\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_17k\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_17k\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_17k\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_17k\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_17k\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_17k\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_17k\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_17k\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_17k\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_17k\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .node rect,#chatgpt-mermaid-\_r_17k\_ .node circle,#chatgpt-mermaid-\_r_17k\_ .node ellipse,#chatgpt-mermaid-\_r_17k\_ .node polygon,#chatgpt-mermaid-\_r_17k\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_17k\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_17k\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_17k\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_17k\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_17k\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Customer / Business OwnerNext.js ApplicationPresentation LayerApplication LayerBusiness Logic LayerData Access LayerPostgreSQLAuthenticationResend Email - OptionalNext.js Route Handlers

## 12.3 Layer Responsibilities

### Presentation Layer

Tanggung jawab:

- Rendering halaman.
- UI components.
- Forms.
- User interactions.
- Responsive design.

Teknologi:

- React.
- Next.js.
- Tailwind CSS.
- shadcn/ui.

### Application Layer

Tanggung jawab:

- Mengatur use case.
- Mengatur alur bisnis.
- Memanggil service.
- Mengatur transaksi melalui repository/service yang relevan.

Contoh:

- CreateBooking.
- GetAvailableSlots.
- CreateBusiness.
- UpdateService.

### Business Logic Layer

Tanggung jawab:

- Validasi aturan bisnis.
- Menghitung slot.
- Validasi konflik jadwal.
- Validasi transisi status booking.
- Mengelola timezone.

Business logic tidak boleh bergantung langsung pada komponen React.

### Data Access Layer

Tanggung jawab:

- Database queries.
- CRUD.
- Relational queries.
- Transaction management.

Teknologi:

\- Prisma ORM.

### Infrastructure Layer

Tanggung jawab:

- Database connection.
- Authentication adapter.
- Email provider.
- Logging.
- Rate limiting.

## 12.4 Next.js Responsibilities

| Component         | Responsibility                            |
| ----------------- | ----------------------------------------- |
| `app/`            | Routing dan layouts                       |
| `page.tsx`        | Page rendering                            |
| `layout.tsx`      | Layout composition                        |
| `route.ts`        | HTTP API endpoints                        |
| Server Components | Server-side rendering dan data display    |
| Client Components | Interactive UI                            |
| Server Actions    | Opsional untuk operasi internal sederhana |
| Middleware        | Pemeriksaan ringan bila diperlukan        |

Untuk konsistensi MVP, operasi mutasi utama menggunakan application services melalui Route Handlers.

## 12.5 State Management

Gunakan React state untuk:

- Modal.
- Tabs.
- Form state.
- Selected date.
- Selected service.
- Selected slot.

Gunakan Zustand hanya jika terdapat client state yang perlu digunakan bersama lintas halaman atau komponen yang kompleks.

Jangan menyimpan server data sebagai global Zustand state tanpa kebutuhan yang jelas.

## 12.6 API Architecture

Prefix:

```
/api/v1
```

Endpoints:

| Method | Endpoint                    | Purpose                   |
| ------ | --------------------------- | ------------------------- |
| POST   | `/api/v1/auth/register`     | Register                  |
| GET    | `/api/v1/business`          | Get owner business        |
| PATCH  | `/api/v1/business`          | Update business           |
| GET    | `/api/v1/businesses/[slug]` | Public business           |
| GET    | `/api/v1/services`          | List services             |
| POST   | `/api/v1/services`          | Create service            |
| PATCH  | `/api/v1/services/[id]`     | Update service            |
| DELETE | `/api/v1/services/[id]`     | Delete/deactivate service |
| GET    | `/api/v1/staff`             | List staff                |
| POST   | `/api/v1/staff`             | Create staff              |
| PATCH  | `/api/v1/staff/[id]`        | Update staff              |
| GET    | `/api/v1/availability`      | Available slots           |
| POST   | `/api/v1/bookings`          | Create booking            |
| GET    | `/api/v1/bookings`          | List bookings             |
| GET    | `/api/v1/bookings/[id]`     | Booking detail            |
| PATCH  | `/api/v1/bookings/[id]`     | Update status             |

Public availability dan booking endpoints harus memiliki validasi tersendiri.

## 12.7 Booking Concurrency Strategy

Ini adalah bagian paling kritis dalam BookEase.

Jangan hanya mengandalkan frontend untuk mencegah double booking.

Strategi:

1. Frontend mengambil slot tersedia.
2. Pelanggan memilih slot.
3. Backend menerima request booking.
4. Backend memulai transaksi database.
5. Backend memvalidasi ulang layanan, staf, jadwal, dan status booking.
6. Backend memastikan tidak ada reservasi aktif yang overlap.
7. Backend menyimpan booking.
8. Database memastikan tidak terjadi konflik.
9. Backend mengembalikan booking reference.

Untuk PostgreSQL, gunakan exclusion constraint pada rentang waktu dan resource staf jika sesuai dengan model penjadwalan.

Alternatif yang lebih sederhana untuk MVP adalah transaksi dengan locking yang tepat dan validasi overlap, tetapi mekanisme locking harus benar-benar melindungi concurrent requests.

Jika menggunakan PostgreSQL exclusion constraint, pertimbangkan penggunaan extension `btree_gist` dan migrasi SQL Prisma khusus.

Booking yang menggunakan opsi "Any Available" harus dialokasikan ke staf tertentu secara atomik di backend. Jangan menyimpan reservasi tanpa resource yang jelas jika hal itu memungkinkan overlap.

## 12.8 Timezone Strategy

Setiap business menyimpan:

```
timezone: Asia/Jakarta
```

Contoh lain:

- Asia/Makassar.
- Asia/Jayapura.

Aturan:

- Simpan timestamp booking dalam UTC.
- Simpan timezone bisnis secara terpisah.
- Tampilkan waktu berdasarkan timezone bisnis.
- Hitung operating hours menggunakan timezone bisnis.
- Jangan mengandalkan timezone browser sebagai sumber kebenaran.

## 12.9 External Services

| Service             | Status      | Reason             |
| ------------------- | ----------- | ------------------ |
| Resend              | P1          | Email notification |
| Supabase PostgreSQL | Required    | Database           |
| Vercel              | Recommended | Hosting            |
| Cloudflare          | Optional    | DNS/CDN            |

Tidak dibutuhkan:

- Redis pada MVP.
- Dedicated backend.
- Message broker.
- Kubernetes.
- Microservices.
- Background worker terpisah.

Untuk reminder terjadwal, gunakan scheduled function atau cron provider setelah P1 diimplementasikan.

# 13. Data Model

## 13.1 Database Overview

Database: PostgreSQL.

ORM: Prisma.

Entities utama:

1. User
2. Business
3. Service
4. Staff
5. StaffService
6. OperatingHour
7. Booking

## 13.2 Entity Relationship

\#chatgpt-mermaid-\_r_183\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_183\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_183\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_183\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_183\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_183\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_183\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_183\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_183\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_183\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_183\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_183\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_183\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_183\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_183\_ p{margin:0;}#chatgpt-mermaid-\_r_183\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_183\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_183\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_183\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_183\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_183\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_183\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_183\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_183\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_183\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_183\_ .node rect,#chatgpt-mermaid-\_r_183\_ .node circle,#chatgpt-mermaid-\_r_183\_ .node ellipse,#chatgpt-mermaid-\_r_183\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_183\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_183\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_183\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_183\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_183\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_183\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_183\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_183\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_183\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_183\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_183\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_183\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}USERstringidPKstringnamestringemailUKstringpasswordHashdatetimecreatedAtBUSINESSstringidPKstringownerIdFKstringnamestringslugUKstringdescriptionstringphonestringtimezonedatetimecreatedAtSERVICEstringidPKstringbusinessIdFKstringnamedecimalpriceintdurationMinutesbooleanisActiveSTAFFstringidPKstringbusinessIdFKstringnamebooleanisActiveOPERATING_HOURstringidPKstringbusinessIdFKintdayOfWeekstringopenTimestringcloseTimebooleanisClosedBOOKINGstringidPKstringbusinessIdFKstringserviceIdFKstringstaffIdFKstringcustomerNamestringcustomerEmailstringcustomerPhonedatetimestartAtdatetimeendAtstringstatusstringreferenceUKSTAFF_SERVICEstringstaffIdFKstringserviceIdFKownsprovidesemploysdefinesreceivesselectedassignedoffersassigned

## 13.3 Important Data Rules

- Business memiliki satu owner pada MVP.
- Business memiliki banyak services.
- Business memiliki banyak staff.
- Service memiliki durasi dan harga.
- Staff dapat menangani banyak service.
- Booking harus terhubung ke business.
- Booking harus menyimpan snapshot harga dan durasi ketika dibuat agar perubahan service tidak mengubah histori.
- Booking harus memiliki reference unik.
- Booking yang dibatalkan tidak dihapus.

## 13.4 TypeScript Types

```
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  timezone: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  reference: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
}
```

## 13.5 Storage Strategy

| Data             | Storage                               |
| ---------------- | ------------------------------------- |
| User account     | PostgreSQL                            |
| Business profile | PostgreSQL                            |
| Service          | PostgreSQL                            |
| Staff            | PostgreSQL                            |
| Schedule         | PostgreSQL                            |
| Booking          | PostgreSQL                            |
| Session          | Auth.js configured session strategy   |
| Logo             | Object storage jika upload diaktifkan |

# 14. Security & Privacy

## 14.1 Authentication

Gunakan Auth.js dengan konfigurasi Credentials Provider jika sesuai dengan versi dan kebutuhan deployment.

Password hashing:

- Argon2id atau bcrypt.
- Gunakan library yang kompatibel dengan runtime deployment.
- Jangan membuat algoritma hashing sendiri.

## 14.2 Authorization

Setiap dashboard API harus memeriksa:

- Session pengguna.
- Business ownership.
- Resource ownership.

Jangan hanya memeriksa apakah pengguna telah login.

## 14.3 Validation

Gunakan Zod pada:

- Register.
- Login.
- Business profile.
- Service.
- Staff.
- Operating hours.
- Booking.

Validasi server adalah wajib.

## 14.4 Rate Limiting

Terapkan rate limiting pada:

- Login.
- Registration.
- Public availability.
- Public booking creation.
- Cancellation endpoint.

Gunakan provider yang sesuai dengan hosting. Jangan mengandalkan in-memory limiter pada deployment serverless multi-instance.

## 14.5 Environment Variables

Contoh:

```
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
```

Jangan menggunakan prefix `NEXT_PUBLIC_` untuk secret.

## 14.6 Privacy

- Data pelanggan hanya dapat dilihat oleh bisnis terkait.
- Public page hanya menampilkan informasi bisnis.
- Booking reference tidak boleh mudah ditebak.
- Hindari menampilkan data pribadi pada URL.
- Sediakan kebijakan retensi dan penghapusan data.

## 14.7 Data Retention

Booking history disimpan untuk kebutuhan operasional dan histori bisnis.

Penghapusan atau anonimisasi data pribadi dilakukan berdasarkan kebijakan privasi dan ketentuan hukum yang berlaku.

# 15. Success Criteria

MVP dinyatakan selesai jika:

- Business owner dapat register.
- Business owner dapat login.
- Business owner dapat mengatur profil bisnis.
- Business owner dapat mengatur layanan.
- Business owner dapat mengatur staf.
- Business owner dapat mengatur operating hours.
- Public booking page tersedia.
- Pelanggan dapat melihat layanan.
- Pelanggan dapat melihat slot tersedia.
- Pelanggan dapat membuat booking.
- Booking tersimpan di database.
- Double booking dapat dicegah di database/backend.
- Owner dapat melihat booking.
- Owner dapat mengubah status booking.
- Data antarbisnis terisolasi.
- Responsive pada mobile.
- Tidak ada critical security issue.
- Production deployment berhasil.

# 16. Risks & Technical Constraints

| Risk                   | Impact | Mitigation                       |
| ---------------------- | ------ | -------------------------------- |
| Double booking         | High   | Transaction + DB constraint      |
| Incorrect timezone     | High   | UTC + business timezone          |
| Database downtime      | High   | Managed database + backup        |
| Unauthorized access    | High   | Server-side ownership validation |
| Email delivery failure | Medium | Retry/logging                    |
| High traffic           | Medium | Pagination + query optimization  |
| Public spam booking    | Medium | Rate limiting                    |
| Slug collision         | Low    | Unique constraint                |
| ORM migration issue    | Medium | Versioned migrations             |
| Hosting limitations    | Medium | Verify runtime compatibility     |

## 16.1 Important Technical Decisions

1. Gunakan PostgreSQL.
2. Gunakan Prisma ORM.
3. Gunakan Next.js Route Handlers.
4. Gunakan Auth.js untuk autentikasi.
5. Gunakan managed hosting.
6. Jangan gunakan microservices.
7. Jangan gunakan Redis sebelum diperlukan.
8. Jangan membuat sistem pembayaran pada MVP.
9. Gunakan database transaction untuk booking.
10. Simpan waktu booking dalam UTC dan timezone bisnis secara terpisah.

# PART B — SEQUENTIAL DEVELOPMENT PLAYBOOK

## Development Workflow

Development dilakukan secara berurutan. AI Coding Assistant hanya boleh mengerjakan satu phase dalam satu waktu.

\#chatgpt-mermaid-\_r_18j\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_18j\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_18j\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_18j\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_18j\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_18j\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_18j\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_18j\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_18j\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_18j\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_18j\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_18j\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_18j\_ p{margin:0;}#chatgpt-mermaid-\_r_18j\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_18j\_ .label text,#chatgpt-mermaid-\_r_18j\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ .node rect,#chatgpt-mermaid-\_r_18j\_ .node circle,#chatgpt-mermaid-\_r_18j\_ .node ellipse,#chatgpt-mermaid-\_r_18j\_ .node polygon,#chatgpt-mermaid-\_r_18j\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .rough-node .label text,#chatgpt-mermaid-\_r_18j\_ .node .label text,#chatgpt-mermaid-\_r_18j\_ .image-shape .label,#chatgpt-mermaid-\_r_18j\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_18j\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .rough-node .label,#chatgpt-mermaid-\_r_18j\_ .node .label,#chatgpt-mermaid-\_r_18j\_ .image-shape .label,#chatgpt-mermaid-\_r_18j\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_18j\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_18j\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_18j\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_18j\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_18j\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_18j\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_18j\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_18j\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_18j\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_18j\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_18j\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_18j\_ .icon-shape,#chatgpt-mermaid-\_r_18j\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_18j\_ .icon-shape p,#chatgpt-mermaid-\_r_18j\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_18j\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_18j\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_18j\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_18j\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_18j\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_18j\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_18j\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_18j\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_18j\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_18j\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_18j\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_18j\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_18j\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_18j\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_18j\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_18j\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .node rect,#chatgpt-mermaid-\_r_18j\_ .node circle,#chatgpt-mermaid-\_r_18j\_ .node ellipse,#chatgpt-mermaid-\_r_18j\_ .node polygon,#chatgpt-mermaid-\_r_18j\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_18j\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_18j\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_18j\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_18j\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_18j\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Phase 1: BootstrapPhase 2: ArchitecturePhase 3: UI/UX PlanningPhase 4: Frontend FoundationPhase 5: Core FrontendPhase 6: BackendPhase 7: IntegrationPhase 8: Additional FeaturesPhase 9: TestingPhase 10: Deployment

## Phase Execution Rules

Setiap phase wajib mengikuti aturan berikut:

1. Baca PRD dan dokumentasi sebelumnya.
2. Periksa kondisi repository.
3. Kerjakan hanya scope phase aktif.
4. Jangan mengerjakan phase berikutnya.
5. Jalankan testing yang diwajibkan.
6. Perbaiki error yang ditemukan.
7. Tampilkan laporan hasil.
8. Tunggu persetujuan developer.
9. Buat Git checkpoint setelah verifikasi.
10. Lanjutkan hanya setelah developer memberikan persetujuan.

# PHASE 1 — Environment & Project Bootstrap

Foundation

## 1. Phase Objective

Mempersiapkan development environment dan membuat project Next.js BookEase dengan konfigurasi dasar yang stabil.

Phase ini belum mengimplementasikan fitur bisnis.

## 2. Scope of Work

- Memeriksa Node.js dan package manager.
- Membuat Next.js application.
- Setup TypeScript.
- Setup Tailwind CSS.
- Setup shadcn/ui.
- Setup ESLint.
- Setup Prettier jika diperlukan.
- Setup Git.
- Membuat struktur folder awal.
- Memastikan aplikasi berjalan.

## 3. Detailed Implementation Steps

### Step 1 — Verify Development Environment

Gunakan Node.js versi LTS yang kompatibel dengan Next.js versi yang dipilih.

Periksa:

```
node -v
npm -v
git --version
```

Pastikan Node.js dan npm tersedia.

### Step 2 — Create Next.js Project

Gunakan npm sebagai package manager.

```
npx create-next-app@latest bookease
```

Pilih konfigurasi:

| Option         | Selection      |
| -------------- | -------------- |
| TypeScript     | Yes            |
| ESLint         | Yes            |
| Tailwind CSS   | Yes            |
| src directory  | Yes            |
| App Router     | Yes            |
| Import alias   | `@/*`          |
| React Compiler | No (initially) |

Masuk ke project:

```
cd bookease
```

### Step 3 — Install Dependencies

```
npm install zustand zod react-hook-form @hookform/resolvers
```

Tambahkan Prisma pada tahap ini hanya sebagai tooling awal jika diperlukan untuk menyiapkan proyek:

```
npm install -D prisma
```

Jangan install seluruh dependency backend sebelum technical planning selesai.

### Step 4 — Initialize shadcn/ui

```
npx shadcn@latest init
```

Pilih konfigurasi sesuai Tailwind dan project yang dihasilkan.

Tambahkan komponen dasar:

```
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add sonner
```

Periksa command dan kompatibilitas komponen dengan versi shadcn/ui yang digunakan.

### Step 5 — Install Icons

```
npm install lucide-react
```

### Step 6 — Setup Git

```
git init
```

Pastikan `.gitignore` mencakup:

```
node_modules
.next
.env
.env.local
.env.production
dist
coverage
```

### Step 7 — Run Development Server

```
npm run dev
```

Buka:

```
http://localhost:3000
```

## 4. Required Commands

```
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

Jika konfigurasi Next.js tidak menyediakan script `lint` atau script tersebut berubah pada versi yang digunakan, sesuaikan dengan konfigurasi ESLint aktual.

## 5. AI Coding Assistant Prompt

# PHASE 1 — PROJECT BOOTSTRAP

Kamu bertindak sebagai Senior Fullstack Developer.

Project: BookEase

Dokumen utama:

- PROJECT_PRD_AND_PLAYBOOK.md

Tech stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (jika diperlukan)
- React Hook Form
- Zod

Development approach:\
Solo developer, MVP first, clean architecture pragmatis, maintainable code.

## Instructions

1. Baca PROJECT_PRD_AND_PLAYBOOK.md terlebih dahulu.
2. Periksa environment dan repository sebelum melakukan perubahan.
3. Buat project Next.js sesuai konfigurasi dalam Phase 1.
4. Gunakan TypeScript.
5. Gunakan App Router.
6. Setup Tailwind CSS.
7. Setup shadcn/ui.
8. Install hanya dependency yang diperlukan.
9. Setup Git dan .gitignore.
10. Jangan membuat fitur bisnis.
11. Jangan membuat database schema.
12. Jangan mengimplementasikan authentication.
13. Jangan melanjutkan ke Phase 2.

## Expected Files

- package.json
- tsconfig.json
- next.config.\*
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- components.json
- .gitignore

Struktur boleh mengikuti hasil create-next-app.

## Verification

Jalankan:

- npm run dev
- npm run build
- npm run lint jika tersedia
- npx tsc --noEmit

## Acceptance Criteria

- Project dapat dijalankan.
- Next.js menggunakan App Router.
- TypeScript aktif.
- Tailwind aktif.
- shadcn/ui terkonfigurasi.
- Tidak terdapat error build.
- Tidak terdapat dependency yang tidak diperlukan.

## Final Report

Laporkan:

1. Environment.
2. Project structure.
3. Dependency yang ditambahkan.
4. File yang dibuat.
5. File yang diubah.
6. Hasil testing aktual.
7. Error yang masih ada.
8. Git status.

Jangan membuat commit sebelum developer melakukan review dan menyetujui hasilnya.

## 6. Expected Deliverables

- Next.js project.
- TypeScript configuration.
- Tailwind configuration.
- shadcn/ui setup.
- Git repository.
- Working development environment.

## 7. Acceptance Criteria

- Project dapat dijalankan dengan `npm run dev`.
- Homepage dapat diakses.
- TypeScript berjalan.
- Tailwind berfungsi.
- shadcn/ui berhasil diinisialisasi.
- Build berhasil.
- Git repository tersedia.

## 8. Testing Requirements

```
npm run build
npm run lint
npx tsc --noEmit
```

Verifikasi tampilan melalui browser.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 1: project bootstrap"
```

# PHASE 2 — Technical Planning & Architecture

Planning

## 1. Phase Objective

Menghasilkan rancangan teknis BookEase sebelum implementasi fitur utama.

Output utama:

`TECHNICAL_PLAN.md`

Tidak boleh mengimplementasikan fitur utama pada phase ini.

## 2. Scope of Work

- Menganalisis PRD.
- Menentukan final architecture.
- Menentukan folder structure.
- Menentukan database schema.
- Menentukan API contracts.
- Menentukan authentication strategy.
- Menentukan booking concurrency strategy.
- Menentukan timezone strategy.
- Menentukan dependencies.
- Menentukan error handling.
- Mengidentifikasi technical risks.

## 3. Detailed Implementation Steps

### Step 1 — Review Existing Project

Periksa:

```
find . -maxdepth 3 -type f
```

Periksa package:

```
cat package.json
```

### Step 2 — Finalize Folder Structure

Struktur yang direkomendasikan:

```
bookease/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── book/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   ├── marketing/
│   │   ├── dashboard/
│   │   └── booking/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── business/
│   │   ├── services/
│   │   ├── staff/
│   │   ├── schedule/
│   │   └── bookings/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── validations/
│   │   └── utils.ts
│   │
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── policies/
│   │
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── constants/
│
├── TECHNICAL_PLAN.md
├── UI_UX_GUIDE.md
├── PROJECT_PRD_AND_PLAYBOOK.md
├── package.json
└── README.md
```

Folder dapat disederhanakan jika jumlah file masih sedikit. Jangan membuat file kosong hanya untuk memenuhi struktur.

### Step 3 — Define Database Architecture

Tentukan schema:

- User.
- Business.
- Service.
- Staff.
- StaffService.
- OperatingHour.
- Booking.

Tentukan relasi dan constraint.

Khusus Booking:

- Unique reference.
- Foreign keys.
- Status enum.
- Start time.
- End time.
- Snapshot price.
- Snapshot duration.
- Staff assignment.
- Business ownership.

### Step 4 — Define API Contract

Dokumentasikan setiap endpoint:

- HTTP method.
- URL.
- Authentication.
- Request payload.
- Response payload.
- Validation.
- Error codes.

### Step 5 — Define Booking Engine

Tentukan:

- Slot generation algorithm.
- Business timezone conversion.
- Service duration.
- Buffer time.
- Staff availability.
- Overlap detection.
- Transaction strategy.
- Concurrent booking handling.

### Step 6 — Define Authentication

Tentukan:

- Auth.js configuration.
- Session strategy.
- User-business ownership.
- Protected routes.
- Password hashing.

### Step 7 — Define Dependencies

Setiap dependency harus memiliki alasan.

Contoh:

| Dependency      | Reason                  |
| --------------- | ----------------------- |
| Prisma          | Database ORM            |
| PostgreSQL      | Relational database     |
| Auth.js         | Authentication          |
| Zod             | Validation              |
| React Hook Form | Form handling           |
| date-fns        | Date calculations       |
| date-fns-tz     | Timezone handling       |
| Resend          | Optional email delivery |

Pastikan versi dan kompatibilitas library diverifikasi sebelum instalasi.

### Step 8 — Generate Technical Plan

Buat file `TECHNICAL_PLAN.md`.

Dokumen harus mencakup:

1. Architecture overview.
2. Folder structure.
3. Data model.
4. Database relationships.
5. API contracts.
6. Authentication.
7. Authorization.
8. Booking algorithm.
9. Timezone strategy.
10. Error handling.
11. Dependencies.
12. Deployment architecture.
13. Security considerations.
14. Technical risks.

## 4. Required Commands

```
cat package.json
find src -maxdepth 4 -type f
git status
```

Command bersifat inspeksi. Jangan melakukan implementasi fitur.

## 5. AI Coding Assistant Prompt

# PHASE 2 — TECHNICAL PLANNING

Kamu bertindak sebagai Senior Software Architect.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- Kondisi repository aktual.

## Objective

Menghasilkan TECHNICAL_PLAN.md sebagai pedoman implementasi seluruh project.

## Tasks

1. Analisis kebutuhan BookEase.
2. Finalisasi arsitektur modular monolith.
3. Tentukan folder structure.
4. Tentukan tanggung jawab setiap layer.
5. Tentukan database PostgreSQL.
6. Rancang Prisma data model.
7. Rancang relasi User, Business, Service, Staff, StaffService, OperatingHour, Booking.
8. Rancang seluruh REST API endpoints.
9. Rancang Auth.js authentication.
10. Rancang business ownership authorization.
11. Rancang booking slot calculation.
12. Rancang double booking prevention.
13. Rancang timezone handling.
14. Tentukan dependency dan alasan penggunaannya.
15. Rancang error handling.
16. Tentukan deployment architecture.

## Critical Requirements

- Gunakan Next.js Route Handlers.
- Jangan menggunakan microservices.
- Jangan menggunakan Rust atau Tauri.
- Jangan menambahkan Redis tanpa alasan.
- Jangan membuat background worker terpisah untuk MVP.
- Booking concurrency harus diproteksi pada level database.
- Public booking tidak memerlukan customer account.
- Simpan booking timestamp dalam UTC.
- Gunakan timezone bisnis untuk jadwal.
- Business data harus terisolasi.

## Expected Output

Buat TECHNICAL_PLAN.md secara lengkap.

Jangan mengimplementasikan:

- API.
- Database migrations.
- Authentication.
- Booking logic.
- UI features.

## Acceptance Criteria

TECHNICAL_PLAN.md harus:

- Konsisten dengan PRD.
- Memiliki folder structure final.
- Memiliki database design.
- Memiliki API contracts.
- Memiliki security design.
- Memiliki booking concurrency strategy.
- Memiliki dependency justification.
- Memiliki deployment design.

Jangan melanjutkan ke Phase 3.

## Final Report

Laporkan dokumen yang dibuat, keputusan arsitektur, risiko, dan hasil review konsistensi PRD.

## 6. Expected Deliverables

- `TECHNICAL_PLAN.md`
- Final folder architecture.
- API contract.
- Database design.
- Booking algorithm design.

## 7. Acceptance Criteria

- Architecture terdokumentasi.
- Folder structure disepakati.
- Database relationships jelas.
- API contracts lengkap.
- Booking concurrency strategy jelas.
- Timezone strategy jelas.
- Dependency justified.
- Tidak ada fitur bisnis diimplementasikan.

## 8. Testing Requirements

Tidak ada functional test.

Lakukan document review:

- Konsistensi PRD.
- Validasi dependency.
- Validasi architecture.
- Validasi data relationship.
- Validasi API design.

## 9. Git Checkpoint

```
git add TECHNICAL_PLAN.md
git commit -m "phase 2: technical architecture"
```

# PHASE 3 — UI/UX Planning & Design System

Design Planning

## 1. Phase Objective

Membuat panduan visual dan interaksi BookEase sebelum implementasi frontend.

Output utama:

`UI_UX_GUIDE.md`

## 2. Scope of Work

- Design direction.
- Color palette.
- Typography.
- Spacing.
- Layout.
- Navigation.
- Public pages.
- Dashboard.
- Booking experience.
- Component inventory.
- Responsive behavior.
- UI states.

## 3. Detailed Implementation Steps

### Step 1 — Define Design Direction

BookEase harus terlihat seperti modern SaaS product.

Karakter:

- Professional.
- Minimalist.
- Friendly.
- Clean.
- Trustworthy.
- Easy to navigate.

### Step 2 — Define Design Tokens

Dokumentasikan:

```
:root {
  --background: 248 250 252;
  --foreground: 15 23 42;
  --primary: 79 70 229;
  --secondary: 241 245 249;
  --muted: 100 116 139;
  --success: 22 163 74;
  --warning: 217 119 6;
  --destructive: 220 38 38;
  --radius: 0.75rem;
}
```

Sesuaikan dengan format token Tailwind/shadcn/ui yang aktual.

### Step 3 — Define Pages

Design minimal:

1. Homepage.
2. Login.
3. Register.
4. Dashboard.
5. Booking management.
6. Service management.
7. Staff management.
8. Business profile.
9. Schedule management.
10. Public booking page.
11. Booking success page.

### Step 4 — Define Booking Wizard

Booking harus sederhana.

Customer booking experience

1

Select service

Pilih layanan dan harga.

2

Select staff

Pilih staf atau siapa saja yang tersedia.

3

Select date and time

Pilih tanggal dan slot yang tersedia.

4

Customer details

Masukkan nama dan kontak.

5

Confirmation

Reservasi berhasil dibuat.

### Step 5 — Define Dashboard

Dashboard minimal:

- Sidebar.
- Header.
- Overview cards.
- Upcoming bookings.
- Recent bookings.
- Quick actions.

### Step 6 — Define Component Inventory

Dokumentasikan:

- Button.
- Input.
- Select.
- Date picker.
- Time slot.
- Dialog.
- Dropdown.
- Table.
- Card.
- Badge.
- Toast.
- Form field.
- Empty state.
- Skeleton.

### Step 7 — Define Responsive Behavior

Tentukan breakpoint sesuai konfigurasi Tailwind.

Pastikan:

- Sidebar menjadi mobile navigation.
- Booking wizard mudah digunakan pada layar kecil.
- Table dapat berubah menjadi card list.
- Form tidak overflow.
- Tombol memiliki touch target yang memadai.

### Step 8 — Document UI/UX

Buat `UI_UX_GUIDE.md`.

## 4. Required Commands

```
find src -maxdepth 4 -type f
cat package.json
```

## 5. AI Coding Assistant Prompt

# PHASE 3 — UI/UX DESIGN PLANNING

Kamu bertindak sebagai Senior UI/UX Designer dan Frontend Architect.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md

## Objective

Membuat UI_UX_GUIDE.md sebagai pedoman implementasi visual.

## Tasks

1. Tentukan design direction.
2. Tentukan color palette.
3. Tentukan typography.
4. Tentukan spacing system.
5. Tentukan border radius.
6. Tentukan shadow system.
7. Rancang public layout.
8. Rancang dashboard layout.
9. Rancang public booking page.
10. Rancang booking wizard.
11. Rancang dashboard overview.
12. Rancang service management UI.
13. Rancang staff management UI.
14. Rancang schedule management UI.
15. Buat component inventory.
16. Tentukan responsive behavior.
17. Tentukan loading, empty, error, success states.
18. Pertimbangkan accessibility.

## Design Requirements

- Modern SaaS.
- Clean and professional.
- Mobile-first.
- Consistent design tokens.
- Reusable components.
- Avoid unnecessary decoration.
- Booking flow harus sederhana.

## Expected Files

- UI_UX_GUIDE.md

Jika diperlukan, sertakan Mermaid diagram dan deskripsi wireframe berbasis teks.

## Restrictions

- Jangan mengimplementasikan UI.
- Jangan mengubah application source code.
- Jangan menambahkan dependency.
- Jangan membuat fitur baru.
- Jangan melanjutkan Phase 4.

## Acceptance Criteria

UI_UX_GUIDE.md harus mencakup seluruh halaman, layout, navigation, component inventory, tokens, responsive rules, dan UI states.

## Final Report

Laporkan hasil design planning dan kesesuaian dengan PRD serta TECHNICAL_PLAN.md.

## 6. Expected Deliverables

- `UI_UX_GUIDE.md`
- Design tokens.
- Page inventory.
- Component inventory.
- Responsive specification.
- Booking wireframe descriptions.

## 7. Acceptance Criteria

- Seluruh halaman terdokumentasi.
- Design tokens tersedia.
- Navigation jelas.
- Booking wizard terdokumentasi.
- Dashboard layout terdokumentasi.
- Responsive behavior ditentukan.
- UI states ditentukan.
- Tidak ada implementasi fitur.

## 8. Testing Requirements

Lakukan review dokumen:

- Konsistensi dengan PRD.
- Konsistensi dengan technical architecture.
- Kelengkapan komponen.
- Kelengkapan responsive rules.

## 9. Git Checkpoint

```
git add UI_UX_GUIDE.md
git commit -m "phase 3: ui ux planning"
```

# PHASE 4 — Frontend Foundation & Application Shell

Frontend Foundation

## 1. Phase Objective

Membangun struktur frontend BookEase berdasarkan technical planning dan design guide.

Belum mengimplementasikan business logic utama.

## 2. Scope of Work

- Final folder structure.
- Global layout.
- Public navbar.
- Footer.
- Dashboard sidebar.
- Dashboard header.
- Navigation.
- Design tokens.
- Reusable UI components.
- Basic routing.
- Theme setup jika diperlukan.

## 3. Detailed Implementation Steps

### Step 1 — Finalize Folder Structure

Buat struktur sesuai `TECHNICAL_PLAN.md`.

### Step 2 — Setup Global Styles

Implementasikan:

- CSS variables.
- Typography.
- Background.
- Text colors.
- Radius.
- Global container.
- Responsive styles.

### Step 3 — Create Public Layout

Implementasikan:

```
src/app/(marketing)/
├── layout.tsx
├── page.tsx
├── features/
│   └── page.tsx
└── pricing/
    └── page.tsx
```

### Step 4 — Create Authentication Layout

```
src/app/(auth)/
├── layout.tsx
├── login/
│   └── page.tsx
└── register/
    └── page.tsx
```

Gunakan placeholder UI untuk halaman autentikasi. Jangan menghubungkan authentication backend.

### Step 5 — Create Dashboard Layout

```
src/app/(dashboard)/
├── layout.tsx
└── dashboard/
    ├── page.tsx
    ├── bookings/
    │   └── page.tsx
    ├── services/
    │   └── page.tsx
    ├── staff/
    │   └── page.tsx
    ├── schedule/
    │   └── page.tsx
    └── business/
        └── page.tsx
```

### Step 6 — Build Navigation Components

- PublicNavbar.
- PublicFooter.
- DashboardSidebar.
- DashboardHeader.
- MobileNavigation.

### Step 7 — Build Reusable Components

- PageHeader.
- StatCard.
- EmptyState.
- LoadingState.
- ErrorState.
- SectionCard.
- StatusBadge.

### Step 8 — Build Placeholder Pages

Setiap route harus dapat dibuka.

Belum perlu data database.

## 4. Required Commands

```
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

## 5. AI Coding Assistant Prompt

# PHASE 4 — FRONTEND FOUNDATION

Kamu bertindak sebagai Senior Frontend Developer.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- UI_UX_GUIDE.md

## Objective

Membangun frontend foundation dan application shell.

## Tasks

1. Finalisasi folder structure.
2. Implementasikan global CSS.
3. Implementasikan design tokens.
4. Implementasikan public layout.
5. Implementasikan navbar.
6. Implementasikan footer.
7. Implementasikan authentication layout.
8. Implementasikan dashboard layout.
9. Implementasikan dashboard sidebar.
10. Implementasikan dashboard header.
11. Implementasikan mobile navigation.
12. Implementasikan reusable UI components.
13. Buat placeholder untuk seluruh route utama.
14. Pastikan seluruh halaman responsif.

## Component Requirements

- PageHeader.
- StatCard.
- EmptyState.
- LoadingState.
- ErrorState.
- StatusBadge.
- SectionCard.

Gunakan shadcn/ui apabila sesuai.

## Restrictions

- Jangan implementasikan authentication backend.
- Jangan implementasikan Prisma.
- Jangan implementasikan database.
- Jangan membuat booking logic.
- Jangan menggunakan mock data sebagai fitur production.
- Placeholder data hanya boleh digunakan untuk visual shell.
- Jangan melanjutkan Phase 5.

## Expected Deliverables

Frontend shell, layouts, navigation, reusable components, dan route placeholders.

## Verification

Jalankan build, lint, dan typecheck.

Periksa seluruh halaman melalui browser.

## Acceptance Criteria

- Semua route dapat diakses.
- Layout konsisten.
- Sidebar berfungsi.
- Mobile navigation berfungsi.
- Responsive pada mobile dan desktop.
- Tidak ada TypeScript error.
- Tidak ada build error.

## Final Report

Laporkan file yang dibuat, komponen, route, dependency, dan hasil testing aktual.

## 6. Expected Deliverables

- Global layout.
- Navbar.
- Footer.
- Dashboard shell.
- Sidebar.
- Header.
- Shared components.
- Basic route structure.

## 7. Acceptance Criteria

- Public layout berjalan.
- Dashboard layout berjalan.
- Navigation berfungsi.
- Seluruh route tersedia.
- Responsive design berjalan.
- Reusable components tersedia.
- Tidak ada business logic.

## 8. Testing Requirements

- Build.
- Lint.
- Typecheck.
- Manual browser test.
- Mobile viewport test.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 4: frontend foundation"
```

# PHASE 5 — Core Frontend Feature Development

Core UI Development

## 1. Phase Objective

Membangun seluruh UI utama BookEase menggunakan frontend-only implementation.

Semua data menggunakan mock service sementara.

Mock tidak boleh menjadi implementasi production.

## 2. Scope of Work

- Homepage.
- Login UI.
- Register UI.
- Dashboard overview.
- Business profile UI.
- Service management UI.
- Staff management UI.
- Schedule management UI.
- Booking management UI.
- Public booking page.
- Booking wizard.
- Booking success page.
- Form validation.
- UI state management.

## 3. Detailed Implementation Steps

### Step 1 — Homepage

Implementasikan:

- Hero.
- Main CTA.
- Feature section.
- How it works.
- Target business section.
- Footer CTA.

### Step 2 — Authentication UI

Login form:

- Email.
- Password.
- Show/hide password.
- Validation.
- Loading state.

Register form:

- Name.
- Email.
- Password.
- Confirm password.

### Step 3 — Dashboard Overview

Implementasikan:

- Total bookings.
- Today's bookings.
- Upcoming bookings.
- Completed bookings.
- Recent booking list.

Gunakan mock data dengan label atau file yang jelas, misalnya:

```
src/features/dashboard/mocks/dashboard.mock.ts
```

### Step 4 — Business Management UI

Implementasikan:

- Business name.
- Description.
- Category.
- Phone.
- Address.
- Slug.
- Timezone.

### Step 5 — Service Management UI

Implementasikan:

- Service list.
- Add service dialog.
- Edit service dialog.
- Delete/deactivate confirmation.
- Price.
- Duration.
- Description.

### Step 6 — Staff Management UI

Implementasikan:

- Staff list.
- Add staff.
- Edit staff.
- Active/inactive.
- Service assignment.

### Step 7 — Schedule Management UI

Implementasikan:

- Weekly schedule.
- Opening time.
- Closing time.
- Closed toggle.
- Buffer time UI jika sudah disepakati dalam design guide.

### Step 8 — Booking Management UI

Implementasikan:

- Booking table.
- Status badge.
- Search.
- Date filter.
- Detail dialog atau page.
- Status change dialog.

### Step 9 — Public Booking Wizard

Implementasikan:

1. Select service.
2. Select staff.
3. Select date.
4. Select time.
5. Customer details.
6. Review.
7. Success.

### Step 10 — Form Validation

Gunakan:

- React Hook Form.
- Zod.
- Shared validation schema.

### Step 11 — Mock Service Layer

Contoh:

```
src/features/
├── bookings/
│   ├── components/
│   ├── services/
│   │   └── booking.mock-service.ts
│   └── mocks/
│       └── booking.mock.ts
```

Semua mock harus memiliki batas yang jelas.

Buat dokumentasi:

`MOCK_DATA.md`

Jelaskan:

- Mock file.
- Mock data purpose.
- Fitur yang menggunakannya.
- Bagian yang harus diganti pada Phase 7.

## 4. Required Commands

```
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

## 5. AI Coding Assistant Prompt

# PHASE 5 — CORE FRONTEND FEATURES

Kamu bertindak sebagai Senior Frontend Engineer.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- UI_UX_GUIDE.md

## Objective

Mengimplementasikan seluruh core UI BookEase menggunakan mock data.

## Tasks

1. Implementasikan homepage.
2. Implementasikan login UI.
3. Implementasikan register UI.
4. Implementasikan dashboard overview.
5. Implementasikan business profile UI.
6. Implementasikan service management UI.
7. Implementasikan staff management UI.
8. Implementasikan schedule management UI.
9. Implementasikan booking management UI.
10. Implementasikan booking detail UI.
11. Implementasikan public booking page.
12. Implementasikan booking wizard.
13. Implementasikan booking success page.
14. Implementasikan form validation.
15. Implementasikan loading, empty, error, dan success states.
16. Implementasikan state management sesuai kebutuhan.
17. Buat mock service layer.
18. Buat MOCK_DATA.md.

## Booking Wizard Requirements

- Service selection.
- Staff selection.
- Date selection.
- Time selection.
- Customer information.
- Booking review.
- Confirmation.

Validasi seluruh input.

## Mock Data Rules

- Semua mock harus terpisah.
- Jangan hardcode mock dalam komponen.
- Jangan menganggap mock sebagai production backend.
- Buat mock service dengan interface yang mudah diganti.
- Tandai penggunaan mock dengan jelas.

## Restrictions

- Jangan membuat database.
- Jangan membuat API backend.
- Jangan implementasikan authentication nyata.
- Jangan mengimplementasikan email delivery.
- Jangan mengimplementasikan payment.
- Jangan melanjutkan Phase 6.

## Expected Deliverables

- Seluruh core UI.
- Feature components.
- Forms.
- Mock services.
- MOCK_DATA.md.

## Acceptance Criteria

Semua core UI berfungsi menggunakan mock service.

Semua form tervalidasi.

Semua state UI tersedia.

Tidak ada halaman core yang kosong.

## Verification

Jalankan:

- npm run build
- npm run lint
- npx tsc --noEmit

Lakukan manual test untuk seluruh flow.

## Final Report

Laporkan semua halaman, komponen, mock files, dependencies, testing, dan mock yang nantinya harus diganti.

## 6. Expected Deliverables

- Core frontend pages.
- Booking wizard.
- Dashboard UI.
- Business management UI.
- Service management UI.
- Staff management UI.
- Schedule management UI.
- Mock services.
- `MOCK_DATA.md`.

## 7. Acceptance Criteria

- Homepage selesai.
- Login dan register UI selesai.
- Dashboard UI selesai.
- Business profile UI selesai.
- Service CRUD UI berjalan dengan mock.
- Staff CRUD UI berjalan dengan mock.
- Schedule UI berjalan dengan mock.
- Booking management UI selesai.
- Booking wizard berfungsi.
- Form validation berjalan.
- Loading/empty/error/success tersedia.
- Mock terisolasi.

## 8. Testing Requirements

- Manual test seluruh form.
- Manual test booking wizard.
- Test responsive.
- Build.
- Lint.
- Typecheck.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 5: core frontend features"
```

# PHASE 6 — Backend & Core Business Logic

Critical Implementation

## 1. Phase Objective

Mengimplementasikan backend dan seluruh core business logic BookEase.

Pada akhir phase ini, sistem harus memiliki backend yang dapat menjalankan fungsi utama tanpa frontend mock.

## 2. Scope of Work

- PostgreSQL.
- Prisma.
- Database schema.
- Migrations.
- Authentication.
- Authorization.
- Business CRUD.
- Service CRUD.
- Staff CRUD.
- Operating hours.
- Availability calculation.
- Booking creation.
- Double booking prevention.
- Booking management.
- API validation.
- Error handling.
- Security.
- Logging.

## 3. Detailed Implementation Steps

### Step 1 — Install Backend Dependencies

Verifikasi versi library dan kompatibilitas runtime sebelum instalasi.

Contoh:

```
npm install @prisma/client
npm install @auth/prisma-adapter
npm install next-auth
npm install date-fns date-fns-tz
```

```
npm install -D prisma
```

Tambahkan database driver sesuai konfigurasi Prisma yang dipilih.

Untuk deployment serverless, evaluasi strategi koneksi PostgreSQL yang sesuai, termasuk pooled connection.

### Step 2 — Configure Database

Buat:

```
prisma/schema.prisma
```

Configure `.env.local`:

```
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3 — Create Database Schema

Implementasikan entity:

- User.
- Business.
- Service.
- Staff.
- StaffService.
- OperatingHour.
- Booking.

Pastikan semua relation dan constraints sesuai technical plan.

### Step 4 — Run Migration

```
npx prisma migrate dev --name init
npx prisma generate
```

Periksa:

```
npx prisma studio
```

### Step 5 — Setup Prisma Client

Buat:

```
src/lib/prisma.ts
```

Gunakan singleton pattern pada development agar tidak membuat terlalu banyak koneksi.

### Step 6 — Implement Authentication

Implementasikan:

- Register.
- Login.
- Logout.
- Session.
- Protected dashboard.
- Business ownership.

Pastikan versi Auth.js yang digunakan kompatibel dengan Prisma adapter dan Next.js runtime.

### Step 7 — Implement Business Service

Business operations:

- Create business.
- Get business.
- Update business.
- Validate slug.
- Get public business profile.

### Step 8 — Implement Service Management

Operations:

- Create service.
- Update service.
- Deactivate service.
- List services.
- Validate price.
- Validate duration.

### Step 9 — Implement Staff Management

Operations:

- Create staff.
- Update staff.
- Deactivate staff.
- Assign staff to service.
- Remove service assignment.

### Step 10 — Implement Operating Hours

Operations:

- Get schedule.
- Update schedule.
- Validate time.
- Handle closed days.

### Step 11 — Implement Availability Engine

Input:

```
interface AvailabilityRequest {
  businessId: string;
  serviceId: string;
  staffId?: string;
  date: string;
}
```

Output:

```
interface AvailableSlot {
  startAt: string;
  endAt: string;
  staffId: string;
}
```

Algorithm:

1. Validate business.
2. Validate service.
3. Load business timezone.
4. Convert requested date into business-local date.
5. Load operating hours.
6. Load staff eligible for service.
7. Load active bookings for the selected date range.
8. Generate candidate time slots.
9. Exclude past times.
10. Exclude overlapping bookings.
11. Return available slots.

Interval overlap menggunakan prinsip:

```
existing.startAt < requested.endAt
AND
existing.endAt > requested.startAt
```

Jangan hanya mengecek apakah `startAt` sama.

### Step 12 — Implement Booking Creation

Booking creation harus:

1. Validate request.
2. Validate public business.
3. Validate active service.
4. Validate staff assignment.
5. Validate business operating hours.
6. Recalculate end time.
7. Start database transaction.
8. Lock atau gunakan database constraint untuk mencegah concurrent overlap.
9. Create booking.
10. Commit transaction.
11. Return booking reference.

Untuk PostgreSQL, implementasikan strategi exclusion constraint yang direncanakan dalam `TECHNICAL_PLAN.md`, atau strategi transaction/locking yang terbukti aman untuk pola akses yang dipilih.

Jika menggunakan exclusion constraint, pastikan semua booking yang menempati resource sama menggunakan range waktu yang konsisten. Booking `CANCELLED` tidak boleh memblokir slot.

### Step 13 — Implement Booking Management

Operations:

- List bookings.
- Get booking details.
- Confirm booking.
- Cancel booking.
- Complete booking.
- Mark no-show.

Semua operasi harus memeriksa business ownership dan status transition.

### Step 14 — Implement API Routes

Gunakan route handler sesuai API contract.

Contoh:

```
src/app/api/v1/bookings/route.ts
src/app/api/v1/bookings/[id]/route.ts
src/app/api/v1/availability/route.ts
```

### Step 15 — Implement Security

- Zod server validation.
- Authorization.
- Rate limiting.
- Secure session.
- Generic error response.
- Structured logging.

### Step 16 — Implement Backend Tests

Prioritaskan test:

- Booking overlap.
- Concurrent booking.
- Timezone.
- Booking cancellation.
- Ownership isolation.
- Invalid service.
- Invalid staff assignment.

## 4. Required Commands

```
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

## 5. AI Coding Assistant Prompt

# PHASE 6 — BACKEND & CORE BUSINESS LOGIC

Kamu bertindak sebagai Senior Backend Engineer.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- MOCK_DATA.md

## Objective

Mengimplementasikan backend production-ready untuk core MVP.

## Tasks

1. Setup PostgreSQL.
2. Setup Prisma.
3. Implementasikan database schema.
4. Implementasikan migrations.
5. Setup Prisma client.
6. Implementasikan authentication.
7. Implementasikan registration.
8. Implementasikan login/logout.
9. Implementasikan authorization.
10. Implementasikan business management.
11. Implementasikan service management.
12. Implementasikan staff management.
13. Implementasikan staff-service assignment.
14. Implementasikan operating hours.
15. Implementasikan availability engine.
16. Implementasikan booking creation.
17. Implementasikan booking management.
18. Implementasikan booking status transitions.
19. Implementasikan seluruh API endpoints.
20. Implementasikan error handling.
21. Implementasikan rate limiting.
22. Implementasikan structured logging.
23. Implementasikan backend tests.

## Critical Booking Requirements

Booking harus benar-benar aman terhadap double booking.

Jangan hanya mengandalkan frontend availability.

Implementasikan:

- Server-side availability validation.
- Database transaction.
- Appropriate row/resource locking atau database exclusion constraint.
- Correct overlap detection.
- Atomic staff allocation untuk Any Available.
- Cancellation slot release.
- Business timezone handling.
- UTC storage.

Booking yang CANCELLED tidak boleh memblokir slot.

Booking reference harus unik dan tidak mudah ditebak.

## Security Requirements

- Business ownership verification.
- Server-side Zod validation.
- Secure authentication.
- Password hashing.
- Rate limiting.
- No sensitive data leakage.
- No unrestricted database queries.

## Architecture Rules

Ikuti TECHNICAL_PLAN.md.

Gunakan modular monolith.

Jangan menambahkan:

- Microservices.
- Redis tanpa kebutuhan.
- Dedicated backend service.
- Payment gateway.
- WhatsApp API.
- Features P2.

## Expected Deliverables

- Prisma schema.
- Database migrations.
- Authentication.
- Backend services.
- API routes.
- Availability engine.
- Booking engine.
- Backend tests.

## Testing Requirements

Uji:

- Register/login.
- Business ownership.
- Service CRUD.
- Staff CRUD.
- Operating hours.
- Available slots.
- Booking creation.
- Double booking.
- Concurrent booking.
- Cancellation.
- Timezone.

Jangan mengklaim concurrency aman hanya berdasarkan test sequential. Buat integration test dengan concurrent requests atau transaksi paralel.

## Acceptance Criteria

Semua backend core MVP berjalan.

Database menyimpan data secara persisten.

API memiliki validation dan authorization.

Booking tidak dapat overlap untuk resource yang sama.

## Restrictions

Jangan mengimplementasikan frontend integration.

Jangan menghapus mock service.

Jangan melanjutkan Phase 7.

## Final Report

Laporkan schema, migrations, endpoints, services, security, test results, dependency, dan known limitations.

## 6. Expected Deliverables

- Prisma schema.
- Database migrations.
- Prisma client.
- Authentication.
- Backend services.
- API routes.
- Booking engine.
- Availability engine.
- Backend tests.

## 7. Acceptance Criteria

- Database terkoneksi.
- Migration berhasil.
- Register berfungsi.
- Login berfungsi.
- Session tersedia.
- Business CRUD berfungsi.
- Service CRUD berfungsi.
- Staff CRUD berfungsi.
- Schedule management berfungsi.
- Availability calculation berfungsi.
- Booking creation berfungsi.
- Double booking dicegah.
- Ownership isolation berfungsi.
- Error handling tersedia.
- Backend tests berhasil.

## 8. Testing Requirements

Test minimal:

| Test                  | Expected                                 |
| --------------------- | ---------------------------------------- |
| Register              | Success                                  |
| Duplicate email       | Rejected                                 |
| Invalid login         | Rejected                                 |
| Unauthorized API      | 401                                      |
| Other business access | 403/404                                  |
| Create service        | Success                                  |
| Invalid service       | Rejected                                 |
| Available slots       | Correct                                  |
| Overlapping booking   | Rejected                                 |
| Concurrent booking    | At most one conflicting booking succeeds |
| Cancel booking        | Slot released                            |
| Timezone conversion   | Correct                                  |

## 9. Git Checkpoint

```
git add .
git commit -m "phase 6: backend implementation"
```

# PHASE 7 — Frontend & Backend Integration

End-to-End Integration

## 1. Phase Objective

Menghubungkan seluruh frontend BookEase dengan backend production implementation.

Semua mock service yang digunakan untuk core features harus diganti dengan service nyata.

## 2. Scope of Work

- API client.
- Authentication integration.
- Business data fetching.
- Service CRUD integration.
- Staff CRUD integration.
- Schedule integration.
- Booking availability integration.
- Booking submission.
- Dashboard integration.
- Error mapping.
- Loading states.
- Data synchronization.

## 3. Detailed Implementation Steps

### Step 1 — Create API Client

Gunakan native `fetch` sebagai default.

Axios tidak wajib karena Next.js sudah mendukung fetch.

Buat:

```
src/lib/api-client.ts
```

Implementasikan:

- Base URL.
- Headers.
- Error handling.
- JSON parsing.
- Credentials handling bila diperlukan.

### Step 2 — Replace Authentication Mock

Hubungkan:

- Register.
- Login.
- Logout.
- Session.
- Protected routes.

### Step 3 — Replace Business Mock

Hubungkan:

- Business profile.
- Business update.
- Slug validation.

### Step 4 — Replace Service Mock

Hubungkan:

- List services.
- Create service.
- Update service.
- Deactivate service.

### Step 5 — Replace Staff Mock

Hubungkan:

- List staff.
- Create staff.
- Update staff.
- Service assignment.

### Step 6 — Replace Schedule Mock

Hubungkan:

- Get schedule.
- Update schedule.
- Closed days.

### Step 7 — Replace Booking Mock

Hubungkan:

- Booking list.
- Booking detail.
- Booking status update.
- Booking cancellation.

### Step 8 — Integrate Availability

Saat pelanggan memilih tanggal:

1. Request availability.
2. Tampilkan loading.
3. Tampilkan slot.
4. Jika tidak ada slot, tampilkan empty state.
5. Jika API error, tampilkan retry.

### Step 9 — Integrate Booking Submission

Saat pelanggan submit:

1. Validate form.
2. Submit request.
3. Handle loading.
4. Handle success.
5. Handle HTTP 409.
6. Redirect ke success page.

### Step 10 — Remove Mock Data

Hapus mock service production references.

Pertahankan hanya mock yang dibutuhkan oleh test atau Storybook jika ada.

Update:

`MOCK_DATA.md`

Tandai seluruh mock core features sebagai sudah diganti atau dihapus.

### Step 11 — Verify End-to-End Flow

Test dua aktor:

Business owner:

- Login.
- Configure business.
- Add service.
- Add staff.
- Configure hours.
- View booking.

Customer:

- Open booking page.
- Select service.
- Select staff.
- Select date.
- Select slot.
- Submit details.
- Receive confirmation.

## 4. Required Commands

```
npm run dev
npm run build
npm run lint
npx tsc --noEmit
npx prisma studio
```

## 5. AI Coding Assistant Prompt

# PHASE 7 — FRONTEND BACKEND INTEGRATION

Kamu bertindak sebagai Senior Fullstack Engineer.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- UI_UX_GUIDE.md
- MOCK_DATA.md

## Objective

Mengintegrasikan frontend dan backend agar seluruh core MVP bekerja end-to-end.

## Tasks

1. Buat API client.
2. Integrasikan authentication.
3. Integrasikan business profile.
4. Integrasikan service management.
5. Integrasikan staff management.
6. Integrasikan operating hours.
7. Integrasikan dashboard data.
8. Integrasikan booking list.
9. Integrasikan booking detail.
10. Integrasikan availability endpoint.
11. Integrasikan booking submission.
12. Integrasikan booking cancellation.
13. Implementasikan error mapping.
14. Implementasikan loading states.
15. Implementasikan empty states.
16. Implementasikan retry behavior bila relevan.
17. Hapus mock service yang sudah tidak dibutuhkan.
18. Update MOCK_DATA.md.

## Integration Rules

- Gunakan native fetch.
- Jangan menggunakan Axios tanpa kebutuhan khusus.
- Jangan mengakses database langsung dari Client Components.
- Semua data sensitif harus diproses di server.
- Jangan hardcode API response.
- Jangan mengabaikan HTTP error.
- Jangan menyimpan credential dalam localStorage.
- Jangan menampilkan data lintas business.

## Critical Flow

Business:\
Login → Business Setup → Services → Staff → Schedule → Dashboard.

Customer:\
Public Booking → Service → Staff → Date → Time → Customer Details → Submit → Confirmation.

## Booking Conflict Handling

Jika server mengembalikan HTTP 409:

- Jangan menganggap booking berhasil.
- Berikan pesan yang jelas.
- Refresh availability.
- Minta pelanggan memilih slot lain.
- Pertahankan data form yang tidak bermasalah jika memungkinkan.

## Restrictions

- Jangan menambahkan fitur P1/P2.
- Jangan membuat payment.
- Jangan membuat WhatsApp integration.
- Jangan mengubah database architecture tanpa persetujuan.
- Jangan melanjutkan Phase 8.

## Acceptance Criteria

Seluruh core flow harus bekerja menggunakan database nyata.

Tidak ada mock service yang digunakan untuk menggantikan core production functionality.

## Verification

Lakukan end-to-end manual test.

Jalankan build, lint, dan typecheck.

## Final Report

Laporkan seluruh integrasi, mock yang dihapus, endpoint yang digunakan, error yang ditemukan, dan hasil pengujian end-to-end.

## 6. Expected Deliverables

- API client.
- Integrated frontend.
- Authentication integration.
- Real data fetching.
- Real form submission.
- Removed mock production dependencies.
- Updated `MOCK_DATA.md`.

## 7. Acceptance Criteria

- Authentication integration berjalan.
- Business profile terintegrasi.
- Service CRUD terintegrasi.
- Staff CRUD terintegrasi.
- Schedule terintegrasi.
- Dashboard menggunakan data database.
- Availability menggunakan backend.
- Booking submission berhasil.
- Booking confirmation benar.
- Booking conflict ditangani.
- Mock core features dihapus.
- Seluruh core user flow berjalan.

## 8. Testing Requirements

Lakukan manual end-to-end testing:

| Scenario         | Expected            |
| ---------------- | ------------------- |
| Owner login      | Dashboard terbuka   |
| Add service      | Tersimpan           |
| Add staff        | Tersimpan           |
| Update schedule  | Tersimpan           |
| Open public page | Data benar          |
| Select service   | Berhasil            |
| Select slot      | Berhasil            |
| Submit booking   | Booking tersimpan   |
| Double booking   | Ditolak             |
| Cancel booking   | Status berubah      |
| Reload page      | Data tetap tersedia |

## 9. Git Checkpoint

```
git add .
git commit -m "phase 7: frontend backend integration"
```

# PHASE 8 — Additional Features & Product Completion

Product Completion

## 1. Phase Objective

Mengimplementasikan fitur P1 yang meningkatkan pengalaman penggunaan BookEase.

Core MVP harus sudah stabil sebelum memasuki phase ini.

## 2. Scope of Work

Fitur P1 yang dipilih untuk MVP completion:

1. Email confirmation.
2. Booking cancellation oleh pelanggan.
3. Booking search.
4. Calendar view sederhana.
5. Dashboard statistics.
6. Booking buffer time.
7. SEO.
8. Accessibility improvements.

Fitur yang membutuhkan integrasi eksternal yang belum siap boleh ditunda, tetapi harus dicatat secara eksplisit.

## 3. Detailed Implementation Steps

### Step 1 — Email Confirmation

Gunakan Resend.

Install:

```
npm install resend
```

Implementasikan:

- Booking confirmation email.
- Business notification email jika dibutuhkan.
- Email template.
- Email delivery logging.

Jangan membuat booking gagal hanya karena pengiriman email gagal setelah transaksi booking berhasil.

### Step 2 — Customer Cancellation

Sediakan cancellation URL dengan token acak yang aman.

Aturan:

- Token tidak boleh berupa booking ID.
- Token disimpan dalam bentuk hash.
- Token memiliki masa berlaku.
- Booking yang sudah completed tidak dapat dibatalkan.
- Cancellation memeriksa kebijakan waktu pembatalan.

### Step 3 — Booking Search

Implementasikan:

- Search customer name.
- Search booking reference.
- Filter status.
- Filter date.

Gunakan pagination.

### Step 4 — Calendar View

Tampilkan:

- Daily view.
- Weekly view sederhana.
- Booking status.
- Booking time.
- Assigned staff.

Tidak perlu membuat kalender kompleks seperti Google Calendar.

### Step 5 — Dashboard Statistics

Statistik:

- Total booking.
- Today's bookings.
- Upcoming bookings.
- Completed bookings.
- Cancelled bookings.

Gunakan database query.

### Step 6 — Booking Buffer Time

Owner dapat menentukan jeda antarbooking.

Contoh:

```
Service duration: 60 minutes
Buffer time: 15 minutes
Occupied period: 75 minutes
```

Buffer harus diperhitungkan dalam availability dan concurrency protection.

### Step 7 — SEO

Implementasikan:

- Metadata.
- Open Graph.
- Dynamic business page title.
- Meta description.
- Canonical URL jika diperlukan.
- Sitemap.
- Robots configuration.

Halaman dashboard dan halaman yang mengandung data privat tidak boleh diindeks.

### Step 8 — Accessibility

Periksa:

- Keyboard navigation.
- Input labels.
- Dialog focus.
- Button labels.
- Contrast.
- Focus indicators.
- Screen reader compatibility.

### Step 9 — Product Polish

Perbaiki:

- Empty states.
- Success messages.
- Error messages.
- Form feedback.
- Responsive spacing.
- Navigation behavior.

## 4. Required Commands

```
npm install resend
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

Install Resend hanya jika email confirmation benar-benar diimplementasikan.

## 5. AI Coding Assistant Prompt

# PHASE 8 — ADDITIONAL FEATURES & PRODUCT COMPLETION

Kamu bertindak sebagai Senior Product Engineer.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- UI_UX_GUIDE.md

## Objective

Menyelesaikan fitur pendukung P1 tanpa memperluas scope ke P2.

## Tasks

1. Implementasikan email confirmation.
2. Implementasikan customer cancellation.
3. Implementasikan secure cancellation token.
4. Implementasikan booking search.
5. Implementasikan booking filters.
6. Implementasikan pagination.
7. Implementasikan calendar view sederhana.
8. Implementasikan dashboard statistics.
9. Implementasikan booking buffer time.
10. Implementasikan SEO.
11. Implementasikan accessibility improvements.
12. Perbaiki UX seluruh core flow.

## Important Requirements

Email:

- Gunakan Resend.
- Jangan membocorkan API key.
- Email failure tidak boleh membatalkan booking yang sudah tersimpan.
- Log delivery failures.

Cancellation:

- Gunakan secure random token.
- Simpan hash token.
- Batasi masa berlaku.
- Validasi status booking.
- Pastikan pembatalan atomik.

Search:

- Server-side search.
- Pagination.
- Business ownership validation.

Buffer:

- Perhitungkan dalam slot calculation.
- Perhitungkan dalam booking conflict protection.
- Jangan hanya menerapkan buffer di frontend.

SEO:

- Public pages boleh diindeks.
- Dashboard harus noindex.
- Jangan mengekspos informasi pelanggan.

## Restrictions

- Jangan membuat payment.
- Jangan membuat subscription billing.
- Jangan membuat multi-branch.
- Jangan membuat WhatsApp integration.
- Jangan membuat customer accounts.
- Jangan mengimplementasikan fitur P2.
- Jangan mengubah arsitektur tanpa alasan dan persetujuan.
- Jangan melanjutkan Phase 9.

## Expected Deliverables

Fitur P1 yang selesai, dokumentasi konfigurasi tambahan, dan UX improvements.

## Acceptance Criteria

Seluruh fitur yang dipilih dapat diuji dan tidak merusak core booking flow.

## Verification

Jalankan build, lint, typecheck, dan test terkait.

## Final Report

Laporkan fitur P1 yang selesai, fitur yang ditunda, dependency, environment variables, dan hasil testing aktual.

## 6. Expected Deliverables

- Email confirmation.
- Cancellation flow.
- Search.
- Calendar view.
- Dashboard statistics.
- Buffer time.
- SEO metadata.
- Accessibility improvements.

## 7. Acceptance Criteria

- Email confirmation berfungsi jika provider aktif.
- Email failure tidak merusak booking.
- Cancellation token aman.
- Customer cancellation berjalan.
- Booking search berjalan.
- Pagination berjalan.
- Calendar view berjalan.
- Dashboard statistics akurat.
- Buffer time dihitung backend.
- SEO tersedia.
- Dashboard noindex.
- Accessibility diperbaiki.

## 8. Testing Requirements

- Test email success/failure.
- Test cancellation token.
- Test expired token.
- Test booking cancellation.
- Test search.
- Test pagination.
- Test buffer time.
- Test SEO metadata.
- Test responsive.
- Test keyboard navigation.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 8: additional features"
```

# PHASE 9 — Testing, Security & Optimization

Quality Assurance

## 1. Phase Objective

Melakukan validasi menyeluruh terhadap BookEase sebelum production deployment.

Output utama:

`TEST_REPORT.md`

Tidak boleh menambahkan fitur baru.

## 2. Scope of Work

- Functional testing.
- Integration testing.
- End-to-end testing.
- Database testing.
- Booking concurrency testing.
- Authentication testing.
- Authorization testing.
- Security audit.
- Performance optimization.
- Responsive testing.
- Browser compatibility.
- Build verification.
- Bug fixing.

## 3. Detailed Implementation Steps

### Step 1 — Review Dependencies

```
npm audit
```

Review:

- Vulnerable dependencies.
- Unused dependencies.
- Outdated dependencies.
- Unnecessary packages.

Jangan melakukan major dependency upgrade tanpa evaluasi kompatibilitas.

### Step 2 — Type Checking

```
npx tsc --noEmit
```

Pastikan tidak ada TypeScript errors.

### Step 3 — Linting

```
npm run lint
```

Perbaiki:

- ESLint errors.
- React hooks issues.
- Unused imports.
- Invalid dependencies.

### Step 4 — Unit Testing

Gunakan Vitest jika belum ada test runner.

```
npm install -D vitest @vitejs/plugin-react
```

Test:

- Booking overlap.
- Availability calculations.
- Status transitions.
- Validation.
- Timezone conversion.
- Cancellation rules.

### Step 5 — Integration Testing

Test:

- Authentication.
- Database.
- Business CRUD.
- Service CRUD.
- Staff CRUD.
- Schedule.
- Booking creation.
- Booking cancellation.

### Step 6 — End-to-End Testing

Gunakan Playwright.

```
npm install -D @playwright/test
npx playwright install
```

Test:

1. Register.
2. Login.
3. Configure business.
4. Add service.
5. Add staff.
6. Configure schedule.
7. Open public booking page.
8. Create booking.
9. View booking dashboard.
10. Update booking status.
11. Cancel booking.

### Step 7 — Concurrency Testing

Simulasikan dua request booking pada resource dan waktu yang sama.

Expected:

- Maksimal satu booking yang konflik berhasil.
- Request lainnya menerima HTTP 409.
- Tidak ada duplicate active booking.

Uji juga:

- Cancellation bersamaan dengan booking baru.
- Any Available staff allocation.
- Buffer time overlap.

### Step 8 — Security Audit

Periksa:

- Authentication bypass.
- Business IDOR.
- Unauthorized API access.
- SQL injection exposure.
- XSS.
- CSRF.
- Rate limiting.
- Environment secrets.
- Sensitive data leakage.
- Cancellation token security.
- Session handling.

### Step 9 — Performance Audit

Periksa:

- Lighthouse.
- Bundle size.
- Database query.
- N+1 query.
- Image optimization.
- Server rendering.
- Pagination.
- API latency.

### Step 10 — Responsive Testing

Test viewport:

| Device       | Viewport    |
| ------------ | ----------- |
| Mobile       | 375 × 812   |
| Mobile Large | 430 × 932   |
| Tablet       | 768 × 1024  |
| Laptop       | 1366 × 768  |
| Desktop      | 1920 × 1080 |

### Step 11 — Generate Test Report

Buat:

`TEST_REPORT.md`

Format:

```
# Test Report

## Project
BookEase

## Environment
Development / Staging

## Test Summary
Total tests:
Passed:
Failed:
Skipped:

## Functional Testing

## Integration Testing

## E2E Testing

## Security Testing

## Performance Testing

## Responsive Testing

## Known Issues

## Recommendations

## Final Status
PASS / FAIL
```

Jangan mengarang angka atau hasil pengujian.

## 4. Required Commands

```
npm run lint
npx tsc --noEmit
npm run build
npm audit
npx vitest run
npx playwright test
```

Command test dijalankan sesuai script yang telah dikonfigurasi. Jangan menganggap Vitest atau Playwright tersedia sebelum diinstal dan disiapkan.

## 5. AI Coding Assistant Prompt

# PHASE 9 — TESTING, SECURITY & OPTIMIZATION

Kamu bertindak sebagai Senior QA Engineer dan Application Security Engineer.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- UI_UX_GUIDE.md

## Objective

Memvalidasi seluruh aplikasi sebelum deployment.

Buat TEST_REPORT.md.

## Tasks

1. Review seluruh fitur P0.
2. Review seluruh fitur P1 yang diimplementasikan.
3. Jalankan TypeScript check.
4. Jalankan lint.
5. Jalankan production build.
6. Jalankan unit tests.
7. Jalankan integration tests.
8. Jalankan E2E tests.
9. Jalankan booking concurrency tests.
10. Review database constraints.
11. Review authentication.
12. Review authorization.
13. Review business ownership isolation.
14. Review cancellation token.
15. Review API security.
16. Review environment variables.
17. Review performance.
18. Review responsive behavior.
19. Review accessibility.
20. Perbaiki bug yang ditemukan.
21. Buat TEST_REPORT.md.

## Critical Tests

Booking:

- Same staff, same time.
- Same staff, overlapping time.
- Different staff, same time.
- Concurrent requests.
- Cancelled booking.
- Buffer time.
- Timezone boundaries.

Security:

- Unauthorized access.
- Cross-business access.
- IDOR.
- Sensitive data exposure.
- Rate limiting.
- Session handling.

## Testing Rules

- Jangan mengarang test result.
- Jangan menandai test passed tanpa menjalankannya.
- Catat skipped tests.
- Catat known issues.
- Pisahkan critical, high, medium, low severity.
- Jangan menghapus test untuk membuat build terlihat berhasil.

## Restrictions

- Jangan menambahkan fitur baru.
- Jangan memperluas product scope.
- Jangan melakukan major architecture rewrite.
- Fokus pada bug fixing, security, testing, dan optimization.
- Jangan melanjutkan Phase 10.

## Expected Deliverables

- TEST_REPORT.md.
- Test coverage untuk core features.
- Bug fixes.
- Security findings.
- Performance findings.

## Acceptance Criteria

Tidak ada critical blocker yang diketahui.

Seluruh core booking flow telah diuji.

Seluruh test result tercatat secara aktual.

Production build berhasil.

## Final Report

Laporkan:

1. Total test.
2. Passed.
3. Failed.
4. Skipped.
5. Security findings.
6. Performance findings.
7. Fixed bugs.
8. Known issues.
9. Production readiness recommendation.

## 6. Expected Deliverables

- `TEST_REPORT.md`
- Unit tests.
- Integration tests.
- E2E tests.
- Security audit.
- Performance report.
- Bug fixes.

## 7. Acceptance Criteria

- Build berhasil.
- Typecheck berhasil.
- Lint berhasil.
- Core tests berhasil.
- E2E core flow berhasil.
- Booking concurrency berhasil diuji.
- Security audit dilakukan.
- Responsive testing selesai.
- Critical bug tidak tersisa.
- `TEST_REPORT.md` tersedia.

## 8. Testing Requirements

Seluruh test yang relevan wajib dijalankan dan hasilnya dicatat.

Production deployment tidak boleh dilanjutkan jika masih ada critical security issue atau booking consistency failure.

## 9. Git Checkpoint

```
git add .
git commit -m "phase 9: testing and optimization"
```

# PHASE 10 — Production Deployment & Release

Production Release

## 1. Phase Objective

Melakukan konfigurasi production, deployment, domain, HTTPS, database, monitoring, dan final release BookEase.

Output utama:

- `DEPLOYMENT_GUIDE.md`
- `RELEASE_NOTES.md`

## 2. Scope of Work

- Production configuration.
- Environment variables.
- Database production.
- Hosting.
- Domain.
- DNS.
- HTTPS.
- Database migration.
- Build.
- Monitoring.
- Backup.
- Smoke testing.
- Release notes.

## 3. Deployment Architecture

Recommended MVP Deployment

Gunakan managed deployment:

\#chatgpt-mermaid-\_r_1i8\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1i8\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1i8\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1i8\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1i8\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1i8\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1i8\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1i8\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1i8\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1i8\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1i8\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1i8\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_1i8\_ p{margin:0;}#chatgpt-mermaid-\_r_1i8\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1i8\_ .label text,#chatgpt-mermaid-\_r_1i8\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ .node rect,#chatgpt-mermaid-\_r_1i8\_ .node circle,#chatgpt-mermaid-\_r_1i8\_ .node ellipse,#chatgpt-mermaid-\_r_1i8\_ .node polygon,#chatgpt-mermaid-\_r_1i8\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .rough-node .label text,#chatgpt-mermaid-\_r_1i8\_ .node .label text,#chatgpt-mermaid-\_r_1i8\_ .image-shape .label,#chatgpt-mermaid-\_r_1i8\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1i8\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .rough-node .label,#chatgpt-mermaid-\_r_1i8\_ .node .label,#chatgpt-mermaid-\_r_1i8\_ .image-shape .label,#chatgpt-mermaid-\_r_1i8\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1i8\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1i8\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1i8\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1i8\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_1i8\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1i8\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1i8\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1i8\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_1i8\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1i8\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1i8\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1i8\_ .icon-shape,#chatgpt-mermaid-\_r_1i8\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1i8\_ .icon-shape p,#chatgpt-mermaid-\_r_1i8\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_1i8\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1i8\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1i8\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1i8\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1i8\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1i8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1i8\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1i8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1i8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1i8\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1i8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1i8\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_1i8\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_1i8\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1i8\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1i8\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .node rect,#chatgpt-mermaid-\_r_1i8\_ .node circle,#chatgpt-mermaid-\_r_1i8\_ .node ellipse,#chatgpt-mermaid-\_r_1i8\_ .node polygon,#chatgpt-mermaid-\_r_1i8\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1i8\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1i8\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_1i8\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1i8\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1i8\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}User BrowserDNS / CDNVercelNext.js ApplicationSupabase PostgreSQLResendDeveloperGitHub Repository

### Recommended Services

| Component          | Service                         |
| ------------------ | ------------------------------- |
| Frontend + Backend | Vercel                          |
| Database           | Supabase PostgreSQL             |
| Email              | Resend                          |
| Repository         | GitHub                          |
| CI/CD              | GitHub Actions / Vercel         |
| DNS                | Cloudflare                      |
| Monitoring         | Hosting logs + error monitoring |

Vercel dan Supabase dipilih untuk menyederhanakan operasional MVP.

VPS + Docker dapat menjadi alternatif apabila membutuhkan kontrol infrastruktur lebih besar. Tidak perlu menjalankan keduanya sekaligus.

## 4. Detailed Implementation Steps

### Step 1 — Prepare Production Environment

Siapkan:

- GitHub repository.
- Vercel project.
- Supabase production database.
- Resend account jika email digunakan.
- Domain.

### Step 2 — Configure Environment Variables

Contoh:

```
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
```

Gunakan production secrets yang berbeda dari development.

Pastikan `DATABASE_URL` menggunakan koneksi pooled atau koneksi yang sesuai dengan deployment runtime.

Jika menggunakan direct connection khusus migration, pisahkan dari runtime connection.

### Step 3 — Configure Database

1. Buat production database.
2. Verifikasi PostgreSQL version.
3. Konfigurasi database access.
4. Periksa connection pooling.
5. Siapkan backup.
6. Jalankan migration.

```
npx prisma migrate deploy
npx prisma generate
```

Jangan menggunakan:

```
npx prisma migrate dev
```

pada production.

### Step 4 — Deploy Next.js

Push repository:

```
git push origin main
```

Hubungkan repository dengan Vercel.

Konfigurasi:

- Framework preset: Next.js.
- Root directory: project root.
- Build command: default Next.js build.
- Environment variables: production.

### Step 5 — Configure Domain

Contoh:

```
bookease.com
www.bookease.com
```

Atur DNS sesuai instruksi hosting.

### Step 6 — Configure HTTPS

Pastikan:

- HTTPS aktif.
- HTTP redirect ke HTTPS.
- Cookie secure pada production.
- Public booking page menggunakan HTTPS.

### Step 7 — Configure Email

Jika menggunakan Resend:

- Verifikasi domain.
- Setup SPF.
- Setup DKIM.
- Konfigurasi sender.
- Test delivery.

### Step 8 — Configure Monitoring

Minimal monitoring:

- Application error logs.
- Database health.
- Deployment status.
- Email delivery errors.
- Booking API errors.

Tambahkan error monitoring provider jika dibutuhkan.

### Step 9 — Configure Backup

- Aktifkan managed database backup.
- Tentukan retention.
- Dokumentasikan restore procedure.
- Lakukan uji restore jika memungkinkan.

### Step 10 — Production Smoke Test

Test:

- Homepage.
- Register.
- Login.
- Dashboard.
- Create service.
- Create staff.
- Operating hours.
- Public booking page.
- Available slots.
- Create booking.
- Booking dashboard.
- Cancellation.
- Email delivery.

Gunakan akun testing dan data dummy.

### Step 11 — Generate Deployment Documentation

Buat `DEPLOYMENT_GUIDE.md`.

Isi:

1. Architecture.
2. Hosting configuration.
3. Database setup.
4. Environment variables.
5. Domain setup.
6. DNS setup.
7. HTTPS.
8. Deployment procedure.
9. Migration procedure.
10. Backup.
11. Restore.
12. Monitoring.
13. Troubleshooting.
14. Rollback.

### Step 12 — Generate Release Notes

Buat `RELEASE_NOTES.md`.

Isi:

- Product overview.
- Features implemented.
- Known limitations.
- Deployment version.
- Release date.
- Future roadmap.

## 5. Alternative Deployment — VPS + Docker

Jika ingin mengelola infrastruktur sendiri, arsitektur alternatif:

\#chatgpt-mermaid-\_r_1j6\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1j6\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1j6\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1j6\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1j6\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1j6\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1j6\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1j6\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1j6\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1j6\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1j6\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1j6\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_1j6\_ p{margin:0;}#chatgpt-mermaid-\_r_1j6\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1j6\_ .label text,#chatgpt-mermaid-\_r_1j6\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ .node rect,#chatgpt-mermaid-\_r_1j6\_ .node circle,#chatgpt-mermaid-\_r_1j6\_ .node ellipse,#chatgpt-mermaid-\_r_1j6\_ .node polygon,#chatgpt-mermaid-\_r_1j6\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .rough-node .label text,#chatgpt-mermaid-\_r_1j6\_ .node .label text,#chatgpt-mermaid-\_r_1j6\_ .image-shape .label,#chatgpt-mermaid-\_r_1j6\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1j6\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .rough-node .label,#chatgpt-mermaid-\_r_1j6\_ .node .label,#chatgpt-mermaid-\_r_1j6\_ .image-shape .label,#chatgpt-mermaid-\_r_1j6\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1j6\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1j6\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1j6\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1j6\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_1j6\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1j6\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1j6\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1j6\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_1j6\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1j6\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1j6\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1j6\_ .icon-shape,#chatgpt-mermaid-\_r_1j6\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1j6\_ .icon-shape p,#chatgpt-mermaid-\_r_1j6\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_1j6\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1j6\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1j6\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1j6\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1j6\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1j6\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1j6\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1j6\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1j6\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1j6\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1j6\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1j6\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_1j6\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_1j6\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1j6\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1j6\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .node rect,#chatgpt-mermaid-\_r_1j6\_ .node circle,#chatgpt-mermaid-\_r_1j6\_ .node ellipse,#chatgpt-mermaid-\_r_1j6\_ .node polygon,#chatgpt-mermaid-\_r_1j6\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1j6\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1j6\_ .mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_1j6\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1j6\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1j6\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}UserCloudflare DNSNginx / CaddyNext.js ContainerPostgreSQLResendDeveloperDocker Deployment

Gunakan Docker hanya jika dibutuhkan.

Contoh Dockerfile:

```
FROM node:22-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

Pastikan `output: "standalone"` dikonfigurasi dan kompatibel dengan versi Next.js yang digunakan.

Jangan memasukkan environment secrets ke image.

## 6. Required Commands

```
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
git push origin main
```

Untuk VPS:

```
docker build -t bookease .
docker run -p 3000:3000 bookease
```

Command Docker hanya digunakan jika memilih deployment VPS.

## 7. AI Coding Assistant Prompt

# PHASE 10 — PRODUCTION DEPLOYMENT & RELEASE

Kamu bertindak sebagai Senior DevOps Engineer dan Release Manager.

Project: BookEase

Baca:

- PROJECT_PRD_AND_PLAYBOOK.md
- TECHNICAL_PLAN.md
- TEST_REPORT.md

## Objective

Menyiapkan dan melakukan production deployment BookEase.

Buat:

- DEPLOYMENT_GUIDE.md
- RELEASE_NOTES.md

## Tasks

1. Review production architecture.
2. Review production build.
3. Configure environment variables.
4. Configure PostgreSQL production.
5. Configure Prisma production migrations.
6. Configure Vercel deployment.
7. Configure domain.
8. Configure DNS.
9. Verify HTTPS.
10. Configure email provider jika digunakan.
11. Configure monitoring.
12. Configure database backup.
13. Document restore procedure.
14. Perform production smoke tests.
15. Create DEPLOYMENT_GUIDE.md.
16. Create RELEASE_NOTES.md.

## Deployment Rules

Recommended architecture:

- Vercel for Next.js.
- Supabase PostgreSQL.
- Resend for email.
- GitHub for source control.

VPS + Docker hanya digunakan jika developer memilih alternatif tersebut.

Jangan menggunakan:

- Rust.
- Tauri.
- Desktop application deployment.
- Kubernetes.
- Unnecessary microservices.

## Database Rules

- Gunakan prisma migrate deploy.
- Jangan gunakan prisma migrate dev di production.
- Jangan menjalankan destructive migration tanpa backup dan approval.
- Verifikasi connection pooling.
- Jangan mengekspos database credentials.

## Security Rules

- HTTPS wajib.
- Production secrets harus aman.
- Secure cookies.
- Database access dibatasi.
- Jangan memasukkan secrets ke Git.
- Pastikan dashboard tidak dapat diakses publik tanpa autentikasi.

## Smoke Test

Uji:

- Homepage.
- Registration.
- Login.
- Business profile.
- Services.
- Staff.
- Schedule.
- Public booking.
- Booking creation.
- Booking management.
- Cancellation.
- Email delivery.

## Expected Deliverables

DEPLOYMENT_GUIDE.md:

- Infrastructure.
- Environment variables.
- Database.
- Deployment.
- Domain.
- DNS.
- HTTPS.
- Monitoring.
- Backup.
- Restore.
- Rollback.
- Troubleshooting.

RELEASE_NOTES.md:

- Release version.
- Features.
- Improvements.
- Known limitations.
- Roadmap.

## Restrictions

- Jangan mengklaim deployment berhasil sebelum diverifikasi.
- Jangan mengarang domain.
- Jangan mengarang deployment URL.
- Jangan menghapus production database.
- Jangan melakukan destructive migration tanpa approval.
- Jangan menambahkan fitur baru.

## Acceptance Criteria

- Production build berhasil.
- Production database terhubung.
- Migration berhasil.
- HTTPS aktif.
- Smoke test berhasil.
- Backup strategy terdokumentasi.
- Deployment documentation tersedia.
- Release notes tersedia.

## Final Report

Laporkan:

1. Production architecture.
2. Hosting provider.
3. Deployment URL aktual.
4. Database status.
5. Migration status.
6. HTTPS status.
7. Smoke test results.
8. Monitoring.
9. Backup.
10. Known issues.
11. Release version.

Jika deployment belum dilakukan, jelaskan langkah yang masih membutuhkan tindakan developer.

## 8. Expected Deliverables

- Production application.
- Production database.
- Domain.
- HTTPS.
- Monitoring.
- Backup configuration.
- `DEPLOYMENT_GUIDE.md`
- `RELEASE_NOTES.md`

## 9. Acceptance Criteria

- Production build berhasil.
- Environment variables aman.
- Database production aktif.
- Migration berhasil.
- Deployment berhasil.
- Domain terhubung.
- HTTPS aktif.
- Email berjalan jika diaktifkan.
- Backup tersedia.
- Monitoring tersedia.
- Smoke test berhasil.
- Deployment guide tersedia.
- Release notes tersedia.

## 10. Testing Requirements

Lakukan smoke testing pada production.

Jangan menggunakan data pelanggan nyata untuk testing.

Pastikan booking test dapat dibersihkan atau dianonimkan sesuai prosedur.

## 11. Git Checkpoint

```
git add .
git commit -m "phase 10: production deployment"
git push origin main
```

10 Phases Defined

# PART C — GLOBAL AI CODING RULES

Bagian ini merupakan aturan global yang berlaku pada seluruh phase development BookEase.

## C.1 Project Context

Setiap AI Coding Assistant harus memahami konteks berikut:

```
Project: BookEase

Product:
Online Booking & Appointment Management SaaS.

Platform:
Web Application.

Target Users:
Business Owners, Staff, Public Customers.

Tech Stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma
- Auth.js
- React Hook Form
- Zod

Architecture:
Modular Monolith.

Development:
Solo Developer + AI Coding Assistant.

Priority:
MVP First.
```

## C.2 Mandatory Working Rules

1. Selalu membaca PRD sebelum melakukan perubahan.
2. Membaca `TECHNICAL_PLAN.md` setelah Phase 2.
3. Membaca `UI_UX_GUIDE.md` setelah Phase 3.
4. Memeriksa kondisi repository sebelum mengedit file.
5. Tidak menghapus kode tanpa alasan.
6. Tidak mengubah teknologi utama tanpa persetujuan.
7. Tidak menambahkan dependency tanpa kebutuhan.
8. Tidak membuat fitur di luar phase.
9. Tidak membuat mock production setelah Phase 7.
10. Tidak mengarang hasil testing.
11. Tidak mengabaikan TypeScript errors.
12. Tidak mengabaikan lint errors.
13. Tidak menyimpan secret dalam source code.
14. Tidak mengakses database langsung dari Client Components.
15. Tidak mengandalkan frontend untuk security.
16. Tidak membuat commit sebelum review.
17. Tidak melanjutkan phase berikutnya secara otomatis.

## C.3 Architecture Rules

Frontend

- Gunakan Server Components secara default.
- Gunakan Client Components jika membutuhkan interaksi.
- Hindari penggunaan `useEffect` untuk data fetching yang sebenarnya dapat dilakukan di server.
- Pisahkan feature components dari shared components.
- Gunakan reusable components secara proporsional.

Backend

- Gunakan Route Handlers.
- Validasi request menggunakan Zod.
- Pisahkan business logic dari HTTP handlers.
- Gunakan Prisma untuk akses database.
- Pastikan authorization di server.

Database

- Gunakan PostgreSQL.
- Gunakan Prisma migrations.
- Gunakan foreign keys.
- Gunakan unique constraints.
- Gunakan database transactions untuk operasi booking.
- Hindari query yang tidak memiliki filter business ownership.

State Management

- React state untuk local UI.
- Zustand hanya untuk shared client state yang memang dibutuhkan.
- Database menjadi source of truth untuk server data.

## C.4 Naming Convention

| Item           | Convention       | Example               |
| -------------- | ---------------- | --------------------- |
| Component      | PascalCase       | `BookingCard.tsx`     |
| Hook           | camelCase        | `useBooking.ts`       |
| Function       | camelCase        | `createBooking()`     |
| Variable       | camelCase        | `bookingData`         |
| Constant       | UPPER_SNAKE_CASE | `MAX_BOOKING_LIMIT`   |
| Type           | PascalCase       | `BookingStatus`       |
| Interface      | PascalCase       | `BusinessProfile`     |
| Route          | kebab-case       | `/dashboard/bookings` |
| Database model | PascalCase       | `OperatingHour`       |

## C.5 File Organization Rules

Jangan membuat satu file berisi terlalu banyak tanggung jawab.

Contoh yang direkomendasikan:

```
features/bookings/
├── components/
│   ├── booking-table.tsx
│   ├── booking-card.tsx
│   └── booking-status-badge.tsx
│
├── services/
│   └── booking.service.ts
│
├── schemas/
│   └── booking.schema.ts
│
├── hooks/
│   └── use-bookings.ts
│
├── types/
│   └── booking.types.ts
│
└── utils/
    └── booking.utils.ts
```

Tidak semua folder wajib dibuat. Buat hanya jika diperlukan.

## C.6 AI Phase Completion Report

Setiap AI Coding Assistant wajib memberikan laporan menggunakan format:

```
# PHASE COMPLETION REPORT

Project:
BookEase

Phase:
Phase X

Status:
COMPLETED / PARTIALLY COMPLETED / BLOCKED

## 1. Summary

Ringkasan pekerjaan.

## 2. Files Created

Daftar file baru.

## 3. Files Modified

Daftar file yang diubah.

## 4. Dependencies

Dependency yang ditambahkan/dihapus.

## 5. Implementation Details

Penjelasan implementasi.

## 6. Testing Results

| Test | Result |
|---|---|
| Build | PASS/FAIL/NOT RUN |
| Lint | PASS/FAIL/NOT RUN |
| Typecheck | PASS/FAIL/NOT RUN |
| Unit Test | PASS/FAIL/NOT RUN |
| Manual Test | PASS/FAIL/NOT RUN |

## 7. Known Issues

Masalah yang masih ada.

## 8. Acceptance Criteria

Daftar kriteria yang terpenuhi.

## 9. Git Status

Status repository.

## 10. Recommendation

Apakah phase layak direview dan disetujui developer?
```

## C.7 Definition of Done

Sebuah phase dianggap selesai apabila:

- Seluruh scope telah dikerjakan.
- Acceptance criteria terpenuhi.
- Testing yang diwajibkan sudah dijalankan.
- Tidak ada error kritis.
- Dokumentasi diperbarui.
- File changes dilaporkan.
- Developer melakukan review.
- Git checkpoint dibuat.

# PART D — GIT & EXECUTION RULES

## D.1 Git Workflow

Gunakan branch `main` sebagai branch utama.

Untuk solo developer, gunakan branch phase agar perubahan mudah diperiksa dan dikembalikan.

Contoh:

```
git checkout -b phase/01-bootstrap
```

Setelah selesai:

```
git add .
git commit -m "phase 1: project bootstrap"
```

Jika sudah disetujui:

```
git checkout main
git merge phase/01-bootstrap
```

Untuk phase berikutnya:

```
git checkout -b phase/02-architecture
```

## D.2 Commit Convention

| Phase | Commit                                  |
| ----- | --------------------------------------- |
| 1     | `phase 1: project bootstrap`            |
| 2     | `phase 2: technical architecture`       |
| 3     | `phase 3: ui ux planning`               |
| 4     | `phase 4: frontend foundation`          |
| 5     | `phase 5: core frontend features`       |
| 6     | `phase 6: backend implementation`       |
| 7     | `phase 7: frontend backend integration` |
| 8     | `phase 8: additional features`          |
| 9     | `phase 9: testing and optimization`     |
| 10    | `phase 10: production deployment`       |

## D.3 Before Starting Each Phase

Jalankan:

```
git status
git log --oneline -5
```

Pastikan tidak ada perubahan sebelumnya yang belum diselesaikan.

## D.4 Before Committing

Jalankan:

```
npm run lint
npx tsc --noEmit
npm run build
```

Untuk phase yang memiliki testing tambahan:

```
npx vitest run
npx playwright test
```

Jalankan seluruh test yang diwajibkan oleh phase terkait.

Jangan commit jika:

- Testing wajib belum dijalankan.
- Ada error yang belum ditangani.
- Perubahan belum direview.
- Ada file environment secret yang ikut ter-stage.

## D.5 Rollback Strategy

Jika terjadi masalah:

Periksa commit:

```
git log --oneline
```

Rollback dengan revert:

```
git revert HEAD
```

Untuk perubahan yang belum di-commit, periksa terlebih dahulu:

```
git status
git diff
```

Jangan langsung menjalankan `git reset --hard` karena dapat menghilangkan pekerjaan yang belum disimpan.

## D.6 Phase Approval Protocol

| Phase    | Approval Required               |
| -------- | ------------------------------- |
| Phase 1  | Project bootstrap review        |
| Phase 2  | Architecture approval           |
| Phase 3  | UI/UX approval                  |
| Phase 4  | Frontend foundation review      |
| Phase 5  | Core UI approval                |
| Phase 6  | Backend and database approval   |
| Phase 7  | End-to-end integration approval |
| Phase 8  | Product completion approval     |
| Phase 9  | Production readiness approval   |
| Phase 10 | Release approval                |

Aturan utama: AI tidak memiliki otorisasi untuk otomatis berpindah phase.

# PART E — COMMAND CHEAT SHEET

## E.1 Development Commands

```
# Start development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Install dependencies
npm install

# Clean install
npm ci
```

## E.2 shadcn/ui Commands

```
# Initialize
npx shadcn@latest init

# Add components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add skeleton
```

## E.3 Prisma Commands

```
# Initialize Prisma
npx prisma init

# Generate client
npx prisma generate

# Development migration
npx prisma migrate dev --name init

# Production migration
npx prisma migrate deploy

# Open database studio
npx prisma studio

# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status
```

## E.4 Testing Commands

```
# Unit tests
npx vitest run

# Watch mode
npx vitest

# E2E tests
npx playwright test

# Open Playwright UI
npx playwright test --ui

# Security audit
npm audit
```

## E.5 Git Commands

```
# Initialize
git init

# Check status
git status

# Create branch
git checkout -b phase/01-bootstrap

# Stage
git add .

# Commit
git commit -m "phase 1: project bootstrap"

# View history
git log --oneline

# Push
git push origin main
```

## E.6 Database Connection Checklist

Sebelum menjalankan database migrations:

```
[ ] PostgreSQL instance aktif
[ ] DATABASE_URL benar
[ ] Database user memiliki permission
[ ] Connection pooling sesuai environment
[ ] Prisma schema valid
[ ] Migration telah direview
[ ] Backup tersedia untuk production migration
```

## E.7 Environment Variables Template

Development `.env.local`:

```
DATABASE_URL="postgresql://..."
AUTH_SECRET="development-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY=""
```

Production:

```
DATABASE_URL="production-database-url"
AUTH_SECRET="production-secret"
NEXT_PUBLIC_APP_URL="https://bookease.com"
RESEND_API_KEY="production-resend-key"
```

Jangan menggunakan contoh nilai tersebut sebagai production secret. Buat secret yang kuat dan unik.

# PART F — FINAL CHECKLIST & DOCUMENTATION

## F.1 Project Documentation Structure

Setelah seluruh phase selesai, struktur repository yang diharapkan:

```
bookease/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── server/
│   ├── stores/
│   ├── types/
│   └── constants/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── PROJECT_PRD_AND_PLAYBOOK.md
├── TECHNICAL_PLAN.md
├── UI_UX_GUIDE.md
├── MOCK_DATA.md
├── TEST_REPORT.md
├── DEPLOYMENT_GUIDE.md
├── RELEASE_NOTES.md
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

Catatan: Struktur final mengikuti implementasi aktual. File dan folder yang tidak diperlukan tidak wajib dibuat.

## F.2 Final Feature Checklist

### Authentication

- Registration.
- Login.
- Logout.
- Session management.
- Protected dashboard.
- Business ownership authorization.

### Business Management

- Create business.
- Edit business.
- Business profile.
- Business slug.
- Business timezone.
- Public booking page.

### Service Management

- Create service.
- Edit service.
- Deactivate service.
- Service price.
- Service duration.
- Service description.

### Staff Management

- Create staff.
- Edit staff.
- Deactivate staff.
- Assign staff to services.

### Scheduling

- Operating hours.
- Closed days.
- Available slot calculation.
- Timezone conversion.
- Buffer time.
- Conflict prevention.

### Booking

- Public booking.
- Service selection.
- Staff selection.
- Date selection.
- Time selection.
- Customer information.
- Booking confirmation.
- Booking reference.
- Booking cancellation.
- Booking status management.
- Double booking prevention.

### Dashboard

- Overview.
- Booking list.
- Booking detail.
- Booking search.
- Booking filters.
- Calendar view.
- Statistics.

### Production

- Production database.
- Environment configuration.
- Domain.
- HTTPS.
- Monitoring.
- Backup.
- Deployment documentation.

## F.3 Documentation Checklist

| Document                      | Created In | Purpose                                    |
| ----------------------------- | ---------- | ------------------------------------------ |
| `PROJECT_PRD_AND_PLAYBOOK.md` | Initial    | Product requirements and development guide |
| `TECHNICAL_PLAN.md`           | Phase 2    | Technical architecture                     |
| `UI_UX_GUIDE.md`              | Phase 3    | Design specification                       |
| `MOCK_DATA.md`                | Phase 5    | Mock data documentation                    |
| `TEST_REPORT.md`              | Phase 9    | Testing and QA results                     |
| `DEPLOYMENT_GUIDE.md`         | Phase 10   | Production deployment                      |
| `RELEASE_NOTES.md`            | Phase 10   | Release information                        |
| `README.md`                   | Phase 1–10 | Project setup and usage                    |

## F.4 Final Definition of Done

BookEase MVP dinyatakan selesai apabila:

MVP Release Criteria

- Seluruh 10 phase telah diselesaikan.
- Seluruh core functional requirements terpenuhi.
- Business owner dapat mengelola bisnis.
- Business owner dapat mengelola layanan.
- Business owner dapat mengelola staf.
- Business owner dapat mengatur jadwal.
- Pelanggan dapat melakukan booking tanpa akun.
- Sistem mencegah double booking secara database-backed.
- Data antarbisnis terisolasi.
- Booking dapat dikelola melalui dashboard.
- Core flow telah diuji end-to-end.
- Tidak ada critical security issue yang diketahui.
- Production deployment berhasil.
- Dokumentasi tersedia.

## F.5 Suggested Future Roadmap

Fitur berikut sengaja tidak dimasukkan dalam MVP. Pengembangannya dilakukan setelah BookEase mendapatkan validasi penggunaan.

| Version | Feature                     |
| ------- | --------------------------- |
| V1.1    | WhatsApp notification       |
| V1.2    | Online payment              |
| V1.3    | Google Calendar integration |
| V1.4    | Customer accounts           |
| V1.5    | Multi-branch management     |
| V1.6    | Subscription billing        |
| V1.7    | Advanced analytics          |
| V1.8    | Custom domain               |
| V2.0    | Booking marketplace         |

# FINAL DEVELOPMENT SUMMARY

# 10 / 10

Development phases defined

Urutan implementasi BookEase dari bootstrap hingga production release.

01

Environment & Project Bootstrap

02

Technical Planning & Architecture

03

UI/UX Planning & Design System

04

Frontend Foundation & Application Shell

05

Core Frontend Feature Development

06

Backend & Core Business Logic

07

Frontend & Backend Integration

08

Additional Features & Product Completion

09

Testing, Security & Optimization

10

Production Deployment & Release

## Rekomendasi cara memulai development

Untuk BookEase, saya merekomendasikan urutan eksekusi berikut:

1. Simpan dokumen ini sebagai `PROJECT_PRD_AND_PLAYBOOK.md` di root repository.
2. Mulai dengan Phase 1 menggunakan VS Code dan AI Coding Assistant.
3. Setelah Phase 1 selesai, review hasil implementasi dan commit.
4. Lanjutkan ke Phase 2 hanya setelah Phase 1 disetujui.
5. Ulangi proses yang sama sampai Phase 10.

Catatan arsitektur penting: Sebelum Phase 6, pastikan desain database dan strategi concurrency booking sudah direview dengan serius. Fitur paling kritis BookEase bukan sekadar membuat form reservasi, melainkan memastikan dua pelanggan tidak bisa memperoleh slot yang sama ketika melakukan booking secara bersamaan.

Dengan pendekatan ini, BookEase dapat dibangun secara bertahap tanpa meminta AI menghasilkan seluruh aplikasi sekaligus.

Dokumen selesai — BookEase PRD & Sequential Development Playbook v1.0.0.
