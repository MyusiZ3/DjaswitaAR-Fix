# Rencana Pengembangan Global: Generalisasi Sistem AR (Bucket `ar-media` & Kolom `activity_start`/`activity_end`)

Rencana ini dibuat untuk memenuhi permintaan generalisasi lanjutan agar platform tidak terikat secara kaku pada industri pariwisata. Perubahan ini mencakup penyesuaian nama Supabase Storage Bucket dari `wisata-media` menjadi `ar-media`, serta penamaan ulang kolom tanggal pendaftaran/event dari `booking_start`/`booking_end` menjadi `activity_start`/`activity_end`.

---

## User Review Required: Panduan Migrasi Database & Storage Supabase

Karena perubahan ini melibatkan backend aktif Anda di Supabase, Anda perlu melakukan migrasi manual berikut di Dashboard Supabase agar sinkron dengan kode program baru:

### 1. Migrasi Kolom Database (Melalui SQL Editor)
Jalankan script SQL berikut di **SQL Editor** Supabase Anda untuk mengubah nama kolom secara aman tanpa kehilangan tipe data:

```sql
-- 1. Mengubah kolom booking_start menjadi activity_start
ALTER TABLE ar_targets 
RENAME COLUMN booking_start TO activity_start;

-- 2. Mengubah kolom booking_end menjadi activity_end
ALTER TABLE ar_targets 
RENAME COLUMN booking_end TO activity_end;
```

### 2. Migrasi Storage Bucket (Melalui Menu Storage)
Karena Supabase tidak mendukung pengubahan nama (*rename*) bucket secara langsung lewat SQL, silakan lakukan langkah mudah berikut:
1. Masuk ke menu **Storage** di Dashboard Supabase.
2. Buat bucket baru bernama **`ar-media`** (pastikan diatur ke **Public**).
3. Salin/unggah ulang file-file pengetesan Anda dari bucket lama `wisata-media` ke bucket baru `ar-media`.
4. Salin kebijakan akses (**Storage Policies**) dari bucket lama ke bucket baru (misal: memberikan akses insert/update/delete untuk *authenticated users*).
5. Hapus bucket lama **`wisata-media`** setelah semua data dipindahkan.

---

## Detail Perubahan Per Berkas (Lokal)

Kami akan memperbarui berkas-berkas berikut secara terstruktur di lingkungan lokal:

### 1. Web Admin Dashboard (CMS)

#### [MODIFY] [main.js](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/main.js)
*   Mengubah seluruh referensi penyimpanan Supabase dari `"wisata-media"` menjadi `"ar-media"`.
*   Memperbarui fungsi parsing URL media yang mendeteksi jalur folder agar memisahkan string berdasarkan `/ar-media/` alih-alih `/wisata-media/`.

#### [MODIFY] [SettingsSection.js](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/components/SettingsSection.js)
*   Memperbarui teks penjelasan pemindaian sinkronisasi media (baris 305) agar merujuk ke bucket baru:
    ```html
    <!-- Sebelum -->
    Sistem akan memindai seluruh isi bucket <strong>wisata-media</strong> dan membandingkannya...

    <!-- Sesudah -->
    Sistem akan memindai seluruh isi bucket <strong>ar-media</strong> dan membandingkannya...
    ```

---

### 2. Unity Client App

#### [MODIFY] [ARTargetData.cs](file:///d:/Projects/Unity/DjaswitaAR-Fix/Assets/Scripts/ARTargetData.cs)
*   Mengubah nama properti data C# agar memetakan skema database baru secara tepat saat parsing JSON:
    ```csharp
    // Sebelum
    public string booking_start;
    public string booking_end;

    // Sesudah
    public string activity_start;
    public string activity_end;
    ```

---

### 3. Dokumentasi Program

#### [MODIFY] [README.md](file:///d:/Projects/Unity/DjaswitaAR-Fix/README.md)
*   Memperbarui penjelasan tabel `ar_targets` bagian skema kolom agar mencantumkan `activity_start` & `activity_end`.
*   Menyesuaikan SQL Query inisialisasi database (baris 215-216) dengan nama kolom yang baru.
*   Memperbarui bagian panduan inisialisasi Supabase Storage agar menuntun pembuatan bucket **`ar-media`** lengkap dengan konfigurasi kebijakannya (*Storage Policies*).

---

## Rencana Verifikasi

### Pengujian Web Admin:
1. Pastikan aplikasi web berhasil dijalankan tanpa error di konsol browser.
2. Coba unggah file marker atau model 3D baru pada modul penambahan AR Marker.
3. Verifikasi di tab Network browser bahwa file dikirim ke endpoint Storage bucket `ar-media`.
4. Jalankan fitur scan integritas di halaman Settings untuk memastikan ia berhasil memindai bucket `ar-media`.

### Pengujian Unity:
1. Pastikan seluruh kode C# dapat dikompilasi secara bersih tanpa error (*Compilation Success*).
2. Lakukan simulasi pengambilan data API dan verifikasi bahwa parsing JSON target berjalan lancar dengan properti baru.

---

## Konfirmasi Sebelum Commit

Sesuai dengan kesepakatan ("*oke nanti sblm saya suh commit jangan commit langung ya saya perlu cek*"), seluruh rangkaian perubahan ini **hanya akan diaplikasikan pada salinan lokal** dan **tidak akan di-commit** secara langsung ke Git. Kami akan menunggu instruksi tertulis berikutnya setelah Anda selesai memeriksa seluruh modifikasi.
