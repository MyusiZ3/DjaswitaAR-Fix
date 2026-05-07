export const DashboardSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>Performance Insights</h1>
      <p>Pantau sejauh mana pengunjung berinteraksi dengan konten AR kamu.</p>
    </div>
  </header>

  <div class="dashboard-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Total Engagement</span>
        <h2 class="stat-value" id="stat-total-scans">0</h2>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Active Spots</span>
        <h2 class="stat-value" id="stat-active-locations">0</h2>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Verified Admins</span>
        <h2 class="stat-value" id="stat-total-admins">0</h2>
      </div>
    </div>
  </div>

  <div class="dashboard-charts-row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
    <div class="card">
      <div class="card-header">
        <h3>Weekly Scan Activity</h3>
        <p style="font-size: 0.875rem; color: var(--text-dim)">Tren interaksi pengunjung dalam 7 hari terakhir.</p>
      </div>
      <div style="padding: 1.5rem; height: 320px">
        <canvas id="scans-chart"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <h3>Category Distribution</h3>
        <p style="font-size: 0.875rem; color: var(--text-dim)">Proporsi jenis destinasi wisata kamu.</p>
      </div>
      <div style="padding: 1.5rem; height: 320px; display: flex; align-items: center; justify-content: center;">
        <canvas id="category-chart"></canvas>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top: 1.5rem">
    <div class="card-header">
      <h3>Top Destinations</h3>
      <p style="font-size: 0.875rem; color: var(--text-dim)">Lokasi yang paling sering di-scan oleh pengunjung.</p>
    </div>
    <div class="content-card" style="padding: 0; border: none; background: transparent; backdrop-filter: none;">
      <table style="margin: 0">
        <thead>
          <tr>
            <th>Destination Name</th>
            <th>Category</th>
            <th>Engagement</th>
            <th style="width: 200px">Popularity</th>
          </tr>
        </thead>
        <tbody id="popular-locations-body">
          <tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-dim);">Memuat data...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
`;
