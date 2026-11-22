# Panduan Lengkap: Supabase Database Keep-Alive (Anti Auto-Pause)

Dokumen ini menjelaskan strategi, arsitektur, dan langkah-langkah implementasi otomatis agar database **Supabase Free Tier** pada proyek **Zirebo (Zona Integritas Reformasi Birokrasi)** tidak pernah dinonaktifkan (auto-pause) karena inaktivitas.

---

## 1. Latar Belakang Masalah

Pada paket **Supabase Free Tier**, database PostgreSQL akan otomatis di-pause (dinonaktifkan sementara) jika **tidak ada aktivitas query atau koneksi selama 7 hari berturut-turut**.

### Akibat Jika Database Ter-pause:
- Pengguna yang mengakses aplikasi web Rebo akan mengalami error (data tidak tampil atau gagal login/fetch data).
- Developer harus login manual ke Dashboard Supabase lalu menekan tombol **"Restore project"** (memerlukan waktu restore 2-5 menit).

### Solusi yang Diterapkan:
Sistem keep-alive otomatis yang melakukan query ringan ke database (tabel `area`) setiap 2-3 hari sekali melalui beberapa jalur otomatis yang **100% gratis** dan berjalan di cloud tanpa perlu komputer lokal menyala.

---

## 2. Pilihan Jalur Keep-Alive yang Tersedia

Kami menyediakan **4 metode** yang saling melengkapi (redundant) sehingga database dijamin selalu aktif:

| Metode | Tempat Berjalan | Biaya | Kebutuhan PC Menyala? | Rekomendasi |
| :--- | :--- | :--- | :--- | :--- |
| **1. GitHub Actions Cron** | Cloud GitHub | Gratis (Free Plan) | **Tidak** (Otomatis Cloud) | ⭐ **Paling Direkomendasikan** |
| **2. Vercel Cron Job** | Cloud Vercel | Gratis (Hobby Plan) | **Tidak** (Otomatis Cloud) | ⭐ **Sangat Bagus jika deploy di Vercel** |
| **3. Web Cron Eksternal** | cron-job.org / UptimeRobot | Gratis | **Tidak** (Otomatis Cloud) | Alternatif Fleksibel |
| **4. Script Node.js Lokal** | Komputer / VPS | Gratis | Ya (hanya saat dijalankan) | Cocok untuk uji coba mandiri / task scheduler |

---

## 3. Metode 1: GitHub Actions Cloud Cron (Paling Mudah & Mandiri)

Workflow file: [`.github/workflows/supabase-keep-alive.yml`](file:///d:/10Project/Rebo/.github/workflows/supabase-keep-alive.yml)

### Cara Kerja:
- Berjalan terjadwal di server GitHub setiap 3 hari pukul 02:00 UTC (`0 2 */3 * *`).
- Mengirimkan query langsung ke REST API PostgREST Supabase:
  `GET https://<project-ref>.supabase.co/rest/v1/area?select=id_area&limit=1`
- Memperbarui status aktivitas Supabase sehingga timer 7 hari auto-pause langsung di-reset.
- Jika rahasia `APP_URL` diatur, GitHub Actions juga akan sekaligus melakukan ping ke endpoint web Next.js Anda.

### Cara Setup GitHub Actions:
1. Buka repositori proyek Anda di GitHub.
2. Masuk ke tab **Settings** > **Secrets and variables** > **Actions**.
3. Klik tombol **New repository secret** dan tambahkan:
   - **`NEXT_PUBLIC_SUPABASE_URL`**: URL Supabase Anda (contoh: `https://xyzcompany.supabase.co`).
   - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Anon key Supabase Anda.
   - **`APP_URL`** *(opsional)*: URL web production Anda (contoh: `https://rebo-app.vercel.app`).
   - **`CRON_SECRET`** *(opsional)*: Token rahasia pengaman jika Anda mengaktifkan proteksi cron.
4. **Uji Coba Manual:**
   - Masuk ke tab **Actions** di GitHub.
   - Pilih workflow **"Supabase Database Keep-Alive"** di sidebar kiri.
   - Klik dropdown **"Run workflow"** lalu klik tombol hijau **"Run workflow"**.
   - Periksa log eksekusi, Anda akan melihat status `HTTP 200` dan rincian latensi respons database.

---

## 4. Metode 2: Vercel Cron Job

File konfigurasi: [`vercel.json`](file:///d:/10Project/Rebo/vercel.json)  
Endpoint route: [`src/app/api/cron/keep-alive/route.ts`](file:///d:/10Project/Rebo/src/app/api/cron/keep-alive/route.ts)

### Konfigurasi di `vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 4 */3 * *"
    }
  ]
}
```

### Cara Kerja:
- Ketika proyek di-deploy ke Vercel, Vercel secara otomatis mendeteksi konfigurasi `crons`.
- Setiap 3 hari pukul 04:00 UTC, Vercel akan mengeksekusi request HTTP ke endpoint `/api/cron/keep-alive`.
- Endpoint tersebut menjalankan query database Supabase via `@supabase/supabase-js` dan mengembalikan JSON status.

### Pengamanan Endpoint (Opsional tapi Direkomendasikan):
Jika Anda ingin mencegah orang lain mengakses endpoint cron:
1. Buat token acak (misal: string panjang acak seperti `my_secret_cron_token_12345`).
2. Di Vercel Dashboard: buka **Project Settings** > **Environment Variables** > tambahkan `CRON_SECRET` dengan nilai token tersebut.
3. Vercel Cron secara otomatis menyisipkan header `Authorization: Bearer <CRON_SECRET>` saat memanggil cron.
4. Endpoint `/api/cron/keep-alive` otomatis memvalidasi header ini jika `CRON_SECRET` diset di environment. Jika tidak cocok, endpoint akan mengembalikan `401 Unauthorized`. Jika `CRON_SECRET` tidak diset, endpoint tetap berfungsi secara publik untuk health-check.

---

## 5. Metode 3: Layanan Web Cron Pihak Ketiga (Free Cloud Ping)

Jika Anda tidak menggunakan GitHub Actions atau Vercel, Anda dapat menggunakan layanan cron gratis seperti:
- **[cron-job.org](https://cron-job.org)** (100% Gratis, sangat handal)
- **[UptimeRobot](https://uptimerobot.com)** (Monitor uptime sekaligus keep-alive)

### Cara Konfigurasi di cron-job.org:
1. Buat akun gratis di [cron-job.org](https://cron-job.org).
2. Buat cronjob baru (**Create Cronjob**).
3. Isi kolom:
   - **Title**: `Rebo Supabase Keep-Alive`
   - **URL**: `https://<domain-aplikasi-anda>/api/cron/keep-alive`
   - **Schedule**: Pilih *Every 3 days* atau *Every 2 days* (misal: jam 03:00).
   - *(Jika memakai `CRON_SECRET`)*: Pada tab **Headers**, tambahkan `Authorization: Bearer <CRON_SECRET_ANDA>`.
