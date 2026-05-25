# Skenario Pengujian Blackbox Aplikasi Android Build (.APK)
## Proyek: Djaswita AR - Unity Client (Mobile Android Application)

Dokumen ini mendefinisikan rencana, metodologi, dan skenario pengujian fungsional terintegrasi khusus untuk aplikasi **Djaswita AR** yang telah di-build sebagai paket rilis Android (`.apk` atau `.aab`) dan diinstal langsung pada perangkat keras/smartphone Android fisik.

Pengujian ini sangat penting karena performa kamera fisik, izin sistem operasi Android (Android OS Permissions), manajemen memori perangkat seluler, pemutaran video streaming, serta penanganan interupsi (panggilan telepon, meminimalisir aplikasi) hanya dapat divalidasi secara akurat pada perangkat keras nyata.

---

## 📌 Lingkup Pengujian Perangkat Fisik (Physical Device Testing Scope)

1. **Instalasi & Manajemen Izin OS (Installation & Permissions):** Kompatibilitas versi OS Android, pemberian izin kamera, dan hak akses penyimpanan internal untuk caching.
2. **Performa Sensor Kamera & Pelacakan AR Fisik (AR Tracking & Environment Sensitivity):** Sensitivitas pemindaian marker di bawah berbagai kondisi pencahayaan, sudut kemiringan, dan jarak fisik.
3. **Manajemen Memori Seluler & Caching Hardware (Memory & Caching Integrity):** Pemuatan model GLB berukuran besar, keandalan penulisan disk cache di internal storage, serta pencegahan perlambatan FPS (*frame rate drop*).
4. **Keandalan Jaringan Seluler (Dynamic Network Connectivity):** Transisi koneksi Wi-Fi ke Data Seluler, penanganan pemutaran video Google Drive di jaringan lambat (3G/4G), serta isolasi otomatis saat sinyal hilang.
5. **Siklus Hidup Aplikasi & Interupsi Android (OS Lifecycles & Interruption Defense):** Penanganan aplikasi saat diminimalisir (background), panggilan telepon masuk, serta penguncian layar (screen lock).

---

## 🛠️ Rincian Skenario Pengujian Perangkat Fisik (Android Build Test Cases)

### Kategori I: Instalasi & Keamanan Izin OS Android (Installation & Permissions)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Kondisi Perangkat Fisik / Masukan | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-I-01** | Kompatibilitas Pemasangan Aplikasi (Installation Match) | 1. Salin berkas `.apk` rilis ke penyimpanan ponsel.<br>2. Jalankan paket installer bawaan Android.<br>3. Selesaikan proses pemasangan aplikasi. | Android OS: v10 (Q) hingga v14 (Upside Down Cake)<br>Device: Low-end (RAM 3GB) & High-end | Aplikasi sukses terinstal tanpa memicu pesan kesalahan *"Package installer stopped"* atau *"App not installed"*. | |
| **TC-I-02** | Penanganan Izin Kamera Fisik - Diizinkan (Permission Granted) | 1. Jalankan aplikasi pertama kali setelah instalasi.<br>2. Ketika popup permintaan izin kamera sistem muncul, klik **"Allow / Saat Aplikasi Digunakan"**.<br>3. Amati layar aplikasi. | Aksi klik: **Setuju (Grant)** | Kamera fisik ponsel menyala dengan lancar di layar AR, dan proses pelacakan marker aktif siap digunakan. | |
| **TC-I-03** | Penanganan Izin Kamera Fisik - Ditolak (Permission Denied) | 1. Instal ulang aplikasi atau hapus data aplikasi.<br>2. Jalankan aplikasi.<br>3. Ketika popup izin kamera muncul, klik **"Don't Allow / Tolak"**.<br>4. Amati layar aplikasi. | Aksi klik: **Tolak (Deny)** | Aplikasi tidak mengalami *crash*. Aplikasi menampilkan dialog peringatan informatif: *"Izin kamera diperlukan untuk fitur AR. Silakan aktifkan di Pengaturan"* dan menutup modul AR dengan aman. | |
| **TC-I-04** | Hak Akses Baca/Tulis Disk Cache Internal | 1. Masuk ke aplikasi.<br>2. Pindai marker untuk mengunduh aset Model 3D GLB pertama kali.<br>3. Periksa direktori internal storage perangkat menggunakan File Manager bawaan. | Path: `/Android/data/com.Djaswita.AR/files/JawitaCache/` | Aplikasi sukses membuat direktori cache internal tanpa memicu *security exception* OS Android. Aset terunduh tersimpan sebagai berkas hash MD5 unik dengan sempurna. | |
| **TC-I-05** | Validasi Keamanan & Kunci API Supabase Tidak Valid (Supabase API Key Integrity) | 1. Sengaja masukkan kunci API Supabase (atau data inisialisasi URL/Keys) yang salah ke dalam berkas konfigurasi/APIManager.<br>2. Build dan jalankan aplikasi.<br>3. Amati antarmuka aplikasi. | Input: Salah memasukkan 2 Supabase Keys | Aplikasi mendeteksi kegagalan autentikasi API secara instan dan menampilkan overlay "Disconnect" atau "Connection Failed" secara otomatis. | |

