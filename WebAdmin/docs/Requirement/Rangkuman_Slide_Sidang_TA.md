# 📊 RANGKUMAN SLIDE PRESENTASI SIDANG TUGAS AKHIR
### Muhamad Sidik — NIM 7708220034
### Program Studi S1 Terapan Teknologi Rekayasa Multimedia, Universitas Telkom — 2026

---

## SLIDE 1 — HALAMAN JUDUL

> **PENGEMBANGAN APLIKASI AUGMENTED REALITY DINAMIS**
> **MENGGUNAKAN METODE AGILE PADA PT JASWITA JABAR**

| | |
|---|---|
| **Penulis** | Muhamad Sidik — NIM 7708220034 |
| **Pembimbing 1** | Bambang Pudjoatmodjo, S.Si., M.T., Ph.D. (NIP 14700021) |
| **Pembimbing 2** | Dr. Ismail, S.Si., M.T. (NIP 10760049) |
| **Instansi** | Fakultas Ilmu Terapan, Universitas Telkom |
| **Tahun** | 2026 |

---

## SLIDE 2 — LATAR BELAKANG

### Kondisi Saat Ini
- PT Jaswita Jabar adalah **BUMD Pemerintah Provinsi Jawa Barat** yang rutin mengikuti kegiatan pameran sebagai media promosi utama
- Media promosi yang digunakan masih berupa **brosur & company profile cetak (statis)**

### Permasalahan
1. Konten **tidak dapat diperbarui cepat** antara satu pameran dengan pameran lainnya → butuh cetak ulang (biaya & waktu)
2. Materi cetak **tidak selalu relevan** dengan konteks pameran yang sedang berlangsung
3. Penyampaian informasi **satu arah & terbatas** (teks + gambar 2D) — tidak interaktif

### Solusi yang Diusulkan
> Teknologi **Augmented Reality (AR)** memungkinkan pengunjung mengakses informasi promosi secara langsung melalui **pemindaian marker menggunakan kamera ponsel**, tanpa perangkat tambahan.

---

## SLIDE 3 — RUMUSAN MASALAH & SOLUSI

### ❌ Rumusan Masalah
1. PT Jaswita Jabar belum memiliki media promosi interaktif berbasis teknologi digital
2. Belum ada platform yang memungkinkan pembaruan konten secara **mandiri & real-time**

### ✅ Solusi yang Diusulkan
| Masalah | Solusi |
|---|---|
| Media promosi statis | Aplikasi AR Android berbasis **Unity + Vuforia** |
| Konten tidak bisa diperbarui mandiri | **Admin Dashboard berbasis web** terhubung ke Supabase sebagai backend |

> **Keunggulan utama:** Pembaruan konten AR (teks, gambar, video, model 3D) dapat dilakukan **tanpa proses rebuild aplikasi**.

---

## SLIDE 4 — TUJUAN PENELITIAN

1. ✅ Mengembangkan **aplikasi AR berbasis Android** sebagai platform media promosi interaktif untuk kegiatan pameran PT Jaswita Jabar
2. ✅ Merancang dan membangun **sistem pengelolaan konten AR berbasis admin dashboard** yang memungkinkan penambahan marker baru dan pembaruan konten secara mandiri

---

## SLIDE 5 — PROFIL ORGANISASI

### PT Jaswita Jabar (Perseroda)
- **Nama lengkap:** PT Jasa dan Kepariwisataan Jawa Barat (Perseroda)
- **Jenis:** BUMD Pemerintah Provinsi Jawa Barat
- **Bidang:** Pengelolaan properti, jasa kepariwisataan & optimalisasi aset daerah
- **Alamat:** Jl. Lengkong Besar No. 135–137, Bandung
- **Dasar hukum:** Perda Jabar No. 15 Tahun 2017 (hasil merger dua BUMD)

### Penempatan Penulis
- **Departemen:** Komunikasi dan Informasi (Kominfo)
- **Tugas:** IT Support, pengembangan sistem internal, inventaris aset TI

---

## SLIDE 6 — ARSITEKTUR SISTEM

### 3 Pilar Utama Sistem
| Komponen | Teknologi | Fungsi |
|---|---|---|
| **Aplikasi AR Android** | Unity 6 + Vuforia 11.4.4 + glTFast 6.0.1 | Deteksi marker, tampilkan konten AR dinamis |
| **Admin Dashboard** | HTML5 + Vanilla JS + Vite → deploy ke Vercel | Kelola konten AR tanpa rebuild |
| **Backend (Supabase)** | PostgreSQL + Auth + Cloud Storage | Single Source of Truth, real-time data |

### Alur Kerja Sistem
1. Admin → update konten di **Admin Dashboard**
2. Dashboard → simpan data ke **Supabase** (cloud backend)
3. Pengunjung → scan marker via **Aplikasi AR Android**
4. Aplikasi → ambil data terbaru dari **Supabase** secara otomatis
5. Konten terbaru → tampil di layar **tanpa rebuild aplikasi**

---

## SLIDE 7 — FITUR UNGGULAN SISTEM

