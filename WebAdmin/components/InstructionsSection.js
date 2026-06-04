export const InstructionsSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Marker Guide & Template</h1>
      <p>Panduan standar desain marker agar AR terbaca dengan optimal oleh sistem.</p>
    </div>
    <div style="display: flex; gap: 12px">
      <!-- Edit Button for SuperAdmin -->
      <button id="btn-edit-canva" class="btn btn-ghost super-admin-only" title="Edit Canva Link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>

      <a id="canva-link-btn" href="#" target="_blank" class="btn btn-primary" style="text-decoration: none">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
        Open Canva Template
      </a>
    </div>
  </header>

  <div class="instructions-grid">
    <!-- Card 1: Dimensi -->
    <div class="guide-card-pastel">
      <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px; color: white;">
        <span style="background: var(--pastel-mint); color: var(--text-dark); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 700;">1</span>
        Aspek Rasio & Dimensi
      </h3>
      <p style="color: var(--text-dim); margin-bottom: 0.5rem">Rasio yang disarankan:</p>
      <h4 style="color: white; font-size: 1.75rem; margin-bottom: 1rem; font-family: var(--font-mono)">4 : 5</h4>
      <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.7; margin: 0;">
        <li>Resolusi Ideal: <b>1080 x 1350 px</b></li>
        <li>Minimal: 800 x 1000 px</li>
        <li>Pastikan konten utama tidak terlalu mepet ke pinggir (safe zone 50px).</li>
      </ul>
    </div>

    <!-- Card 2: Kualitas -->
    <div class="guide-card-pastel">
      <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px; color: white;">
        <span style="background: var(--pastel-lavender); color: var(--text-dark); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 700;">2</span>
        Kualitas Marker (Digital)
      </h3>
      <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.8; margin: 0;">
        <li><b>Kontras Tinggi:</b> Perpaduan warna gelap & terang yang jelas.</li>
        <li><b>Fitur Unik:</b> Hindari gambar polos atau berpola repetitif.</li>
        <li><b>Non-Simetris:</b> Asimetris lebih mudah dilacak sensor AR.</li>
        <li><b>Format:</b> Gunakan .JPG atau .PNG (Max 2MB).</li>
      </ul>
    </div>

    <!-- Card 3: Panduan Cetak -->
    <div class="guide-card-pastel">
      <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px; color: white;">
        <span style="background: var(--pastel-peach); color: var(--text-dark); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 700;">3</span>
        Panduan Cetak (Fisik)
      </h3>
      <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.8; margin: 0;">
        <li><b>Bahan Matte/Doff:</b> Hindari kertas glossy karena pantulan cahaya merusak tracking AR.</li>
        <li><b>Ekspor PDF Print:</b> Gunakan format PDF Print untuk hasil cetak paling tajam.</li>
        <li><b>Minimal 300 DPI:</b> Pastikan cetakan tajam, tidak blur.</li>
        <li><b>Pencahayaan:</b> Cahaya merata di lokasi pameran.</li>
      </ul>
    </div>

    <!-- Card 4: Format & Streaming Video -->
    <div class="guide-card-pastel">
      <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px; color: white;">
        <span style="background: var(--pastel-blue); color: var(--text-dark); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 700;">4</span>
        Format & Streaming Video
      </h3>
      <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.8; margin: 0;">
        <li><b>Format Wajib:</b> MP4 dengan codec H.264 (Video) dan AAC (Audio).</li>
        <li><b>Google Drive:</b> Wajib di-encode dengan fitur <b>Fast-Start / Web Optimized</b>.</li>
        <li><b>Rekomendasi Tools:</b> Gunakan software gratis <b>HandBrake</b> dan centang kotak opsi <b>"Web Optimized"</b> sebelum ekspor.</li>
        <li><b>Catatan Penting:</b> Tanpa opsi ini, video streaming dari Drive akan error (stuck/tidak berputar).</li>
      </ul>
    </div>
  </div>

  <!-- Good vs Bad Marker Quality Comparison -->
  <div class="content-card" style="margin-top: 2rem; padding: 2rem">
    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; color: white;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      Marker Quality Comparison (Good vs Bad)
    </h3>
    <p style="color: var(--text-dim); margin-bottom: 2rem; font-size: 0.95rem;">Contoh struktur gambar marker yang ideal untuk Vuforia Engine vs gambar yang sulit terbaca oleh kamera AR.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
      <!-- Good Marker Card -->
      <div class="guide-card-pastel" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: white;">KONTEN KAYA FITUR</span>
          <span class="badge-pastel" style="background: var(--pastel-mint);">RECOMMENDED</span>
        </div>
        <div class="marker-preview-container good" style="background-image: url('image/goodmarker.webp'); background-size: cover; background-position: center;">
          <div class="marker-preview-grid"></div>
          <div class="marker-crosshair"></div>
          <div class="marker-hud-text">TRACKING: ACTIVE (100%)</div>
        </div>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.6; margin: 0;">
          <li>Memiliki banyak sudut kontras tinggi dan elemen visual asimetris.</li>
          <li>Titik fitur (*feature points*) berlimpah dan tersebar merata.</li>
          <li>Sangat mudah dilacak dari sudut miring atau kondisi cahaya redup.</li>
        </ul>
      </div>

      <!-- Bad Marker Card -->
      <div class="guide-card-pastel" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: white;">POLA REPETITIF / MINIM DETAIL</span>
          <span class="badge-pastel" style="background: var(--pastel-coral);">POOR QUALITY</span>
        </div>
        <div class="marker-preview-container bad" style="background-image: url('image/badmarker.jpg'); background-size: cover; background-position: center;">
          <div class="marker-preview-grid"></div>
          <div class="marker-crosshair-bad"></div>
          <div class="marker-hud-text-bad">TRACKING: WEAK (30%)</div>
        </div>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.875rem; line-height: 1.6; margin: 0;">
          <li>Memiliki pola geometris berulang yang membingungkan pelacak AR.</li>
          <li>Terlalu polos dengan sedikit sudut kontras atau variasi bentuk.</li>
          <li>Menyebabkan objek 3D bergeser (*drift*) atau sulit muncul di aplikasi.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="content-card" style="margin-top: 1.5rem; padding: 2rem; border-left: 4px solid var(--pastel-peach); background: rgba(254, 215, 170, 0.03);">
    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; color: var(--pastel-peach);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Aturan Layout Penting (Wajib Dipatuhi)
    </h3>
    <p style="color: var(--text-dim); margin-bottom: 1.5rem; font-size: 0.95rem;">Agar posisi objek AR di Unity tetap presisi (tidak melayang/geser), perhatikan aturan berikut:</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
      <div style="background: rgba(0, 0, 0, 0.2); padding: 1.25rem; border-radius: 12px;">
        <h4 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pastel-coral)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          JANGAN DIUBAH (Mask - Square)
        </h4>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.6;">
          <li><b>Bingkai Foto Square (Atas):</b> Bingkai masking kotak di bagian atas sudah presisi. Jangan digeser, di-scale, atau diubah setingan maskingnya.</li>
          <li><b>Tombol Bawah Tengah:</b> Tombol berbentuk pil di bawah adalah anchor untuk tombol virtual. <b>Jangan dipindah posisinya</b>.</li>
        </ul>
      </div>
      <div style="background: rgba(0, 0, 0, 0.2); padding: 1.25rem; border-radius: 12px;">
        <h4 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pastel-coral)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          JANGAN DIUBAH (Full - 4:5)
        </h4>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.6;">
          <li><b>Bingkai Foto Full 4:5 (Tengah):</b> Area gambar menutupi penuh rasio 4:5. Jangan digeser atau diubah skalanya agar posisinya tetap presisi dengan marker fisik.</li>
          <li><b>Tombol Bawah Tengah:</b> Tombol berbentuk pil di bawah adalah anchor untuk tombol virtual. <b>Jangan dipindah posisinya</b>.</li>
        </ul>
      </div>
      <div style="background: rgba(0, 0, 0, 0.2); padding: 1.25rem; border-radius: 12px;">
        <h4 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pastel-mint)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          BOLEH DIUBAH (Keduanya)
        </h4>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.6;">
          <li><b>Teks & Judul:</b> Nama lokasi, deskripsi, dan footer boleh diganti font, warna, atau dihapus.</li>
          <li><b>QR Code:</b> Boleh dipindah, diganti, atau dihilangkan.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="content-card" style="margin-top: 1.5rem; padding: 2rem">
    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 3rem; align-items: center;">
      <div>
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; color: var(--primary);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
          QR Code Generator (For Designs)
        </h3>
        <p style="color: var(--text-dim); margin-bottom: 2rem">Gunakan alat ini untuk membuat QR Code link download aplikasi.</p>
        <div class="form-group" style="margin-bottom: 1.5rem">
          <label>Application Link / URL</label>
          <input type="url" id="qr-input" placeholder="https://..." value="https://jawita-ar.vercel.app" />
        </div>
        <div style="display: flex; gap: 10px">
          <button id="btn-generate-qr" class="btn btn-primary">Generate QR</button>
          <button id="btn-download-qr" class="btn btn-ghost" style="text-decoration: none">Download Image</button>
        </div>
      </div>
      <div style="background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; min-height: 250px;">
        <img id="qr-result" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://jawita-ar.vercel.app" alt="QR Result" style="max-width: 100%; height: auto; width: 250px;" />
      </div>
    </div>
  </div>

  <!-- Modal: Canva Link (Moved from index.html) -->
  <div id="modal-canva" class="modal-overlay">
    <div class="modal-content" style="max-width: 500px">
      <div class="modal-header">
        <h2>Edit Canva Template</h2>
        <button class="btn-close" onclick="document.getElementById('modal-canva').classList.remove('active')">✕</button>
      </div>
      <form id="canva-form">
        <div class="form-group">
          <label>Canva Template URL</label>
          <input type="url" id="f-canva-url" placeholder="https://www.canva.com/design/..." required />
          <small class="text-hint">Link ini akan digunakan oleh tombol "Open Canva Template" di menu panduan.</small>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-canva').classList.remove('active')">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Link</button>
        </div>
      </form>
    </div>
  </div>
`;
