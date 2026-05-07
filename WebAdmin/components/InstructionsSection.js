export const InstructionsSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Marker Guide & Template</h1>
      <p>Panduan standar desain marker agar AR terbaca dengan optimal oleh sistem.</p>
    </div>
    <div style="display: flex; gap: 12px">
      <button class="btn btn-ghost" style="text-decoration: none" onclick="window.open('image/guide_marker.png', '_blank')" title="Download Guide Image">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>
      
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

  <div class="content-card" style="margin-top: 1.5rem; padding: 2rem">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem;">
      <div>
        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
          <span style="background: var(--primary-glow); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem;">1</span>
          Aspek Rasio & Dimensi
        </h3>
        <div class="guide-item" style="margin-bottom: 1.5rem; background: rgba(255, 255, 255, 0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">
          <p style="color: var(--text-dim); margin-bottom: 0.5rem">Rasio yang disarankan:</p>
          <h4 style="color: var(--primary); font-size: 1.5rem; margin-bottom: 1rem;">4 : 5</h4>
          <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.6;">
            <li>Resolusi Ideal: <b>1080 x 1350 px</b></li>
            <li>Minimal: 800 x 1000 px</li>
            <li>Pastikan konten utama tidak terlalu mepet ke pinggir (safe zone 50px).</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
          <span style="background: var(--primary-glow); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem;">2</span>
          Kualitas Marker (Digital)
        </h3>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.8;">
          <li><b>Kontras Tinggi:</b> Gunakan perpaduan warna gelap dan terang yang jelas.</li>
          <li><b>Fitur Unik:</b> Hindari gambar yang terlalu polos atau berpola repetitif.</li>
          <li><b>Non-Simetris:</b> Gambar yang asimetris lebih mudah dideteksi oleh sensor AR.</li>
          <li><b>Format:</b> Gunakan .JPG atau .PNG (Max 2MB).</li>
        </ul>
      </div>

      <div>
        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
          <span style="background: var(--primary-glow); padding: 5px 12px; border-radius: 8px; font-size: 0.9rem;">3</span>
          Panduan Cetak (Fisik)
        </h3>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.8;">
          <li><b>Bahan Matte/Doff:</b> Hindari kertas <i>glossy</i> karena pantulan cahaya bisa merusak tracking AR.</li>
          <li><b>Ekspor PDF Print:</b> Di Canva, gunakan format <b>PDF Print</b> (bukan Standard) untuk hasil cetak paling tajam.</li>
          <li><b>Minimal 300 DPI:</b> Pastikan cetakan tajam, tidak pecah atau blur.</li>
          <li><b>Pencahayaan:</b> Letakkan di tempat dengan cahaya merata, jangan di bawah lampu sorot langsung.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="content-card" style="margin-top: 1.5rem; padding: 2rem; border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.03);">
    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; color: #f59e0b;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Aturan Layout Penting (Wajib Dipatuhi)
    </h3>
    <p style="color: var(--text-dim); margin-bottom: 1.5rem; font-size: 0.95rem;">Agar posisi objek AR di Unity tetap presisi (tidak melayang/geser), perhatikan aturan berikut:</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
      <div style="background: rgba(0, 0, 0, 0.2); padding: 1.25rem; border-radius: 12px;">
        <h4 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          JANGAN DIUBAH
        </h4>
        <ul style="color: var(--text-dim); padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.6;">
          <li><b>Posisi & Ukuran Gambar Utama:</b> Bingkai foto di bagian atas sudah dipas-kan dengan sistem. Jangan digeser atau diubah skalanya.</li>
          <li><b>Tombol Bawah Tengah:</b> Tombol berbentuk pil di bawah adalah anchor untuk tombol virtual. <b>Jangan dipindah posisinya</b>.</li>
        </ul>
      </div>
      <div style="background: rgba(0, 0, 0, 0.2); padding: 1.25rem; border-radius: 12px;">
        <h4 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          BOLEH DIUBAH
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
