# PANDUAN PENGGUNAAN SISTEM (USER MANUAL) DJASWITA AR

Dokumen ini merupakan panduan operasional resmi untuk seluruh pengguna Sistem Djaswita AR, mencakup aplikasi mobile Android AR (untuk pengunjung/wisatawan) dan Dashboard Web Admin D'jaswitaAR (untuk pengelola/administrator).

---

## PANDUAN APLIKASI MOBILE ANDROID DJASWITA AR

Aplikasi mobile Djaswita AR adalah aplikasi berbasis Augmented Reality (AR) yang dirancang untuk platform Android. Aplikasi ini memungkinkan pengguna memindai marker di area wisata untuk menampilkan informasi interaktif berupa model 3D atau video streaming secara real-time.

### 1.1 Persyaratan Sistem & Instalasi
Sebelum memasang aplikasi, pastikan perangkat Android Anda memenuhi spesifikasi minimum berikut:

| Parameter | Spesifikasi Minimum | Rekomendasi Spesifikasi |
| :--- | :--- | :--- |
| **Versi OS** | Android 8.0 (Oreo) atau lebih tinggi | Android 10.0 atau lebih tinggi |
| **Kamera** | Kamera belakang 8 MP dengan autofokus | Kamera belakang 12 MP dengan autofokus & stabilizer |
| **Sensor** | Giroskop & Akselerometer | Giroskop, Akselerometer, & Kompas |
| **Koneksi Internet**| 3G / HSPA | 4G LTE / Wi-Fi Stabil (untuk streaming video/model 3D) |
| **RAM** | Minimal 2 GB | 4 GB atau lebih tinggi |
| **Penyimpanan Bebas**| Minimal 150 MB | 500 MB (untuk cache data aset media) |

#### Langkah Instalasi:
1. Unduh berkas installer aplikasi Android (`DjaswitaAR.apk`) dari tautan yang disediakan oleh pengelola.
2. Buka berkas `.apk` tersebut di perangkat Android Anda.
3. Jika muncul peringatan keamanan tentang instalasi dari sumber tidak dikenal, aktifkan izin **"Izinkan Instalasi dari Sumber Ini"** pada pengaturan peramban atau file manager Anda.
4. Ketuk **Instal** dan tunggu hingga proses selesai.
5. Jalankan aplikasi untuk pertama kali. Anda **wajib memberikan izin akses kamera** saat diminta agar modul AR dapat berfungsi.

---

### 1.2 Antarmuka & Navigasi Utama
Saat pertama kali membuka aplikasi, Anda akan langsung diarahkan ke layar kamera utama (AR Scanner view). Berikut penjelasan elemen-elemen antarmukanya:
* **Area Kamera AR**: Tampilan kamera belakang untuk mengarahkan bidikan ke marker.
* **Indikator Koneksi**: Menampilkan status koneksi internet untuk memberi tahu jika sinyal terputus.

---

### 1.3 Langkah Memindai Target AR
Ikuti langkah-langkah berikut untuk mendapatkan visualisasi Augmented Reality yang maksimal:
1. Temukan marker resmi Djaswita AR di lokasi wisata (biasanya berupa gambar ikonik objek wisata).
2. Posisikan kamera ponsel Anda pada jarak **10 cm s/d 2 meter** dari marker.
3. Arahkan kamera ponsel Anda secara tegak lurus (sejajar) ke marker tersebut. Pastikan seluruh bagian gambar marker masuk ke dalam bingkai kamera ponsel Anda.
4. Tahan ponsel Anda agar tetap stabil selama 1-2 detik.
5. Sistem akan mengenali marker secara otomatis dan memunculkan konten visual:
   * **Jika Mode Konten Video**: Video streaming dari Google Drive akan langsung diputar di atas UI aplikasi.
   * **Jika Mode Konten 3D**: Model 3D interaktif objek wisata akan muncul di atas marker.

---

