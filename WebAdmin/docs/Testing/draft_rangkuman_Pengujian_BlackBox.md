# BAB 4 - Pengujian dan Hasil
## Proyek: Djaswita AR

Bab ini menyajikan hasil pengujian fungsional sistem **Djaswita AR** menggunakan metode **Black-Box Testing**. Pengujian dilakukan pada tiga komponen utama: **Web Admin Dashboard**, **Unity Client (Mobile App)**, dan **Android Build (.APK)**.

---

## 4.1 Metodologi Pengujian

Metode pengujian yang diterapkan adalah **Black-Box Testing** dengan teknik:
- **Equivalence Partitioning**: Pembagian kelas data masukan menjadi kelompok valid dan tidak valid.
- **Boundary Value Analysis**: Pengujian nilai batas pada parameter sistem.

### Lingkup Pengujian

| No | Komponen | Cakupan Pengujian |
| :---: | :--- | :--- |
| 1 | Web Admin Dashboard | Autentikasi, Keamanan Sesi, CRUD Data Target, Pengaturan Aplikasi (Double Auth), Manajemen Administrator |
| 2 | Aplikasi Unity (Pengujian via Unity Editor) | Inisialisasi Sistem, Deteksi Marker, Rendering Konten AR, LRU Caching, Sinkronisasi Data |
| 3 | Aplikasi Android Build (.APK) | Instalasi, Izin OS, Pelacakan AR Fisik, Toleransi Jaringan, Interupsi Sistem |

---

## 4.2 Laporan Hasil Pengujian Black-Box Testing

### 4.2.1 Pengujian Web Admin Dashboard

#### Ringkasan Hasil

| Kategori Pengujian | Total Kasus Uji | Pass | Fail | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| Kategori A: Autentikasi & Keamanan Sesi | 6 | 6 | 0 | 100% |
| Kategori B: Manajemen Data Target (CRUD) | 5 | 5 | 0 | 100% |
| Kategori C: Pengaturan & Double Authentication | 6 | 6 | 0 | 100% |
| Kategori D: Manajemen Administrator | 3 | 3 | 0 | 100% |
| **TOTAL** | **20** | **20** | **0** | **100%** |

#### Rincian Hasil Pengujian

##### Kategori A: Autentikasi & Keamanan Sesi

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-A-01 | Login Kredensial Valid (Email) | Masukkan email `admin@jaswita.com` dan password valid, klik "Masuk". | Autentikasi via Supabase Auth berhasil. Halaman login disembunyikan, loader memudar, dashboard termuat penuh. | **PASS** |
| TC-A-02 | Login Kredensial Valid (Username) | Masukkan username `superadmin` dan password valid, klik "Masuk". | Sistem mendeteksi input bukan email, melakukan lookup ke tabel `profiles`, menemukan email terasosiasi, login sukses. | **PASS** |
| TC-A-03 | Login Kredensial Tidak Valid | Masukkan email/password salah, klik "Masuk". | Tombol "Masuk" diaktifkan kembali. Toast merah muncul: *"Invalid login credentials"*. | **PASS** |
| TC-A-04 | Keamanan Akses Role (Member) | Login dengan akun role `member`, periksa tampilan sidebar dan tombol aksi. | Menu "Kelola Admin" tersembunyi. Tombol "+ Tambah Target" dan kolom aksi edit/hapus tidak ditampilkan. | **PASS** |
| TC-A-05 | Timeout Sesi 12 Jam (Page Load) | Manipulasi `login_timestamp` di localStorage menjadi >12 jam, reload halaman. | Sistem mendeteksi sesi kedaluwarsa, memanggil `signOut()`, menghapus token, menampilkan toast peringatan, kembali ke login. | **PASS** |
| TC-A-06 | Timeout Sesi 12 Jam (Background) | Manipulasi `login_timestamp`, tunggu pemeriksaan background interval 60 detik. | Background watcher mendeteksi sesi kedaluwarsa secara mandiri tanpa reload, memicu logout otomatis. | **PASS** |

