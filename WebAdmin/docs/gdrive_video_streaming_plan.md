# Mixed Video Streaming Architecture (Supabase + GDrive)

Sistem ini akan mendukung dua sumber video secara bersamaan (Mixed Sources):

1. **Supabase Storage** (default, streaming langsung).
2. **Google Drive** (streaming bypass menggunakan Google Drive API Key).

---

## 1. Persiapan Database (Supabase)

Sistem membutuhkan tempat untuk menyimpan API Key GDrive agar bisa diubah sewaktu-waktu oleh Admin via web.

**Tindakan Wajib di Supabase Dashboard (SQL Editor):**

1. Masuk ke Dashboard Supabase Anda.
2. Buka menu **SQL Editor** di sidebar kiri.
3. Klik **New Query** dan jalankan kode SQL berikut:

```sql
-- Tambah kolom API Key di tabel config
ALTER TABLE app_settings
ADD COLUMN gdrive_api_key text;

-- Tambah kolom log pelacakan perubahan untuk GDrive Key
ALTER TABLE app_settings_logs
ADD COLUMN old_gdrive_key text,
ADD COLUMN new_gdrive_key text;
```

4. Klik tombol **Run** untuk mengeksekusi kode tersebut.

---

## 2. Cara Mendapatkan Google Drive API Key (Google Cloud Console)

Ini adalah langkah yang bisa Anda (atau perusahaan) ikuti untuk membuat kunci rahasia (_API Key_) secara gratis. Kunci inilah yang akan dimasukkan ke dalam Dashboard WebAdmin.

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Login dengan akun Google perusahaan.
3. Di bagian kiri atas, klik menu dropdown **Project**, lalu klik **New Project**. Beri nama (misal: "Jaswita AR GDrive") dan klik **Create**.
4. Setelah project terbuat, pastikan Anda sedang berada di dalam project tersebut.
5. Pergi ke tab **APIs & Services > Library**.
6. Ketik di kotak pencarian: `Google Drive API`.
7. Klik hasil pencariannya dan klik **Enable**.
8. Setelah aktif, pergi ke menu **APIs & Services > Credentials**.
9. Klik tombol **+ CREATE CREDENTIALS** di bagian atas, lalu pilih **API Key**.
10. Akan muncul popup berisi deretan huruf/angka. **Itulah API Key Anda.** (Anda bisa mengklik ikon _copy_).
11. Paste API Key tersebut ke dalam menu **Config** di aplikasi WebAdmin D'Jaswita Anda, lalu tekan Simpan!

---

## 3. Rencana Modifikasi Kode (Implementation Plan)

### A. WebAdmin / Dashboard

**1. `WebAdmin/components/SettingsSection.js`**

- Menambahkan field input baru untuk **Google Drive API Key** di bawah input Supabase Key.
- Menambahkan tampilan informasi "GDrive API Key Saat Ini" di panel sebelah kanan (_Konfigurasi Aktif_).

**2. `WebAdmin/main.js`**

- Mengubah logika `fetchSettings()` untuk merender data `gdrive_api_key` dari tabel `app_settings` ke layar.
- Mengubah event listener pada tombol **Simpan Perubahan** agar `gdrive_api_key` ikut di-upsert ke tabel `app_settings`.

### B. Unity App (C#)

**1. `APIManager.cs`**

- Menambahkan _property_ baru `public string gdriveApiKey;` di dalam struct/class `AppSettings`.
- Ketika Unity memanggil API ke `app_settings`, nilai ini akan ditangkap dan disimpan secara global (misal di `APIManager.Instance.gdriveApiKey`) agar kelas lain bisa memakainya.

**2. `ARTargetHandler.cs`**

- Saat fungsi dijalankan untuk menyetel URL ke `VideoPlayer.url`, tambahkan logika _Interceptor_ / _Parser_.
- Jika `video_url` mengandung kata `drive.google.com`:
  1. Ekstrak `FILE_ID` dari link tersebut. (Contoh: `drive.google.com/file/d/1a2b3c.../view` -> Ambil `1a2b3c...`).
  2. Susun ulang URL menjadi format _Bypass API_:
     `https://www.googleapis.com/drive/v3/files/{FILE_ID}?alt=media&key={APIManager.Instance.gdriveApiKey}`
  3. Berikan link modifikasi tersebut ke `VideoPlayer`.
- Jika bukan dari Google Drive (misal dari Supabase), langsung teruskan URL apa adanya.

---

## 4. Rencana Verifikasi (Testing)

1. **Verifikasi WebAdmin:**
   - Memasukkan API Key ke menu Config, simpan, dan muat ulang halaman untuk memastikan data tidak hilang.
2. **Verifikasi Database:**
   - Melihat tabel `app_settings` di Supabase untuk memastikan data sukses masuk ke kolom `gdrive_api_key`.
3. **Verifikasi Unity:**
   - Melakukan Play di editor. Melacak (Debug.Log) apakah `ARTargetHandler` berhasil mengekstrak ID File dan menempelkannya dengan API Key dari `APIManager`.
   - Menguji kelancaran pemutaran video menggunakan file besar >100MB di GDrive.