### Aplikasi AR Android
- 🔍 **Deteksi image marker** menggunakan Vuforia Engine (min. ⭐⭐⭐)
- 🖼️ **Konten dinamis**: teks, carousel gambar, video streaming, model 3D (GLB)
- 📶 **Offline overlay**: notifikasi & blokir pemindaian otomatis saat tidak ada koneksi
- ⚡ **Tracking-loss tolerance 0,5 detik** — mencegah flickering saat kamera bergeser
- 💾 **LRU Cache**: maks. 500 MB disk + 12 marker aktif di RAM
- 🎯 **Analitik scan** otomatis tercatat ke Supabase (target_id + waktu + durasi)

### Admin Dashboard Web — `djaswita-ar.vercel.app`
- 🔐 **Login** via email/username + sesi timeout otomatis 12 jam
- ✏️ **CRUD target AR** lengkap (tambah/edit/hapus marker & seluruh kontennya)
- 📊 **Analitik real-time** via WebSocket (grafik mingguan & distribusi per target)
- 🔑 **Double Authentication** + auto-lock 30 detik untuk ubah konfigurasi API
- 👥 **Manajemen admin bertingkat**: Superadmin / Admin / Member
- 🏥 **Database heartbeat** — indikator koneksi Supabase secara live

---

## SLIDE 8 — METODE AGILE (6 TAHAP)

| Tahap | Kegiatan Utama | Waktu |
|---|---|---|
| **1. Plan** | Wawancara Kepala Dept. Kominfo, telaah media promosi, requirements gathering, perancangan arsitektur sistem | April 2026 |
| **2. Design** | ERD (5 tabel), Use Case Diagram (4 aktor), Flowchart alur AR, desain antarmuka | April 2026 |
| **3. Develop** | Konfigurasi Supabase, pengembangan Unity AR + Admin Dashboard, build APK & deploy Vercel | April–Mei 2026 |
| **4. Test** | Black-box testing (pengembang) + Usability Testing SUS (15 responden) | Mei–Juni 2026 |
| **5. Deploy** | Distribusi APK ke PT Jaswita Jabar + serah terima sistem & panduan penggunaan | Juni 2026 |
| **6. Review** | Analisis hasil pengujian, dokumentasi temuan, saran pengembangan lanjutan | Juni 2026 |

---

## SLIDE 9 — PERANCANGAN SISTEM (ERD + USE CASE)

### ERD — Struktur Basis Data (5 Tabel)

| Tabel | Fungsi |
|---|---|
| `ar_targets` | Data target AR (nama, deskripsi, URL marker, konten, tipe, status aktif) |
| `scans` | Log analitik pemindaian (target_id, info perangkat, waktu) |
| `profiles` | Akun admin + role (superadmin/admin/member) terhubung ke Supabase Auth |
| `app_settings` | Konfigurasi aktif (Supabase URL & API key) |
| `app_settings_logs` | Riwayat & audit perubahan konfigurasi API |

### Hierarki Pengguna (Use Case — 4 Aktor)
- **Pengunjung Pameran** → scan marker, lihat konten AR, terima notifikasi offline
- **Member** → lihat statistik scan, pantau status koneksi
- **Admin** → semua hak Member + CRUD target AR
- **Superadmin** → semua hak Admin + kelola akun + ubah konfigurasi API (double auth)

---

## SLIDE 10 — HASIL PENGEMBANGAN (LUARAN)

### A. Aplikasi AR Android
| Tampilan | Keterangan |
|---|---|
| Loading Screen | Startup dengan pengecekan koneksi & unduh metadata target dari Supabase |
| Layar Pemindaian | Kamera Vuforia aktif, siap scan marker |
| Konten Carousel | Slideshow gambar interaktif dengan tombol navigasi & page dots |
| Konten 3D | Model GLB dimuat glTFast, dirender real-time di atas marker |
| Overlay Offline | Pemindaian diblokir otomatis, tampil pesan koneksi tidak tersedia |

### B. Admin Dashboard Web
| Halaman | Fungsi |
|---|---|
| Login | Autentikasi email/username, validasi sesi, role-based access |
| AR Markers | Daftar seluruh target + filter real-time, tambah/edit/hapus |
| Form Tambah/Edit | Input metadata, upload aset (gambar/video/GLB), preview konten |
| Manajemen Admin | Tambah/ubah peran/hapus akun (khusus superadmin) |
| Konfigurasi API | Double authentication, masking kredensial, log riwayat perubahan |

---

## SLIDE 11 — PENGUJIAN BLACK-BOX TESTING

> **Metode:** Equivalence Partitioning + Boundary Value Analysis
> **Pelaksana:** Pengembang (selama masa development)

### Rekapitulasi Hasil — 44 Kasus Uji

| Komponen | Total | Lulus | Gagal | Pass Rate |
|---|:---:|:---:|:---:|:---:|
| Admin Dashboard (CMS) — 4 Kategori | 20 | 20 | 0 | **100%** |
| Aplikasi AR — Unity Editor — 3 Kategori | 9 | 9 | 0 | **100%** |
| Aplikasi Android (.APK) — 4 Kategori | 15 | 15 | 0 | **100%** |
| **TOTAL KESELURUHAN** | **44** | **44** | **0** | **✅ 100%** |