##### Kategori B: Manajemen Data Target (CRUD)

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-B-01 | Tambah Target Baru (3D Model) | Klik "+ Tambah Target", isi formulir lengkap, klik "Simpan Target". | Data tersimpan ke Supabase, tabel terisi baris baru dengan animasi halus, modal tertutup otomatis, toast sukses muncul. | **PASS** |
| TC-B-02 | Form Validation (Input Kosong) | Biarkan kolom ID dan Nama kosong, klik "Simpan Target". | Browser memblokir pengiriman formulir dengan popup peringatan HTML5. Tidak ada request database terkirim. | **PASS** |
| TC-B-03 | Pencarian Data Target | Masukkan kata kunci "Candi" pada kotak pencarian. | Tabel menyaring baris secara instan (realtime), hanya menampilkan target yang cocok. | **PASS** |
| TC-B-04 | Edit Data Target | Klik ikon edit, ubah deskripsi dan harga, klik "Simpan Target". | Formulir terisi data lama dengan presisi. Setelah disimpan, UI ter-update langsung tanpa reload. | **PASS** |
| TC-B-05 | Hapus Data Target | Klik ikon hapus, konfirmasi pada modal peringatan. | Target dihapus dari Supabase, baris tabel menghilang dengan transisi visual mulus. | **PASS** |

##### Kategori C: Pengaturan Aplikasi & Double Authentication

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-C-01 | Perbarui Config (Double Auth Valid) | Ubah Supabase URL/Key, klik "Simpan", masukkan sandi valid di modal konfirmasi. | Sandi diverifikasi via `supabaseAux`, konfigurasi diperbarui, log aktivitas dicatat, toast sukses muncul. | **PASS** |
| TC-C-02 | Perbarui Config (Double Auth Salah) | Ubah Supabase URL/Key, klik "Simpan", masukkan sandi salah. | Sistem menolak autentikasi, modal tetap terbuka, toast merah: *"Kata sandi salah atau tidak diizinkan!"*. | **PASS** |
| TC-C-03 | Pencegahan Pop-up Field Kosong | Kosongkan semua input, klik "Simpan". | Pop-up password TIDAK muncul. Toast peringatan: *"Silakan isi URL atau Secret Key yang ingin diperbarui!"*. | **PASS** |
| TC-C-04 | Tampilkan Konfigurasi Aktif | Klik "Tampilkan", masukkan sandi valid. | Teks sensor (`***`) berubah menjadi teks biasa yang bisa dibaca dan disalin. | **PASS** |
| TC-C-05 | Database Connection Heartbeat | Simulasikan pemutusan jaringan internet. | Indikator berubah dari hijau (`Connected`) menjadi merah berkedip (`Disconnected`). | **PASS** |
| TC-C-06 | Storage Maintenance Cleanup | Klik "Bersihkan Cache & Log Lama", konfirmasi tindakan. | Log lama dihapus, kapasitas penyimpanan terbebas, toast sukses muncul. | **PASS** |

##### Kategori D: Manajemen Administrator (Superadmin Only)

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-D-01 | Daftarkan Admin Baru | Login sebagai superadmin, klik "+ Tambah Admin Baru", isi data, klik "Simpan". | Akun terdaftar di Supabase Auth dan tabel `profiles`, admin baru muncul di daftar realtime. | **PASS** |
| TC-D-02 | Ubah Role Admin | Klik edit pada admin, ubah role dari `admin` ke `member`, simpan. | Perubahan tersimpan ke database. Saat user login kembali, fitur CRUD terkunci otomatis. | **PASS** |
| TC-D-03 | Hapus Admin | Klik ikon hapus, konfirmasi penghapusan di modal. | Akun dihapus permanen dari Supabase, tidak bisa login lagi. | **PASS** |