---

### Kategori J: Performa Pelacakan AR di Dunia Nyata (AR Environment Performance)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Kondisi Fisik / Lingkungan | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-J-01** | Pelacakan Marker di Kondisi Cahaya Redup (Low Light Environment) | 1. Bawa marker fisik ke ruangan dengan pencahayaan redup (< 50 lux).<br>2. Arahkan kamera aplikasi ke marker fisik tersebut.<br>3. Amati waktu respon pemuatan objek AR. | Cahaya redup / remang-remang | Pustaka AR (Vuforia) tetap dapat mendeteksi marker dengan stabil meskipun memerlukan waktu deteksi sedikit lebih lama (1 - 3 detik). Objek AR tidak berkedip (*flickering*). | |
| **TC-J-02** | Pelacakan Marker di Sudut Miring Ekstrem (Extreme Scan Angles) | 1. Letakkan marker fisik secara datar di meja.<br>2. Arahkan kamera aplikasi dari sudut kemiringan tajam (sekitar 15° - 30° dari permukaan meja).<br>3. Amati rendering objek. | Sudut pandang miring: 20 derajat | Objek AR berhasil memproyeksikan dirinya secara presisi melayang tegak di atas marker fisik dengan mengikuti sudut inklinasi kemiringan ponsel secara realtime. | |
| **TC-J-03** | Toleransi Jarak Pelacakan Minimum & Maksimum | 1. Dekatkan kamera ke marker hingga jarak kurang dari 10 cm (Jarak Dekat).<br>2. Mundurkan posisi berdiri hingga jarak lebih dari 2 meter (Jarak Jauh). | Jarak minimum: < 10 cm<br>Jarak maksimum: > 2 meter | Pada jarak < 10 cm, kamera mempertahankan fokus dan objek tetap dirender. Pada jarak > 2 meter (selama marker masih tertangkap sensor dengan resolusi memadai), objek AR tetap melekat dengan stabil. | |
| **TC-J-04** | Kehilangan Deteksi Fisik (Tracking Lost Recovery) | 1. Arahkan kamera hingga objek AR model 3D termuat sempurna.<br>2. Tutup marker fisik secara tiba-tiba menggunakan selembar kertas tebal.<br>3. Amati perilaku hilangnya objek AR. | Marker fisik ditutup penuh | Berkat fitur *Tracking Lost Delay*, objek AR ditahan di layar selama **0.5 detik** sebelum disembunyikan. Jika kertas penutup diangkat kembali dalam kurun waktu < 0.5 detik, objek AR langsung pulih tanpa memicu proses reload ulang aset. | |

---

### Kategori K: Keandalan Jaringan Seluler & Caching Perangkat Keras (Network & Hardware Optimization)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Kondisi Jaringan & Aset | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-K-01** | Pemuatan Aset GLB Ukuran Besar pada Ponsel Spesifikasi Rendah | 1. Siapkan aset GLB berukuran besar (> 50MB) yang terdaftar di database Supabase.<br>2. Pindai marker tersebut pada smartphone dengan spesifikasi RAM 3GB/4GB.<br>3. Amati kelancaran aplikasi. | Model GLB Kompleks (> 50MB)<br>Smartphone RAM 3GB / Android 10 | Aplikasi berhasil mengalokasikan heap memori untuk pengunduhan aset, melakukan parsing struktur glb menggunakan glTFast, dan merender objek AR dengan stabil tanpa mengalami *Out of Memory (OOM) Crash*. | |
| **TC-K-02** | Stabilitas Buffering Video Streaming di Jaringan Seluler Lambat | 1. Arahkan kamera ke marker tipe Video.<br>2. Jalankan pengujian di lingkungan dengan jaringan seluler lambat (sinyal HSPA / 3G, kecepatan < 2 Mbps). | Jaringan Seluler Lambat (< 2 Mbps) | Sistem pemutar video Google Drive menampilkan indikator loading (*buffer circle*) yang informatif dan memutar video secara bertahap tanpa membuat aplikasi hang atau menampilkan layar hitam mati (*screen freeze*). | |
| **TC-K-03** | Transisi Mulus dari Wi-Fi ke Data Seluler 4G/5G | 1. Hubungkan ponsel ke jaringan Wi-Fi lokal.<br>2. Jalankan aplikasi, lalu pindai sebuah marker.<br>3. Di tengah proses unduhan aset, matikan sakelar Wi-Fi sehingga ponsel beralih otomatis ke Data Seluler.<br>4. Amati kelanjutan unduhan. | Pergantian koneksi Wi-Fi ke Seluler secara mendadak | Aplikasi mendeteksi perubahan status jaringan via *network reachability change*, mengulang koneksi HTTP yang terputus secara elegan (*auto-retry*), dan melanjutkan proses pengunduhan hingga selesai tanpa memicu crash. | |