### 1.4 Interaksi Konten Augmented Reality
Setelah konten visual muncul di atas marker, Anda dapat berinteraksi dengannya menggunakan gestur layar sentuh:
* **Memutar Model 3D (Rotate)**: Sapukan satu jari ke arah kanan atau kiri pada layar untuk memutar model 3D dan melihatnya dari sudut pandang yang berbeda.
* **Memperbesar/Memperkecil (Pinch to Zoom)**: Cubit layar menggunakan dua jari ke dalam untuk memperkecil model 3D, atau renggangkan dua jari ke luar untuk memperbesarnya.
* **Memindahkan Posisi Konten**: Sapukan dua jari secara bersamaan untuk menggeser objek ke atas, bawah, kiri, atau kanan.
* **Menjalankan/Menghentikan Video**: Untuk konten video, mengetuk layar di area video akan memutar (*Play*) atau menjeda (*Pause*) tayangan video tersebut.

---

### 1.5 Mekanisme Manajemen Memori, Caching, & Streaming Video (LRU Cache)
Untuk memastikan aplikasi berjalan dengan performa maksimal (frame rate stabil) tanpa membebani perangkat, sistem mengimplementasikan manajemen memori otomatis berikut:
* **RAM/GPU Texture Cache (Batas Maksimal 12 Gambar Marker Aktif)**: Untuk mencegah kebocoran memori (*memory leak*) atau *Out of Memory* (OOM) pada perangkat dengan RAM terbatas, Unity client membatasi jumlah texture marker yang dimuat ke dalam memori RAM/GPU maksimal 12 marker aktif. Ketika pengguna memindai marker ke-13, sistem secara otomatis menghapus data marker tertua yang tidak aktif dari memori RAM untuk meminimalkan beban memori grafis.
* **Local Storage Cache (Batas Maksimal 500 MB)**: Aset model 3D (.glb) dan marker yang diunduh dari Supabase disimpan secara lokal di direktori penyimpanan internal perangkat. Algoritma *Least Recently Used* (LRU) memantau penggunaan ruang cache ini. Jika ukuran total berkas cache melebihi 500 MB, sistem secara otomatis akan menghapus berkas aset yang paling jarang atau paling lama tidak diakses untuk memberi ruang bagi aset baru.
* **Google Drive Video Streaming Bypass**: Berkas video tidak disimpan ke dalam cache lokal perangkat untuk mencegah kepenuhan memori. Video dialirkan langsung (*streaming*) secara runtime dari proxy Google Drive API, meminimalkan waktu tunggu (buffering) dan menghemat penyimpanan internal.

---

### 1.6 Panduan Pemecahan Masalah (Troubleshooting) Aplikasi Mobile

| Kendala | Kemungkinan Penyebab | Solusi |
| :--- | :--- | :--- |
| **Konten AR tidak muncul setelah diarahkan ke marker** | Kamera kurang fokus, lensa kotor, atau kondisi sekitar terlalu gelap | Bersihkan lensa kamera, ketuk layar ponsel Anda untuk memicu autofokus kamera, dekati marker, dan pastikan pencahayaan cukup. |
| **Konten AR hilang-timbul/bergetar (jitter)** | Cahaya terlalu redup atau sudut kemiringan terlalu ekstrem | Pastikan marker mendapatkan pencahayaan yang cukup. Berdirilah tegak lurus menghadap marker. |
| **Video loading terlalu lama / berputar-putar saja** | Sinyal internet tidak stabil | Periksa koneksi internet Anda atau gunakan jaringan Wi-Fi lokal terdekat yang stabil. |
| **Model 3D muncul dengan warna hitam/rusak** | Memori GPU perangkat penuh (Limit 12 Gambar Aktif) | Mulai ulang (*restart*) aplikasi Anda untuk membersihkan cache memori RAM/GPU. |
| **Muncul overlay layar "Offline"** | Tidak ada koneksi internet saat startup aplikasi | Aplikasi membutuhkan koneksi internet pada saat pertama kali dibuka untuk mengunduh daftar target aktif dari database Supabase. Hubungkan ke internet terlebih dahulu sebelum membuka aplikasi. |

---
---

