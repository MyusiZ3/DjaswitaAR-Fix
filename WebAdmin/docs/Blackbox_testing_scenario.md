# Skenario Pengujian Blackbox (Blackbox Testing Scenario)
## Proyek: Jaswita AR (Web Admin Dashboard & Unity AR Mobile App)

Dokumen ini berisi rencana dan skenario pengujian fungsional terintegrasi untuk sistem **Jaswita AR** menggunakan metode **Blackbox Testing**. Pengujian difokuskan pada pengamatan hasil akhir (output) dari masukan (input) yang diberikan tanpa harus melihat detail kode program secara mendalam.

Metode pengujian yang diterapkan meliputi **Equivalence Partitioning** (pembagian kelas data) dan **Boundary Value Analysis** (analisis nilai batas).

---

## 📌 Lingkup Pengujian (Test Scope)
1. **Web Admin Dashboard (Web App)**: Autentikasi, Keamanan Sesi (Timeout 12 Jam), Manajemen Data Target (CRUD), Pengaturan Aplikasi (Supabase & Google Drive Config dengan Double Authentication), Manajemen Administrator, dan Pemantauan Statistik.
2. **Unity Client (Mobile App)**: Inisialisasi Sistem, Deteksi Marker (Vuforia), Rendering Konten (3D glb, Image Carousel, Video Player GDrive), LRU Caching System (RAM & Disk), dan Manajemen Offline Mode.
3. **Skenario Campuran/Integrasi (Mixed Scenario)**: Sinkronisasi data realtime antara scan marker di aplikasi mobile dan update statistik di Web Admin Dashboard.

---

## 🛠️ Detail Skenario Pengujian (Test Cases)

### Kategori A: Autentikasi & Keamanan Sesi (Web Admin)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Data Masukan (Input) | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-A-01** | Login dengan Kredensial Valid (Email) | 1. Buka halaman login web admin.<br>2. Masukkan email & password terdaftar.<br>3. Klik tombol "Masuk". | Email: `admin@jaswita.com`<br>Password: `password123` | Sistem berhasil masuk dan mengarahkan pengguna ke halaman utama Dashboard. Loader awal hilang. | |
| **TC-A-02** | Login dengan Kredensial Valid (Username) | 1. Buka halaman login web admin.<br>2. Masukkan username & password terdaftar.<br>3. Klik tombol "Masuk". | Username: `superadmin`<br>Password: `password123` | Sistem melakukan lookup email berdasarkan username, lalu berhasil masuk ke halaman Dashboard. | |
| **TC-A-03** | Login dengan Kredensial Tidak Valid | 1. Buka halaman login web admin.<br>2. Masukkan email salah atau password salah.<br>3. Klik tombol "Masuk". | Email: `wrong@jaswita.com`<br>Password: `typo123` | Sistem membatalkan login, memulihkan tombol masuk, dan memunculkan toast error: *"Invalid login credentials"*. | |
| **TC-A-04** | Keamanan Akses Berdasarkan Role (Member/Read-Only) | 1. Login menggunakan akun dengan role `member`.<br>2. Periksa tampilan sidebar navigasi dan tombol penambahan data. | Akun member | Tombol "Tambah Data Baru" di Target tidak muncul. Kolom aksi edit/hapus hilang. Menu kelola Admin tidak dapat diakses. | |
| **TC-A-05** | Keamanan Sesi - Timeout 12 Jam (Page Load) | 1. Login ke dalam Dashboard.<br>2. Simulasikan perubahan timestamp login di localStorage menjadi >12 jam yang lalu.<br>3. Muat ulang (reload) halaman dashboard. | `login_timestamp` di localStorage diset ke `Date.now() - 44000000` | Sistem mendeteksi sesi kedaluwarsa, menghapus token di localStorage, melakukan `signOut` otomatis, menampilkan toast peringatan sesi habis, dan mengarahkan kembali ke layar Login. | |
| **TC-A-06** | Keamanan Sesi - Timeout 12 Jam (Realtime Background) | 1. Login ke dalam Dashboard.<br>2. Biarkan tab tetap terbuka.<br>3. Simulasikan manipulasi waktu `login_timestamp` menjadi >12 jam yang lalu. | Pemeriksaan otomatis tiap 60 detik | Sistem secara otomatis mengaktifkan penanganan logout, menampilkan toast peringatan keluar, memanggil `signOut`, dan memicu reload halaman secara instan tanpa interaksi klik dari pengguna. | |

---

