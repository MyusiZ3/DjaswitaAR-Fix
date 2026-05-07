export const SettingsSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Unity App Settings</h1>
      <p>Kelola koneksi database dan sinkronisasi ke aplikasi Unity.</p>
    </div>
  </header>

  <div class="card" style="margin-top: 1rem">
    <div class="card-header">
      <h3>Konfigurasi Koneksi Supabase</h3>
      <p style="font-size: 0.875rem; color: var(--text-dim)">
        Atur endpoint dan API Key untuk Unity
      </p>
    </div>

    <div
      class="settings-grid"
      style="
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 2rem;
        padding: 1.5rem;
      "
    >
      <!-- LEFT: Input Form -->
      <div
        class="settings-left"
        style="
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-right: 1px solid var(--glass-border);
          padding-right: 2rem;
        "
      >
        <h4 style="color: var(--primary); margin-bottom: -0.5rem">
          Perbarui Konfigurasi
        </h4>
        <form
          id="settings-form"
          style="display: flex; flex-direction: column; gap: 1.25rem"
        >
          <div class="form-group">
            <label for="s-url">New Supabase Project URL</label>
            <input
              type="url"
              id="s-url"
              placeholder="Contoh: https://xyz.supabase.co"
              required
            />
            <small class="text-hint">Masukkan URL utama (tanpa /rest/v1/).</small>
          </div>
          <div class="form-group">
            <label for="s-key">Supabase Secret Key (Service Role)</label>
            <input
              type="password"
              id="s-key"
              placeholder="Enter new secret key to update..."
              required
            />
          </div>


          <div style="display: flex; justify-content: flex-end">
            <button
              type="submit"
              class="btn btn-primary"
              id="btn-save-settings"
              style="width: 100%"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      <!-- RIGHT: Current Active Config -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem">
        <h4 style="color: var(--success); margin-bottom: -0.5rem">
          Konfigurasi Aktif
        </h4>
        <div
          style="
            background: rgba(0, 0, 0, 0.2);
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--glass-border);
          "
        >
          <div style="margin-bottom: 1rem">
            <label style="margin-bottom: 4px">URL Saat Ini:</label>
            <div
              id="current-url-display"
              style="
                font-family: monospace;
                font-size: 0.85rem;
                color: var(--text-main);
                word-break: break-all;
                background: rgba(255, 255, 255, 0.05);
                padding: 8px;
                border-radius: 6px;
              "
            >
              Memuat...
            </div>
          </div>
          <div>
            <label style="margin-bottom: 4px">API Key Saat Ini:</label>
            <div
              id="current-key-display"
              style="
                font-family: monospace;
                font-size: 0.85rem;
                color: var(--text-main);
                word-break: break-all;
                background: rgba(255, 255, 255, 0.05);
                padding: 8px;
                border-radius: 6px;
              "
            >
              Memuat...
            </div>
          </div>
        </div>
        <div
          style="
            background: rgba(59, 130, 246, 0.1);
            padding: 1rem;
            border-radius: 12px;
            border-left: 4px solid var(--primary);
          "
        >
          <p
            style="
              font-size: 0.8rem;
              color: var(--text-dim);
              line-height: 1.4;
            "
          >
            <strong style="color: var(--text-main)">Informasi:</strong><br />
            Data di sebelah kanan adalah yang sedang dibaca oleh
            aplikasi Unity melalui sistem Bootstrap.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top: 2rem; border-color: rgba(239, 68, 68, 0.2)">
    <div class="card-header">
      <h3 style="color: var(--danger)">Storage Maintenance</h3>
      <p style="font-size: 0.875rem; color: var(--text-dim)">
        Bersihkan file sampah (media/3D model) yang tidak terhubung ke data wisata manapun.
      </p>
    </div>
    <div class="card-body" style="padding: 1.5rem">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 2rem;">
        <div style="flex: 1">
          <p style="font-size: 0.875rem; line-height: 1.5; color: var(--text-dim)">
            Sistem akan memindai seluruh isi bucket <strong>wisata-media</strong> dan membandingkannya dengan database. 
            File yang tidak memiliki referensi di tabel <code>wisata</code> akan dihapus untuk menghemat ruang penyimpanan.
          </p>
          <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--danger); opacity: 0.8;">
            *Hanya file yang berumur lebih dari 1 jam yang akan dibersihkan untuk menghindari penghapusan file yang sedang diupload.
          </div>
        </div>
        <button id="btn-cleanup-storage" class="btn btn-ghost" style="border: 1px solid var(--danger); color: var(--danger); min-width: 200px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          Mulai Pembersihan
        </button>
      </div>
      
      <!-- Cleanup Progress (Hidden by default) -->
      <div id="cleanup-progress-container" style="display: none; margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid var(--glass-border);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
          <span id="cleanup-status-text">Memindai file...</span>
          <span id="cleanup-count">0/0</span>
        </div>
        <div class="popularity-bar-container" style="height: 8px;">
          <div id="cleanup-progress-bar" class="popularity-bar" style="width: 0%; background: var(--danger)"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top: 2rem">
    <div class="card-header">
      <h3>Riwayat Perubahan</h3>
      <p style="font-size: 0.875rem; color: var(--text-dim)">
        Riwayat perubahan konfigurasi aplikasi
      </p>
    </div>
    <div
      class="content-card"
      style="
        padding: 0;
        border: none;
        background: transparent;
        backdrop-filter: none;
      "
    >
      <table style="margin: 0">
        <thead>
          <tr>
            <th
              id="th-sort-time"
              style="cursor: pointer; user-select: none"
            >
              Waktu <span id="sort-icon-time">↓</span>
            </th>
            <th>Admin</th>
            <th>Perubahan URL</th>
            <th>Perubahan Key</th>
          </tr>
        </thead>
        <tbody id="settings-logs-body">
          <tr>
            <td
              colspan="4"
              style="
                text-align: center;
                padding: 2rem;
                color: var(--text-dim);
              "
            >
              Memuat riwayat...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal: Confirm Settings Update (Moved from index.html) -->
  <div id="modal-settings-confirm" class="modal-overlay">
    <div class="modal-content" style="max-width: 450px; text-align: center">
      <div
        style="
          width: 64px;
          height: 64px;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        "
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          ></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2 style="margin-bottom: 0.75rem">Simpan Konfigurasi?</h2>
      <p
        style="
          color: var(--text-dim);
          margin-bottom: 2rem;
          font-size: 0.938rem;
          line-height: 1.6;
        "
      >
        Perubahan pada <b>API URL</b> atau <b>Supabase Key</b> dapat memutus
        koneksi antara Dashboard dan Unity App jika tidak sesuai. Pastikan
        data yang dimasukkan sudah benar.
      </p>
      <div style="display: flex; gap: 12px; justify-content: stretch">
        <button
          id="btn-settings-cancel"
          class="btn btn-ghost"
          style="flex: 1"
          type="button"
        >
          Batal
        </button>
        <button
          id="btn-settings-confirm"
          class="btn btn-primary"
          style="flex: 1; background: #f59e0b; border-color: #f59e0b"
          type="button"
        >
          Ya, Simpan
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: Confirm Storage Cleanup -->
  <div id="modal-cleanup-confirm" class="modal-overlay">
    <div class="modal-content" style="max-width: 450px; text-align: center">
      <div
        style="
          width: 64px;
          height: 64px;
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        "
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2 style="margin-bottom: 0.75rem">Konfirmasi Pembersihan</h2>
      <p
        style="
          color: var(--text-dim);
          margin-bottom: 2rem;
          font-size: 0.938rem;
          line-height: 1.6;
        "
      >
        Tindakan ini akan <b>menghapus permanen</b> semua file media yang tidak terhubung ke data wisata manapun. 
        <br/><br/>
        <span style="font-size: 0.8rem; color: var(--danger)">*Hanya file yang berumur >1 jam yang akan dihapus.</span>
      </p>
      <div style="display: flex; gap: 12px; justify-content: stretch">
        <button
          id="btn-cleanup-cancel"
          class="btn btn-ghost"
          style="flex: 1"
          type="button"
        >
          Batal
        </button>
        <button
          id="btn-cleanup-confirm"
          class="btn btn-danger"
          style="flex: 1"
          type="button"
        >
          Ya, Bersihkan
        </button>
      </div>
    </div>
  </div>
`;
