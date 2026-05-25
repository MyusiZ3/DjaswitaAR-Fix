# Rencana Gaya UI: Halaman Manajemen Lokasi Wisata

Dokumen ini memandu penyelarasan gaya visual halaman daftar lokasi wisata, formulir input detail wisata, koordinat transform 3D model-viewer, serta komponen pengunggahan file (GLB/MP4) agar serasi dengan estetika **Matte Pastel Dark Dashboard**.

---

## 1. Standar Input Kolom & Form Control (`.form-group`)
Seluruh input teks (`input[type="text"]`), area catatan (`textarea`), dan pilihan menu (`select`) akan dibersihkan dari gaya bawaan browser dan diganti dengan desain arang matte minimalis.

- **Warna Dasar Input**: Background `#18191e` dengan garis batas tipis `var(--border-color)` (`#212329`).
- **Rounded Corners**: Sudut membulat `border-radius: 12px` (halus dan profesional).
- **Efek Focus State**: 
  - Saat kolom diklik, border bertransisi halus menjadi warna **Pastel Blue (`var(--pastel-blue)`)**.
  - Teks petunjuk (`placeholder`) menggunakan warna abu-abu redup `var(--text-dim)`.

```css
.form-input:focus {
  border-color: var(--pastel-blue);
  box-shadow: 0 0 10px rgba(191, 219, 254, 0.1);
  background-color: #1a1b21;
}
```

---

## 2. Drag & Drop File Uploader Zone
Kotak tempat mengunggah file marker gambar, model 3D (`.glb`), dan video MP4 akan diubah agar menyerupai instrumen laboratorium AR yang sangat premium.

- **Gaya Border**: Garis putus-putus (`dashed`) melingkar dengan warna **Pastel Blue (`var(--pastel-blue)`)** transparan.
- **Background**: Abu-abu arang matte (`#141519`) dengan ikon awan unggah menggunakan pendaran biru pastel yang redup.
- **Micro-Hover**: Saat file diseret di atas kotak (`dragover`), border berubah menjadi warna **Pastel Mint (`var(--pastel-mint)`)** dan area latar belakang menyala lembut.

---

## 3. Panel Kontrol Transformasi HUD (Skala, Rotasi, Posisi)
Panel instrumen untuk mengatur koordinat model 3D agar presisi di dalam aplikasi mobile Unity AR akan diselaraskan menjadi instrumen HUD (*Heads-Up Display*).

- **Label Koordinat**: Label sumbu X, Y, Z menggunakan font monospaced (`var(--font-mono)`) dan diberi tag warna pastel yang berbeda:
  - **Sumbu X**: Teks **Pastel Coral** (`var(--pastel-coral)`) tipis.
  - **Sumbu Y**: Teks **Pastel Mint** (`var(--pastel-mint)`) tipis.
  - **Sumbu Z**: Teks **Pastel Blue** (`var(--pastel-blue)`) tipis.
- **Tombol Reset Default**:
  - Berwarna dasar gelap matte transparan dengan teks putih bersih, dibalut border halus.
  - Memberikan pendaran warna **Pastel Lavender** saat disentuh.
