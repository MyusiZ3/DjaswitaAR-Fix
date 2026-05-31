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
graph TB
    %% Definisi Aktor
    subgraph Aktor ["Aktor Pengguna"]
        Admin[("👤 Administrator <br>(Super/Admin/Member)")]
        User[("📱 Pengunjung Pameran <br>(End User)")]
    end

    %% Batas Sistem (System Boundary)
    subgraph SystemBoundary ["Batas Sistem Djaswita AR"]
        direction TB
        
        %% Use Cases Admin
        UC_Login["Login & Autentikasi Sesi <br>(Timeout 12 Jam)"]
        UC_CRUD["Mengelola Target AR <br>(CRUD & Pencarian Target)"]
        UC_Config["Mengubah Konfigurasi API <br>(Double Authentication)"]
        UC_ViewStats["Memantau Grafik Statistik <br>(Real-time Weekly Scans)"]
        UC_ManageAdmin["Mengelola Akun Admin <br>(Superadmin Only)"]
        UC_Hearbeat["Memantau Database Heartbeat"]

        %% Use Cases User
        UC_ScanMarker["Memindai Marker Fisik <br>(Vuforia Tracking)"]
        UC_View3D["Melihat Model 3D <br>(Auto-Scale glTFast)"]
        UC_ViewCarousel["Melihat Slideshow Gambar <br>(Image Carousel 2D)"]
        UC_PlayVideo["Memutar Video Promosi <br>(GDrive Proxy Stream)"]
        UC_OfflineMode["Berjalan Tanpa Internet <br>(SQLite Offline Fallback)"]
        UC_CacheSync["Sinkronisasi Antrean Scan <br>(Background Batch Sync)"]
    end

    %% Hubungan Aktor ke Use Case
    Admin --> UC_Login
    Admin --> UC_CRUD
    Admin --> UC_Config
    Admin --> UC_ViewStats
    Admin --> UC_ManageAdmin
    Admin --> UC_Hearbeat

    User --> UC_ScanMarker
    User --> UC_OfflineMode

    %% Relasi Include / Extend
    UC_ScanMarker -. "<< include >>" .-> UC_View3D
    UC_ScanMarker -. "<< include >>" .-> UC_ViewCarousel
    UC_ScanMarker -. "<< include >>" .-> UC_PlayVideo
    UC_OfflineMode -. "<< extend >>" .-> UC_CacheSync

    %% Styling Warna
    style Admin fill:#efebe9,stroke:#5d4037,stroke-width:2px;
    style User fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    style SystemBoundary fill:#fafafa,stroke:#333,stroke-width:2px;
```

---

## 3. Flowchart Alur Pemindaian dan Penampilan Konten Augmented Reality

Flowchart ini memetakan langkah-langkah logika mendalam yang dieksekusi oleh aplikasi klien seluler (Unity Client) sejak aplikasi pertama kali diluncurkan, pemeriksaan status jaringan, proses pemindaian Vuforia, pengunduhan & pembersihan cache LRU, hingga penampilan visual AR yang dinamis di layar perangkat.

```mermaid
flowchart TD
    %% Mulai
    Start([Mulai Aplikasi Unity Client]) --> InitConn{Apakah Perangkat<br>Memiliki Internet?}

    %% Cabang Inisialisasi Koneksi
    InitConn -- Ya (Online) --> FetchOnline[Unduh Kredensial & Metadata Terbaru dari Supabase]
    FetchOnline --> UpdateLocalDB[Perbarui Basis Data SQLite Lokal]
    UpdateLocalDB --> ActiveVuforia[Aktifkan Kamera & Vuforia SDK]

    InitConn -- Tidak (Offline) --> LoadLocalDB[Muat Metadata Target Terakhir dari SQLite Lokal]
    LoadLocalDB --> ShowOfflineToast[Tampilkan Toast Indikator Offline]
    ShowOfflineToast --> ActiveVuforia

    %% Proses Pemindaian
    ActiveVuforia --> ScanLoop{Apakah Marker<br>Fisik Terdeteksi?}
    ScanLoop -- Tidak --> ScanLoop
    ScanLoop -- Ya --> ResolveTarget[Ekstrak ID Target dari Vuforia Dataset]

    %% Pemeriksaan Cache
    ResolveTarget --> CheckCache{Apakah Berkas Aset<br>Ada di Disk Cache Lokal?}
    
    CheckCache -- Tidak --> DownloadAsset[Unduh Aset dari Storage/Google Drive Proxy]
    DownloadAsset --> SaveCache[Simpan Berkas Baru di Disk Lokal]
    SaveCache --> CheckLRU{Apakah Ukuran Cache<br>Melebihi 500 MB?}
    
    CheckLRU -- Ya --> EvictLRU[Hapus Aset Tertua yang Jarang Digunakan]
    EvictLRU --> CheckType
    CheckLRU -- Tidak --> CheckType

    CheckCache -- Ya --> ReadCache[Baca Berkas Langsung dari Penyimpanan Lokal]
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
    RecordScan{Apakah Aplikasi<br>Berstatus Online?}
    
    RecordScan -- Ya --> IncrementStats[Kirim Tambah Scan & Log Aktivitas ke Supabase]
    IncrementStats --> PushRealtime[Supabase Realtime Memicu Update Grafik Dashboard]
    PushRealtime --> TrackingLostCheck

    RecordScan -- Tidak --> QueueOffline[Masukkan Event Scan ke SQLite Offline Queue]
    QueueOffline --> TrackingLostCheck

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