---

### Kategori L: Siklus Hidup & Penanganan Interupsi OS Android (Android Interruption & Lifecycles)

| ID Pengujian | Fitur / Deskripsi | Langkah-Langkah Pengujian | Aksi Interupsi OS | Hasil yang Diharapkan (Expected Result) | Kriteria (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-L-01** | Minimalkan Aplikasi saat Objek AR Aktif (Background/Minimize) | 1. Arahkan kamera ke marker hingga objek AR terwujud penuh.<br>2. Tekan tombol **"Home"** pada smartphone sehingga aplikasi berpindah ke latar belakang (*background*).<br>3. Biarkan selama 1 menit.<br>4. Buka kembali aplikasi dari menu *Recent Apps*. | Menekan tombol Home OS -> Resume | Saat berada di latar belakang, pemakaian kamera fisik langsung dilepaskan (dinonaktifkan untuk menjaga keamanan privasi OS). Saat kembali dibuka (Resume), kamera diaktifkan kembali dengan cepat dan siap memindai marker baru. | |
| **TC-L-02** | Interupsi Panggilan Telepon Masuk (Incoming Call Interruption) | 1. Jalankan aplikasi dan arahkan kamera ke marker AR.<br>2. Lakukan panggilan telepon fisik dari nomor lain ke ponsel uji tersebut.<br>3. Biarkan ponsel berdering selama beberapa detik, lalu tolak panggilan telepon.<br>4. Kembali ke aplikasi Djaswita AR. | Panggilan telepon masuk di layar penuh | Aplikasi AR dijeda secara otomatis (*Paused*). Pemutaran audio/video dihentikan sementara. Begitu panggilan telepon selesai dan aplikasi aktif kembali, status pelacakan kamera AR pulih secara instan. | |
| **TC-L-03** | Penguncian Layar Ponsel Secara Tiba-Tiba (Screen Lock/Power Button) | 1. Saat objek AR sedang dirender di layar, tekan tombol **"Power"** fisik ponsel untuk mengunci layar.<br>2. Diamkan ponsel selama 30 detik.<br>3. Tekan kembali tombol Power dan buka kunci layar ponsel (Pattern/PIN). | Layar terkunci -> Buka kunci layar | Sistem meluncurkan event `OnApplicationFocus(false)` dan menjeda rendering. Setelah layar dibuka kembali, memori GPU texture (RAM Cache) tetap terjaga utuh tanpa memicu visual korup atau piksel pecah pada model 3D. | |

---

## 📋 Langkah Persiapan Pengujian Perangkat Fisik (Pre-requisites)

1. **Persiapan Perangkat Keras:**
   * Sediakan minimal satu unit smartphone Android yang representatif (direkomendasikan spesifikasi menengah dengan RAM 4GB dan mendukung sensor gyro).
   * Pastikan kamera belakang dalam kondisi bersih untuk menghindari kegagalan deteksi marker.
2. **Persiapan Berkas Uji:**
   * Pasang berkas `.apk` rilis final Djaswita AR pada perangkat keras tersebut.
   * Cetak lembaran marker fisik resmi (Candi, Kuliner, Event) dalam ukuran standar kertas HVS A4 dengan warna yang tajam dan kontras.
3. **Persiapan Lingkungan Pengujian:**
   * Lakukan pengujian di ruangan dengan pencahayaan yang cukup (terang/cahaya matahari tidak langsung).
   * Sediakan stopwatch atau aplikasi perekam layar ponsel untuk mendokumentasikan performa waktu muat (*load time*) aset.
