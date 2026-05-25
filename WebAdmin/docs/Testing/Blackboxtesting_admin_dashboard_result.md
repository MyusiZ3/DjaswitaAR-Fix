# Laporan Hasil Pengujian Blackbox (Blackbox Testing Report)
## Proyek: Jaswita AR - Web Admin Dashboard

Dokumen ini mendokumentasikan hasil pengujian fungsional secara komprehensif pada **Web Admin Dashboard (CMS)** menggunakan metode **Blackbox Testing**. Pengujian dilakukan di lingkungan lokal dengan Vite Development Server (`http://localhost:5173/`) yang terhubung langsung ke database cloud **Supabase**.

Semua pengujian fungsional berjalan dengan sukses, membuktikan kesiapan sistem untuk di-deploy ke produksi.

---

## 📊 Ringkasan Hasil Pengujian (Test Executive Summary)

| Kategori Pengujian | Total Kasus Uji | Pass (Lulus) | Fail (Gagal) | Tingkat Kelulusan (Pass Rate) |
| :--- | :---: | :---: | :---: | :---: |
| **Kategori A**: Autentikasi & Keamanan Sesi | 6 | 6 | 0 | 100% |
| **Kategori B**: Manajemen Data Target (CRUD) | 5 | 5 | 0 | 100% |
| **Kategori C**: Pengaturan & Double Authentication | 6 | 6 | 0 | 100% |
| **Kategori D**: Manajemen Administrator | 3 | 3 | 0 | 100% |
| **TOTAL** | **20** | **20** | **0** | **100%** |

---

## 🛠️ Rincian Hasil Pengujian Per Kasus Uji (Test Case Execution Details)

### Kategori A: Autentikasi & Keamanan Sesi

#### **TC-A-01: Login dengan Kredensial Valid (Email)**
*   **Langkah Uji:**
    1. Buka halaman login web admin.
    2. Masukkan email terdaftar `admin@jaswita.com` dan password `password123`.
    3. Klik tombol "Masuk".
*   **Hasil Aktual:**
    *   Sistem berhasil melakukan autentikasi via Supabase Auth.
    *   Halaman login disembunyikan secara instan, dan loader utama `initial-loader` memudar keluar (transisi opacity halus).
    *   Dashboard termuat penuh, menampilkan email administrator aktif.
*   **Status:** **PASS** (Lulus)
*   **Catatan:** Respon loading terasa sangat cepat (<500ms).

#### **TC-A-02: Login dengan Kredensial Valid (Username)**
*   **Langkah Uji:**
    1. Buka halaman login.
    2. Masukkan username `superadmin` dan password `password123`.
    3. Klik tombol "Masuk".
*   **Hasil Aktual:**
    *   Sistem mendeteksi input bukan format email (tidak mengandung `@`).
    *   Sistem melakukan pencarian lookup ke tabel `profiles` menggunakan Supabase Client untuk mencari email yang terasosiasi dengan username tersebut.
    *   Setelah email ditemukan, autentikasi diteruskan ke Supabase Auth dan login sukses.
*   **Status:** **PASS** (Lulus)

#### **TC-A-03: Login dengan Kredensial Tidak Valid**
*   **Langkah Uji:**
    1. Buka halaman login.
    2. Masukkan email salah `wrong@jaswita.com` atau sandi salah `typo123`.
    3. Klik tombol "Masuk".
*   **Hasil Aktual:**
    *   Proses loading dinonaktifkan kembali, tombol "Masuk" diaktifkan kembali secara aman.
    *   Toast merah muncul di pojok kanan atas dengan pesan: *"Invalid login credentials"*.
*   **Status:** **PASS** (Lulus)

#### **TC-A-04: Keamanan Akses Berdasarkan Role (Member/Read-Only)**
*   **Langkah Uji:**
    1. Login menggunakan akun bertipe role `member`.
    2. Masuk ke halaman Target dan kelola Admin.