### Cakupan Pengujian
| Komponen | Kategori yang Diuji |
|---|---|
| **Dashboard** | (A) Autentikasi & sesi, (B) CRUD target, (C) Double auth & settings, (D) Manajemen admin |
| **Unity Editor** | (E) Inisialisasi & konektivitas, (F) Deteksi & rendering AR, (G) LRU caching |
| **Android APK** | (I) Instalasi & izin OS, (J) Pelacakan AR & sensitivitas, (K) Toleransi jaringan, (L) Interupsi OS |

---

## SLIDE 12 — PENGUJIAN USABILITY TESTING (SUS)

> **Metode:** System Usability Scale (SUS) — John Brooke (1996)
> **Formula:** `Skor = [Σ(R_ganjil − 1) + Σ(5 − R_genap)] × 2,5` → Rentang 0–100

### Profil Responden
- **Jumlah:** 15 responden (melebihi batas minimal 12–14 per Tullis & Stetson)
- **Usia:** 21–45 tahun (mahasiswa & pekerja)
- **Skenario A:** Gunakan aplikasi AR — scan marker, amati konten, uji berbagai kondisi cahaya
- **Skenario B:** Operasikan admin dashboard — login, tambah target, update konten, logout

### Tabel Interpretasi SUS
| Rentang Skor | Grade | Kategori |
|:---:|:---:|:---:|
| 85 – 100 | A | Excellent |
| 70 – 84.9 | B | Good |
| 50 – 69.9 | C | OK |
| 35 – 49.9 | D | Poor |
| 0 – 34.9 | F | Awful |

---

## SLIDE 13 — HASIL USABILITY TESTING (SUS)

### Skor Akhir per Komponen

| Komponen | Rata-rata SUS | Grade | Kategori | Status |
|---|:---:|:---:|:---:|:---:|
| **Aplikasi AR Android** | **86.50** | **A** | **Excellent** | ✅ Layak |
| **Admin Dashboard** | **83.17** | **B** | **Good** | ✅ Layak |

> 🎯 **Target:** Skor ≥ 70 — **Keduanya melampaui target!**

### Distribusi Skor Responden (N=15)

| Komponen | Excellent (≥85) | Good (70–84.9) | OK (50–69.9) | Layak (≥70) |
|---|:---:|:---:|:---:|:---:|
| AR Android | 10 | 4 | 1 | **14/15 (93%)** |
| Admin Dashboard | 7 | 5 | 3 | **12/15 (80%)** |

### Aspek dengan Skor Terendah (Untuk Saran)
- **AR Android Q6** — Kemampuan scan pada berbagai sudut kemiringan
- **Dashboard Q4** — "Masih butuh bantuan pengembang untuk mengoperasikan dashboard"

---

## SLIDE 14 — KESIMPULAN

> Keempat tujuan penelitian **telah tercapai secara penuh**.

1. ✅ **Sistem AR dinamis berhasil dikembangkan** — aplikasi AR Android + admin dashboard web — untuk mendukung promosi digital PT Jaswita Jabar, menggantikan media cetak statis

2. ✅ **Konten promosi dapat diperbarui real-time** tanpa rebuild/redistribusi aplikasi. Pilihan konten utama (carousel gambar / model 3D) dapat dikonfigurasi mandiri melalui admin dashboard

3. ✅ **Black-Box Testing: 44 kasus uji → Pass Rate 100%** pada semua komponen sistem

4. ✅ **Usability Testing (SUS):**
   - Aplikasi AR Android: **86.50 — Excellent** ✅
   - Admin Dashboard: **83.17 — Good** ✅
   - Keduanya layak diimplementasikan (skor ≥ 70)

---

## SLIDE 15 — SARAN & PENUTUP

### Saran Pengembangan Lanjutan

| Prioritas | Aspek | Rekomendasi |
|:---:|---|---|
| 🔴 1 | **Stabilitas Deteksi Marker** | Eksplorasi **QR Code** sebagai marker — tahan distorsi sudut & variasi cahaya |
| 🟠 2 | **Kemandirian Admin Dashboard** | Tambah **interactive onboarding** & in-app guide langsung di dashboard |
| 🟡 3 | **Performa Upload Aset** | Progress indicator informatif + **kompresi aset otomatis** sebelum upload |
| 🟢 4 | **Platform iOS** | Kembangkan versi iOS untuk perluas jangkauan pengguna saat pameran |

---

### Informasi Sistem yang Diserahterimakan

| Komponen | Detail |
|---|---|
| 📱 Aplikasi AR Android | APK — Android 8.0+ (API Level 26+) |
| 🌐 Admin Dashboard | [djaswita-ar.vercel.app](https://djaswita-ar.vercel.app) |
| ☁️ Backend | Supabase — PostgreSQL + Auth + Cloud Storage |

---

> 🎓 **Terima Kasih**
>
> *"Pengembangan Aplikasi Augmented Reality Dinamis Menggunakan Metode Agile pada PT Jaswita Jabar"*
> **Muhamad Sidik — NIM 7708220034 — Universitas Telkom, 2026**
