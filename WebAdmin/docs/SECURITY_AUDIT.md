# LAPORAN AUDIT KEAMANAN & STABILITAS SISTEM: D'JASWITA AR

Laporan ini menyajikan temuan audit keamanan teknis dan evaluasi stabilitas pada platform **D'Jaswita AR** (aplikasi Unity AR & dasbor WebAdmin). Audit difokuskan pada analisis kerentanan terhadap penyalahgunaan kunci API, potensi bypass otentikasi, eskalasi hak istimewa (*privilege escalation*), serta ketahanan sistem terhadap kondisi gangguan jaringan/offline.

---

## RINGKASAN TEMUAN

| No | Komponen | Nama Celah Keamanan | Tingkat Kerawanan | Status | Deskripsi Singkat |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Supabase Auth & DB | **Administrative Privilege Escalation via Open SignUp** |  **KRITIS (CRITICAL)** | Teridentifikasi | Siapa pun dapat mendaftar melalui API publik Supabase dan secara otomatis mendapatkan hak akses Administrator penuh (`role = 'admin'`). |
| 2 | Unity C# & Web JS | **Hardcoded & Exposed Sensitive API Keys** |  **MEDIUM (SEDANG)** | Teridentifikasi | Supabase Anon Key dan Google Drive API Key terekspos langsung di kode klien (C# Unity & Web build JS) tanpa restriksi. |
| 3 | Supabase RLS | **Permissive Row Level Security (RLS) Policies** |  **KRITIS (CRITICAL)** | Teridentifikasi | Kebijakan RLS saat ini hanya mengecek status otentikasi saja (`Authenticated`), bukan peran spesifik (`admin`/`superadmin`), sehingga RLS mudah dibypass jika penyerang berhasil login/mendaftar. |
| 4 | Unity AR Client | **Offline State Resilience & Network-Loss Recovery** |  **AMAN (STABLE)** | Terverifikasi | Sistem caching lokal, transisi luring (Lottie animation), dan pemantauan koneksi detak jantung berjalan sangat stabil dan toleran terhadap kegagalan jaringan. |

---

## ANALISIS KERENTANAN MENDALAM