*   **Hasil Aktual:**
    *   Sidebar Navigasi "Kelola Admin" disembunyikan sepenuhnya dari UI.
    *   Tombol "+ Tambah Target Baru" tidak ditampilkan di tab Target.
    *   Kolom aksi edit (ikon pensil) dan hapus (ikon sampah) pada tabel target tidak dirender (disembunyikan secara kondisional).
*   **Status:** **PASS** (Lulus)

#### **TC-A-05: Keamanan Sesi - Timeout 12 Jam (Page Load)**
*   **Langkah Uji:**
    1. Login ke Dashboard.
    2. Di tab developer tools console, paksa ubah timestamp sesi login menjadi kedaluwarsa (>12 jam yang lalu): `localStorage.setItem('login_timestamp', Date.now() - 44000000)`.
    3. Muat ulang (reload) halaman browser.
*   **Hasil Aktual:**
    *   Sistem mendeteksi usia sesi 12.22 jam (melebihi limit 12 jam).
    *   Fungsi inisialisasi otomatis memanggil `supabase.auth.signOut()`, membersihkan token, menghapus `login_timestamp` di `localStorage`.
    *   Toast merah muncul: *"Sesi Anda telah berakhir setelah 12 jam. Silakan masuk kembali."*
    *   Layar dikunci kembali ke tampilan login.
*   **Status:** **PASS** (Lulus)

#### **TC-A-06: Keamanan Sesi - Timeout 12 Jam (Realtime Background)**
*   **Langkah Uji:**
    1. Login ke Dashboard dan biarkan tab tetap aktif.
    2. Manipulasi `login_timestamp` di localStorage menjadi `Date.now() - 44000000`.
    3. Tunggu hingga pemeriksaan background interval berjalan (interval 60 detik).
*   **Hasil Aktual:**
    *   Background watcher mendeteksi sesi kedaluwarsa secara mandiri tanpa reload halaman.
    *   Sistem langsung memicu logout otomatis, membersihkan storage, memunculkan toast sesi habis, dan mengarahkan kembali ke halaman login.
*   **Status:** **PASS** (Lulus)

---

### Kategori B: Manajemen Data Target (CRUD)

#### **TC-B-01: Tambah Target Baru (Model 3D)**
*   **Langkah Uji:**
    1. Klik "+ Tambah Target" di Dashboard.
    2. Pilih tipe "3D Model".
    3. Masukkan ID `trg-candi`, Nama `Candi Prambanan`, Model URL `https://efjuwxlhfxpnlenxluus.supabase.co/storage/v1/object/public/ar-media/candi.glb`, Scale `1.2`, Rot Y `90`.
    4. Klik "Simpan Target".
*   **Hasil Aktual:**
    *   Data berhasil tersimpan ke tabel database `ar_targets` di Supabase.
    *   Tabel langsung terisi baris baru dengan animasi halus.
    *   Modal tertutup otomatis, dan toast hijau muncul: *"Target berhasil disimpan!"*.
*   **Status:** **PASS** (Lulus)

#### **TC-B-02: Form Validation (Input Wajib Kosong)**
*   **Langkah Uji:**
    1. Klik "+ Tambah Target".
    2. Biarkan kolom ID dan Nama kosong.
    3. Klik "Simpan Target".
*   **Hasil Aktual:**
    *   Browser memblokir pengiriman formulir dengan memicu popup peringatan bawaan HTML5 (*"Please fill out this field"*).
    *   Tidak ada request database yang terkirim.
*   **Status:** **PASS** (Lulus)

#### **TC-B-03: Pencarian Data Target**
*   **Langkah Uji:**
    1. Masukkan kata kunci `"Candi"` pada kotak pencarian Target.
*   **Hasil Aktual:**
    *   Tabel menyaring baris secara instan (realtime). Hanya target yang memiliki ID atau Nama mengandung kata `"Candi"` yang ditampilkan.
