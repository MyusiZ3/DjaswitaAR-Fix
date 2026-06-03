# 🛡️ Panduan Implementasi Keamanan & Otentikasi WebAdmin

Dokumen ini mendokumentasikan pembaruan pada alur login (Otentikasi dengan Username/Email) serta fitur UI *Password Visibility Toggle* pada **D'Jaswita AR WebAdmin**.

---

## 🔑 1. Otentikasi dengan Username (Username Login Lookup)

### Masalah Sebelumnya (RLS Restriction)
Secara bawaan, kebijakan *Row Level Security* (RLS) pada tabel `profiles` membatasi akses baca (`SELECT`) hanya untuk pengguna yang telah masuk (*Authenticated*). 
Ketika pengguna yang belum masuk (*Anonymous*) mencoba masuk dengan `username`, query frontend ke tabel `profiles` untuk mendapatkan `email` dari username tersebut diblokir oleh RLS, sehingga lookup username gagal.

### Solusi yang Diimplementasikan
Kami memodifikasi `main.js` dengan mekanisme lookup bertingkat (*multi-layered lookup*):
1. **Fungsi RPC (`get_email_by_username`)**: Memanggil fungsi database PostgreSQL dengan opsi `SECURITY DEFINER` (berjalan dengan izin pemilik database, melewati RLS secara aman) untuk mengambil email berdasarkan username tanpa mengekspos data profil lainnya ke publik.
2. **Kueri Langsung (Fallback)**: Jika RPC belum terpasang atau gagal, sistem akan mencoba melakukan kueri langsung ke tabel `profiles.username` (jika kebijakan RLS mengizinkan).
3. **Pemberitahuan Informatif**: Jika kedua metode gagal, sistem menampilkan pesan error terperinci yang memandu administrator untuk memasang RPC.

### SQL Script yang Harus Dijalankan di Supabase SQL Editor:
Silakan jalankan script berikut untuk membuat fungsi RPC pencarian email yang aman:

```sql
-- Membuat fungsi pencarian email berdasarkan username secara aman
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE username = p_username
  LIMIT 1;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batasi hak akses fungsi RPC agar hanya dapat diakses oleh role anon/authenticated
REVOKE ALL ON FUNCTION public.get_email_by_username(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
```

---

## 👁️ 2. Fitur Password Visibility Toggle (Tombol Mata)

Kami menambahkan tombol mata (*eye icon*) interaktif untuk mempermudah pengguna melihat/menyembunyikan kata sandi saat mengetik pada form login.

### Perubahan UI & Gaya (CSS/HTML)
- **HTML (`index.html`)**: Membungkus input `#l-password` ke dalam `.password-field-container` bersama dengan tombol `#toggle-password` berisi ikon SVG mata terbuka dan tertutup.
- **CSS (`main.css`)**: Mengatur tata letak tombol secara absolut di sebelah kanan input, menambahkan efek transisi warna hover dengan variabel warna pastel, dan memastikan tombol tidak bertubrukan dengan teks input (`padding-right: 3rem`).

### Logika Interaktif (`main.js`)
Menambahkan *event listener* pada tombol `#toggle-password` untuk mendeteksi tipe input:
- Mengubah atribut `type` input antara `password` (untuk menyembunyikan) dan `text` (untuk menampilkan).
- Mengubah visibilitas ikon mata terbuka/tertutup dengan menambahkan/menghapus kelas `.hide`.

---

## 🛡️ 3. Keamanan Tambahan RLS

Sebagai tambahan, pastikan RLS Anda dikonfigurasi dengan aman seperti berikut:

| Tabel | Operasi | Kebijakan RLS | Ekspresi Kebijakan | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `SELECT` | `View Profiles` | `public.is_admin() OR auth.uid() = id` | Hanya admin atau pemilik profil yang bisa membaca data detail profil secara langsung. |
| `profiles` | `ALL` | `Admin CRUD Profiles` | `public.is_admin()` | Hanya admin/superadmin yang bisa memodifikasi atau menambah profil baru. |
| `ar_targets`| `SELECT` | `Public Read` | `true` | Aplikasi mobile Unity (pengunjung/non-login) harus bisa memindai marker. |
| `ar_targets`| `ALL` | `Admin CRUD Targets` | `public.is_admin()` | Hanya admin terotentikasi yang dapat memodifikasi data target AR. |