### Kategori B: Manajemen Data Target - CRUD (Web Admin)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Data Masukan (Input) | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-B-01** | Tambah Target Baru (Model 3D) | 1. Masuk ke halaman "Target".<br>2. Klik "+ Tambah Target".<br>3. Isi formulir lengkap dengan `Main Content Type` = "3D Model".<br>4. Klik "Simpan Target". | ID: `trg-candi`<br>Nama: `Candi Prambanan`<br>Model URL: `https://gdrive.com/candi.glb`<br>Scale: `1.2`, Rot Y: `90` | Data berhasil ditambahkan ke database, tabel ter-update secara realtime, modal tertutup, dan toast sukses muncul. | |
| **TC-B-02** | Form Validation (Input Wajib Kosong) | 1. Klik "+ Tambah Target".<br>2. Kosongkan field wajib seperti ID dan Nama.<br>3. Klik "Simpan Target". | ID: `""` (Kosong)<br>Nama: `""` (Kosong) | Browser memicu peringatan HTML5 bawaan (*"Please fill out this field"*) atau sistem membatalkan submit dan menampilkan toast error validasi. | |
| **TC-B-03** | Pencarian Data Target | 1. Masukkan kata kunci pencarian di kolom search box dashboard. | Query: `"Candi"` | Tabel menyaring baris secara instan (realtime) dan hanya menampilkan target yang memiliki nama atau ID mengandung kata `"Candi"`. | |
| **TC-B-04** | Edit Data Target (Ubah Informasi) | 1. Klik ikon pensil (edit) pada baris target.<br>2. Ubah kolom `Harga` dan `Deskripsi`.<br>3. Klik "Simpan Target". | Deskripsi baru: `"Deskripsi ter-update Candi"`<br>Harga: `Rp 50.000` | Data diperbarui di Supabase database, UI menampilkan informasi baru secara langsung tanpa force-reload, dan toast sukses muncul. | |
| **TC-B-05** | Hapus Data Target | 1. Klik ikon tempat sampah (hapus) pada baris target.<br>2. Konfirmasi penghapusan pada modal peringatan yang muncul. | Klik "Hapus" pada modal | Target dihapus dari database, baris tabel terhapus dengan animasi transisi halus, dan toast pemberitahuan sukses muncul. | |

---

### Kategori C: Pengaturan Aplikasi & Double Authentication (Web Admin)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Data Masukan (Input) | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-C-01** | Perbarui Supabase Config (Double Auth Valid) | 1. Masuk ke tab "Settings".<br>2. Ubah isi input Supabase URL/Key.<br>3. Klik "Simpan Supabase".<br>4. Masukkan sandi admin yang valid di modal konfirmasi.<br>5. Klik "Verifikasi & Simpan". | URL: `https://new-project.supabase.co`<br>Password: `password123` | Sandi diverifikasi via `signInWithPassword`, konfigurasi disimpan di Supabase vault/table, logs aktivitas bertambah, dan toast sukses muncul. | |
| **TC-C-02** | Perbarui Supabase Config (Double Auth Salah) | 1. Ubah isi input Supabase URL/Key.<br>2. Klik "Simpan Supabase".<br>3. Masukkan sandi admin yang **salah** di modal.<br>4. Klik "Verifikasi & Simpan". | Password: `sandiSalah123` | Sistem membatalkan penyimpanan, tombol verifikasi dipulihkan, modal tetap aktif, dan toast muncul: *"Kata sandi salah atau tidak diizinkan!"*. | |
| **TC-C-03** | Pencegahan Pop-up Jika Field Kosong | 1. Buka formulir "Perbarui Supabase" atau "Perbarui Google Drive".<br>2. Kosongkan semua kolom input (URL dan Key).<br>3. Klik tombol "Simpan". | Input: Kosong | **Pop-up pengisian password TIDAK MUNCUL**. Sistem langsung membatalkan proses dan memicu toast error: *"Silakan isi URL atau Secret Key yang ingin diperbarui!"*. | |
| **TC-C-04** | Mengaktifkan/Menonaktifkan Tombol "Tampilkan Konfigurasi Aktif" | 1. Masuk ke tab Settings.<br>2. Klik tombol "Tampilkan" di samping judul Konfigurasi Aktif.<br>3. Masukkan sandi admin.<br>4. Klik "Verifikasi & Tampilkan". | Password Valid | Kunci terenkripsi (seperti Supabase Key & GDrive Key) yang sebelumnya disembunyikan dengan tanda bintang (`***`) berubah menjadi teks biasa yang bisa dibaca. | |
| **TC-C-05** | Database Connection Heartbeat Status | 1. Putuskan jaringan internet lokal (offline) atau ubah config Supabase ke URL fiktif.<br>2. Amati indikator Database Heartbeat di kanan atas. | Koneksi terputus / gagal handshake | Bulatan indikator berubah dari warna hijau (`Connected`) menjadi warna merah berkedip (`Disconnected / Error`), memberikan peringatan dini kepada administrator. | |
| **TC-C-06** | Storage Maintenance - Cache & Logs Cleanup | 1. Klik tombol "Bersihkan Cache & Log Lama".<br>2. Konfirmasi tindakan pada modal pembersihan. | Klik "Konfirmasi Bersihkan" | Menghapus log pelacakan yang berusia di atas batas hari yang ditentukan (threshold), memperkecil beban database, dan mengembalikan status log terhapus di tabel logs. | |