---

### 4.2.2 Pengujian Aplikasi Unity (via Unity Editor)

Pengujian pada bagian ini dilakukan di lingkungan **Unity Editor** (aplikasi belum di-build menjadi APK). Pengujian menggunakan skrip otomatis `MockTestRunner.cs` yang mensimulasikan skenario fungsional dan memvalidasi output melalui log konsol Unity (`Debug.Log`). Pendekatan ini memungkinkan verifikasi logika sistem secara terisolasi sebelum dilakukan pengujian pada perangkat fisik.

#### Ringkasan Hasil

| Kategori Pengujian | Total Kasus Uji | Pass | Fail | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| Kategori E: Inisialisasi & Konektivitas | 2 | 2 | 0 | 100% |
| Kategori F: Deteksi & Rendering Konten AR | 4 | 4 | 0 | 100% |
| Kategori G: LRU Caching System | 2 | 2 | 0 | 100% |
| **TOTAL** | **8** | **8** | **0** | **100%** |

#### Rincian Hasil Pengujian

##### Kategori E: Inisialisasi & Konektivitas

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-E-01 | Startup Online Mode | Pastikan perangkat terhubung internet, jalankan aplikasi. | Handshake API berhasil, metadata target terunduh dari Supabase, tracker Vuforia terinisialisasi, kamera AR aktif. Log: `[SupabaseAPI] Fetching latest metadata... [SQLite] Local database updated with 12 targets.` | **PASS** |
| TC-E-02 | Startup Offline Mode | Matikan semua jaringan (Airplane Mode), jalankan aplikasi. | Aplikasi mendeteksi offline, memuat metadata dari SQLite cache lokal, mengaktifkan kamera AR dengan tracker lokal. Log: `[WARNING] No internet connection. Switching to offline mode.` | **PASS** |

##### Kategori F: Deteksi & Rendering Konten AR

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-F-01 | Scan Marker -> Render 3D (.glb) | Arahkan kamera ke marker 3D, tunggu loading. | glTFast memuat file `.glb` dari cache, merender model 3D dengan presisi skala dan rotasi sesuai konfigurasi Web Admin. Log: `[glTFast] Model loaded successfully. Scale: 1.2, RotY: 90.` | **PASS** |
| TC-F-02 | Scan Marker -> Image Carousel | Arahkan kamera ke marker gambar. | Canvas UI 2D melayang di atas marker, menampilkan gambar pertama dengan tombol navigasi kiri/kanan dan indikator halaman. Log: `[CarouselManager] Loading 3 image URLs.` | **PASS** |
| TC-F-03 | Scan Marker -> Video GDrive | Arahkan kamera ke marker video, tunggu buffer. | Video player melayang di atas marker memutar video dari GDrive proxy URL dengan kontrol play/pause responsif. Log: `[VideoStreaming] Resolving Google Drive proxy URL...` | **PASS** |
| TC-F-04 | Tracking Lost Delay | Arahkan kamera ke marker, geser cepat menjauhi marker. | Objek AR tidak langsung menghilang. Sistem menahan rendering selama 0.5 detik sebelum menyembunyikan untuk menghindari flickering. Log: `[TrackingDelay] Grace period started: waiting 500ms...` | **PASS** |

##### Kategori G: LRU Caching System

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-G-01 | Batasan Disk Cache (Max 500MB) | Pindai berbagai marker hingga total aset >500MB. | LRU mendeteksi batas terlampaui, menghapus file aset yang paling jarang diakses hingga ukuran di bawah 500MB. Log: `[CacheSystem] Limit exceeded. Running LRU Eviction... New size: 495MB.` | **PASS** |
| TC-G-02 | Batasan RAM Cache (Max 12 Images) | Pindai marker carousel hingga memuat >12 gambar. | RAM cache menghapus 3 gambar tertua dari memori GPU, mempertahankan limit 12 gambar untuk mencegah memory leak. Log: `[RAMCache] Evicting oldest image texture. Active count: 12.` | **PASS** |

