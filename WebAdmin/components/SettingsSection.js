export const SettingsSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Unity App Settings</h1>
      <p>Kelola koneksi database dan sinkronisasi ke aplikasi Unity.</p>
    </div>
  </header>

  <div class="card" style="margin-top: 1rem">
    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3>Konfigurasi Koneksi Supabase</h3>
        <p style="font-size: 0.875rem; color: var(--text-dim)">
          Atur endpoint dan API Key untuk Unity
        </p>
      </div>
      <div id="db-heartbeat" style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 500; background: rgba(255,255,255,0.02); padding: 6px 12px; border-radius: 100px; border: 1px solid var(--glass-border);">
        <span class="heartbeat-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; display: inline-block; box-shadow: 0 0 8px #94a3b8; transition: all 0.3s ease;"></span>
        <span class="heartbeat-text" style="color: var(--text-dim);">Checking connection...</span>
      </div>
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
        <h4 style="color: var(--primary); margin-bottom: 0.5rem">
          Perbarui Supabase
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
            />
            <small class="text-hint">Biarkan kosong jika tidak ingin mengubah URL.</small>
          </div>
          <div class="form-group">
            <label for="s-key">Supabase Secret Key (Service Role)</label>
            <div style="position: relative; display: flex; align-items: center; width: 100%;">
              <input
                type="password"
                id="s-key"
                placeholder="Enter new secret key to update..."
                style="padding-right: 2.5rem; width: 100%;"
              />
              <button 
                type="button" 
                class="toggle-password" 
                data-target="s-key"
                style="position: absolute; right: 10px; background: none; border: none; color: var(--text-dim); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
            <small class="text-hint">Biarkan kosong jika tidak ingin mengubah Key.</small>
          </div>

          <div style="display: flex; justify-content: flex-end">
            <button
              type="submit"
              class="btn btn-primary"
              id="btn-save-settings"
              style="width: 100%"
            >
              Simpan Supabase
            </button>
          </div>
        </form>

        <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 1.5rem 0;" />

        <h4 style="color: var(--primary); margin-bottom: 0.5rem">
          Perbarui Google Drive
        </h4>
        <form
          id="gdrive-settings-form"
          style="display: flex; flex-direction: column; gap: 1.25rem"
        >
          <div class="form-group">
            <label for="s-gdrive-key">Google Drive API Key (Opsional)</label>
            <div style="position: relative; display: flex; align-items: center; width: 100%;">
              <input
                type="password"
                id="s-gdrive-key"
                placeholder="Enter GDrive API Key (Optional)..."
                style="padding-right: 2.5rem; width: 100%;"
              />
              <button 
                type="button" 
                class="toggle-password" 
                data-target="s-gdrive-key"
                style="position: absolute; right: 10px; background: none; border: none; color: var(--text-dim); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
            <small class="text-hint">Diperlukan untuk streaming video langsung dari GDrive.</small>
          </div>
          <div style="display: flex; justify-content: flex-end">
            <button
              type="submit"
              class="btn btn-primary"
              id="btn-save-gdrive"
              style="width: 100%"
            >
              Simpan Google Drive
            </button>
          </div>
        </form>
      </div>

      <!-- RIGHT: Current Active Config -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="color: var(--success); margin: 0;">
            Konfigurasi Aktif
          </h4>
          <button 
            type="button" 
            id="btn-unlock-config" 
            class="btn btn-ghost" 
            style="padding: 4px 10px; font-size: 0.72rem; display: flex; align-items: center; gap: 6px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.02); height: 26px; border-radius: 6px; cursor: pointer; color: var(--text-dim);"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="unlock-config-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span id="unlock-config-text">Tampilkan</span>
          </button>
        </div>
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
          <div style="margin-bottom: 1rem">
            <label style="margin-bottom: 4px">GDrive API Key Saat Ini:</label>
            <div
              id="current-gdrive-key-display"
              style="
                font-family: monospace;
                font-size: 0.85rem;
                color: var(--text-dim);
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

        <!-- Guide Section -->
        <div
          style="
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          "
        >
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
            <h4 style="color: var(--pastel-peach); margin: 0; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Panduan Kredensial
            </h4>
            <div style="display: flex; background: rgba(0,0,0,0.2); padding: 2px; border-radius: 6px; border: 1px solid var(--glass-border);">
              <button type="button" class="guide-tab active" data-guide="supabase" style="background: rgba(255, 255, 255, 0.08); border: none; color: #fff; padding: 4px 10px; font-size: 0.68rem; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">Supabase</button>
              <button type="button" class="guide-tab" data-guide="gdrive" style="background: none; border: none; color: var(--text-dim); padding: 4px 10px; font-size: 0.68rem; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">GDrive</button>
            </div>
          </div>

          <!-- Guide Content: Supabase -->
          <div id="guide-content-supabase" class="guide-tab-content" style="display: block; animation: fadeIn 0.3s ease;">
            <ol style="margin: 0; padding-left: 1.2rem; font-size: 0.78rem; color: var(--text-dim); display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
              <li>Masuk ke <strong>Supabase Dashboard</strong> (<a href="https://supabase.com" target="_blank" style="color: var(--pastel-blue); text-decoration: none;">supabase.com</a>).</li>
              <li>Pilih proyek Anda, lalu klik ikon **Settings** (gigi roda) di sidebar kiri bawah.</li>
              <li>Masuk ke menu <strong>API</strong> di bawah Project Settings.</li>
              <li>Di bagian <strong>Project API Keys</strong>:
                <br/>• Salin <strong>Project URL</strong> untuk dimasukkan ke kolom URL.
                <br/>• Salin <strong>service_role</strong> (Secret Key) untuk kolom Secret Key.
              </li>
              <li><span style="color: var(--pastel-coral); font-weight: 600;">⚠ PENTING:</span> Jangan pernah membagikan <strong>service_role</strong> key ke publik karena memiliki akses bypass RLS.</li>
            </ol>
          </div>

          <!-- Guide Content: GDrive -->
          <div id="guide-content-gdrive" class="guide-tab-content" style="display: none; animation: fadeIn 0.3s ease;">
            <ol style="margin: 0; padding-left: 1.2rem; font-size: 0.78rem; color: var(--text-dim); display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
              <li>Masuk ke <strong>Google Cloud Console</strong> (<a href="https://console.cloud.google.com" target="_blank" style="color: var(--pastel-blue); text-decoration: none;">console.cloud.google.com</a>).</li>
              <li>Pilih proyek Anda, lalu cari dan aktifkan <strong>Google Drive API</strong> di API Library.</li>
              <li>Masuk ke menu **APIs & Services** > **Credentials**.</li>
              <li>Klik **Create Credentials** > pilih <strong>API Key</strong>.</li>
              <li>Salin API Key yang berhasil dibuat untuk dimasukkan ke kolom GDrive API Key.</li>
              <li>Pastikan file video di GDrive Anda disetel **"Siapa saja yang memiliki link dapat melihat"** (Public View) agar API bypass dapat membacanya di Unity.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top: 2rem; border-color: rgba(239, 68, 68, 0.2)">
    <div class="card-header">
      <h3 style="color: var(--danger)">Storage Maintenance</h3>
      <p style="font-size: 0.875rem; color: var(--text-dim)">
        Bersihkan file sampah (media/3D model) yang tidak terhubung ke data target manapun.
      </p>
    </div>
    <div class="card-body" style="padding: 1.5rem">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 2rem;">
        <div style="flex: 1">
          <p style="font-size: 0.875rem; line-height: 1.5; color: var(--text-dim)">
            Sistem akan memindai seluruh isi bucket <strong>wisata-media</strong> dan membandingkannya dengan database. 
            File yang tidak memiliki referensi di tabel <code>ar_targets</code> akan dihapus untuk menghemat ruang penyimpanan.
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
            <th>Perubahan GDrive Key</th>
          </tr>
        </thead>
        <tbody id="settings-logs-body">
          <tr>
            <td
              colspan="5"
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
          background: rgba(254, 215, 170, 0.15);
          color: var(--pastel-peach);
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
          style="flex: 1; background: var(--pastel-peach); border-color: var(--pastel-peach); color: var(--text-dark); font-weight: 600;"
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
        Tindakan ini akan <b>menghapus permanen</b> semua file media yang tidak terhubung ke data target manapun. 
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

  <!-- Modal: Unlock Config Password Verification -->
  <div class="modal-overlay" id="modal-unlock-config">
    <div class="modal-card" style="max-width: 400px; text-align: center; padding: 2rem;">
      <div
        style="
          width: 56px;
          height: 56px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        "
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3 style="margin-bottom: 0.5rem; color: var(--text-main);">Verifikasi Keamanan</h3>
      <p style="color: var(--text-dim); margin-bottom: 1.5rem; font-size: 0.85rem; line-height: 1.5;">
        Masukkan kata sandi akun Anda untuk membuka sensor Konfigurasi Aktif.
      </p>
      <form id="unlock-config-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group" style="text-align: left; margin: 0;">
          <label for="unlock-password" style="font-size: 0.8rem; margin-bottom: 6px;">Kata Sandi</label>
          <input 
            type="password" 
            id="unlock-password" 
            placeholder="Masukkan kata sandi..." 
            required 
            style="width: 100%;"
          />
        </div>
        <div style="display: flex; gap: 12px; margin-top: 0.5rem;">
          <button
            id="btn-unlock-cancel"
            class="btn btn-ghost"
            style="flex: 1"
            type="button"
          >
            Batal
          </button>
          <button
            id="btn-unlock-confirm"
            class="btn btn-primary"
            style="flex: 1"
            type="submit"
          >
            Verifikasi
          </button>
        </div>
      </form>
    </div>
  </div>
`;