---

### Kategori D: Manajemen Administrator - Superadmin Only (Web Admin)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Data Masukan (Input) | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-D-01** | Superadmin Mendaftarkan Admin Baru | 1. Login sebagai `superadmin`.<br>2. Masuk ke tab "Admins".<br>3. Klik "+ Tambah Admin Baru".<br>4. Masukkan username, email, password, dan pilih role.<br>5. Klik "Simpan". | Username: `subadmin`<br>Email: `sub@jaswita.com`<br>Role: `admin` | Pengguna baru terbuat di sistem auth Supabase, baris admin baru terdaftar di tabel, dan toast pemberitahuan sukses muncul. | |
| **TC-D-02** | Superadmin Mengubah Role Admin Lain | 1. Klik ikon edit pada salah satu admin di tabel.<br>2. Ubah role dari `admin` menjadi `member` (read-only).<br>3. Klik "Simpan". | Role: `member` | Perubahan peran disimpan ke database. Ketika user tersebut login, fiturnya akan terbatas sesuai hak akses member. | |
| **TC-D-03** | Superadmin Menghapus Admin | 1. Klik ikon hapus pada salah satu baris administrator.<br>2. Konfirmasi penghapusan di modal. | Klik "Hapus" | Akun terhapus dari database profiles, dan tidak dapat digunakan lagi untuk login ke sistem Web Admin. | |

---

### Kategori E: Inisialisasi & Konektivitas - Online/Offline (Unity App)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Kondisi Lingkungan | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-E-01** | Startup Aplikasi dengan Koneksi Internet (Online Mode) | 1. Pastikan perangkat terhubung ke Wi-Fi / Data Seluler.<br>2. Jalankan aplikasi Unity Jaswita AR.<br>3. Amati proses inisialisasi awal. | Koneksi Internet Aktif | Aplikasi berhasil melakukan handshake API, mengunduh metadata target terbaru dari Supabase database, memperbarui target tracker Vuforia, dan masuk ke kamera utama. | |
| **TC-E-02** | Startup Aplikasi tanpa Koneksi Internet (Offline Mode) | 1. Matikan semua jaringan internet perangkat (Airplane Mode).<br>2. Jalankan aplikasi Unity Jaswita AR.<br>3. Amati proses penanganan inisialisasi. | Tanpa Koneksi Internet | Aplikasi mendeteksi status offline, melewati proses fetch online, memuat metadata target cadangan dari SQLite lokal (cache terakhir), dan mengaktifkan kamera AR dengan database tracker lokal. | |

---

### Kategori F: Deteksi & Rendering Konten AR (Unity App)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Input Fisik / Aksi | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-01** | Scan Marker -> Render Model 3D (.glb) | 1. Arahkan kamera aplikasi ke marker fisik berjenis Model 3D.<br>2. Tunggu proses loading.<br>3. Amati model 3D yang muncul. | Mengarahkan kamera ke Marker Candi | Pustaka `glTFast` memuat file `.glb` dari cache/URL, merender model 3D di atas marker fisik dengan presisi skala (`1.2`) dan rotasi (`90`) sesuai konfigurasi di Web Admin. | |
| **TC-F-02** | Scan Marker -> Render Image Carousel (2D) | 1. Arahkan kamera aplikasi ke marker fisik berjenis Image Slides.<br>2. Amati tampilan gambar yang dirender. | Mengarahkan kamera ke Marker Kuliner | UI Canvas 2D melayang di atas marker, merender gambar pertama, dan menampilkan tombol navigasi panah kiri/kanan untuk berpindah slide gambar. | |
| **TC-F-03** | Scan Marker -> Stream Video Player (GDrive) | 1. Arahkan kamera aplikasi ke marker fisik berjenis Video.<br>2. Tunggu buffer video.<br>3. Amati jalannya video. | Mengarahkan kamera ke Marker Event | Video player melayang di atas marker memutar video dari endpoint URL (menggunakan GDrive proxy jika menggunakan file Drive) dengan kontrol play/pause yang responsif. | |
| **TC-F-04** | Penanganan Kehilangan Pelacakan (Tracking Lost Delay) | 1. Arahkan kamera ke marker hingga objek AR muncul.<br>2. Geser kamera dengan cepat menjauhi marker (simulasi tracking lost).<br>3. Amati apakah objek langsung menghilang seketika. | Menggeser kamera secara tiba-tiba | Objek AR **tidak langsung menghilang berkedip**. Sistem menahan rendering konten selama **0.5 detik** sebelum menyembunyikannya untuk menghindari masalah kedipan (*flickering*). | |