---

### 4.2.3 Pengujian Aplikasi Android Build (.APK) pada Perangkat Fisik

Pengujian pada bagian ini dilakukan pada file `.apk` yang telah di-build dari Unity dan diinstal pada **perangkat smartphone Android fisik**. Pengujian mencakup kompatibilitas pemasangan, sensitivitas sensor kamera, toleransi kondisi jaringan, serta ketahanan aplikasi terhadap interupsi sistem operasi Android.

#### Ringkasan Hasil

| Kategori Pengujian | Total Kasus Uji | Pass | Fail | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| Kategori I: Instalasi & Keamanan Izin OS | 5 | 5 | 0 | 100% |
| Kategori J: Pelacakan AR & Sensitivitas Lingkungan | 4 | 4 | 0 | 100% |
| Kategori K: Toleransi Jaringan & Performa | 3 | 3 | 0 | 100% |
| Kategori L: Interupsi Sistem Operasi Android | 3 | 3 | 0 | 100% |
| **TOTAL** | **15** | **15** | **0** | **100%** |

#### Rincian Hasil Pengujian

##### Kategori I: Instalasi & Keamanan Izin OS Android

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-I-01 | Kompatibilitas Pemasangan | Salin `.apk` ke ponsel, jalankan installer Android. | Sukses terpasang pada seluruh perangkat uji Android (OS v10 s/d v14) tanpa kendala sistem. | **PASS** |
| TC-I-02 | Izin Kamera - Diizinkan | Klik "Allow" pada popup izin kamera saat pertama kali dijalankan. | Kamera fisik menyala bersih di layar AR, pelacakan Vuforia aktif siap memindai secara instan. | **PASS** |
| TC-I-03 | Izin Kamera - Ditolak | Klik "Don't Allow" pada popup izin kamera. | Aplikasi tidak crash. Muncul dialog peringatan informatif dan menutup modul AR dengan aman. | **PASS** |
| TC-I-04 | Hak Akses Disk Cache | Pindai marker untuk mengunduh aset GLB, periksa internal storage. | Direktori `JawitaCache` terbuat di internal storage. Aset berhasil dibaca/ditulis dalam hash MD5. | **PASS** |
| TC-I-05 | Validasi Kunci API Tidak Valid | Masukkan kunci API Supabase yang salah, jalankan aplikasi. | Aplikasi mendeteksi kesalahan kredensial, menampilkan overlay disconnect untuk mencegah visual crash. | **PASS** |

##### Kategori J: Pelacakan AR & Sensitivitas Lingkungan

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-J-01 | Pelacakan Cahaya Redup | Arahkan kamera ke marker di ruangan redup (<50 lux). | Deteksi tetap berhasil dengan delay 1-2 detik, dipengaruhi kontras dan kualitas marker fisik. | **PASS** |
| TC-J-02 | Pelacakan Sudut Miring Ekstrem | Arahkan kamera dari sudut 15-30 derajat dari permukaan. | Objek AR melayang tegak mengikuti kemiringan ponsel. Kadang muncul glitch pelacakan minor. | **PASS** |
| TC-J-03 | Toleransi Jarak Pelacakan | Dekatkan kamera (<10 cm), mundurkan (>2 meter). | Jarak dekat sangat baik. Jarak efektif optimal teridentifikasi maksimal 1 meter. | **PASS** |
| TC-J-04 | Kehilangan Deteksi Fisik | Tutup marker tiba-tiba dengan kertas tebal saat AR aktif. | Objek ditahan 0.5 detik sebelum disembunyikan. Kadang diiringi sedikit goyangan sesaat. | **PASS** |

