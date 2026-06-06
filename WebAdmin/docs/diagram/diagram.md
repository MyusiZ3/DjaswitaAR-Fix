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

Use case diagram di bawah ini merinci fungsionalitas dan batas sistem (*system boundary*) berdasarkan aktor utama: **Superadmin**, **Admin**, **Member**, dan **Pengunjung Pameran (End User)**.

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

    %% Aktor Kanan (Admin Roles)
    Member(("👤<br><b>Member</b><br>(Read-Only Admin)"))
    AdminActor(("👤<br><b>Admin</b><br>(Manager)"))
    Superadmin(("👤<br><b>Superadmin</b><br>(Full Controller)"))

    %% Relasi Pewarisan / Generalization (Dashed lines to parent class)
    Superadmin -.-> AdminActor
    AdminActor -.-> Member

    %% Hubungan Aktor Kiri ke Use Cases
    User --> UC_ScanMarker
    User --> UC_OfflineOverlay

    %% Hubungan Aktor Kanan ke Use Cases
    Member --> UC_Login
    Member --> UC_ViewStats
    Member --> UC_Hearbeat

    AdminActor --> UC_CRUD

    Superadmin --> UC_Config
    Superadmin --> UC_ManageAdmin

    %% Relasi Include / Extend (Dashed Lines dengan label UML)
    UC_Config -. "<< include >>" .-> UC_DoubleAuth
    UC_ScanMarker -. "<< include >>" .-> UC_CacheMarker
    
    UC_View3D -. "<< extend >>" .-> UC_ScanMarker
    UC_ViewCarousel -. "<< extend >>" .-> UC_ScanMarker
    UC_PlayVideo -. "<< extend >>" .-> UC_ScanMarker
    UC_OfflineOverlay -. "<< extend >>" .-> UC_ScanMarker

    %% Styling Warna & Bentuk Sesuai Standar Premium
    style User fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    style Member fill:#efebe9,stroke:#5d4037,stroke-width:2px;
    style AdminActor fill:#efebe9,stroke:#5d4037,stroke-width:2px;
    style Superadmin fill:#efebe9,stroke:#5d4037,stroke-width:2px;
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

    %% Penanganan Koneksi
    InitConn -- Ya (Online) --> InitApp[Inisialisasi Aplikasi:<br>1. Unduh Kredensial & Metadata dari Supabase<br>2. Aktifkan Kamera & Vuforia SDK]
    
    InitConn -- Tidak (Offline) --> ShowOfflineOverlay[Tampilkan Overlay Offline & Blokir Pemindaian]
    ShowOfflineOverlay --> CheckNetAgain{Apakah Koneksi<br>Kembali Aktif?}
    CheckNetAgain -- Tidak --> ShowOfflineOverlay
    CheckNetAgain -- Ya --> InitApp

    %% Siklus Pemindaian
    InitApp --> ScanLoop{Apakah Marker<br>Fisik Terdeteksi?}
    ScanLoop -- Tidak --> ScanLoop
    
    %% Alur Cache
    ScanLoop -- Ya --> CheckCache{Apakah Berkas Marker<br>Ada di Disk Cache Lokal?}
    
    CheckCache -- Ya --> ReadCache[Baca Berkas Marker dari Disk Lokal]
    CheckCache -- Tidak --> CacheProcess[Proses Disk Cache Lokal:<br>1. Unduh Berkas Marker dari Supabase Storage<br>2. Simpan Berkas & Terapkan Eliminasi LRU jika Penuh]
    
    ReadCache --> CheckType
    CacheProcess --> CheckType

    %% Percabangan Konten (3-Way Split Horisontal)
    CheckType{Apa Jenis Konten Utama<br>dari Target Terdeteksi?}
    
    CheckType -- "3D Model (.glb)" --> Render3D[Render Model 3D:<br>1. Parse GLB via glTFast<br>2. Normalisasi Skala Bounding Box]
    CheckType -- "Image Carousel (2D)" --> RenderCarousel[Render Image Carousel:<br>1. Muat Gambar ke RAM GPU<br>2. Batasi Maks 12 Tekstur di Memori]
    CheckType -- "Video Streaming" --> RenderVideo[Render Video Streaming:<br>1. Konversi Tautan GDrive via Proxy URL<br>2. Alirkan & Buffering Video]

    %% Penggabungan ke Analitik
    Render3D --> LogAnalytics
    RenderCarousel --> LogAnalytics
    RenderVideo --> LogAnalytics

    LogAnalytics[Pencatatan Analitik & Real-time Sync:<br>1. Kirim Log Aktivitas & Tambah Scan ke Supabase<br>2. Supabase Real-time Memicu Update Grafik Dashboard] --> TrackingCheck

    %% Pelacakan & Siklus Ulang (Optimasi Delay)
    TrackingCheck{Apakah Kamera Kehilangan<br>Pelacakan Marker?}
    TrackingCheck -- Tidak --> TrackingCheck
    
    TrackingCheck -- Ya --> DelayCheck{Marker Terdeteksi Kembali<br>dalam Jeda 0.5 Detik?}
    DelayCheck -- Ya --> MaintainRender[Pertahankan Tampilan Konten AR Tanpa Kedip]
    MaintainRender --> TrackingCheck
    
    DelayCheck -- Tidak --> HideContent[Sembunyikan Konten AR dengan Aman]
    HideContent --> ScanLoop
```