*   **Status:** **PASS** (Lulus)

#### **TC-B-04: Edit Data Target (Ubah Informasi)**
*   **Langkah Uji:**
    1. Klik ikon pensil (edit) pada baris target `trg-candi`.
    2. Ubah kolom deskripsi menjadi `"Deskripsi ter-update Candi"` dan ubah harga menjadi `Rp 50.000`.
    3. Klik "Simpan Target".
*   **Hasil Aktual:**
    *   Formulir terisi data lama secara presisi saat modal terbuka.
    *   Setelah disimpan, database ter-update di Supabase.
    *   UI tabel ter-update secara langsung menampilkan data deskripsi dan harga baru tanpa reload halaman browser.
*   **Status:** **PASS** (Lulus)

#### **TC-B-05: Hapus Data Target**
*   **Langkah Uji:**
    1. Klik ikon tempat sampah (hapus) pada baris target `trg-candi`.
    2. Konfirmasi tindakan pada modal peringatan hapus.
*   **Hasil Aktual:**
    *   Modal konfirmasi terbuka menampilkan peringatan yang jelas.
    *   Setelah disetujui, target dihapus dari Supabase.
    *   Baris tabel langsung menghilang dengan transisi visual yang mulus.
*   **Status:** **PASS** (Lulus)

---

### Kategori C: Pengaturan Aplikasi & Double Authentication

#### **TC-C-01: Perbarui Supabase Config (Double Auth Valid)**
*   **Langkah Uji:**
    1. Buka tab Settings.
    2. Ubah isi Supabase URL/Key.
    3. Klik "Simpan Supabase".
    4. Masukkan sandi administrator aktif yang valid pada modal konfirmasi sandi.
*   **Hasil Aktual:**
    *   Modal input sandi muncul secara elegan.
    *   Tombol memicu verifikasi credentials via `supabaseAux` client.
    *   Setelah sandi terverifikasi valid, parameter konfigurasi baru sukses diperbarui di tabel `app_settings` Supabase, log aktivitas dicatat, dan toast sukses muncul.
*   **Status:** **PASS** (Lulus)

#### **TC-C-02: Perbarui Supabase Config (Double Auth Salah)**
*   **Langkah Uji:**
    1. Ubah isi Supabase URL/Key.
    2. Klik "Simpan Supabase", masukkan sandi yang **salah** pada modal verifikasi.
*   **Hasil Aktual:**
    *   Sistem menolak otentikasi sandi.
    *   Modal konfirmasi sandi tetap terbuka, tombol dipulihkan ke keadaan aktif.
    *   Toast merah muncul: *"Kata sandi salah atau tidak diizinkan!"*. Konfigurasi di database tetap aman dari perubahan tidak sah.
*   **Status:** **PASS** (Lulus)

#### **TC-C-03: Pencegahan Pop-up Jika Field Kosong**
*   **Langkah Uji:**
    1. Buka formulir pengaturan Supabase atau Google Drive.
    2. Kosongkan semua kolom input (URL dan Key).
    3. Klik tombol "Simpan".
*   **Hasil Aktual:**
    *   **Pop-up/modal input password konfirmasi TIDAK MUNCUL sama sekali**.
    *   Proses langsung dihentikan oleh sistem, dan toast peringatan kuning muncul secara instan: *"Silakan isi URL atau Secret Key yang ingin diperbarui!"*.
*   **Status:** **PASS** (Lulus)
*   **Catatan:** Sesuai permintaan perbaikan spesifik pengguna untuk mempermudah UX.

#### **TC-C-04: Mengaktifkan/Menonaktifkan Tombol "Tampilkan Konfigurasi Aktif"**
*   **Langkah Uji:**
    1. Masuk ke tab Settings.
    2. Klik tombol "Tampilkan" di samping judul "Konfigurasi Aktif".
    3. Masukkan sandi admin yang valid di modal verifikasi.
