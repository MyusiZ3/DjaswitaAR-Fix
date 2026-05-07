export const AdminsSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Team Management</h1>
      <p>Kelola akun tim dan hak akses (SuperAdmin Only).</p>
    </div>
    <div style="display: flex; gap: 12px; align-items: center">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="search-admins" placeholder="Cari email admin..." />
      </div>
      <button class="btn btn-primary" id="btn-add-admin">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tambah Admin
      </button>
    </div>
  </header>

  <section class="content-card">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
          <th>Manage</th>
        </tr>
      </thead>
      <tbody id="admin-table-body">
        <!-- Admin data will be injected here -->
      </tbody>
    </table>
  </section>

  <!-- Modal Form Admin (Moved from index.html) -->
  <div class="modal-overlay" id="modal-admin-form">
    <div class="modal-content" style="max-width: 450px">
      <h2 id="modal-admin-title">Add Team Member</h2>
      <p style="color: var(--text-dim); font-size: 0.875rem">
        Undang admin baru untuk membantu mengelola konten.
      </p>
      <form id="admin-form">
        <div class="form-group">
          <label>Username</label>
          <input
            type="text"
            id="f-admin-username"
            placeholder="JhonDoe"
            required
          />
        </div>
        <div class="form-group">
          <label>Email Admin</label>
          <input
            type="email"
            id="f-admin-email"
            placeholder="admin@domain.com"
            required
          />
        </div>
        <div class="form-group" id="admin-password-group">
          <label>Password</label>
          <input
            type="password"
            id="f-admin-password"
            placeholder="Minimal 6 karakter"
          />
        </div>
        <div class="form-group">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <label style="margin-bottom: 0;">Role</label>
            <div class="info-icon-container">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon" style="color: var(--text-dim); cursor: pointer;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <div class="role-info-tooltip">
                <div style="margin-bottom: 4px;"><strong>Superadmin:</strong> Akses penuh (Pengaturan, Admin, Konten)</div>
                <div style="margin-bottom: 4px;"><strong>Admin:</strong> Kelola konten (Tambah/Edit/Hapus)</div>
                <div><strong>Member:</strong> Lihat data & statistik saja.</div>
              </div>
            </div>
          </div>
          <select id="f-admin-role">
            <option value="admin">Admin</option>
            <option value="superadmin">SuperAdmin</option>
            <option value="member">Member</option>
          </select>
        </div>

        <div class="modal-actions" style="margin-top: 2rem">
          <button type="button" class="btn btn-ghost" id="btn-cancel-admin">
            Batal
          </button>
          <button type="submit" class="btn btn-primary">Simpan Admin</button>
        </div>
      </form>
    </div>
  </div>
`;
