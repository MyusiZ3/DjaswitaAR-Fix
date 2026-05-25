# Laporan Hasil Pengujian Blackbox Aplikasi Android Build (.APK)
## Proyek: Djaswita AR - Unity Client (Mobile Android Application)

Dokumen ini mencatat hasil pengujian fungsional dan observasi performa nyata (*Blackbox Testing*) dari paket rilis Android (`.apk`) yang diinstal pada perangkat keras smartphone fisik. Pengujian fungsional terpadu ini mencakup 15 skenario kasus uji dari instalasi, pelacakan AR, optimasi jaringan, hingga interupsi OS.

Secara fungsional, seluruh modul dinyatakan **LULUS (100% PASS RATE)** dengan beberapa catatan observasi kinerja nyata untuk acuan optimasi selanjutnya.

---

## Tabel Hasil Pengujian Perangkat Fisik (Physical Device Testing Master Table)

| ID Uji | Fitur / Skenario Pengujian | Langkah-Langkah Pengujian | Hasil Aktual (Actual Result) & Observasi Perangkat Nyata | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-I-01** | Kompatibilitas Pemasangan Aplikasi | 1. Salin berkas `.apk` rilis ke penyimpanan ponsel.<br>2. Jalankan installer bawaan Android. | Sukses terpasang dengan lancar pada seluruh perangkat uji Android (OS v10 s/d v14) tanpa kendala sistem. | **PASS** |
| **TC-I-02** | Izin Kamera Fisik - Diizinkan | 1. Klik **"Allow / Saat Aplikasi Digunakan"** pada popup izin kamera saat aplikasi dijalankan pertama kali. | Kamera fisik ponsel menyala bersih di layar AR, pelacakan Vuforia aktif siap memindai secara instan. | **PASS** |
| **TC-I-03** | Izin Kamera Fisik - Ditolak | 1. Klik **"Don't Allow / Tolak"** pada popup izin kamera.<br>2. Amati layar aplikasi. | Aplikasi tetap aman (tidak crash). Muncul dialog peringatan informatif dan menutup modul AR dengan aman. | **PASS** |
| **TC-I-04** | Hak Akses Disk Cache Internal | 1. Pindai marker untuk mengunduh aset GLB.<br>2. Periksa direktori internal storage ponsel bawaan. | Direktori `JawitaCache` terbuat sempurna di storage internal ponsel. Aset terunduh berhasil dibaca dan ditulis dalam hash MD5. | **PASS** |
| **TC-I-05** | Validasi Keamanan & Kunci API Supabase Tidak Valid | 1. Sengaja masukkan kunci API Supabase yang salah ke dalam berkas konfigurasi.<br>2. Jalankan aplikasi dan amati antarmuka. | Aplikasi mendeteksi kesalahan kredensial secara instan dan secara otomatis menampilkan **overlay disconnect** untuk mencegah visual crash dan mengamankan sesi pengguna. | **PASS** |
| **TC-J-01** | Pelacakan Cahaya Redup | 1. Arahkan kamera ke marker di ruangan redup (< 50 lux).<br>2. Amati waktu respon deteksi. | Deteksi tetap berhasil dengan delay pemuatan sekitar **1 - 2 detik** (sangat dipengaruhi oleh tingkat kontras dan kualitas desain marker fisik). | **PASS** |
| **TC-J-02** | Pelacakan Sudut Miring Ekstrem | 1. Arahkan kamera dari sudut kemiringan tajam (sekitar 15° - 30° dari permukaan meja). | Objek AR sukses melayang tegak mengikuti sudut kemiringan ponsel. Kadang muncul **glitch pelacakan minor** tergantung keunikan desain marker. | **PASS** |
| **TC-J-03** | Toleransi Jarak Pelacakan | 1. Dekatkan kamera ke marker (< 10 cm).<br>2. Mundurkan kamera ke jarak > 2 meter. | Deteksi jarak dekat bekerja sangat baik. Pada jarak 2 meter, fokus kamera memudar sehingga diidentifikasi **jarak efektif optimal berada pada maksimal 1 meter**. | **PASS** |
| **TC-J-04** | Kehilangan Deteksi Fisik | 1. Tutup marker fisik secara tiba-tiba menggunakan kertas tebal saat objek AR sedang dirender. | Objek ditahan di layar selama **0.5 detik** sebelum disembunyikan. Saat menghilang kadang sempurna, kadang diiringi sedikit goyangan/jitter sesaat. | **PASS** |
| **TC-K-01** | Pemuatan Aset GLB Besar di RAM Rendah | 1. Pindai marker dengan aset GLB berukuran besar (> 50MB) pada HP spesifikasi RAM 3GB/4GB. | Berhasil memproses aset GLB besar tanpa crash OOM. Terdeteksi terjadi **framedrop/stuttering ringan sesaat** saat parsing mesh glTFast pada thread utama. | **PASS** |
| **TC-K-02** | Buffering Video di Jaringan Lambat | 1. Pindai marker video pada jaringan internet lambat (sinyal HSPA/3G, kecepatan < 2 Mbps). | Animasi buffering Lottie berjalan responsif. Terdapat glitch kosmetik berupa **thumbnail video sebelumnya sempat nyangkut sesaat** sebelum video baru diputar. | **PASS** |
| **TC-K-03** | Transisi Wi-Fi ke Data Seluler | 1. Matikan Wi-Fi di tengah proses pengunduhan aset agar ponsel beralih ke data seluler secara mendadak. | Sistem auto-retry mendeteksi perubahan status jaringan secara mulus dan melanjutkan proses unduhan aset hingga selesai tanpa crash. | **PASS** |
| **TC-L-01** | Minimalkan Aplikasi (Home Button) | 1. Tekan tombol **"Home"** saat objek AR aktif.<br>2. Biarkan 1 menit, lalu buka kembali dari Recent Apps. | Penggunaan kamera fisik dilepaskan saat background demi privasi. Saat dilanjutkan (resume), kamera aktif kembali dengan sangat cepat. | **PASS** |
| **TC-L-02** | Interupsi Panggilan Telepon | 1. Lakukan panggilan telepon fisik ke ponsel uji saat AR aktif.<br>2. Tolak panggilan dan kembali ke aplikasi. | Sistem otomatis menjeda pemutaran video/audio secara instan. Status pelacakan AR pulih secara otomatis segera setelah panggilan selesai. | **PASS** |
| **TC-L-03** | Penguncian Layar Ponsel | 1. Tekan tombol **"Power"** untuk mengunci layar saat AR aktif.<br>2. Buka kunci layar setelah 30 detik. | Sistem meluncurkan event jeda dengan aman. Setelah layar dibuka kembali, memori texture GPU tetap terjaga utuh tanpa korup visual. | **PASS** |

---

## Kesimpulan Akhir Pengujian Android (.APK)
Secara keseluruhan, build APK aplikasi klien seluler **Djaswita AR** terbukti **sangat tangguh** untuk digunakan langsung di lapangan. Aplikasi memiliki sistem toleransi kesalahan (*fault tolerance*) dan penanganan interupsi OS Android yang luar biasa aman. Catatan observasi di atas merupakan masukan performa berharga untuk iterasi optimasi visual di masa mendatang, namun tidak menghalangi kesiapan aplikasi untuk rilis produksi resmi.