4. Simpan. Layanan ini akan memanggil endpoint aplikasi Anda sesuai jadwal.

---

## 6. Metode 4: Standalone Node.js Script (Uji Coba & Lokal)

File script: [`scripts/supabase_keep_alive.js`](file:///d:/10Project/Rebo/scripts/supabase_keep_alive.js)

### Cara Menjalankan Manual di Terminal:
Cukup jalankan perintah:
```bash
pnpm cron:keep-alive
```
atau:
```bash
node scripts/supabase_keep_alive.js
```

### Contoh Hasil Output di Terminal:
```text
=======================================================
[CRON Keep-Alive] Starting Supabase Ping at 2026-11-23T00:23:13.595Z
[CRON Keep-Alive] Target: https://tvsieplcwiyrsnnmsrde.supabase.co
=======================================================
[CRON Keep-Alive] [SUCCESS] Ping to Supabase was successful!
[CRON Keep-Alive] Latency: 700ms
[CRON Keep-Alive] Table sample query: 'area' (found 2 total records)
[CRON Keep-Alive] Sample data: ID=1, Area="Pemenuhan"
[CRON Keep-Alive] Database activity confirmed. Supabase pause timer reset.
=======================================================
```

---

## 7. Rincian Respons Endpoint `/api/cron/keep-alive`

### Respons Sukses (`HTTP 200 OK`):
```json
{
  "status": "success",
  "message": "Supabase keep-alive ping successful. Database activity recorded.",
  "latencyMs": 145,
  "timestamp": "2026-11-23T00:25:00.000Z",
  "database": {
    "connected": true,
    "table": "area",
    "rowCount": 2
  },
  "security": "protected"
}
```

### Respons Gagal Query (`HTTP 500 Internal Server Error`):
```json
{
  "status": "error",
  "message": "Supabase query error: relation not found",
  "latencyMs": 85,
  "timestamp": "2026-11-23T00:25:00.000Z",
  "database": {
    "connected": false,
    "error": "relation not found"
  }
}
```

### Respons Unauthorized (`HTTP 401 Unauthorized`):
*(Hanya muncul jika `CRON_SECRET` diatur di environment tetapi request tidak mengirim Bearer token yang valid)*
```json
{
  "status": "error",
  "message": "Unauthorized: Invalid or missing Bearer token in Authorization header",
  "timestamp": "2026-11-23T00:25:00.000Z"
}
```

---

## 8. Panduan Jika Database Supabase Terlanjur Di-pause

Jika suatu saat proyek belum disetup cron-nya dan terlanjur di-pause oleh Supabase:
1. Buka [https://supabase.com/dashboard](https://supabase.com/dashboard) dan login.
2. Pilih project **Zirebo**.
3. Di banner atas akan ada tulisan *"Project is paused"*.
4. Klik tombol **"Restore project"**.
5. Tunggu 2-3 menit hingga status berubah kembali menjadi hijau (**"Active"**).
6. Segera aktifkan **Metode 1 (GitHub Actions)** atau **Metode 2 (Vercel Cron)** agar kejadian serupa tidak terulang kembali.
