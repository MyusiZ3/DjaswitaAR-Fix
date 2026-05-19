# Jawita AR - Platform Manajemen App Augmented Reality

Proyek ini terdiri dari dua bagian utama:

1. **Unity AR Application (Unity 6 Core)**: Aplikasi mobile AR berbasis Unity untuk menampilkan konten AR dinamis di perangkat Android/iOS.
2. **Web Admin Dashboard**: Dashboard admin berbasis web untuk pengelolaan data marker secara real-time yang terhubung ke database Supabase.

---

## 1. Web Admin Dashboard (CMS & Control Panel)

Dashboard admin digunakan untuk mengelola data marker, memantau grafik engagement scan, mengontrol akun admin, serta melakukan sinkronisasi konfigurasi API Supabase untuk aplikasi Unity.

### A. Prasyarat Web Admin

- **Node.js** (Versi 18 atau terbaru)
- **NPM** (Package Manager)
- **Vite** (Build Tool - diinstal otomatis sebagai dependensi developer)

### B. Langkah Instalasi dan Menjalankan Web Admin

1. Buka terminal atau Command Prompt pada komputer Anda.
2. Arahkan ke folder `WebAdmin/` di dalam direktori root project Anda:
   ```bash
   cd WebAdmin
   ```
3. Pasang/instal seluruh paket dependensi yang dibutuhkan oleh project dengan menjalankan perintah berikut:
   ```bash
   npm install
   ```
4. Jalankan server pengembangan lokal (local development server) untuk melihat tampilan web secara real-time:
   ```bash
   npm run dev
   ```
5. Buka web browser pilihan Anda (Google Chrome, Microsoft Edge, dll.) lalu kunjungi alamat URL lokal yang tercantum di terminal Anda (biasanya `http://localhost:5173`).

---

## 2. Setup Supabase Backend (Jika Belum Ada / Dari Awal)

Supabase berfungsi sebagai Backend-as-a-Service (BaaS) yang menyediakan database relasional PostgreSQL, otentikasi admin, dan Cloud Storage untuk menyimpan gambar marker, video panduan, serta model 3D GLB secara online.

Apabila Anda belum memiliki project Supabase yang dikonfigurasi untuk Jawita AR, ikuti petunjuk mendetail di bawah ini:

### A. Membuat Project Supabase Baru

