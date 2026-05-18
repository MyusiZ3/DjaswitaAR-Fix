# Rencana Gaya UI: Halaman Informasi Aplikasi (About)

Dokumen ini memandu implementasi gaya visual halaman profil pengembang, sejarah rilis sistem (*release history*), detail arsitektur terintegrasi Supabase & Unity AR, serta lisensi perangkat lunak agar serasi dengan estetika **Matte Pastel Dark Dashboard**.

---

## 🛠️ 1. Panel Info Sistem & Arsitektur Terintegrasi
Area tentang teknologi yang digunakan (Vite, Supabase, Unity Engine, Vuforia SDK) akan dipresentasikan dengan modul ikon minimalis bertema modular.

- **Integrasi Pustaka (Tech Stack Cards)**: Setiap teknologi dikemas dalam kartu kotak kecil abu-abu arang matte (`#141519`) berpendar.
- **Warna Aksen**: Menggunakan aksen **Pastel Blue (`var(--pastel-blue)`)** untuk teknologi web (Vite & Supabase) dan **Pastel Peach (`var(--pastel-peach)`)** untuk teknologi AR Mobile (Unity & Vuforia).
- **Penulisan Versi SDK**: Diberi penanda kode menggunakan font monospaced (`var(--font-mono)`) transparan yang rapi.

---

## 📅 2. Garis Waktu Pengembangan & Release Notes (Timeline)
Garis waktu kronologis rilis perbaikan bug dan peningkatan sistem (misalnya pelacakan marker offline, optimalisasi URP, penyeimbangan shader variant) akan didesain vertikal secara minimalis.

- **Garis Utama Timeline**: Garis vertikal tipis `2px` berwarna arang gelap, dengan titik bulat penyambung (*timeline nodes*) di setiap versi rilis.
- **Titik Bulat Nodes**: Menggunakan pendaran warna bulat **Neon Lime (`var(--pastel-lime)`)** untuk versi terbaru aktif saat ini, dan **Pastel Lavender** untuk versi rilis sebelumnya.
- **Card Catatan Rilis**: Kartu ringkasan fitur rilis bertema abu-abu arang matte dengan padding dalam yang rapat dan rapi.

```css
.timeline-line {
  background-color: var(--border-color);
  width: 2px;
}
.timeline-node.active {
  background-color: var(--pastel-lime);
  box-shadow: 0 0 10px var(--pastel-lime);
}
```

---

## 💻 3. Kartu Profil Pengembang (Developer Credits)
Profil tim yang membangun Djaswita AR terintegrasi akan didesain asimetris menggunakan skema pastel yang menyenangkan.

- **Warna Latar Belakang Kartu**: Menggunakan skema kartu pastel penuh asimetris:
  - **Profil 1**: Latar belakang penuh **Pastel Mint** (`var(--pastel-mint)`) dengan teks gelap.
  - **Profil 2**: Latar belakang penuh **Pastel Lavender** (`var(--pastel-lavender)`) dengan teks gelap.
- **Tombol Tautan Kontak (GitHub / Website)**: Menggunakan tombol kapsul hitam transparan minimalis di dalam kartu pastel dengan efek geser halus saat di-hover.
