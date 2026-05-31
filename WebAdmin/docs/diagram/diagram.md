# Spesifikasi Visual & Diagram Sistem Djaswita AR

Dokumen ini mendokumentasikan diagram arsitektur basis data, model use case, dan flowchart alur operasional untuk sistem **Djaswita AR** (Aplikasi Mobile AR + Web Admin Dashboard CMS + Supabase Backend). 

Seluruh diagram di bawah ini diimplementasikan menggunakan **Mermaid.js** standar untuk memastikan kemudahan integrasi dan pemeliharaan jangka panjang.

---

## 1. Entity Relationship Diagram (ERD) Basis Data Supabase

Diagram hubungan entitas (ERD) berikut menggambarkan struktur tabel PostgreSQL di Supabase. Database ini mengelola data autentikasi pengguna, data target marker, log analitik pemindaian, serta catatan konfigurasi dan audit internal.

```mermaid
erDiagram
    PROFILES {
        uuid id PK "Relasi ke auth.users"
        varchar username "Nama pengguna unik"
        varchar email "Surel resmi admin"
        varchar role "superadmin | admin | member"
        timestamp updated_at "Waktu modifikasi terakhir"
    }

    AR_TARGETS {
        varchar id PK "ID target unik (Vuforia Marker ID)"
        varchar name "Nama destinasi/lokasi"
        text description "Deskripsi promosi wisata"
        varchar main_content_type "3d_model | image_carousel | video_streaming"
        text content_url "URL berkas aset (Supabase/GDrive)"
        float scale "Multiplier skala untuk normalisasi"
        float rotation_y "Rotasi default sumbu Y"
        varchar marker_url "URL gambar marker terunggah"
        integer scan_count "Akumulasi jumlah pemindaian"
        timestamp created_at "Waktu pembuatan data"
    }

    SCANS {
        bigint id PK "Auto Increment"
        varchar target_id FK "Relasi ke ar_targets.id (CASCADE)"
        varchar device_info "Model HP dan OS Android"
        timestamp scanned_at "Waktu pemindaian dilakukan"
    }

    APP_SETTINGS {
        varchar key PK "Kunci konfigurasi (misal: GDRIVE_KEY)"
        text value "Nilai konfigurasi (terenkripsi)"
        timestamp updated_at "Waktu update terakhir"
    }

    APP_SETTINGS_LOGS {
        bigint id PK "Auto Increment"
        uuid admin_id FK "Relasi ke profiles.id"
        varchar action_details "Detail tindakan modifikasi"
        timestamp logged_at "Waktu pencatatan log"
    }

    PROFILES ||--o{ APP_SETTINGS_LOGS : "mencatat aktivitas"
    AR_TARGETS ||--o{ SCANS : "memiliki riwayat"
```

### Penjelasan Relasi:
1. **`PROFILES` ke `APP_SETTINGS_LOGS` (1:N)**: Setiap administrator memiliki riwayat audit log aktivitas yang mencatat perubahan konfigurasi sensitif (Supabase/Google Drive) demi transparansi keamanan.
2. **`AR_TARGETS` ke `SCANS` (1:N)**: Satu target penanda (marker) dapat dipindai berkali-kali oleh banyak pengguna unik dari perangkat Android yang berbeda. Jika sebuah target dihapus, seluruh data riwayat scan yang terasosiasi dengannya otomatis terhapus secara berantai (`ON DELETE CASCADE`).

---

## 2. Use Case Diagram Sistem Augmented Reality Dinamis

Use case diagram di bawah ini merinci fungsionalitas dan batas sistem (*system boundary*) berdasarkan dua aktor utama: **Administrator** (termasuk sub-role Superadmin, Admin, Member) dan **Pengunjung Pameran (End User)**.