### 1.  Privilege Escalation via Open SignUp & Database Trigger (Sangat Kritis)
- **Lokasi Kode Celah Keamanan:** 
  - Fungsi PostgreSQL `public.handle_new_user()` di Supabase DB (tercantum di `README.md`):
    ```sql
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, username, role)
      VALUES (new.id, new.email, split_part(new.email, '@', 1), 'admin'); -- <-- KATA KUNCI BAHAYA: 'admin'
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
  - Pembuatan pendaftaran akun pembantu di `WebAdmin/main.js` (baris 2145):
    ```javascript
    const { data, error } = await supabaseAux.auth.signUp({ email, password });
    ```
- **Analisis Mekanisme Eksploitasi:**
  1. Supabase secara default membiarkan fitur **"Allow new users to sign up"** aktif pada konfigurasi otentikasi Email.
  2. Supabase URL (`SUPABASE_URL`) and Anon Key (`SUPABASE_ANON_KEY`) bersifat publik karena digunakan langsung di sisi Web Frontend dan Unity client.
  3. Penyerang luar dapat mengekstrak Anon Key dengan mudah (misalnya melalui inspect element browser atau dekompilasi file APK Android).
  4. Dengan Anon Key tersebut, penyerang mengirimkan permintaan `POST` langsung ke endpoint registrasi Supabase API (`/auth/v1/signup`) dengan email & kata sandi sembarang.
  5. Setelah akun dibuat di `auth.users`, pemicu database (`on_auth_user_created`) memanggil fungsi `public.handle_new_user()`.
  6. Fungsi trigger ini **secara otomatis menetapkan `'admin'`** sebagai role pengguna baru di tabel `public.profiles`.
  7. Penyerang kini resmi memiliki hak akses administrator penuh dan dapat login ke dasbor WebAdmin untuk memanipulasi, merusak, atau menghapus seluruh data wisata, marker, model 3D, serta mengambil data sensitif lainnya.

---

### 2.  Permissive Row Level Security (RLS) Policies (Sangat Kritis)
- **Lokasi Dokumen:** Kebijakan RLS yang direkomendasikan di `README.md` (baris 180-191):
  - Tabel `ar_targets` $\rightarrow$ Kebijakan `Admin CRUD` $\rightarrow$ Target Role: `Authenticated` $\rightarrow$ Izin: `ALL`
  - Tabel `profiles` $\rightarrow$ Kebijakan `View Profiles` $\rightarrow$ Target Role: `Authenticated` $\rightarrow$ Izin: `SELECT`
- **Analisis Mekanisme Eksploitasi:**
  - Kebijakan RLS di atas hanya memvalidasi apakah pengguna tersebut **terotentikasi** (`Authenticated`) di Supabase.
  - RLS **tidak melakukan validasi peran** (*role validation*) terhadap isi kolom `role` di tabel `profiles`.
  - Jika penyerang mendaftar secara mandiri menggunakan akun non-admin biasa (sekalipun pemicu `handle_new_user` di atas diubah menjadi default `'member'`), penyerang tetap berstatus `Authenticated`.
  - Hasilnya, penyerang dapat memotong antarmuka WebAdmin dan mengirim query SQL/REST langsung ke tabel `ar_targets` untuk melakukan `INSERT`, `UPDATE`, atau `DELETE` karena kebijakan RLS memperbolehkan *semua* pengguna terotentikasi untuk melakukan modifikasi.

---

### 3.  Kunci API Google Drive & Supabase Terekspos tanpa Batasan (Medium)
- **Lokasi Kode Celah Keamanan:** 
  - Variabel master di C# Unity client `APIManager.cs` (baris 20-24):
    ```csharp
    private string masterBaseUrl = "https://efjuwxlhfxpnlenxluus.supabase.co/rest/v1/";
    private string masterApiKey = "eyJhbGciOiJIUzI1NiIsIn...";
    private string masterGDriveApiKey = "AIzaSyCqOuvDt8stKiEzMq8d9eZVIIM1jbJjR14";
    ```
- **Analisis Dampak Keamanan:**
  - **Supabase Anon Key**: Bersifat publik secara desain. Namun, membiarkannya terbuka tanpa RLS yang ketat akan membuka celah manipulasi data.
  - **Google Drive API Key**: Terekspos langsung secara polos dalam kode C# biner. Jika seseorang melakukan ekstraksi (*reverse-engineering*) terhadap berkas APK Android menggunakan perkakas dekompilator gratisan (seperti IL2CPP dumper atau dnSpy), mereka dapat mengambil kunci ini dengan instan.
  - Kunci API Google Cloud Platform (GCP) yang tidak dibatasi (*unrestricted*) dapat disalahgunakan oleh pihak ketiga untuk melakukan permintaan API dalam jumlah besar hingga menghabiskan kuota harian (*quota theft*) atau mengakibatkan tagihan finansial membengkak jika akun GCP Anda terhubung ke kartu kredit.

---

## REKOMENDASI PERBAIKAN DAN MITIGASI KONKRET

Kami merekomendasikan tindakan pengerasan (*hardening*) sistem berikut sesegera mungkin di lingkungan database Supabase dan Google Cloud Platform Anda:

### 1. Perbaikan Pemicu PostgreSQL (`handle_new_user`)
Ubah fungsi database agar secara default menetapkan role sebagai `'member'` (pengguna biasa), bukan `'admin'`. Hanya admin yang ada atau superadmin yang dapat menaikkan tingkat akun (*promote*) di tabel `profiles`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1), 
    'member' -- <-- Amankan! Mengubah default role menjadi member biasa
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2. Matikan Registrasi Terbuka (Disable Open SignUp) di Supabase Auth
Untuk mencegah penyerang mendaftar secara mandiri:
1. Masuk ke **Dashboard Supabase** Anda.
2. Navigasi ke menu **Authentication** di bilah kiri, lalu pilih sub-menu **Providers**.
3. Klik opsi **Email** untuk membuka pengaturannya.
4. Matikan (disable) opsi **Allow new users to sign up** (Izinkan pengguna baru mendaftar).
5. Klik **Save**.

> [!NOTE]
> Setelah opsi ini dinonaktifkan, pembuatan akun admin baru hanya dapat dilakukan secara aman melalui menu "Invite User" di Dashboard Supabase, atau dasbor admin yang menggunakan API Admin bypass (`service_role` key yang dirahasiakan).

---

### 3. Pengerasan Kebijakan Row Level Security (RLS) di Database
Kita harus menambahkan fungsi pembantu `public.is_admin()` untuk memvalidasi kolom `role` pengguna yang sedang mengakses tabel secara dinamis.

#### A. Membuat Fungsi Pemeriksa Admin
Jalankan script SQL berikut di **SQL Editor** Supabase Anda:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### B. Mengubah Kebijakan RLS Tabel `ar_targets`
Gantikan kebijakan yang lama dengan validasi fungsi `is_admin()`:
- **Untuk Izin SELECT (Membaca Data):**
  *Biarkan tetap publik agar aplikasi Unity tanpa login dapat membaca data target.*
  ```sql
  -- Policy: Public Read (SELECT)
  -- Expression: true (Allow for ALL roles / Anon)
  ```
- **Untuk Izin ALL (INSERT, UPDATE, DELETE):**
  *Hanya izinkan jika pengguna bersangkutan terotentikasi DAN memiliki role admin/superadmin.*
  ```sql
  -- Policy: Admin CRUD (ALL)
  -- Target Role: authenticated
  -- Using Expression (USING / WITH CHECK):
  public.is_admin()
  ```

#### C. Mengubah Kebijakan RLS Tabel `profiles`
Pastikan admin tidak bisa memanipulasi profil admin lain tanpa hak akses yang valid:
- **Untuk SELECT (Membaca Detail Profil):**
  ```sql
  -- Target Role: authenticated
  -- Expression: public.is_admin() OR auth.uid() = id
  ```
- **Untuk ALL (Mengubah Profil):**
  ```sql
  -- Target Role: authenticated
  -- Expression: public.is_admin()
  ```

#### D. Mengubah Kebijakan RLS Tabel `app_settings`
Pastikan konfigurasi kunci API utama tidak bisa diubah oleh sembarang orang terotentikasi:
- **Untuk SELECT (Membaca Konfigurasi - untuk Unity & Web):**
  ```sql
  -- Target Role: public (all)
  -- Expression: true
  ```
- **Untuk ALL (Mengubah Konfigurasi):**
  ```sql
  -- Target Role: authenticated
  -- Expression: public.is_admin()
  ```

---

### 4. Pengamanan Kunci API Google Drive di GCP Console
Untuk memastikan kunci API Google Drive (`masterGDriveApiKey`) aman dari pencurian kuota oleh pihak luar:
1. Masuk ke **Google Cloud Console** (`https://console.cloud.google.com`).
2. Pilih project GCP tempat Anda membuat Google Drive API Key.
3. Buka menu **APIs & Services > Credentials**.
4. Klik ikon edit pada API Key yang bersangkutan.
5. Pada bagian **API restrictions**:
   - Pilih **Restrict key**.
   - Pilih **Google Drive API** dari daftar dropdown. Ini membatasi kunci agar tidak dapat digunakan untuk memanggil layanan Google Cloud lainnya (seperti Cloud Storage, Compute Engine, dll.).
