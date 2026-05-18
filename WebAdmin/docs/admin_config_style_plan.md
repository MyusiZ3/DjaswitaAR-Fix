# Rencana Gaya UI: Halaman Konfigurasi Admin (Admin Config)

Dokumen ini memandu implementasi gaya visual halaman manajemen pengguna, pengaturan profil admin, penyesuaian hak akses (roles), serta tombol toggle fungsional agar serasi dengan estetika **Matte Pastel Dark Dashboard**.

---

## 👥 1. Grid Pengguna & Kartu Profil Anggota
Profil para admin dan superadmin akan disajikan dalam susunan kartu profil minimalis yang bersih dengan status aktif yang mudah dipantau.

- **Avatar Profil**: Menggunakan pembungkus berbentuk lingkaran dengan border berwarna **Pastel Lavender (`var(--pastel-lavender)`)** berpendar.
- **Pill Indikator Role**:
  - **Superadmin**: Lencana bertema **Pastel Lavender** (`rgba(233, 213, 255, 0.15)`) transparan dengan teks lavender.
  - **Admin**: Lencana bertema **Pastel Blue** (`rgba(191, 219, 254, 0.15)`) transparan dengan teks biru.
  - **Member**: Lencana bertema **Pastel Mint** (`rgba(187, 247, 208, 0.15)`) transparan dengan teks hijau mint.

---

## 🎚️ 2. Switch Toggle Hak Akses Kustom (`.switch`)
Tombol sakelar geser (*toggle switch*) untuk menghidupkan/mematikan izin akses modul atau status verifikasi admin akan didesain menyerupai konsol teknologi tinggi yang futuristik.

- **Background Switch Non-Aktif**: Warna arang gelap abu-abu (`#1e1f24`) dengan lingkaran geser berwarna abu-abu redup.
- **Background Switch Aktif (Checked)**: Warna penuh **Neon Lime (`var(--pastel-lime)`)** dengan lingkaran geser bergeser halus menggunakan transisi *spring/bounce* elastis ke kanan dan berubah warna menjadi gelap (`var(--text-dark)`).

```css
.switch input:checked + .slider {
  background-color: var(--pastel-lime);
}
.switch .slider::before {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## 📋 3. Tabel Riwayat Aktivitas & Audit Logs
Tabel log audit yang mencatat waktu kapan admin memperbarui lokasi wisata akan didesain agar mudah discan secara kronologis.

- **Waktu / Timestamp**: Ditampilkan menggunakan font monospaced (`var(--font-mono)`) berwarna **Pastel Peach (`var(--pastel-peach)`)** tipis untuk kemudahan verifikasi waktu.
- **Baris Aktivitas**: Memiliki efek transisi warna latar belakang abu-abu transparan yang sangat lembut saat disorot pointer mouse pengguna (`hover`).
- **Garis Batas Baris**: Garis tipis arang matte (`1px solid var(--border-color)`).