## PANDUAN DASHBOARD WEB ADMIN D'JASWITAAR

Dashboard Web Admin D'jaswitaAR adalah panel kontrol berbasis web yang digunakan oleh pengelola untuk mengelola target marker, memantau statistik pemindaian secara real-time, dan mengatur konfigurasi keamanan database.

### 2.1 Persyaratan Sistem & Instalasi Web Admin
Sebelum memasang dan menjalankan dashboard Web Admin, pastikan lingkungan pengembangan Anda telah memenuhi prasyarat berikut:
* **Node.js** (Versi 18 atau versi LTS terbaru)
* **NPM** (Node Package Manager)
* **Web Browser** modern (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari)

#### Langkah Instalasi & Konfigurasi:
1. Buka aplikasi terminal, Command Prompt, atau PowerShell pada komputer Anda.
2. Arahkan ke folder `WebAdmin/` di dalam root direktori proyek:
   ```bash
   cd WebAdmin
   ```
3. Pasang seluruh dependensi pustaka (libraries) yang dibutuhkan dengan menjalankan perintah:
   ```bash
   npm install
   ```
4. Konfigurasikan berkas variabel lingkungan (*Environment Variables*):
   * Buat berkas baru bernama `.env` di dalam folder `WebAdmin/` (atau salin dari template jika tersedia).
   * Isi berkas `.env` tersebut dengan format konfigurasi Supabase berikut:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-long-anon-jwt-key
     ```
   * *Catatan*: Ganti `https://your-project-id.supabase.co` dengan URL proyek Supabase Anda dan `your-long-anon-jwt-key` dengan Anon API Key publik Anda.
5. Jalankan server pengembangan lokal (Vite Development Server) dengan perintah:
   ```bash
   npm run dev
   ```
6. Buka peramban (browser) dan akses alamat URL lokal yang ditampilkan pada terminal (biasanya `http://localhost:5173`).

---

### 2.2 Hak Akses Pengguna (Role Management)
Sistem memiliki 3 tingkat hak akses (role) dengan kewenangan yang berbeda demi menjaga integritas data:

| Fitur / Halaman | Superadmin | Administrator | Member |
| :--- | :--- | :--- | :--- |
| **Melihat Dashboard & Statistik** | Ya | Ya | Ya (Hanya Lihat) |
| **Menambah/Mengedit Target AR** | Ya | Ya | Tidak |
| **Menghapus Target AR** | Ya | Ya | Tidak |
| **Menambah/Mengedit User Admin** | Ya | Tidak | Tidak |
| **Mengubah API Key & Config Sensitif** | Ya (Dengan Password Kedua) | Tidak | Tidak |
| **Melihat Log Audit Perubahan** | Ya | Ya | Tidak |
| **Melakukan Pemeliharaan Storage (Cleanup)**| Ya (Dengan Password Kedua) | Tidak | Tidak |

---

### 2.3 Proses Login & Double Authentication (Keamanan Ganda)
Untuk masuk ke sistem, ikuti langkah berikut:
1. Buka tautan URL Dashboard Web Admin D'jaswitaAR pada peramban Anda.
2. Masukkan alamat **Email** atau **Username** dan **Kata Sandi** akun Anda yang terdaftar pada form login, lalu klik tombol **Masuk**.
3. Jika akun Anda adalah **Superadmin**, untuk mengakses konfigurasi sensitif (seperti mengubah Google Drive API Key, Kunci Supabase, atau menghapus file sampah di menu **Config**), sistem menerapkan **Double Authentication**.
4. Saat Anda mengklik tombol Simpan pada menu pengaturan sensitif, sistem akan menampilkan pop-up verifikasi. Anda **wajib memasukkan kembali kata sandi akun aktif** untuk memvalidasi identitas sebelum perubahan disimpan ke database `app_settings` dan dicatat ke `app_settings_logs`. Hal ini mencegah perubahan ilegal apabila komputer admin ditinggalkan dalam keadaan login.

---