---

### Kategori G: LRU Caching System (Unity App)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Simulasi Data / Batas | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-G-01** | Batasan Disk Cache (Max 500MB) | 1. Pindai berbagai marker secara bergantian hingga total ukuran aset 3D/video yang diunduh melebihi 500MB.<br>2. Periksa kapasitas direktori penyimpanan lokal aplikasi. | Total aset unduhan: `520MB` | Sistem pendeteksi LRU (Least Recently Used) memicu pembersihan otomatis pada disk lokal, menghapus file aset dari target yang paling jarang/terakhir dipindai hingga ukuran di bawah 500MB. | |
| **TC-G-02** | Batasan RAM Image Cache (Max 12 Images) | 1. Pindai marker carousel gambar secara beruntun hingga memuat lebih dari 12 aset gambar berbeda ke memori. | Jumlah gambar dimuat: `15 Gambar` | RAM cache menghapus alokasi memori untuk 3 gambar pertama (tertua), mempertahankan penggunaan RAM tetap efisien dan mencegah kebocoran memori (*memory leak*). | |

---

### Kategori H: Integrasi & Sinkronisasi Campuran (Mixed Integration)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Kondisi Jaringan | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-H-01** | Sinkronisasi Jumlah Scan Realtime (Online) | 1. Buka Web Admin Dashboard pada tab "Dashboard" (grafik *Weekly Scans* & tabel *Popular Locations* terlihat).<br>2. Di aplikasi mobile (Online), pindai marker `"Candi Prambanan"` sebanyak 3 kali.<br>3. Periksa statistik di Web Admin. | Online | Supabase memicu penambahan kolom `scan_count` pada database. Dashboard Web Admin memperbarui visualisasi grafik dan tabel lokasi terpopuler secara realtime tanpa perlu reload browser. | |
| **TC-H-02** | Penangguhan & Sinkronisasi Scan Offline | 1. Set aplikasi mobile ke Offline Mode (matikan internet).<br>2. Lakukan pemindaian marker sebanyak 5 kali (aplikasi menyimpan log scan ke database SQLite lokal).<br>3. Nyalakan kembali koneksi internet di ponsel.<br>4. Periksa statistik di Web Admin. | Offline -> Online | Saat koneksi terdeteksi aktif kembali, aplikasi mobile mengirimkan akumulasi log scan lokal ke Supabase. Dashboard Web Admin memperbarui jumlah scan secara akumulatif. | |

---

## 📈 Laporan Hasil Pengujian (Test Log Summary Template)
*Gunakan tabel di bawah ini untuk mencatat hasil pengujian nyata saat uji coba dirilis:*

| ID Pengujian | Tanggal Uji | Penguji | Status (Pass/Fail) | Catatan Masalah / Bugs | Tanda Tangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-A-01** | | | | | |
| **TC-A-02** | | | | | |
| **TC-A-03** | | | | | |
| **TC-A-04** | | | | | |
| **TC-A-05** | | | | | |
| **TC-A-06** | | | | | |
| **TC-B-01** | | | | | |
| **TC-B-02** | | | | | |
| **TC-B-03** | | | | | |
| **TC-B-04** | | | | | |
| **TC-B-05** | | | | | |
| **TC-C-01** | | | | | |
| **TC-C-02** | | | | | |
| **TC-C-03** | | | | | |
| **TC-C-04** | | | | | |
| **TC-C-05** | | | | | |
| **TC-C-06** | | | | | |
| **TC-D-01** | | | | | |
| **TC-D-02** | | | | | |
| **TC-D-03** | | | | | |
| **TC-E-01** | | | | | |
| **TC-E-02** | | | | | |
| **TC-F-01** | | | | | |
| **TC-F-02** | | | | | |
| **TC-F-03** | | | | | |
| **TC-F-04** | | | | | |
| **TC-G-01** | | | | | |
| **TC-G-02** | | | | | |
| **TC-H-01** | | | | | |
| **TC-H-02** | | | | | |
