# Rencana Implementasi Gaya UI: Matte Pastel Dark Dashboard (Jaswita AR)

Dokumen ini berisi rencana teknis revisi untuk mentransformasikan antarmuka (UI) panel admin **Jaswita AR** menjadi bertema **Matte Pastel Dark Dashboard** berdasarkan referensi premium yang Anda berikan (*Outlander* & *Kreatop* style).

---

## 1. Sistem Warna & Desain Token Baru (`main.css`)

Kami akan memperbarui bagian `:root` pada file `main.css` untuk mengubah skema warna neon tajam sebelumnya menjadi **skema pastel gelap matte** dengan tingkat kontras yang tinggi namun nyaman di mata.

```css
:root {
  /* Matte Slate & Charcoal Base */
  --bg-color: #0c0d0f;        /* Deep matte charcoal background */
  --card-bg: #141519;         /* Lighter warm slate for cards */
  --sidebar-bg: #0c0d0f;      /* Sidebar blending with background */
  --border-color: #212329;    /* Thin, clean dark border line */
  
  /* Primary Text Colors */
  --text-main: #f3f4f6;       /* Bright off-white */
  --text-dim: #8e939e;        /* Clean cool gray for captions */
  --text-dark: #121316;       /* Deep slate for text inside pastel blocks */
  
  /* Pastel Accent Palette (Outlander Style) */
  --pastel-mint: #bbf7d0;     /* Mint Green (Engagement / Active) */
  --pastel-mint-dark: #14532d;
  
  --pastel-peach: #fed7aa;    /* Warm Peach/Orange (Locations) */
  --pastel-peach-dark: #7c2d12;
  
  --pastel-lavender: #e9d5ff; /* Soft Lavender/Purple (Admins) */
  --pastel-lavender-dark: #581c87;
  
  --pastel-blue: #bfdbfe;     /* Ice Blue (Charts / Scans) */
  
  --pastel-coral: #fecaca;    /* Soft Coral/Salmon (Danger / Delete) */
  --pastel-coral-dark: #7f1d1d;
  
  /* Neon Lime Accent (Kreatop Active Highlight Style) */
  --pastel-lime: #d4fc34;     /* High-impact highlight lime green */
  
  /* Layout Metrics */
  --radius-lg: 20px;          /* Highly rounded cards */
  --radius-md: 12px;          /* Buttons, inputs, smaller pills */
  --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
```

---

## 2. Desain Ulang Sidebar Navigation (Kreatop Style)

Sesuai referensi *Kreatop*, navigasi aktif akan dibuat sangat menonjol menggunakan **pill-shaped neon lime** dengan teks gelap, yang memancarkan kesan berenergi tinggi dan modern.

#### File: [main.css](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/main.css)
*   **Target Kelas**: `.nav-item`, `.nav-item.active`
*   **Perubahan Gaya**:
    1.  Sidebar memiliki batas kanan tipis (`border-right: 1px solid var(--border-color)`).
    2.  Setiap `.nav-item` mendapatkan transisi bergeser dan teks berubah terang secara perlahan saat di-hover.
    3.  Pill aktif `.nav-item.active` mendapatkan latar belakang penuh warna **Neon Lime (`var(--pastel-lime)`)** dengan teks gelap (`var(--text-dark)`) dan ketebalan huruf `font-weight: 700`.
    4.  Ujung pill dibuat bulat sempurna (`border-radius: 12px` atau `100px` untuk gaya pill murni).

---

## 3. Desain Grid Kartu Statistik & Grafik (Outlander Style)

Pada referensi *Outlander*, kartu statistik tidak semuanya seragam berwarna gelap. Kami akan mengadopsi struktur **Mix-and-Match Stat Cards** ini pada dashboard Jaswita AR untuk memecah kebosanan visual.

#### File: [DashboardSection.js](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/components/DashboardSection.js) & [main.css](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/main.css)
*   **Kartu 1 (Total Engagement)**: Diubah menjadi kartu dengan latar belakang penuh warna **Pastel Mint (`var(--pastel-mint)`)** dan warna teks dalam bernuansa gelap (`var(--text-dark)`).
*   **Kartu 2 (Active Spots)**: Kartu dasar gelap matte dengan aksen ikon berwarna **Pastel Peach (`var(--pastel-peach)`)**.
*   **Kartu 3 (Verified Admins)**: Diubah menjadi kartu dengan latar belakang penuh warna **Pastel Lavender (`var(--pastel-lavender)`)** dan warna teks dalam bernuansa gelap (`var(--text-dark)`).
*   **Grafik Mingguan & Distribusi (Chart.js)**:
    -   Mengubah garis mingguan menjadi kurva berwarna **Pastel Blue (`var(--pastel-blue)`)** dengan titik-titik bulat pastel di atas latar belakang grafik yang bersih.
    -   Warna segmen chart donat diubah menggunakan rangkaian warna pastel: Mint, Peach, Lavender, dan Blue.
    -   Menambahkan teks total lokasi dengan ukuran font besar di tengah lingkaran donat.

---

## 3⃣ 4. Holographic 3D Viewport & Pilihan Mode AR

Kami akan menyelaraskan instrumen pratinjau 3D model-viewer dan marker agar selaras dengan estetika pastel gelap matte.

#### File: [WisataSection.js](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/components/WisataSection.js) & [main.css](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/main.css)
*   **Pilihan Mode AR (Image Slides vs 3D Model)**:
    -   Mengganti penanda radio aktif kustom dengan warna penuh **Neon Lime (`var(--pastel-lime)`)** dan teks gelap ketika di-klik.
*   **3D Studio Viewport**:
    -   Mengubah background viewport menjadi abu-abu arang matte (`#141519`) dengan sudut bidik kamera AR tipis berwarna **Pastel Mint** berpendar lembut.
    -   Tombol "Reset Default" dan form angka koordinat didesain minimalis dengan border tipis dan font monospaced.

---

## 5. Micro-Animations & Kontrol Dinamis

Menyempurnakan dashboard dengan animasi yang terasa sangat organik dan responsif saat diklik atau dimuat.

*   **Tabel & Progress Bar**:
    -   Bar popularitas di tabel *Top Destinations* akan menggunakan warna gradien dari **Pastel Mint** ke **Pastel Blue** dengan transisi lebar dinamis saat data dimuat.
    -   Lencana kategori (`badge`) diubah menjadi pill pastel transparan minimalis (contoh: wisata menggunakan latar mint transparan dengan teks mint hijau).
*   **Notifikasi & Tombol**:
    -   Tombol utama (*primary button*) "New Location" atau "Masuk" menggunakan warna **Pastel Mint** atau **Neon Lime** yang kontras tinggi.
    -   Menambahkan efek denyut (*pulse animation*) halus pada lencana aktif.

---

## Rencana Verifikasi Tampilan Visual

Kami akan melakukan peninjauan visual secara manual melalui browser subagent untuk memastikan:
1.  **Konsistensi Kontras**: Memastikan teks di dalam kartu pastel (Mint & Lavender) terbaca dengan sangat jelas memakai warna teks gelap (`var(--text-dark)`).
2.  **Keseimbangan Warna**: Memastikan warna Neon Lime pada menu aktif sidebar tidak mengaburkan teks menu dan ikon.
3.  **Kerapihan Layout**: Memastikan susunan Mix-and-Match kartu di dashboard memiliki ukuran tinggi yang sama (*flex equal height*) dan responsif pada berbagai ukuran layar.