### 2.4 Manajemen Target AR (CRUD)
Menu **AR Targets** adalah area kerja utama untuk mengelola konten visual yang akan discan oleh aplikasi mobile.

#### 2.4.1 Menambah Target AR Baru
1. Masuk ke halaman **AR Targets** pada sidebar sebelah kiri.
2. Klik tombol **New Marker** (+ Tambah Data) di sudut kanan atas tabel.
3. Isi form data target secara lengkap:
   * **Unique Spot ID**: Kode pengenal unik untuk target (Format: huruf kecil & strip, contoh: `kawah-putih-01`).
   * **AR Marker Name**: Nama lokasi wisata atau target (contoh: "Kawah Putih Ciwidey").
   * **Category / Type**: Pilih kategori target (*Nature / Wisata*, *Culinary / Kuliner*, *Special Event*, *Unit Bisnis*, atau *Others / Lainnya*).
     * **Custom Category**: Jika memilih *Others / Lainnya*, form input *Custom Category Name* akan muncul. Ketik nama kategori kustom Anda (**maksimal 11 karakter** untuk menjaga kerapian tata letak UI aplikasi mobile).
   * **Start Date & End Date**: Tanggal mulai dan berakhirnya keaktifan marker (berguna untuk membatasi pemindaian pada jenis *Special Event* yang berjangka waktu).
   * **Deskripsi**: Penjelasan detail tentang target tersebut.
   * **Pricing / Entry Fee**: Masukkan harga tiket masuk (angka saja, sistem otomatis memformat menjadi mata uang Rupiah).
   * **Link Kontak / Hubungi**: Tautan WhatsApp atau situs web resmi untuk informasi lebih lanjut.
4. **Unggah File Marker**:
   * Seret berkas gambar atau klik tombol **Browse** untuk memilih file marker (Format: JPG/PNG, ukuran maks. 2MB).
   * **PENTING**: Sistem secara otomatis akan menganalisis kelayakan marker menggunakan algoritma *Harris Corner Detector* untuk menilai kepadatan fitur sudut gambar. Nilai kelayakan akan ditampilkan dalam bentuk **Rating Bintang (1 - 5)**. Marker dengan rating **3 bintang ke atas** sangat direkomendasikan untuk stabilitas pelacakan (*tracking quality*) Vuforia yang optimal.
5. **Pilih Mode Konten**:
   * **Image Slides**: Menampilkan deretan gambar slider pada aplikasi AR. Masukkan URL slide secara manual atau unggah file gambar secara bersamaan melalui tombol upload. Anda juga dapat memilih *Tipe Layout UI (Image Carousel)* berupa **Mask (Square)** atau **Full (4:5)**.
   * **3D Model**: Menampilkan objek 3D interaktif. Unggah file model 3D berformat `.glb` (maks. 50MB). Sistem menyediakan area pratinjau 3D interaktif menggunakan `<model-viewer>`. Anda dapat mengatur setelan transform model:
     * **X: SCALE**: Mengatur ukuran pembesaran model 3D (default: 1.0).
     * **Y: ROTATION**: Mengatur sudut rotasi model pada sumbu Y (default: 0).
     * **Y: POSITION**: Mengatur posisi ketinggian model (atas/bawah).
     * **Z: POSITION**: Mengatur posisi kedalaman model (depan/belakang).
     * *Tips*: Klik tombol **Reset Default** untuk mengembalikan setelan transform ke posisi semula.
6. **Link Video**:
   * Masukkan tautan MP4 video (maks 60MB). Jika Anda memasukkan tautan sharing Google Drive, sistem secara otomatis menerapkan mekanisme **Google Drive API Bypass** untuk mengonversinya menjadi tautan streaming langsung secara instan.
7. Klik **Simpan Data** untuk merekam target baru ke database.