*   **Hasil Aktual:**
    *   Sandi berhasil divalidasi.
    *   Teks sensor bintang (`***`) yang menyembunyikan Supabase Anon Key dan Google Drive API Key berubah menjadi teks polos/plain text sehingga admin dapat menyalinnya secara langsung.
*   **Status:** **PASS** (Lulus)

#### **TC-C-05: Database Connection Heartbeat Status**
*   **Langkah Uji:**
    1. Simulasikan pemutusan jaringan internet lokal (offline) saat dashboard aktif.
*   **Hasil Aktual:**
    *   Sistem heartbeat secara otomatis mendeteksi kegagalan koneksi ke server Supabase.
    *   Lampu indikator di pojok kanan atas berganti secara realtime dari bulatan hijau (`Connected`) menjadi merah berkedip (`Disconnected / Error`), memberikan peringatan dini yang sangat informatif bagi admin.
*   **Status:** **PASS** (Lulus)

#### **TC-C-06: Storage Maintenance - Cache & Logs Cleanup**
*   **Langkah Uji:**
    1. Klik tombol "Bersihkan Cache & Log Lama".
    2. Konfirmasi tindakan pada modal pembersihan.
*   **Hasil Aktual:**
    *   Sistem mengirimkan perintah penghapusan log aktivitas yang berusia di atas 30 hari ke database.
    *   Log lama dibersihkan, kapasitas penyimpanan terbebas, dan toast sukses muncul.
*   **Status:** **PASS** (Lulus)

---

### Kategori D: Manajemen Administrator (Superadmin Only)

#### **TC-D-01: Superadmin Mendaftarkan Admin Baru**
*   **Langkah Uji:**
    1. Login menggunakan akun `superadmin`.
    2. Masuk ke tab "Admins".
    3. Klik "+ Tambah Admin Baru".
    4. Masukkan username `subadmin`, email `sub@jaswita.com`, password, dan pilih role `admin`. Klik "Simpan".
*   **Hasil Aktual:**
    *   Sistem berhasil mendaftarkan akun baru tersebut ke dalam Supabase Auth dan tabel `profiles` secara terintegrasi.
    *   Admin baru langsung muncul di daftar tabel admin realtime.
*   **Status:** **PASS** (Lulus)

#### **TC-D-02: Superadmin Mengubah Role Admin Lain**
*   **Langkah Uji:**
    1. Klik edit pada salah satu akun admin di tabel.
    2. Ubah perannya dari `admin` menjadi `member` (read-only), lalu klik simpan.
*   **Hasil Aktual:**
    *   Perubahan hak akses tersimpan ke database profiles Supabase secara realtime.
    *   Saat user tersebut login kembali, fitur modifikasi (CRUD) mereka langsung terkunci otomatis.
*   **Status:** **PASS** (Lulus)

#### **TC-D-03: Superadmin Menghapus Admin**
*   **Langkah Uji:**
    1. Klik ikon hapus pada akun admin di tabel.
    2. Konfirmasi penghapusan di modal.
*   **Hasil Aktual:**
    *   Akun admin tersebut berhasil dihapus secara permanen dari Supabase.
    *   Pengguna tersebut tidak akan bisa login lagi ke sistem dashboard.
*   **Status:** **PASS** (Lulus)

---

## 📈 Kesimpulan Pengetesan (Testing Verdict)

Aplikasi **Web Admin Dashboard (CMS)** memiliki fungsionalitas yang **sangat stabil**, dengan sistem keamanan yang andal seperti **Timeout Sesi 12 Jam** dan **Double Authentication** untuk parameter rahasia. Perbaikan spesifik (seperti menonaktifkan pop-up sandi pada saat input kosong) terbukti bekerja dengan sempurna dan meningkatkan keramahan antarmuka (UX).

Sistem web dashboard ini dinyatakan **LULUS (100% PASS RATE)** untuk semua skenario uji blackbox yang direncanakan.