1. Kunjungi situs resmi **[Supabase](https://supabase.com)** dan buat akun (bisa mendaftar menggunakan akun GitHub).
2. Di dalam Dashboard utama Supabase, klik tombol **New Project** (atau **Create Project**).
3. Lengkapi formulir pembuatan project baru dengan rincian berikut:
   - **Organization**: Pilih nama organisasi default Anda.
   - **Project Name**: Isi dengan nama proyek, misalnya `Jawita AR`.
   - **Database Password**: Buat kata sandi database yang aman, pastikan untuk menyalin atau mencatat kata sandi ini.
   - **Region**: Pilih lokasi server terdekat dengan pengguna Anda (direkomendasikan memilih **Singapore** / `ap-southeast-1` untuk performa terbaik dan latensi terendah dari Indonesia).
   - **Pricing Plan**: Pilih opsi **Free** (Gratis).
4. Klik **Create new project**. Supabase memerlukan waktu beberapa menit untuk menyiapkan infrastruktur database dan server API untuk project Anda.

### B. Mendapatkan Supabase URL dan Anon Key

Setelah project baru Anda aktif dan siap digunakan:

1. Masuk ke halaman dashboard project Supabase Anda.
2. Lihat pada menu navigasi vertikal di sisi kiri, klik ikon roda gigi **Project Settings** (biasanya terletak di bagian paling bawah).
3. Di dalam menu Settings, pilih tab **API**.
4. Di halaman API Settings, cari bagian **Project URL** dan **Project API Keys**:
   - **Project URL (Supabase URL)**: Cari kolom **URL** (formatnya berupa `https://xxxx.supabase.co`). Klik tombol **Copy** untuk menyalin nilainya. URL ini digunakan sebagai penunjuk server API Supabase Anda.
   - **Project API Keys (Anon Key)**: Cari baris API Key yang bertipe **anon public** (bukan `service_role`). Nilainya berupa string JWT yang sangat panjang. Klik tombol **Copy** untuk menyalin kunci publik ini.
5. Simpan kedua string tersebut untuk digunakan di konfigurasi berkas `.env` dan kode Unity.

### C. Konfigurasi Environment (`.env`)

1. Buka teks editor Anda, lalu periksa file bernama `.env` di dalam folder `WebAdmin/`.
2. Jika file `.env` tersebut belum ada di dalam folder `WebAdmin/`, buatlah sebuah file baru berformat text dan namai `.env` (tanpa ekstensi `.txt` di belakangnya).
3. Tuliskan kredensial API Supabase yang telah Anda salin sebelumnya dengan format persis seperti di bawah ini:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-jwt-key
   ```
   > [!IMPORTANT]
   > Gantilah `https://your-project-id.supabase.co` dengan **Project URL** asli milik Anda, dan gantilah `your-long-anon-jwt-key` dengan **anon public key** asli Anda dari Supabase. Pastikan tidak ada spasi di sekitar tanda sama dengan (`=`).

---

## 3. Konfigurasi Database Supabase (Langkah Wajib)

Setelah project Supabase berhasil dibuat, database dan media storage harus disiapkan agar sesuai dengan struktur data yang digunakan oleh Web Admin dan aplikasi Unity.

### A. SQL Schema & Tables

Jalankan script SQL di bawah ini di bagian **SQL Editor** pada Dashboard Supabase Anda (klik **New Query**, paste script berikut, lalu klik **Run**):

```sql
-- 1. Table: ar_targets
CREATE TABLE ar_targets (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  type TEXT DEFAULT 'wisata',
  deskripsi TEXT,
  harga NUMERIC DEFAULT 0,
  booking_url TEXT,
  marker_url TEXT,
  slide_urls TEXT,
  video_url TEXT,
  glb_url TEXT,
  media_type TEXT DEFAULT 'image',
  start_date DATE,
  end_date DATE,
  duration TEXT,
  booking_start TIMESTAMPTZ,
  booking_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: profiles (Extending Auth.Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'member', -- superadmin, admin, member
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: scans (Engagement Tracking)
CREATE TABLE scans (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  target_id TEXT REFERENCES ar_targets(id) ON DELETE CASCADE,
  device_info TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: app_settings (Config for Unity)
CREATE TABLE app_settings (
  id TEXT PRIMARY KEY DEFAULT 'current_config',
  supabase_url TEXT,
  supabase_key TEXT,
  gdrive_api_key TEXT,
  canva_template_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: app_settings_logs
CREATE TABLE app_settings_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  admin_email TEXT,
  old_url TEXT,
  new_url TEXT,
  old_key TEXT,
  new_key TEXT,
  old_gdrive_key TEXT,
  new_gdrive_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### B. Auth Triggers & Functions

Jalankan query ini di SQL Editor untuk mengatur agar setiap kali admin baru terdaftar di auth Supabase, baris profilnya secara otomatis dibuat di tabel `profiles`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (new.id, new.email, split_part(new.email, '@', 1), 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### C. Row Level Security (RLS)

Aktifkan fitur **Row Level Security (RLS)** pada setiap tabel yang dibuat dan konfigurasikan policy/kebijakan berikut:

| Tabel            | Policy Name   | Target Role   | Permission | Keterangan / Deskripsi                                             |
| :--------------- | :------------ | :------------ | :--------- | :----------------------------------------------------------------- |
| **ar_targets**   | Public Read   | All (Anon)    | `SELECT`   | Memungkinkan aplikasi Unity & Web membaca data marker              |
| **ar_targets**   | Admin CRUD    | Authenticated | `ALL`      | Memungkinkan admin yang terotentikasi mengelola data marker        |
| **profiles**     | View Profiles | Authenticated | `SELECT`   | Hanya admin terdaftar yang dapat melihat detail profil admin lain  |
| **scans**        | Anon Insert   | All (Anon)    | `INSERT`   | Aplikasi Unity dapat mencatat tracking data scan tanpa perlu login |
| **app_settings** | Unity Fetch   | All (Anon)    | `SELECT`   | Aplikasi Unity dapat menarik info konfigurasi URL/Key terpusat     |

### D. Storage Configuration

1. Buka menu **Storage** pada panel navigasi kiri di Dashboard Supabase.
2. Klik tombol **Create Bucket** (atau **New Bucket**) untuk membuat penampung file publik baru.
3. Masukkan parameter-parameter berikut:
   - **Bucket Name**: `wisata-media`
   - **Public Bucket**: **Aktifkan** (pastikan posisinya _Public_ agar file GLB, marker, dan video dapat memiliki tautan unduh publik yang valid untuk Unity).
4. Buat folder di dalam bucket `wisata-media` untuk menyusun file Anda secara rapi:
   - `uploads/`
   - `markers/`
   - `videos/`
   - `models/`
5. Konfigurasikan **Storage Policies** agar user yang berstatus **authenticated** (admin yang login ke Web Admin) memiliki akses penuh untuk `INSERT`, `UPDATE`, dan `DELETE` file di dalam bucket `wisata-media`.

---

## 4. Unity AR Application (Unity 6 Core)

Aplikasi Unity berfungsi untuk menampilkan konten AR secara dinamis berdasarkan data marker & model 3D yang diambil dari server database Supabase. Project ini dioptimalkan penuh untuk **Unity 6** menggunakan **Universal Render Pipeline (URP)**.

### A. Prasyarat & Library Pihak Ketiga

Project ini bergantung pada library pihak ketiga. Silakan instal paket-paket berikut melalui Unity Package Manager (UPM):

1. **Vuforia Engine (11.4.4)**
   - Unduh SDK resmi dan import paketnya dari: [Vuforia Developer Portal](https://developer.vuforia.com/downloads/sdk)
2. **glTFast (6.0.1)** - Digunakan untuk memuat model 3D berekstensi GLB/glTF secara runtime.
   - Buka menu `Project Settings > Package Manager`, tambahkan registry OpenUPM berikut:
     - Name: `OpenUPM`
     - URL: `https://package.openupm.com`
     - Scope: `com.unity.cloud.gltfast`
   - _Alternatif:_ Instal via Git URL di Package Manager: `https://github.com/atteneder/glTFast.git#v6.0.1`
3. **LottieUnity** - Untuk memutar file JSON animasi lottie pada layar transisi offline UI.
   - Git URL: `https://github.com/p_v_v/LottieUnity.git`
4. **Newtonsoft JSON** (Sudah tersemat secara bawaan di dalam Unity 6 core).

### B. Konfigurasi API

Agar Unity dapat menarik data marker dari database Supabase:

1. Buka project Unity menggunakan Unity Hub / Unity Editor 6.
2. Di panel Project, temukan berkas skrip bernama `APIManager.cs` di dalam folder `Assets/Scripts/`.
3. Buka berkas tersebut dan perbarui variabel konfigurasi *Master Fallback* dengan kredensial Supabase dan Google Drive milik Anda:
   ```csharp
   // Ganti dengan kredensial API Supabase & GDrive yang valid
   private string masterBaseUrl = "https://your-project-id.supabase.co";
   private string masterApiKey = "your-long-anon-jwt-key";
   private string masterGDriveApiKey = "your-gdrive-api-key";
   ```
   > [!NOTE]
   > Nilai `masterBaseUrl` dan `masterApiKey` diisi dengan kredensial dari Dashboard Supabase. Sedangkan `masterGDriveApiKey` adalah kunci API cadangan jika aplikasi gagal menarik konfigurasi dari tabel `app_settings`.

### C. Fitur Utama Skrip Unity

- **AssetCacheManager**: Sistem manajemen cache tunggal yang mengunduh gambar, video, dan model 3D, lalu menyimpannya secara lokal di dalam folder `Application.persistentDataPath` di handphone. Aset tidak perlu diunduh berulang kali sehingga sangat menghemat konsumsi kuota data internet pengguna.
- **ARTargetHandler (Auto-Normalize)**: Kode ini secara dinamis menghitung batas bounding box model 3D GLB yang baru saja diunduh, lalu melakukan normalisasi ukuran ke skala standar yang seragam (default: `0.15` unit Unity). Hal ini menjamin model 3D berukuran stabil saat menempel pada marker target.
- **Delayed Hide Logic**: Memberikan waktu toleransi beberapa detik ketika kamera kehilangan pandangan dari marker AR sebelum menonaktifkan objek 3D. Menghindari gangguan visual (objek berkedip hilang-timbul) ketika kamera goyang atau terhalang sesaat.

---

## 5. Fitur Unggulan & Optimasi Sistem (Terbaru)

- **Keamanan Konfigurasi Aktif (Masking & Verification):** Sistem perlindungan data kredensial API Supabase & GDrive di WebAdmin dengan penyensoran otomatis (*masking*), sistem verifikasi kata sandi admin untuk membuka kunci, serta fitur penguncian otomatis (*auto-lock* dalam 30 detik) demi mencegah kebocoran kunci API.
- **Indikator Detak Jantung Koneksi (Database Heartbeat):** Dashboard dilengkapi dengan pemantau status koneksi Supabase secara *real-time* yang memberikan indikator visual hidup (*heartbeat status*) yang memberi tahu admin apabila database sedang terhubung atau terputus.
- **Panduan Setup Kredensial Interaktif (Interactive API Guide):** Panduan terintegrasi berbasis tab di dashboard WebAdmin untuk mengedukasi administrator baru langkah-demi-langkah tentang cara mendapatkan API Key Supabase dan Google Drive secara mandiri.
- **Optimasi Live Streaming Video GDrive (Bypass Cache):** Sistem klien Unity mendeteksi video Google Drive dan langsung memutarnya secara *live streaming* instan tanpa mendownload data biner besar (55MB+) ke cache lokal. Hal ini memotong waktu tunggu pemutaran menjadi nol dan mencegah lag/penurunan *frame rate* saat AR aktif.
- **Isolasi Cache GDrive Unik (Anti Hash Collision):** Manajemen cache di Unity mengekstrak ID unik Google Drive dan menyematkan ekstensi yang tepat (.mp4, .glb, .png). Ini mencegah tabrakan cache antar berkas (*cache overlap*) dan melindungi mesin glTFast dari kerusakan pembacaan berkas (crash fatal).
- **Log Analitik Berbasis Render Lifecycle (Robust Analytics):** Pencatatan frekuensi scan marker dihitung secara akurat berdasarkan kemunculan fisik target di kamera (`mIsTargetPresent`) menggantikan metode *cooldown* waktu (seperti 60 menit sebelumnya). Scan baru hanya dihitung jika target benar-benar hilang dari layar dan dipindai kembali.
- **Pengelompokan Kategori Cerdas (Smart Category Chart):** Dashboard secara otomatis mengelompokkan kategori kustom yang diinput manual oleh admin ke dalam irisan **"Lainnya"** di diagram donat untuk menjaga kebersihan, tata letak, dan keindahan grafik analitik.
- **Auto-Normalize Size:** Penyetelan otomatis proporsi visual objek 3D secara runtime menggunakan bounding box sehingga developer tidak perlu menyamakan skala mentah model di Blender/perangkat lunak modeling 3D.
- **Unified Caching & Robust Tracking:** Sistem caching luring pintar untuk model 3D GLB, gambar slide, beserta penanganan buffering visual (*Delayed Hide*) agar objek tidak goyang atau hilang saat kamera terhalang sesaat.