```mermaid
graph LR
    %% Aktor Kiri (User)
    User(("🧍<br><b>Pengunjung Pameran</b><br>(End User)"))

    %% Batas Sistem (System Boundary Tunggal)
    subgraph SystemBoundary ["Batas Sistem Djaswita AR"]
        direction TB
        
        %% Use Cases dalam bentuk OVAL (Stadium Shape)
        UC_Login(["Login & Autentikasi Sesi <br>(Timeout 12 Jam)"])
        UC_CRUD(["Mengelola Target AR <br>(CRUD & Pencarian)"])
        UC_Config(["Mengubah Konfigurasi API"])
        UC_DoubleAuth(["Verifikasi Sandi Admin <br>(Double Authentication)"])
        UC_ViewStats(["Memantau Grafik Statistik <br>(Real-time Weekly Scans)"])
        UC_ManageAdmin(["Mengelola Akun Admin <br>(Superadmin Only)"])
        UC_Hearbeat(["Memantau Database Heartbeat"])
        
        UC_ScanMarker(["Memindai Marker Fisik <br>(Vuforia Tracking)"])
        UC_View3D(["Melihat Model 3D <br>(Auto-Scale glTFast)"])
        UC_ViewCarousel(["Melihat Slideshow Gambar <br>(Image Carousel 2D)"])
        UC_PlayVideo(["Memutar Video Promosi <br>(GDrive Proxy Stream)"])
        UC_OfflineOverlay(["Melihat Overlay Offline <br>(Blokir Pemindaian)"])
        UC_CacheMarker(["Caching Marker Aset <br>(LRU Cache System)"])
    end

    %% Aktor Kanan (Admin)
    Admin(("👤<br><b>Administrator</b><br>(Super/Admin/Member)"))

    %% Hubungan Aktor Kiri ke Use Cases
    User --> UC_ScanMarker
    User --> UC_OfflineOverlay

    %% Hubungan Aktor Kanan ke Use Cases (Tarik ke kanan)
    UC_Login --> Admin
    UC_CRUD --> Admin
    UC_Config --> Admin
    UC_ViewStats --> Admin
    UC_ManageAdmin --> Admin
    UC_Hearbeat --> Admin

    %% Relasi Include / Extend (Dashed Lines dengan label UML)
    UC_Config -. "<< include >>" .-> UC_DoubleAuth
    UC_ScanMarker -. "<< include >>" .-> UC_CacheMarker
    
    UC_View3D -. "<< extend >>" .-> UC_ScanMarker
    UC_ViewCarousel -. "<< extend >>" .-> UC_ScanMarker
    UC_PlayVideo -. "<< extend >>" .-> UC_ScanMarker
    UC_OfflineOverlay -. "<< extend >>" .-> UC_ScanMarker

    %% Styling Warna & Bentuk Sesuai Standar Premium
    style User fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    style Admin fill:#efebe9,stroke:#5d4037,stroke-width:2px;
    style SystemBoundary fill:#fafafa,stroke:#333,stroke-width:2px;
```

---

## 3. Flowchart Alur Pemindaian dan Penampilan Konten Augmented Reality

Flowchart ini memetakan langkah-langkah logika mendalam yang dieksekusi oleh aplikasi klien seluler (Unity Client) sejak aplikasi pertama kali diluncurkan, pemeriksaan status jaringan, proses pemindaian Vuforia, pengunduhan & pembersihan cache LRU marker, hingga penampilan visual AR yang dinamis di layar perangkat. 

*Catatan: Pemindaian diblokir sepenuhnya saat offline dengan memunculkan **Overlay Offline** untuk meminimalisir kegagalan penampilan pemutaran video Google Drive.*

