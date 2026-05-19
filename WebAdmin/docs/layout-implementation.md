## 1. Perubahan Database (Supabase)
Jalankan query SQL berikut di **Supabase SQL Editor** Anda untuk menambahkan kolom layout secara otomatis:

```sql
ALTER TABLE ar_targets 
ADD COLUMN target_layout VARCHAR(50) DEFAULT 'mask';
```

## 2. Pembaruan Dashboard Web Admin (`WebAdmin/components/TargetSection.js`)
- Menambahkan field `<select>` pada form Input/Edit Marker dengan dua opsi:
  - `Mask (Square)` -> *value*: `mask`
  - `Full (4:5)` -> *value*: `full`
- Field ini menentukan kerangka UI mana yang akan dirender di sisi aplikasi Unity saat marker berhasil dideteksi.

## 3. Pembaruan Aplikasi Unity
### A. Perubahan Script Data (`ARTargetData.cs`)
Tambahkan field agar API parser dapat membaca pilihan layout dari database:
```csharp
public string target_layout;
```

### B. Perubahan Script Handler (`ARTargetHandler.cs`)

Agar script bisa menangani dua variasi tampilan slider (Square Mask vs Full 4:5), kita akan merombak bagian variabel referensi UI. 

**1. Menambah Variabel Referensi Baru:**
Kita akan mengganti variabel tunggal (seperti `slidesContainer`, `mediaDisplay`, tombol navigasi, dan dots) menjadi sepasang referensi untuk masing-masing layout:
```csharp
[Header("Layout Variant: Mask (Square)")]
public GameObject maskSlidesContainer; // Container fisik untuk layout Square
public RawImage mediaDisplayMask;      // Tempat ngerender gambar
public Button nextButtonMask;          // Tombol Next khusus Square
public Button prevButtonMask;          // Tombol Prev khusus Square
public Transform dotContainerMask;     // Container titik carousel Square

[Header("Layout Variant: Full (4:5)")]
public GameObject fullSlidesContainer; // Container fisik untuk layout 4:5
public RawImage mediaDisplayFull;      // Tempat ngerender gambar
public Button nextButtonFull;          // Tombol Next khusus 4:5
public Button prevButtonFull;          // Tombol Prev khusus 4:5
public Transform dotContainerFull;     // Container titik carousel 4:5
```

**2. Logika Aktif/Nonaktif (Toggling):**
Pada method `ShowSlidesUI`, script mengecek format yang dipilih user. Script mematikan container yang tidak aktif dan menghidupkan yang aktif.
```csharp
bool isFullLayout = (mData.target_layout == "full");

if (maskSlidesContainer) maskSlidesContainer.SetActive(!isFullLayout);
if (fullSlidesContainer) fullSlidesContainer.SetActive(isFullLayout);
```

**3. Logika Navigasi & Carousel Dots:**
Karena kontainer diduplikasi, otomatis letak tombol dan dots juga ikut tereplikasi agar posisinya selalu proporsional dengan gambar. Script akan merender dots dan event klik tombol secara dinamis:
```csharp
// Tentukan komponen yang sedang aktif
Transform activeDotContainer = isFullLayout ? dotContainerFull : dotContainerMask;
Button activeNext = isFullLayout ? nextButtonFull : nextButtonMask;
Button activePrev = isFullLayout ? prevButtonFull : prevButtonMask;

// Hapus sisa dots lama di KEDUA container agar bersih
if (dotContainerMask) foreach (Transform child in dotContainerMask) Destroy(child.gameObject);
if (dotContainerFull) foreach (Transform child in dotContainerFull) Destroy(child.gameObject);

// Instantiate dots baru hanya di activeDotContainer
// ... (logika instantiate dot) ...

// Set status nyala/mati tombol Next & Prev yang aktif
if (activeNext) activeNext.gameObject.SetActive(hasMultipleImages);
if (activePrev) activePrev.gameObject.SetActive(hasMultipleImages);
```

**4. Logika Render Gambar (Media Routing):**
Pada fungsi `DownloadImage`, tekstur rute dikirim ke `RawImage` yang aktif:
```csharp
RawImage activeDisplay = isFullLayout ? mediaDisplayFull : mediaDisplayMask;

if (activeDisplay && texture != null) {
    activeDisplay.texture = texture;
    AdjustAspectRatio(activeDisplay, (float)texture.width / texture.height, true);
}
```

## 4. Tindakan Manual di Unity Editor (Oleh Anda)
Karena kita memisahkan dua logic ini di script, Anda cukup melakukan hal berikut di dalam Editor:
1. Duplikasi seluruh grup `Slides_Container` Anda yang sekarang.
2. Nama hasil duplikatnya menjadi `Slides_Container_Full` (sementara yang lama diganti namanya jadi `Slides_Container_Mask`).
3. Sesuaikan tinggi/bentuk `Slides_Container_Full` beserta *masking*-nya agar berbentuk **4:5** penuh.
4. **Assign / Drag & Drop:**
   - Tarik `Slides_Container_Mask` dan anak objek `RawImage`-nya ke slot **Layout Variant: Mask**.
   - Tarik `Slides_Container_Full` dan anak objek `RawImage`-nya ke slot **Layout Variant: Full**.
   - *Voila!* Anda punya 2 desain statis yang sempurna di Unity, dan script akan men-switch-nya secara otomatis saat jalan di HP sesuai kemauan web admin!
