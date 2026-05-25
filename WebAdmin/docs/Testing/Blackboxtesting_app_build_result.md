# Laporan Hasil Pengujian Blackbox Aplikasi Android Build (.APK)
## Proyek: Jaswita AR - Unity Client (Mobile Android Application)

Dokumen ini mencatat hasil pengujian fungsional dan observasi performa nyata (*Blackbox Testing*) dari paket rilis Android (`.apk`) yang diinstal pada perangkat keras smartphone fisik. Pengujian ini melengkapi pengujian simulasi editor sebelumnya dengan berfokus pada performa perangkat keras nyata di lapangan.

Secara fungsional, seluruh modul **LULUS (100% PASS RATE)** dengan beberapa catatan observasi performa dan batasan fisik perangkat keras seluler yang terdokumentasi di bawah ini untuk acuan optimasi selanjutnya.

---

## 📊 Ringkasan Hasil Pengujian Fisik (Physical Testing Verdict)

| Kategori Pengujian | Kasus Uji | Status | Hasil Aktual & Catatan Observasi Perangkat Nyata |
| :--- | :--- | :---: | :--- |
| **Kategori I**: Instalasi & Izin OS | TC-I-01 s/d TC-I-04 | **PASS** | Pemasangan sukses di Android. Popup izin kamera ditangani dengan aman. Sistem penyimpanan cache internal berhasil ditulis dan dibaca tanpa kendala hak akses. |
| **Kategori J**: Pelacakan AR Fisik | TC-J-01 s/d TC-J-04 | **PASS** | Pelacakan marker berhasil di dunia nyata. Jarak pemindaian optimal diidentifikasi, sensor cahaya rendah, dan delay kehilangan pelacakan berjalan sukses dengan beberapa temuan visual. |
| **Kategori K**: Jaringan & Caching | TC-K-01 s/d TC-K-03 | **PASS** | Algoritma Caching berhasil menghemat bandwidth seluler. Pengunduhan aset GLB besar berjalan aman dari crash OOM dengan temuan kinerja pemuatan memori. |
| **Kategori L**: Interupsi OS | TC-L-01 s/d TC-L-03 | **PASS** | Penanganan transisi ke latar belakang (*background*), panggilan telepon masuk, dan penguncian layar ponsel terverifikasi aman tanpa merusak integritas memori. |

---

## 🔍 Temuan Pengujian & Observasi Lapangan (Real-Device Observations)

Berikut adalah detail catatan observasi fisik dan perilaku performa yang ditemukan selama pengujian pada perangkat keras Android:

### 1. Performa Pemuatan Aset & RAM (Ponsel RAM 3GB/4GB)
*   **Temuan:** Saat aplikasi memuat model 3D `.glb` berukuran besar pada ponsel berspesifikasi menengah ke bawah (RAM 3GB - 4GB), terdeteksi terjadi **framedrop ringan sesaat** (*stuttering*).
*   **Analisis:** Hal ini wajar karena pustaka `glTFast` melakukan inisialisasi mesh dan instansiasi material pada thread utama saat objek AR dimunculkan ke scene.
*   **Kesimpulan:** Aplikasi tetap stabil, **tidak mengalami crash OOM** (*Out of Memory*), dan kembali ke frame rate normal (stabil) segera setelah objek terwujud penuh di layar.

### 2. Buffering Video & Glitch Visual Pemutar Video (Jaringan Lambat)
*   **Temuan:** Saat memutar video dari Google Drive pada jaringan internet yang lambat, animasi buffering Lottie berhasil muncul secara responsif. Namun, teridentifikasi adanya **glitch kosmetik minor**: *thumbnail* dari video yang dipindai sebelumnya masih sempat tertahan/nyangkut sesaat di layar sebelum video baru yang sedang dimuat mulai diputar.
*   **Rekomendasi Perbaikan:** Kosongkan tekstur pemutar video (*clear video player texture/render texture*) ke warna hitam transparan sebelum memicu pemuatan video baru.

### 3. Sensitivitas Deteksi & Sudut Kemiringan (AR Scanning Angle)
*   **Temuan:** Pemindaian dari sudut miring berjalan dengan sangat baik. Namun, terkadang muncul **glitch pelacakan minor** (objek sedikit bergeser/goyang) pada sudut ekstrem.
*   **Analisis:** Tingkat kestabilan ini sangat dipengaruhi oleh **desain visual marker fisik**. Semakin unik pola kontras gambar marker (memiliki rating bintang tinggi di Vuforia Target Manager), semakin kokoh proyeksi objek AR pada sudut ekstrem.

### 4. Batasan Kecerahan Cahaya (Low Light Sensitivity)
*   **Temuan:** Di bawah kondisi cahaya yang sangat redup (remang-remang), sistem pelacakan mengalami **delay deteksi selama 1 - 2 detik** sebelum objek AR berhasil muncul.
*   **Analisis:** Sensor kamera ponsel membutuhkan waktu untuk meningkatkan ISO/eksposur guna menangkap fitur kontras marker. Kualitas cetak marker fisik yang tajam dan kontras sangat membantu mempercepat proses deteksi pada kondisi remang-remang ini.

### 5. Jarak Pemindaian Efektif (Effective Scan Distance)
*   **Temuan:** Pada jarak pemindaian fisik sejauh 2 meter, fokus lensa kamera HP mulai memudar (*blur*) dan kehilangan ketajaman pelacakan marker.
*   **Rekomendasi Operasional:** Jarak pemindaian fisik yang paling efektif, responsif, dan direkomendasikan adalah pada kisaran **maksimal 1 meter** (jarak optimal ~1m).

### 6. Perilaku Kehilangan Pelacakan (Tracking Lost Recovery)
*   **Temuan:** Saat marker ditutup secara tiba-tiba, objek AR tidak langsung menghilang berkat delay penahanan **0.5 detik**. Namun, pada saat objek akhirnya menghilang, terkadang objek AR menghilang dengan sempurna, dan terkadang terdapat sedikit **goyangan/jitter sesaat** sebelum tidak dirender.

---

## 📈 Kesimpulan Akhir Pengujian Android (.APK)
Secara keseluruhan, build APK aplikasi klien seluler **Jaswita AR** terbukti **sangat tangguh** untuk digunakan langsung di lapangan. Aplikasi memiliki sistem toleransi kesalahan (*fault tolerance*) dan penanganan interupsi OS Android yang luar biasa aman. Catatan observasi di atas merupakan masukan performa berharga untuk iterasi optimasi visual di masa mendatang, namun tidak menghalangi kesiapan aplikasi untuk rilis produksi resmi.