```mermaid
flowchart TD
    %% Mulai
    Start([Mulai Aplikasi Unity Client]) --> InitConn{Apakah Perangkat<br>Memiliki Internet?}

    %% Cabang Inisialisasi Koneksi
    InitConn -- Ya (Online) --> FetchOnline[Unduh Kredensial & Metadata Terbaru dari Supabase]
    FetchOnline --> ActiveVuforia[Aktifkan Kamera & Vuforia SDK]

    %% Cabang Offline (Blokir Pemindaian)
    InitConn -- Tidak (Offline) --> ShowOfflineOverlay[Tampilkan Overlay Offline & Blokir Pemindaian]
    ShowOfflineOverlay --> BlockScan[Aplikasi Menunggu Jaringan Aktif Kembali]
    BlockScan --> CheckNetAgain{Apakah Koneksi<br>Kembali Aktif?}
    CheckNetAgain -- Tidak --> BlockScan
    CheckNetAgain -- Ya --> FetchOnline

    %% Proses Pemindaian
    ActiveVuforia --> ScanLoop{Apakah Marker<br>Fisik Terdeteksi?}
    ScanLoop -- Tidak --> ScanLoop
    ScanLoop -- Ya --> ResolveTarget[Ekstrak ID Target dari Vuforia Dataset]

    %% Pemeriksaan Cache Marker (LRU Caching)
    ResolveTarget --> CheckCache{Apakah Berkas Marker<br>Ada di Disk Cache Lokal?}
    
    CheckCache -- Tidak --> DownloadMarker[Unduh Marker dari Supabase Storage]
    DownloadMarker --> SaveCache[Simpan Berkas Marker di Disk Lokal]
    SaveCache --> CheckLRU{Apakah Ukuran Cache Marker<br>Melebihi Batas?}
    
    CheckLRU -- Ya --> EvictLRU[Hapus Aset Marker Tertua yang Jarang Digunakan]
    EvictLRU --> CheckType
    CheckLRU -- Tidak --> CheckType

    CheckCache -- Ya --> ReadCache[Baca Berkas Marker Langsung dari Penyimpanan Lokal]
    ReadCache --> CheckType

    %% Percabangan Jenis Media Konten
    CheckType{Apa Jenis Konten Utama<br>dari Target Terdeteksi?}
    
    CheckType -- "3D Model (.glb)" --> ParseGLB[Parse File GLB menggunakan glTFast]
    ParseGLB --> AutoScale[Hitung Normalisasi Skala Bounding Box]
    AutoScale --> Render3D[Render Model 3D Melayang Presisi di Atas Marker]
    Render3D --> RecordScan

    CheckType -- "Image Carousel (2D)" --> LoadImages[Muat Gambar-Gambar ke RAM GPU Texture]
    LoadImages --> LimitRAM{Apakah Gambar di RAM<br>Lebih dari 12 Tekstur?}
    LimitRAM -- Ya --> EvictRAM[Hapus Alokasi Tekstur Tertua dari Memori]
    EvictRAM --> RenderCarousel
    LimitRAM -- Tidak --> RenderCarousel
    RenderCarousel[Render Canvas 2D Melayang dengan Navigasi Slide Arrow]
    RenderCarousel --> RecordScan

    CheckType -- "Video Streaming" --> ProxyGDrive[Konversi Tautan File Google Drive Menjadi Proxy URL]
    ProxyGDrive --> VideoPlayer[Alirkan Video ke Unity VideoPlayer dengan Buffering]
    VideoPlayer --> RenderVideo[Render Video Melayang Dilengkapi Kontrol Play/Pause]
    RenderVideo --> RecordScan

    %% Perekaman Log Analitik
    RecordScan --> IncrementStats[Kirim Tambah Scan & Log Aktivitas ke Supabase]
    IncrementStats --> PushRealtime[Supabase Realtime Memicu Update Grafik Dashboard]
    PushRealtime --> TrackingLostCheck

    %% Penanganan Tracking Lost & Delay
    TrackingLostCheck{Apakah Kamera Kehilangan<br>Pelacakan Marker?}
    TrackingLostCheck -- Tidak --> TrackingLostCheck
    TrackingLostCheck -- Ya --> DelayTimer[Aktifkan Jeda Waktu Pengampunan 0.5 Detik]
    
    DelayTimer --> RecaptureCheck{Apakah Marker<br>Terdeteksi Kembali?}
    RecaptureCheck -- Ya (Sebelum 0.5s) --> MaintainRender[Pertahankan Tampilan Konten AR Tanpa Kedip]
    MaintainRender --> TrackingLostCheck
    
    RecaptureCheck -- Tidak (Setelah 0.5s) --> HideContent[Sembunyikan Konten AR dengan Aman]
    HideContent --> ScanLoop
```
