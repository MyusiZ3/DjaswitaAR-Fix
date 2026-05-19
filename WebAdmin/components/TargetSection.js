export const TargetSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Destinations List</h1>
      <p>Kelola data marker dan hidupkan suasana dengan konten AR.</p>
    </div>
    <div style="display: flex; gap: 1rem; align-items: center">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="search-target" placeholder="Cari nama target..." />
      </div>
      <button class="btn btn-primary" id="btn-add">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Location
      </button>
    </div>
  </header>

  <section class="content-card">
    <table>
      <thead>
        <tr>
          <th>Cover</th>
          <th>ID</th>
          <th>Nama Lokasi</th>
          <th>Type</th>
          <th>Event Date</th>
          <th>Price</th>
          <th id="th-aksi-target">Aksi</th>
        </tr>
      </thead>
      <tbody id="data-table-body">
        <!-- Data will be injected here -->
      </tbody>
    </table>
  </section>
  <!-- Modal Form Target -->
  <div class="modal-overlay" id="modal-form">
    <div class="modal-content">
      <h2 id="modal-title">Create New Experience</h2>
      <p style="color: var(--text-dim); font-size: 0.875rem">
        Isi detail di bawah untuk menambahkan destinasi AR baru.
      </p>
      <form id="target-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem">
          <div class="form-group">
            <label>Unique Spot ID</label>
            <input
              type="text"
              id="f-id"
              placeholder="e.g., kawah-putih-01"
              required
            />
            <small class="text-hint">Gunakan huruf kecil & strip (slug format).</small>
          </div>
          <div class="form-group">
            <label>Destination Name</label>
            <input
              type="text"
              id="f-nama"
              placeholder="e.g., Kawah Putih Ciwidey"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Category / Type</label>
          <select id="f-type">
            <option value="wisata">Nature / Wisata</option>
            <option value="kuliner">Culinary / Kuliner</option>
            <option value="event">Special Event</option>
            <option value="lainnya">Others</option>
          </select>
        </div>

        <!-- Location Dates -->
        <div id="event-date-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label>Start Date</label>
            <input type="date" id="f-start-date" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>End Date</label>
            <input type="date" id="f-end-date" />
          </div>
        </div>

        <div class="form-group">
          <label>Deskripsi</label>
          <textarea
            id="f-deskripsi"
            rows="4"
            placeholder="Jelaskan tentang tempat ini..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Pricing / Entry Fee</label>
          <input
            type="text"
            id="f-harga"
            placeholder="e.g., 25000 (Otomatis Rp)"
          />
        </div>

        <div class="form-group">
          <label>Link Pemesanan (WhatsApp/Web)</label>
          <input
            type="url"
            id="f-booking_url"
            placeholder="https://wa.me/... atau link website"
          />
        </div>

        <div class="form-group">
          <label>Marker Image</label>
          <div class="upload-zone">
            <input
              type="text"
              id="f-marker-url"
              placeholder="URL gambar yang akan discan (Marker)"
            />
            <input type="file" id="f-marker-file" style="display: none" />
            <button
              type="button"
              class="btn btn-secondary"
              onclick="document.getElementById('f-marker-file').click()"
              style="white-space: nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Browse
            </button>
          </div>
          <small class="text-hint"
            >Gambar ini digunakan Vuforia untuk deteksi (tidak tampil di slide). Rekomendasi: 1080x1350 (4:5) & <span style="color: var(--pastel-peach); font-weight: 700;">Tracking Quality Minimal ★★★ (3 Bintang)</span>.</small
          >
          <div
            class="preview-container"
            id="marker-preview-box"
            style="height: 100px; margin-top: 5px"
          >
            <span class="preview-placeholder">Belum ada marker</span>
          </div>
          <div id="marker-quality-indicator" style="display: none; margin-top: 8px; padding: 12px; border-radius: 10px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); flex-direction: column; gap: 6px; transition: all 0.3s ease;">
            <!-- Will be dynamically populated via main.js -->
          </div>
        </div>

        <!-- Video Section (Always Visible) -->
        <div class="form-group">
          <label for="f-video-url">Link Video</label>
          <div class="upload-zone">
            <input
              type="text"
              id="f-video-url"
              placeholder="Link MP4 (misal: https://...video.mp4)"
            />
            <input
              type="file"
              id="f-video-file"
              style="display: none"
              accept="video/mp4"
            />
            <button
              type="button"
              class="btn btn-secondary"
              onclick="document.getElementById('f-video-file').click()"
              style="white-space: nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload
            </button>
          </div>
          <small class="text-hint">Format .MP4. Max 60MB. Video ini akan tampil saat marker discan.</small>
        </div>

        <!-- Content Type Selection -->
        <div class="form-section-card no-accent">
          <div class="form-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            AR Content Mode
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <label class="mode-selector" for="mode-image">
              <input type="radio" name="f-main-content-type" id="mode-image" value="image_slides" checked />
              <div class="mode-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Image Slides</span>
              </div>
            </label>
            <label class="mode-selector" for="mode-3d">
              <input type="radio" name="f-main-content-type" id="mode-3d" value="3d_model" />
              <div class="mode-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span>3D Model</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Image Slides Content Section -->
        <div id="section-slides-content">
          <div class="form-group">
            <label>Slide Images (KONTEN CAROUSEL)</label>
            <div class="upload-zone">
              <input
                type="text"
                id="f-media-url"
                placeholder="URL gambar slide (pisahkan dengan koma)"
              />
              <input
                type="file"
                id="f-media-file"
                style="display: none"
                multiple
              />
              <button
                type="button"
                class="btn btn-secondary"
                onclick="document.getElementById('f-media-file').click()"
                style="white-space: nowrap"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Upload
              </button>
            </div>
            <small class="text-hint">Gambar-gambar yang akan tampil di UI slide AR. Gunakan rasio seragam.</small>
            <div class="preview-container" id="media-preview-box">
              <span class="preview-placeholder">Belum ada slide</span>
            </div>
          </div>
        </div>

        <!-- 3D Content Section -->
        <div id="section-3d-content" style="display: none;">
          <div class="form-section-card no-accent">
            <div class="form-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              3D Model Assets
            </div>
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label>Model File (.GLB)</label>
              <div class="upload-zone">
                <input
                  type="text"
                  id="f-model-url"
                  placeholder="URL file .glb"
                />
                <input
                  type="file"
                  id="f-model-file"
                  style="display: none"
                  accept=".glb"
                />
                <button
                  type="button"
                  class="btn btn-secondary"
                  onclick="document.getElementById('f-model-file').click()"
                  style="white-space: nowrap"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Browse
                </button>
              </div>
              <small class="text-hint">Gunakan format .GLB untuk performa terbaik. Max 50MB.</small>
            </div>

            <div class="preview-container" id="model-3d-preview-box">
              <div class="studio-badge">3D STUDIO</div>
              <div id="model-3d-display">
                <span class="preview-placeholder">Preview 3D akan muncul di sini setelah model dimuat</span>
              </div>
            </div>
          </div>

          <div class="form-section-card no-accent">
            <div class="form-section-title" style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
              <span>Transform Settings</span>
              <button type="button" class="btn btn-ghost" onclick="reset3DTransform()" style="margin-left: auto; padding: 4px 10px; font-size: 0.75rem; border-radius: 8px; height: auto; min-height: 0; color: var(--pastel-lavender); border: 1px solid rgba(233, 213, 255, 0.2);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                Reset Default
              </button>
            </div>
            <div class="transform-grid">
              <div class="transform-item">
                <label title="Ukuran Model" style="color: var(--pastel-coral); font-family: var(--font-mono);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 8V4h4"></path><path d="M16 4h4v4"></path><path d="M20 16v4h-4"></path><path d="M4 16v4h4"></path></svg>
                  X: SCALE
                </label>
                <input type="number" id="f-model-scale" step="0.0001" value="1.0" style="font-family: var(--font-mono); color: var(--pastel-coral); border-color: rgba(254, 178, 178, 0.2);" />
              </div>
              <div class="transform-item">
                <label title="Rotasi Sumbu Y" style="color: var(--pastel-mint); font-family: var(--font-mono);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                  Y: ROTATION
                </label>
                <input type="number" id="f-model-rot-y" step="1" value="0" style="font-family: var(--font-mono); color: var(--pastel-mint); border-color: rgba(187, 247, 208, 0.2);" />
              </div>
              <div class="transform-item">
                <label title="Posisi Atas/Bawah" style="color: var(--pastel-mint); font-family: var(--font-mono);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
                  Y: POSITION
                </label>
                <input type="number" id="f-model-pos-y" step="0.0001" value="0" style="font-family: var(--font-mono); color: var(--pastel-mint); border-color: rgba(187, 247, 208, 0.2);" />
              </div>
              <div class="transform-item">
                <label title="Posisi Depan/Belakang" style="color: var(--pastel-blue); font-family: var(--font-mono);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                  Z: POSITION
                </label>
                <input type="number" id="f-model-pos-z" step="0.0001" value="0.0192" style="font-family: var(--font-mono); color: var(--pastel-blue); border-color: rgba(191, 219, 254, 0.2);" />
              </div>
            </div>
            <p class="text-hint" style="margin-top: 1.25rem; opacity: 0.6; font-style: italic;">
              Tips: Atur posisi model agar pas dengan marker di aplikasi AR. Gunakan angka default jika tidak yakin.
            </p>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="btn-cancel">
            Batal
          </button>
          <button type="submit" class="btn btn-primary">Simpan Data</button>
        </div>
      </form>
    </div>
  </div>
  </div>
`;