6. Pada bagian **Application restrictions** (Pilih salah satu atau kombinasikan):
   - **Android apps**: Masukkan nama paket aplikasi Android Anda (contoh: `com.Djaswita.JawitaAR`) beserta sidik jari SHA-1 sertifikat penandatanganan aplikasi (*keystore fingerprint*) Anda. Ini memastikan hanya aplikasi resmi Anda yang diizinkan menggunakan kunci tersebut di ponsel.
   - **Website (HTTP Referrers)**: Masukkan domain web admin Anda (misalnya `https://youradmin.pages.dev/*` or local testing domain). Ini mencegah orang lain memanggil kunci tersebut dari origin domain luar.

---

## ANALISIS STABILITAS SISTEM LURING (OFFLINE RESILIENCE)

Selain aspek keamanan, audit juga difokuskan pada pengujian stabilitas Unity AR Client saat menghadapi masalah kegagalan jaringan atau kondisi tanpa internet.

### Aspek Stabilitas yang Sangat Baik (Kelebihan Sistem saat Ini):
1. **Pencegahan Aplikasi Hang/Freeze:**
   Dalam skrip `DynamicMarkerManager.cs` dan `ARTargetHandler.cs`, pemantauan status internet (`MonitorInternetConnection()`) berjalan secara periodik setiap 1 detik. Apabila internet terputus sewaktu-waktu:
   - Kamera Vuforia tetap aktif dan stabil.
   - Prompt scan secara otomatis bertukar ke animasi **Offline Lottie Indicator** (`noInternetPrompt`) dengan transisi visual yang halus tanpa mematikan aplikasi.
   - Deteksi marker langsung diabaikan secara anggun (`isTracked = false`) jika jaringan tidak tersedia, mencegah rendering model 3D parsial yang merusak visual.
2. **Pemulihan Koneksi Otomatis (*Auto-Recovery*):**
   Saat jaringan pulih kembali, `loadedMarkers` dipantau kembali. Jika inisialisasi awal database gagal akibat mati koneksi pada saat startup, pemanggilan `LoadMarkersFromDatabase()` langsung dipicu kembali secara otomatis sesaat setelah koneksi pulih.
3. **Optimasi Cache Berkas (AssetCacheManager):**
   Sistem cache lokal untuk GLB, gambar, dan video melindungi aplikasi dari kegagalan buffering akibat koneksi lambat. Sekali data terunduh, aplikasi sepenuhnya mandiri membaca berkas dari penyimpanan internal (`Application.persistentDataPath`).

---

## KESIMPULAN AUDIT

Sistem D'Jaswita AR memiliki **pondasi stabilitas klien Unity yang sangat tangguh** terhadap kegagalan jaringan. Namun, dari segi keamanan backend, terdapat **kelemahan struktural kritis pada pemicu otomatis otentikasi Supabase dan kebijakan RLS**. 

Eksploitasi atas celah ini **sangat mudah dilakukan** dan dapat mengakibatkan pengambilalihan kontrol dasbor secara penuh (*full database takeover*). Mengikuti langkah-langkah mitigasi di atas sangat penting dan wajib diselesaikan sebelum platform ini diluncurkan secara luas ke publik.
