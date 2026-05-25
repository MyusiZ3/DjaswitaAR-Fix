# Rencana Implementasi: Refactoring `booking_url` menjadi `contact_url`

Dokumen ini berisi rencana pengembangan teknis untuk mengubah field `booking_url` menjadi `contact_url` di seluruh sistem (Web Admin CMS, Supabase, Unity Client, dan Dokumentasi). Tujuan perubahan ini adalah agar tautan tindakan bersifat lebih umum (generik) dan tidak terbatas pada pariwisata (booking tiket) saja.

---

## Perhatian Khusus & Mitigasi Risiko

Untuk menghindari kerusakan data dan terputusnya referensi komponen di Unity:
1. **Unity Inspector Serialization Constraint**: Di dalam Unity, tombol `bookingButton` dihubungkan secara visual melalui Unity Inspector pada prefab `AR_Content_Root.prefab` dan scene `MainScene.unity`. Jika variabel `bookingButton` di dalam C# langsung diganti namanya menjadi `contactButton` tanpa mitigasi, Unity akan kehilangan referensi (*Null Reference*) dan tombol tidak akan berfungsi.
   - **Solusi**: Kita akan menggunakan atribut `[FormerlySerializedAs("bookingButton")]` dari namespace `UnityEngine.Serialization`. Ini akan memberi tahu Unity bahwa variabel `contactButton` yang baru secara internal memuat data dari `bookingButton` yang lama, menjaga integritas editor Unity secara penuh!
2. **Supabase Database Column**: Nama kolom di database saat ini adalah `booking_url`. Penggantian ini mengharuskan kita memperbarui dokumentasi SQL di `README.md`. Di sisi frontend JavaScript, kita akan memetakan pembacaan dan penyimpanan data ke kolom `contact_url`.

---

## Detail Perubahan Per Berkas

Kita akan memperbarui berkas-berkas berikut secara terstruktur:

### 1. Web Admin Dashboard (CMS)

#### [MODIFY] [TargetSection.js](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/components/TargetSection.js)
- Ubah label form pemesanan:
  ```html
  <!-- Sebelum -->
  <label>Link Pemesanan (WhatsApp/Web)</label>
  
  <!-- Sesudah -->
  <label>Link Kontak / Hubungi (WhatsApp/Web/Email)</label>
  ```
- Ubah `id` input form dari `f-booking_url` menjadi `f-contact_url`.

#### [MODIFY] [main.js](file:///d:/Projects/Unity/DjaswitaAR-Fix/WebAdmin/main.js)
- Ubah penarikan data form submit pada baris 1441 dari `booking_url` menjadi `contact_url`:
  ```javascript
  contact_url: document.getElementById("f-contact_url").value,
  ```
- Ubah pengisian data (*hydration*) saat edit modal pada baris 2396 dari `booking_url` menjadi `contact_url`:
  ```javascript
  document.getElementById("f-contact_url").value = data.contact_url || "";
  ```

---

### 2. Unity Client App

#### [MODIFY] [ARTargetData.cs](file:///d:/Projects/Unity/DjaswitaAR-Fix/Assets/Scripts/ARTargetData.cs)
- Ubah deklarasi field data agar mengambil properti `contact_url` dari database:
  ```csharp
  // Sebelum
  public string booking_url;

  // Sesudah
  public string contact_url;
  ```

#### [MODIFY] [ARTargetHandler.cs](file:///d:/Projects/Unity/DjaswitaAR-Fix/Assets/Scripts/ARTargetHandler.cs)
- Impor `UnityEngine.Serialization` di bagian atas berkas:
  ```csharp
  using UnityEngine.Serialization;
  ```
- Ubah deklarasi variabel tombol agar menggunakan `FormerlySerializedAs` guna mengamankan referensi di Inspector:
  ```csharp
  // Sebelum
  public Button bookingButton;

  // Sesudah
  [FormerlySerializedAs("bookingButton")]
  public Button contactButton;
  ```
- Perbarui logika runtime untuk mengaktifkan tombol dan membuka URL kontak:
  ```csharp
  if (contactButton)
  {
      contactButton.gameObject.SetActive(!string.IsNullOrEmpty(data.contact_url));
      contactButton.onClick.RemoveAllListeners();
      contactButton.onClick.AddListener(() => Application.OpenURL(data.contact_url));
  }
  ```

---

### 3. Dokumentasi & Skema Database

#### [MODIFY] [README.md](file:///d:/Projects/Unity/DjaswitaAR-Fix/README.md)
- Perbarui deskripsi skema basis data di bagian `ar_targets` (baris 38) dari `booking_url` menjadi `contact_url`.
- Perbarui query SQL pembuatan tabel `ar_targets` (baris 206) dari `booking_url TEXT` menjadi `contact_url TEXT`.

---

## Rencana Verifikasi

### Pengujian Frontend (Web Admin):
1. Buka formulir pembuatan/edit AR Marker.
2. Pastikan label input tertulis "Link Kontak / Hubungi (WhatsApp/Web/Email)".
3. Masukkan tautan kontak baru dan simpan.
4. Periksa payload yang dikirim ke Supabase memiliki properti `contact_url`.

### Pengujian Unity Client:
1. Jalankan Unity Editor.
2. Buka `MainScene.unity` atau buka `AR_Content_Root.prefab`.
3. Pilih gameobject `ARTargetHandler`.
4. **Verifikasi**: Pastikan kolom input Button `Contact Button` (sebelumnya `Booking Button`) di Inspector Unity tetap terhubung dan tidak bernilai *None (Button)*!
5. Lakukan simulasi scanning target yang memiliki `contact_url`. Tombol kontak harus muncul dan ketika diklik berhasil membuka URL yang ditentukan.

---

## Konfirmasi Sebelum Commit

Sesuai instruksi Anda ("*oke nanti sblm saya suh commit jangan commit langung ya saya perlu cek*"), kami akan **hanya mengubah berkas-berkas secara lokal** dan **tidak akan melakukan `git commit` atau `git push`** sampai Anda memeriksa hasilnya dan memberikan perintah eksplisit untuk melakukan commit.
