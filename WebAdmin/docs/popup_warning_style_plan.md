# Rencana Gaya UI: Popups, Modals, Warnings & Toast Alerts

Dokumen ini memandu implementasi gaya visual untuk seluruh jendela dialog, pesan peringatan (warning), konfirmasi penghapusan, dan notifikasi melayang (toast) agar serasi dengan estetika **Matte Pastel Dark Dashboard**.

---

## 1. Aturan Dasar Gaya Modal (`.modal-content`)
Semua kotak dialog modal akan didesain minimalis dengan bayangan lembut yang dalam dan batas arang matte tipis.

```css
.modal-content {
  background-color: var(--card-bg);           /* Matte charcoal #141519 */
  border: 1px solid var(--border-color);       /* Thin border #212329 */
  border-radius: 24px;                         /* Organic rounded corners */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);  /* Deep floating shadow */
  padding: 2.25rem;
  transition: var(--transition-smooth);
}
```

---

## 2. Pop-up Peringatan & Konfirmasi Hapus (Warning/Delete Modal)
Ketika pengguna menghapus destinasi wisata, popup konfirmasi akan didominasi oleh aksen warna **Pastel Coral** (`#fecaca`) untuk menunjukkan tindakan berisiko tinggi.

- **Header Icon Box**: Ikon tanda seru menggunakan latar lingkaran transparan dengan ikon **Pastel Coral** berpendar tipis.
- **Tombol Konfirmasi Hapus (`.btn-danger`)**:
  - Warna Background: **Pastel Coral (`var(--pastel-coral)`)** murni.
  - Warna Teks: Teks gelap (`var(--text-dark)`).
  - Gaya Hover: Naik `translateY(-2px)` dengan sedikit bayangan pendaran coral lembut.
- **Tombol Batal (`.btn-secondary`)**:
  - Latar belakang transparan dengan garis batas tipis (`border: 1px solid var(--border-color)`).
  - Warna Teks: `var(--text-dim)` berpindah menjadi `var(--text-main)` saat di-hover.

---

## 3. Toast Notifications (Toast Sukses / Gagal)
Notifikasi dinamis di sudut kanan bawah akan diubah menjadi modul minimalis berbentuk kapsul premium dengan animasi pegas masuk (*elastic slide-in*).

```css
.toast {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 100px;                      /* Capsule pill format */
  padding: 0.75rem 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInPegas 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideInPegas {
  from { transform: translateY(100px) scale(0.85); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
```

- **Toast Sukses**: Menggunakan indikator bulat kecil berpendar warna **Pastel Mint (`var(--pastel-mint)`)** di sebelah kiri teks.
- **Toast Gagal / Error**: Menggunakan indikator bulat kecil berpendar warna **Pastel Coral (`var(--pastel-coral)`)** di sebelah kiri teks.