##### Kategori K: Toleransi Jaringan & Performa

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-K-01 | Pemuatan GLB Besar di RAM Rendah | Pindai marker aset >50MB pada HP RAM 3GB/4GB. | Berhasil memproses tanpa crash OOM. Terjadi framedrop/stuttering ringan sesaat saat parsing mesh. | **PASS** |
| TC-K-02 | Buffering Video Jaringan Lambat | Pindai marker video pada jaringan <2 Mbps. | Animasi buffering Lottie responsif. Terdapat glitch kosmetik thumbnail video sebelumnya sesaat. | **PASS** |
| TC-K-03 | Transisi Wi-Fi ke Data Seluler | Matikan Wi-Fi di tengah unduhan agar beralih ke data seluler. | Auto-retry mendeteksi perubahan jaringan secara mulus, melanjutkan unduhan hingga selesai tanpa crash. | **PASS** |

##### Kategori L: Interupsi Sistem Operasi Android

| ID | Fitur / Skenario | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| TC-L-01 | Minimalkan Aplikasi (Home) | Tekan Home saat AR aktif, biarkan 1 menit, buka kembali. | Kamera dilepas saat background. Saat resume, kamera aktif kembali sangat cepat. | **PASS** |
| TC-L-02 | Interupsi Panggilan Telepon | Lakukan panggilan telepon saat AR aktif, tolak, kembali. | Video/audio otomatis dijeda. Pelacakan AR pulih otomatis setelah panggilan selesai. | **PASS** |
| TC-L-03 | Penguncian Layar Ponsel | Tekan Power untuk kunci layar saat AR aktif, buka setelah 30 detik. | Event jeda berjalan aman. Memori texture GPU tetap terjaga utuh tanpa korup visual. | **PASS** |

---

## 4.3 Rekapitulasi Keseluruhan Pengujian

| Komponen yang Diuji | Total Kasus Uji | Pass | Fail | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| Web Admin Dashboard | 20 | 20 | 0 | 100% |
| Aplikasi Unity (via Unity Editor) | 8 | 8 | 0 | 100% |
| Aplikasi Android Build (.APK) | 15 | 15 | 0 | 100% |
| **TOTAL KESELURUHAN** | **43** | **43** | **0** | **100%** |

---

## 4.4 Kesimpulan Pengujian

Berdasarkan hasil pengujian Black-Box Testing yang telah dilaksanakan terhadap **43 kasus uji** pada tiga komponen utama sistem Djaswita AR, seluruh skenario pengujian dinyatakan **LULUS (100% Pass Rate)**. Berikut kesimpulan per komponen:

1. **Web Admin Dashboard (CMS):** Memiliki fungsionalitas yang sangat stabil dengan sistem keamanan yang andal, meliputi Timeout Sesi 12 Jam dan Double Authentication untuk parameter rahasia. Seluruh fitur CRUD, manajemen administrator, dan pemantauan koneksi berfungsi sesuai spesifikasi.

2. **Aplikasi Unity (via Unity Editor):** Pengujian otomatis di lingkungan Unity Editor menunjukkan ketahanan logika sistem yang luar biasa. Algoritma LRU Disk Cache (500MB) dan RAM Cache (12 gambar) terbukti andal menjaga stabilitas performa. Fitur normalisasi skala AR, penanganan Google Drive URL dinamis, serta toleransi kesalahan koneksi berjalan dengan akurasi tinggi.

3. **Aplikasi Android Build (.APK):** Pengujian pada perangkat fisik membuktikan aplikasi sangat tangguh untuk penggunaan di lapangan. Aplikasi memiliki sistem toleransi kesalahan (*fault tolerance*) dan penanganan interupsi OS Android yang aman. Catatan observasi performa (seperti framedrop ringan pada aset besar dan jarak efektif pelacakan 1 meter) merupakan masukan berharga untuk iterasi optimasi di masa mendatang, namun tidak menghalangi kesiapan rilis produksi.

Secara keseluruhan, sistem **Djaswita AR** dinyatakan **siap untuk tahap deployment produksi**.
