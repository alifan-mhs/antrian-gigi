# Rancangan Web Pendaftaran Harian Pasien (Walk-in Queue)

Web terpisah dari RME utama — dipakai 1 perawat/operator untuk mendata pasien yang mau ditangani **hari itu juga**, tanpa perlu pasien login.

## 1. Proses Bisnis (dirapikan dari deskripsi)

1. Perawat/operator login ke dashboard.
2. Perawat **buka pendaftaran hari ini**: set kuota maksimal, isi info promo (opsional).
3. Pasien buka web (tanpa login) → langsung lihat form pendaftaran untuk hari ini, kalau masih buka & kuota belum penuh.
4. Pasien isi **nama, nomor HP/WA, keluhan singkat** → submit → dapat nomor antrian.
5. Kalau kuota sudah penuh atau perawat menutup pendaftaran → form otomatis nonaktif, tampil pesan info.
6. Perawat lihat daftar pasien yang sudah mendaftar hari itu (antrian), lalu **follow up satu per satu** (hubungi manual via telepon/WA di luar sistem — sistem hanya mencatat status).
7. Kalau pasien tidak merespons/cancel/tidak datang → **perawat yang mengubah status** jadi batal/tidak datang.
8. Semua manajemen (buka/tutup pendaftaran, kuota, promo, follow up, cancel) ada di tangan perawat — tidak ada role lain yang login.

## 2. Role & Akses

| Role | Akses |
|---|---|
| **Perawat/Operator** | Satu-satunya yang login. Kelola sesi harian (kuota, promo, buka/tutup), lihat & update status semua pendaftar |
| **Pasien** | Publik, tanpa login/akun — cuma isi form pendaftaran hari ini |

## 3. Fitur

### 3.1 Manajemen Sesi Harian — MVP
- Buka/tutup pendaftaran hari ini (toggle on/off)
- Atur kuota maksimal untuk hari itu
- Atur teks info promo (opsional, tampil di halaman publik kalau diisi)
- Sesi baru otomatis mengikuti tanggal (per hari beda sesi, kuota reset)

### 3.2 Form Pendaftaran Publik (Pasien) — MVP
- Tanpa login, langsung dibuka dari HP pasien
- Tampilkan: tanggal hari ini, sisa kuota, banner promo (kalau ada)
- Input: nama, nomor HP/WA, keluhan singkat
- Submit → pasien dapat **nomor antrian** & status "menunggu konfirmasi"
- Kalau kuota penuh / pendaftaran ditutup → form nonaktif, pesan jelas ("Pendaftaran hari ini sudah ditutup" / "Kuota hari ini penuh")
- Validasi dasar: format nomor HP, dan cegah 1 nomor HP daftar 2x di hari yang sama

### 3.3 Dashboard Antrian (Perawat) — MVP
- List pasien terdaftar hari ini, urut berdasarkan nomor antrian
- Per baris: nama, no HP, keluhan, jam daftar, status
- Update status per pasien: `Menunggu` → `Dihubungi` → `Dikonfirmasi` → `Selesai` / `Batal` / `Tidak Datang`
- Filter berdasarkan status (biar gampang lihat mana yang belum di-follow up)

### 3.4 Fitur Lanjutan — Phase 2 (belum perlu di awal)
- Notifikasi WA otomatis ke pasien saat status berubah
- Riwayat & statistik pendaftaran per hari/minggu/bulan (jumlah daftar, batal, tidak datang)
- Multi-operator (kalau nanti lebih dari 1 perawat buka sesi bersamaan)
- Sinkron ke data Pasien di RME utama (match by nomor HP) kalau nanti mau digabung

## 4. Skema Database (Prisma, garis besar)

```prisma
model Operator {
  id        String         @id @default(uuid())
  name      String
  email     String         @unique
  createdAt DateTime       @default(now())
  sessions  DailySession[]
}

model DailySession {
  id            String         @id @default(uuid())
  operator      Operator       @relation(fields: [operatorId], references: [id])
  operatorId    String
  date          DateTime       @db.Date
  quota         Int
  promoText     String?
  isOpen        Boolean        @default(true)
  createdAt     DateTime       @default(now())
  registrations Registration[]

  @@unique([operatorId, date]) // 1 sesi per operator per hari
}

model Registration {
  id          String             @id @default(uuid())
  session     DailySession       @relation(fields: [sessionId], references: [id])
  sessionId   String
  queueNumber Int                // nomor antrian, auto-increment per sesi
  name        String
  phone       String
  complaint   String?
  status      RegistrationStatus @default(MENUNGGU)
  createdAt   DateTime           @default(now())

  @@unique([sessionId, phone]) // cegah 1 nomor HP daftar dobel di hari sama
}

enum RegistrationStatus {
  MENUNGGU
  DIHUBUNGI
  DIKONFIRMASI
  SELESAI
  BATAL
  TIDAK_DATANG
}
```

## 5. Alur Teknis Singkat

- **Halaman publik** (`/` atau `/daftar`): ambil `DailySession` dengan `date = hari ini` & `isOpen = true`. Kalau ada dan `count(registrations) < quota` → tampilkan form. Kalau tidak → tampilkan pesan penuh/tutup.
- **Submit pendaftaran**: lewat Server Action/API route, insert `Registration` dalam transaksi (hitung jumlah registrasi existing di sesi itu + 1 → jadi `queueNumber`), sekaligus re-check kuota supaya tidak race condition saat submit bersamaan.
- **Dashboard perawat** (`/dashboard`, protected — wajib login): list & update status. Disarankan pakai **Supabase Realtime** biar list otomatis update tiap ada pendaftar baru, tanpa perawat harus refresh manual.

## 6. UI/UX

- Halaman publik: sangat sederhana & mobile-first (pasien buka dari HP masing-masing) — `Form`, `Input`, `Textarea`, `Button` dari shadcn/ui, sisa kuota ditampilkan pakai `Badge` atau progress bar simpel
- Dashboard perawat: di mobile/tablet tampil sebagai **list card** per pasien (bukan tabel sempit), aksi ubah status pakai `DropdownMenu`/`Select` biar cepat di-tap
- Warna & font ikut design system SCB yang sudah ada (Gold `#F3C623` / Navy `#092F54`, Plus Jakarta Sans)

## 7. Asumsi yang Diambil (tolong dikoreksi kalau salah)

- Kuota & sesi pendaftaran **reset otomatis tiap hari** (bukan akumulasi lintas hari)
- Untuk MVP, sistem ini **berdiri sendiri** (belum terhubung ke tabel `Patient` di RME utama) — follow-up ke rekam medis tetap manual dulu, integrasi bisa Phase 2
- 1 operator/perawat = 1 sesi aktif per hari (belum multi-operator bersamaan)