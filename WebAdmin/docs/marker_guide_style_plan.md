# Rencana Gaya UI: Halaman Panduan Marker AR (Marker Guide)

Dokumen ini memandu implementasi halaman panduan kualitas gambar marker agar serasi dengan estetika **Matte Pastel Dark Dashboard**. Halaman ini sangat penting untuk membantu admin mengunggah marker yang mudah dikenali oleh pustaka pelacakan AR (seperti Vuforia) di Unity.

---

## 🎴 1. Kartu Perbandingan Kualitas Gambar (Good vs Bad Markers)
Visualisasi contoh marker gambar yang baik dan yang buruk akan disajikan menggunakan tata letak kartu berdampingan (*comparison cards*) yang terstruktur sangat kontras.

- **Kartu Marker Baik (High Contrast / Rich Features)**:
  - Latar belakang kartu menggunakan batas border tipis berpendar warna **Pastel Mint (`var(--pastel-mint)`)**.
  - Ditambahkan lencana/tag kecil bertuliskan `"RECOMMENDED"` berwarna **Pastel Mint** dengan teks gelap di bagian sudut atas.
- **Kartu Marker Buruk (Low Contrast / Repeating Patterns)**:
  - Latar belakang kartu menggunakan batas border tipis berpendar warna **Pastel Coral (`var(--pastel-coral)`)**.
  - Ditambahkan lencana/tag kecil bertuliskan `"POOR QUALITY"` berwarna **Pastel Coral** dengan teks gelap di bagian sudut atas.

---

## 🎯 2. Grid & Viewfinder Overlay Kamera AR (Visual panduan)
Untuk memberikan kesan simulasi kamera pemindai sungguhan, kotak contoh marker akan dilengkapi dengan overlay grid dan crosshair bertema holografik.

- **Holographic Scan Grid**: Memberikan garis-garis tipis berpola kotak (*matrix grid*) transparan berwarna biru muda di atas gambar contoh.
- **Crosshair Scanner**: Menaruh lingkaran target bidik di pusat gambar dengan warna **Neon Lime (`var(--pastel-lime)`)** berpendar tipis, disertai teks petunjuk monospaced di sudut gambar (misalnya: `SCANNER ACTIVE: 100%`).

```css
.marker-preview-grid {
  position: relative;
  background-image: 
    linear-gradient(rgba(191, 219, 254, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 219, 254, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 💡 3. Kartu Panduan Teknis & Kriteria Marker
Detail penjelasan kriteria (seperti resolusi gambar, detail kontras, dan format berkas) akan dikemas dalam modul list interaktif.

- **Kriteria Kartu Panduan**: Menggunakan gaya kartu pastel asimetris (*Outlander style*), yaitu menggunakan latar belakang penuh warna **Pastel Peach (`var(--pastel-peach)`)** transparan atau **Pastel Lavender (`var(--pastel-lavender)`)** transparan dengan ikon di sebelah kiri yang serasi untuk menonjolkan poin-poin krusial.
- **Transisi Hover**: Kartu akan sedikit membesar (`scale(1.02)`) dengan mulus saat disorot pointer mouse pengguna untuk meningkatkan ketertarikan interaksi.