#### 2.4.2 Pembaruan dan Penghapusan Data Target
* **Edit**: Klik tombol aksi edit (ikon pensil kuning) pada baris data tabel. Perbarui kolom yang diperlukan (ID unik tidak dapat diedit), lalu klik **Simpan Data**.
* **Hapus**: Klik tombol aksi hapus (ikon tempat sampah merah) pada baris data tabel.
  * **Pembersihan Total (Hard-Delete/Storage Cleanup)**: Pada dialog konfirmasi hapus, centang kotak pilihan **"Pembersihan Total"** jika Anda ingin menghapus secara otomatis seluruh file aset media terkait (file marker, file model 3D, dan file slide) dari server cloud Supabase Storage saat data target dihapus dari database. Ini disarankan untuk mencegah pemborosan ruang penyimpanan cloud.

---

### 2.5 Memantau Dashboard & Grafik Analitik Real-Time & Ekspor Laporan
Menu **Dashboard** menampilkan ringkasan performa sistem secara dinamis dan seketika (real-time):
* **Summary Cards**: Menampilkan total pemindaian (*scans*), total target AR aktif, dan total akun administrator yang terdaftar.
* **Grafik Aktivitas Pemindaian (Scan Activity)**:
  * Grafik garis dinamis yang menampilkan frekuensi scan berdasarkan rentang waktu yang dipilih.
  * Gunakan tombol filter waktu (**Weekly**, **Monthly**, atau **All-Time**) untuk mengubah visualisasi data.
  * Berkat integrasi **WebSocket (Supabase Realtime API)** via fungsi `setupRealtimeScans` pada tabel `scans`, grafik ini akan langsung memperbarui garis tren secara otomatis dan instan tanpa perlu reload halaman setiap kali ada wisatawan yang melakukan pemindaian marker di lapangan.
* **Distribusi Kategori Target**: Grafik lingkaran (Donut Chart) yang memvisualisasikan proporsi sebaran kategori target AR (Wisata, Kuliner, dll.) yang aktif dalam sistem.
* **Lokasi Terpopuler (Popular Locations)**: Tabel daftar objek wisata yang paling sering dipindai oleh pengunjung, diurutkan dari jumlah scan tertinggi.
* **Ekspor Laporan PDF**: Pengguna dapat mengekspor laporan resmi visual dashboard analitik ini dengan menekan tombol ekspor. Sistem akan memicu skrip `jsPDF` dan `html2canvas` untuk merender ringkasan grafik, tabel popularitas, dan data statistik menjadi berkas PDF formal terstruktur yang siap dicetak untuk kebutuhan presentasi atau rapat manajemen.

---

### 2.6 Menu Pengaturan (App Settings) & Pemeliharaan Sistem
Menu ini hanya dapat diakses penuh oleh akun bertipe **Superadmin** untuk konfigurasi parameter kritis aplikasi:
* **API Configuration**: Mengatur Google Drive API Key, target folder ID penyimpanan video, serta URL & Anon Key Supabase.
* **Template Canva**: Mengubah tautan template Canva yang digunakan oleh administrator untuk mendesain poster bingkai marker baru.
* **Database Heartbeat Status**: Menampilkan lampu indikator status koneksi server admin ke database Supabase secara real-time. Indikator berwarna hijau menandakan koneksi stabil dan database dalam kondisi prima. Lampu merah berkedip menandakan koneksi terputus.
* **Log Aktivitas Pengaturan (Audit Logs)**: Menampilkan tabel daftar kronologis perubahan konfigurasi yang pernah dilakukan oleh para admin (diambil dari tabel `app_settings_logs`), lengkap dengan cap waktu, email admin pengubah, serta rincian tindakan untuk transparansi dan audit keamanan.
* **Pembersihan File Sampah (Storage Maintenance)**: Fitur khusus untuk membersihkan file-file yatim (*orphaned files*) pada Supabase Storage. Sistem membandingkan semua file yang ada di bucket `ar-media` dengan database URL yang aktif di `ar_targets`. File yang tidak memiliki rujukan di database akan otomatis dihapus untuk menghemat ruang cloud storage.

---
*Manual Penggunaan Sistem Djaswita AR ini dibuat sebagai acuan resmi standar operasional sistem. Pastikan untuk selalu merujuk pada dokumen ini saat terjadi kendala teknis.*
