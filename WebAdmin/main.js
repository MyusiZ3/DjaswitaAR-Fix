import "./main.css";
import { createClient } from "@supabase/supabase-js";

// Components
import { DashboardSection } from "./components/DashboardSection.js";
import { WisataSection } from "./components/WisataSection.js";
import { InstructionsSection } from "./components/InstructionsSection.js";
import { AdminsSection } from "./components/AdminsSection.js";
import { SettingsSection } from "./components/SettingsSection.js";
import { AboutSection } from "./components/AboutSection.js";

// Initial Component Injection
const sections = {
  "section-dashboard": DashboardSection(),
  "section-wisata": WisataSection(),
  "section-instructions": InstructionsSection(),
  "section-admins": AdminsSection(),
  "section-settings": SettingsSection(),
  "section-about": AboutSection(),
};

for (const [id, html] of Object.entries(sections)) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to warning if missing in build
if (!SUPABASE_URL && import.meta.env.PROD) {
  console.warn("VITE_SUPABASE_URL is not set in environment variables!");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// Client for signing up new admins without modifying current session
const supabaseAux = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'jawita-aux-auth'
  },
});

// DOM Elements
const tableBody = document.getElementById("data-table-body");
const modal = document.getElementById("modal-form");
const form = document.getElementById("wisata-form");
const fType = document.getElementById('f-type');
const eventDateGroup = document.getElementById('event-date-group');

// Start and End Date are now always visible as per user requirement

const btnAdd = document.getElementById("btn-add");
const btnCancel = document.getElementById("btn-cancel");
const fileInput = document.getElementById("f-media-file");
const mediaUrlInput = document.getElementById("f-media-url");
const previewBox = document.getElementById("media-preview-box");
const markerUrlInput = document.getElementById("f-marker-url");
const markerPreviewBox = document.getElementById("marker-preview-box");
const markerFileInput = document.getElementById("f-marker-file");
const searchInput = document.getElementById("search-wisata");
const hargaInput = document.getElementById("f-harga");
const modelUrlInput = document.getElementById("f-model-url");
const modelFileInput = document.getElementById("f-model-file");
const modelPreviewBox = document.getElementById("model-3d-display");
const modelContainer = document.getElementById("model-3d-preview-box"); // For background/styles if needed

const sectionSlides = document.getElementById("section-slides-content");
const section3D = document.getElementById("section-3d-content");

const loginScreen = document.getElementById("login-screen");
const appContent = document.getElementById("app");
const loginForm = document.getElementById("login-form");
const userEmailDisplay = document.getElementById("user-email");
const userRoleDisplay = document.getElementById("user-role");
const btnLogout = document.getElementById("btn-logout");
const toastContainer = document.getElementById("toast-container");

// Navigation & Sections
const navItems = document.querySelectorAll(".nav-item");
const viewSections = document.querySelectorAll(".view-section");
const navAdmins = document.getElementById("nav-admins");
const navSettings = document.getElementById("nav-settings");
const settingsForm = document.getElementById("settings-form");

// Admin DOM
const adminTableBody = document.getElementById("admin-table-body");
const btnAddAdmin = document.getElementById("btn-add-admin");
const modalAdmin = document.getElementById("modal-admin-form");
const adminForm = document.getElementById("admin-form");
const btnCancelAdmin = document.getElementById("btn-cancel-admin");
const modalAdminTitle = document.getElementById("modal-admin-title");
const adminPasswordGroup = document.getElementById("admin-password-group");
const searchAdminsInput = document.getElementById("search-admins");
const adminUsernameInput = document.getElementById("f-admin-username");

// Confirm Modals
const modalConfirm = document.getElementById("modal-confirm");
const btnConfirmLogout = document.getElementById("btn-confirm-logout");
const btnConfirmCancel = document.getElementById("btn-confirm-cancel");

const modalDelete = document.getElementById("modal-delete");
const btnDeleteConfirm = document.getElementById("btn-delete-confirm");
const btnDeleteCancel = document.getElementById("btn-delete-cancel");
const hardDeleteOption = document.getElementById("hard-delete-option");
const checkHardDelete = document.getElementById("check-hard-delete");
const modalSettingsConfirm = document.getElementById("modal-settings-confirm");
const btnSettingsConfirm = document.getElementById("btn-settings-confirm");
const btnSettingsCancel = document.getElementById("btn-settings-cancel");


let isEditing = false;
let editingId = null;

let isAdminEditing = false;
let editingAdminId = null;
let currentRole = "admin";
let wisataData = [];
let adminData = [];
let idToDelete = null;
let deleteType = null; // 'wisata' or 'admin'

// Prevents redundant fetches on tab focus (Supabase onAuthStateChange triggers)
let isInitialized = false;
let currentUserId = null;

let logsSortAsc = false;

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

function showSection(sectionId) {
  // Auto-close any open modals when navigating
  document.querySelectorAll(".modal-overlay.active").forEach((modal) => {
    modal.classList.remove("active");
  });

  // Hide all sections
  document.querySelectorAll(".view-section").forEach((s) => {
    s.classList.remove("active");
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add("active");
  }

  // Update sidebar menu active state
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-target") === sectionId) {
      item.classList.add("active");
    }
  });
  
  // Save state to localStorage to persist across refreshes/tab focus
  localStorage.setItem('activeSection', sectionId);

  if (sectionId === "section-dashboard") fetchAnalytics();
  if (sectionId === "section-instructions") fetchAppSettings(); // Reuse fetch to get canva link
  if (sectionId === "section-admins") fetchAdmins();
  if (sectionId === "section-settings") {
    fetchAppSettings();
    setupSettingsListeners();
  }
  if (sectionId === "section-about") { /* No data to fetch for static about section */ }
}

// --- NAVIGATION ---
navItems.forEach((nav) => {
  nav.addEventListener("click", () => {
    const targetId = nav.getAttribute("data-target");
    if (targetId) showSection(targetId);
  });
});

// --- HELPER FUNCTIONS ---
async function validateImageDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      const targetRatio = 1080 / 1350; // 0.8
      const tolerance = 0.05;

      if (Math.abs(ratio - targetRatio) > tolerance) {
        showToast(
          `Rasio gambar disarankan 1080x1350 (4:5). Saat ini: ${img.width}x${img.height}`,
          "info",
        );
      }
      resolve(true);
    };
  });
}

function updatePreview(urlStr) {
  if (!previewBox) return;
  previewBox.innerHTML = "";

  if (urlStr && urlStr.trim() !== "") {
    const urls = urlStr.split(",").filter((u) => u.trim() !== "");
    urls.forEach((url, index) => {
      const container = document.createElement("div");
      container.className = "preview-item";
      container.style =
        "position:relative; width:80px; height:80px; border-radius:8px; overflow:hidden; border:1px solid var(--border);";

      container.innerHTML = `
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;" alt="Preview ${index}">
        <button type="button" onclick="removeImage(${index})" style="position:absolute; top:2px; right:2px; background:rgba(255,0,0,0.7); color:white; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
      `;
      previewBox.appendChild(container);
    });
  } else {
    previewBox.innerHTML =
      '<span class="preview-placeholder">Belum ada gambar</span>';
  }
}

window.removeImage = (index) => {
  const existing = mediaUrlInput.value
    .split(",")
    .filter((u) => u.trim() !== "");
  existing.splice(index, 1);
  const newVal = existing.join(",");
  mediaUrlInput.value = newVal;
  updatePreview(newVal);
};

function updateMarkerPreview(url) {
  if (!markerPreviewBox) return;
  if (url && url.trim() !== "") {
    markerPreviewBox.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain;" alt="Marker Preview" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\'preview-placeholder\'>Marker tidak dapat dimuat</span>'">`;
  } else {
    markerPreviewBox.innerHTML =
      '<span class="preview-placeholder">Belum ada marker</span>';
  }
}

mediaUrlInput?.addEventListener("input", (e) => updatePreview(e.target.value));
markerUrlInput?.addEventListener("input", (e) =>
  updateMarkerPreview(e.target.value),
);

function update3DPreview(url) {
  if (!modelPreviewBox) return;
  if (url && url.trim() !== "") {
    modelPreviewBox.innerHTML = `
      <model-viewer 
        src="${url}" 
        auto-rotate 
        camera-controls 
        shadow-intensity="1" 
        style="width: 100%; height: 100%;"
        alt="A 3D model preview">
        <div slot="progress-bar" class="model-loading-overlay">
          <div class="loading-spinner"></div>
          <span>Loading 3D Workspace...</span>
        </div>
      </model-viewer>
    `;
    
    // Apply current transform values immediately after loading
    setTimeout(() => {
      const mv = modelPreviewBox.querySelector('model-viewer');
      if (mv) {
        const hideLoader = () => {
          const loader = mv.querySelector('.model-loading-overlay');
          if (loader) loader.classList.add('hide');
        };

        // Use multiple events to ensure it hides
        mv.addEventListener('load', hideLoader);
        mv.addEventListener('poster-dismissed', hideLoader);
        
        // Fallback: if it's already loaded or takes too long
        if (mv.loaded) hideLoader();
        setTimeout(hideLoader, 15000); // 15s max for loader
        
        mv.addEventListener('error', (e) => {
          hideLoader();
          console.error("Model Viewer Error:", e);
          showToast("Gagal memuat model 3D. Pastikan format file benar (.glb)", "error");
        });

        const scale = document.getElementById('f-model-scale').value || "1.0";
        const rotY = document.getElementById('f-model-rot-y').value || "0";
        mv.setAttribute('scale', `${scale} ${scale} ${scale}`);
        mv.setAttribute('orientation', `0deg ${rotY}deg 0deg`);
      }
    }, 100);
  } else {
    modelPreviewBox.innerHTML =
      '<span class="preview-placeholder">Preview 3D akan muncul di sini setelah model dimuat</span>';
  }
}

modelUrlInput?.addEventListener("input", (e) => update3DPreview(e.target.value));


// Handle Login / App Startup
async function handleAuthState(session) {
  const loader = document.getElementById("initial-loader");
  try {
    if (session) {
      // If already initialized for this user, skip re-fetching data (prevents spinner on tab focus)
      if (isInitialized && currentUserId === session.user.id) {
        return;
      }
      
      isInitialized = true;
      currentUserId = session.user.id;

      if (loginScreen) {
        loginScreen.style.display = "none";
        loginScreen.classList.add("init-hidden");
      }
      if (appContent) {
        appContent.style.display = "flex";
        appContent.classList.remove("init-hidden");
      }
      if (userEmailDisplay) userEmailDisplay.innerText = session.user.email;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      currentRole = profile?.role || "admin";
      
      if (userRoleDisplay) {
        // Map roles to friendly display names
        const roleLabels = {
          'superadmin': 'Superadmin',
          'admin': 'Administrator',
          'member': 'Member'
        };
        userRoleDisplay.innerText = roleLabels[currentRole] || (currentRole.charAt(0).toUpperCase() + currentRole.slice(1));
      }
      
      document.body.classList.toggle("is-super-admin", currentRole === "superadmin");
      
      // Hide Add button and Action column for members (Read Only)
      if (btnAdd) {
        btnAdd.style.display = (currentRole === "member") ? "none" : "flex";
      }
      const thWisata = document.getElementById('th-aksi-wisata');
      if (thWisata) {
        thWisata.style.display = (currentRole === "member") ? "none" : "table-cell";
      }

      // Restore last section or default to dashboard
      const lastSection = localStorage.getItem('activeSection') || 'section-dashboard';
      showSection(lastSection);
      
      fetchData();
    } else {
      isInitialized = false;
      currentUserId = null;
      if (loginScreen) {
        loginScreen.style.display = "flex";
        loginScreen.classList.remove("init-hidden");
      }
      if (appContent) {
        appContent.style.display = "none";
        appContent.classList.add("init-hidden");
      }
    }
  } catch (err) {
    console.error("Auth state error:", err);
  } finally {
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
    }
  }
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.innerText = "Memproses...";
  btn.disabled = true;

  let loginIdentifier = document.getElementById("l-email").value;
  const password = document.getElementById("l-password").value;
  let email = loginIdentifier;

  // If not an email, try to find email by username
  if (!loginIdentifier.includes("@")) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", loginIdentifier)
      .maybeSingle();
    
    if (profileError || !profile) {
      showToast("Username tidak ditemukan", "error");
      btn.innerText = originalText;
      btn.disabled = false;
      return;
    }
    email = profile.email;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, "error");
    btn.innerText = originalText;
    btn.disabled = false;
  }
});

btnLogout?.addEventListener("click", () => {
  if (modalConfirm) modalConfirm.classList.add("active");
});

btnConfirmCancel?.addEventListener("click", () => {
  if (modalConfirm) modalConfirm.classList.remove("active");
});

btnConfirmLogout?.addEventListener("click", async () => {
  const btn = btnConfirmLogout;
  btn.disabled = true;
  btn.innerHTML =
    '<div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Keluar...';

  try {
    await supabase.auth.signOut();
    localStorage.removeItem('activeSection');
    if (modalConfirm) modalConfirm.classList.remove("active");
    window.location.reload();
  } catch (err) {
    console.error("Logout error:", err);
    showToast("Gagal keluar", "error");
    btn.disabled = false;
    btn.innerText = "Keluar";
  }
});

// --- WISATA CRUD ---
function renderTable(data) {
  if (!tableBody) return;

  if (data && data.length > 0) {
    tableBody.innerHTML = data
      .map(
        (item) => `
      <tr>
        <td><img src="${item.slide_urls ? item.slide_urls.split(",")[0] : (item.marker_url || "")}" class="media-thumbnail" onerror="this.src=''"></td>
        <td style="font-family: monospace; color: var(--primary)">${item.id}</td>
        <td style="font-weight: 600">${item.nama}</td>
        <td><span class="badge badge-${item.type}">${item.type}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-dim);">
          ${item.start_date ? `<span>${item.start_date}</span>` : ""}
          ${item.start_date && item.end_date ? " - " : ""}
          ${item.end_date ? `<span>${item.end_date}</span>` : (!item.start_date ? "-" : "")}
        </td>
        <td>${item.harga ? formatRupiah(item.harga.toString()) : "-"}</td>
        ${currentRole !== 'member' ? `
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn-edit btn btn-ghost" data-id="${item.id}" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-delete btn btn-ghost" data-id="${item.id}" style="color: var(--danger)" title="Hapus">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
        ` : ''}
      </tr>
    `,
      )
      .join("");

    document
      .querySelectorAll(".btn-edit")
      .forEach((b) => (b.onclick = () => editItem(b.dataset.id)));
    document
      .querySelectorAll(".btn-delete")
      .forEach((b) => (b.onclick = () => deleteItem(b.dataset.id)));
  } else {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-dim);">${searchInput?.value ? "Data yang Anda cari tidak ditemukan." : "Belum ada data wisata. Silakan tambahkan data baru."}</td></tr>`;
  }
}

async function fetchData() {
  try {
    if (tableBody) {
      tableBody.innerHTML = Array(4).fill(0).map(() => `
        <tr class="skeleton-row">
          <td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 48px; height: 48px; border-radius: 10px;"></div></td>
          <td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 120px;"></div></td>
          <td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 180px;"></div></td>
          <td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 80px; border-radius: 100px;"></div></td>
          <td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 140px;"></div></td>
          <td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 100px;"></div></td>
          ${currentRole !== 'member' ? '<td style="border-bottom: 1px solid var(--glass-border); padding: 1.5rem 1rem;"><div class="skeleton-box" style="width: 60px;"></div></td>' : ''}
        </tr>
      `).join('');
    }

    const { data, error } = await supabase
      .from("wisata")
      .select("*")
      .order("nama", { ascending: true });
    if (error) throw error;

    wisataData = data || [];
    renderTable(wisataData);
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">Gagal memuat data: ${error.message}</td></tr>`;
    }
    showToast("Oops! Gagal memuat data: " + error.message, "error");
  }
}

// --- ANALYTICS ---
let scansChart = null;

async function fetchAnalytics() {
  try {
    // Show loading state for popular locations table
    const popBody = document.getElementById('popular-locations-body');
    if (popBody) popBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;"><div class="loading-spinner" style="width: 20px; height: 20px;"></div></td></tr>';

    // 1. Fetch Summary Stats
    const { count: totalScans } = await supabase.from('scans').select('*', { count: 'exact', head: true });
    const { count: activeLocations } = await supabase.from('wisata').select('*', { count: 'exact', head: true });
    const { count: totalAdmins } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    document.getElementById('stat-total-scans').innerText = totalScans || 0;
    document.getElementById('stat-active-locations').innerText = activeLocations || 0;
    document.getElementById('stat-total-admins').innerText = totalAdmins || 0;

    // 2. Fetch Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    
    const { data: scansData, error: scansError } = await supabase
      .from('scans')
      .select('scanned_at')
      .gte('scanned_at', sevenDaysAgo.toISOString());

    if (scansError) throw scansError;

    const dailyData = {};
    const labels = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
      labels.push(label);
      dailyData[label] = 0;
    }

    scansData.forEach(s => {
      const label = new Date(s.scanned_at).toLocaleDateString('id-ID', { weekday: 'short' });
      if (dailyData[label] !== undefined) dailyData[label]++;
    });

    renderScansChart(labels, labels.map(l => dailyData[l]));

    // 3. Category Distribution Chart
    if (wisataData.length === 0) {
      const { data: wData } = await supabase.from("wisata").select("*");
      wisataData = wData || [];
    }

    const categories = {};
    wisataData.forEach(w => {
      const cat = w.type || 'Lainnya';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    renderCategoryChart(Object.keys(categories), Object.values(categories));

    // 4. Fetch Popular Locations
    const { data: popData, error: popError } = await supabase
      .from('scans')
      .select('wisata_id');
    
    if (popError) throw popError;

    const counts = {};
    popData.forEach(p => {
      counts[p.wisata_id] = (counts[p.wisata_id] || 0) + 1;
    });

    const popularList = wisataData.map(w => ({
      ...w,
      scan_count: counts[w.id] || 0
    })).sort((a, b) => b.scan_count - a.scan_count);

    renderPopularLocations(popularList);

  } catch (err) {
    console.error("Analytics Error:", err);
    showToast("Terjadi kendala saat mengambil data analitik: " + err.message, "error");
  }
}

let categoryChart = null;
function renderCategoryChart(labels, data) {
  const ctx = document.getElementById('category-chart')?.getContext('2d');
  if (!ctx) return;
  if (categoryChart) categoryChart.destroy();

  const total = data.reduce((a, b) => a + b, 0);

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
      const width = chart.width, height = chart.height, ctx = chart.ctx;
      ctx.restore();
      const fontSize = (height / 114).toFixed(2);
      ctx.font = "bold " + fontSize + "em Outfit, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f3f4f6";
      const text = total.toString(),
          textX = Math.round((width - ctx.measureText(text).width) / 2),
          textY = height / 2.2;
      ctx.fillText(text, textX, textY);
      
      ctx.font = (fontSize / 2.5).toFixed(2) + "em Outfit, sans-serif";
      ctx.fillStyle = "#8e939e";
      const label = "Total",
          labelX = Math.round((width - ctx.measureText(label).width) / 2),
          labelY = height / 2.2 + (fontSize * 16);
      ctx.fillText(label, labelX, labelY);
      ctx.save();
    }
  };

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#bbf7d0', '#e9d5ff', '#fed7aa', '#bfdbfe', '#fecaca', '#d4fc34'
        ],
        borderWidth: 0,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#8e939e',
            padding: 20,
            usePointStyle: true,
            font: { size: 11 }
          }
        },
        tooltip: {
          backgroundColor: '#141519',
          padding: 12,
          cornerRadius: 8,
          displayColors: true
        }
      }
    },
    plugins: [centerTextPlugin]
  });
}

function renderScansChart(labels, data) {
  const ctx = document.getElementById('scans-chart')?.getContext('2d');
  if (!ctx) return;

  if (scansChart) scansChart.destroy();

  // Create Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(191, 219, 254, 0.4)'); // Pastel Blue
  gradient.addColorStop(1, 'rgba(191, 219, 254, 0)');

  scansChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Scan',
        data: data,
        borderColor: '#bfdbfe', // Pastel Blue
        backgroundColor: gradient,
        borderWidth: 4,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#bbf7d0', // Pastel Mint
        pointBorderColor: '#141519',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#bbf7d0',
        pointHoverBorderColor: '#141519',
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#141519',
          titleFont: { size: 13, weight: 'bold' },
          padding: 14,
          cornerRadius: 10,
          borderColor: 'rgba(255,255,255,0.05)',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            label: (context) => `📈 ${context.parsed.y} Scans`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
          ticks: { color: '#8e939e', font: { size: 11 }, stepSize: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#8e939e', font: { size: 11 } }
        }
      }
    }
  });
}

function renderPopularLocations(data) {
  const tbody = document.getElementById('popular-locations-body');
  if (!tbody) return;

  if (!data || data.length === 0 || data.every(d => d.scan_count === 0)) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-dim);">Belum ada data scan yang tercatat.</td></tr>';
    return;
  }

  const maxScan = Math.max(...data.map(d => d.scan_count), 1);

  tbody.innerHTML = data.slice(0, 5).map(item => `
    <tr>
      <td style="font-weight: 600; color: #fff;">${item.nama}</td>
      <td><span class="badge badge-${item.type}">${item.type}</span></td>
      <td style="font-weight: 700; color: var(--text-main); font-size: 1.125rem;">${item.scan_count}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="popularity-bar-container" style="flex: 1;">
            <div class="popularity-bar" style="width: ${(item.scan_count / maxScan) * 100}%; background: linear-gradient(90deg, var(--pastel-mint), var(--pastel-blue));"></div>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-dim); min-width: 30px; text-align: right;">
            ${Math.round((item.scan_count / maxScan) * 100)}%
          </span>
        </div>
      </td>
    </tr>
  `).join('');
}

searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = wisataData.filter(
    (item) =>
      (item.nama?.toLowerCase() || "").includes(query) ||
      (item.id?.toLowerCase() || "").includes(query) ||
      (item.type?.toLowerCase() || "").includes(query),
  );
  renderTable(filtered);
});

// (Removed duplicate formatRupiah and listener)

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = {
    id: document.getElementById("f-id").value,
    nama: document.getElementById("f-nama").value,
    type: document.getElementById("f-type").value,
    deskripsi: document.getElementById("f-deskripsi").value,
    harga: document.getElementById("f-harga").value === "Free" ? "Free" : parseRupiah(document.getElementById("f-harga").value).toString(),
    booking_url: document.getElementById("f-booking_url").value,
    marker_url: document.getElementById("f-marker-url").value,
    slide_urls: document.getElementById("f-media-url").value,
    video_url: document.getElementById("f-video-url").value,
    start_date: document.getElementById("f-start-date").value || null,
    end_date: document.getElementById("f-end-date").value || null,
    main_content_type: document.querySelector('input[name="f-main-content-type"]:checked')?.value || 'image_slides',
    model_url: document.getElementById("f-model-url").value,
    model_scale: parseFloat(document.getElementById("f-model-scale").value) || 1.0,
    model_rot_y: parseFloat(document.getElementById("f-model-rot-y").value) || 0,
    model_pos_y: parseFloat(document.getElementById("f-model-pos-y").value) || 0,
    model_pos_z: parseFloat(document.getElementById("f-model-pos-z").value) || 0.0192,
  };
  const { error } = isEditing
    ? await supabase.from("wisata").update(formData).eq("id", editingId)
    : await supabase.from("wisata").insert([formData]);

  if (error) {
    showToast("Error: " + error.message, "error");
  } else {
    showToast("Data wisata berhasil disimpan.", "success");
    closeModal();
    fetchData();
  }
});

// --- APP SETTINGS (SUPERADMIN ONLY) ---
async function fetchAppSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "current_config")
    .single();

  if (!error && data) {
    // Inputs are kept empty for a cleaner UI as requested by user
    
    // Fill display fields
    const urlDisplay = document.getElementById("current-url-display");
    const keyDisplay = document.getElementById("current-key-display");
    
    if (urlDisplay) urlDisplay.innerText = data.supabase_url;
    if (keyDisplay) {
      // Show full key in display (readonly) but masked in logs
      keyDisplay.innerText = data.supabase_key;
    }
    
    // Update Canva Link
    const canvaInput = document.getElementById("f-canva-url");
    const canvaBtn = document.getElementById("canva-link-btn");
    if (canvaInput) canvaInput.value = data.canva_template_url || "";
    if (canvaBtn) {
        canvaBtn.href = data.canva_template_url || "#";
        if (!data.canva_template_url) {
            canvaBtn.style.opacity = "0.5";
            canvaBtn.style.pointerEvents = "none";
            canvaBtn.title = "Link Canva belum diatur";
        } else {
            canvaBtn.style.opacity = "1";
            canvaBtn.style.pointerEvents = "auto";
            canvaBtn.title = "";
        }
    }
  }
  
  // Load logs
  renderAppSettingsLogs();
}

async function renderAppSettingsLogs() {
  const tbody = document.getElementById("settings-logs-body");
  if (!tbody) return;

  // Update icon
  const sortIcon = document.getElementById("sort-icon-time");
  if (sortIcon) sortIcon.innerText = logsSortAsc ? "↑" : "↓";

  try {
    const { data, error } = await supabase
      .from("app_settings_logs")
      .select("*")
      .order("created_at", { ascending: logsSortAsc });

    if (error) throw error;

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-dim);">Belum ada riwayat perubahan.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(log => `
      <tr>
        <td style="font-size: 0.8rem; white-space: nowrap;">
          ${new Date(log.created_at).toLocaleString('id-ID')}
        </td>
        <td style="font-weight: 500;">${log.admin_email}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through;">${log.old_url || '-'}</div>
          <div style="color: var(--success); font-size: 0.8rem;">${log.new_url}</div>
        </td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through;">***${log.old_key?.slice(-8) || 'none'}</div>
          <div style="color: var(--success); font-size: 0.8rem;">***${log.new_key?.slice(-8)}</div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error rendering logs:", err);
  }
}

settingsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalSettingsConfirm.classList.add("active");
});

btnSettingsCancel?.addEventListener("click", () => {
  modalSettingsConfirm.classList.remove("active");
});

btnSettingsConfirm?.addEventListener("click", async () => {
  modalSettingsConfirm.classList.remove("active");
  
  const btn = document.getElementById("btn-save-settings");
  const originalText = btn.innerText;

  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  const newUrl = document.getElementById("s-url").value;
  const newKey = document.getElementById("s-key").value;

  const updateData = {};
  if (newUrl) updateData.supabase_url = newUrl;
  if (newKey) updateData.supabase_key = newKey;

  if (Object.keys(updateData).length === 0) {
    showToast("Tidak ada perubahan yang diisi.", "info");
    return;
  }

  try {
    // 1. Get current values for logging
    const { data: current } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", "current_config")
      .single();

    // 2. Update settings
    const { error: updateError } = await supabase.from("app_settings").upsert({
      id: "current_config",
      supabase_url: newUrl,
      supabase_key: newKey,
      updated_at: new Date().toISOString(),
    });

    if (updateError) throw updateError;

    // 3. Log the change
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("app_settings_logs").insert({
      admin_email: user.email,
      old_url: current?.supabase_url || 'empty',
      new_url: newUrl,
      old_key: current?.supabase_key || 'empty',
      new_key: newKey
    });

    showToast("Pengaturan aplikasi berhasil diperbarui.", "success");
    settingsForm.reset();
    fetchAppSettings();
  } catch (err) {
    console.error(err);
    showToast("Gagal memperbarui pengaturan", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
});

document.getElementById("th-sort-time")?.addEventListener("click", () => {
  logsSortAsc = !logsSortAsc;
  renderAppSettingsLogs();
});

// --- APP SETTINGS (SUPERADMIN ONLY) ---

// --- STORAGE CLEANUP (MAINTENANCE) ---
async function cleanupOrphanedFiles() {
  const btn = document.getElementById("btn-cleanup-storage");
  const progressContainer = document.getElementById("cleanup-progress-container");
  const statusText = document.getElementById("cleanup-status-text");
  const countText = document.getElementById("cleanup-count");
  const progressBar = document.getElementById("cleanup-progress-bar");

  btn.disabled = true;
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  statusText.innerText = "Mengumpulkan referensi database...";
  
  try {
    // 1. Get all used URLs from database
    const { data: wisata, error: dbError } = await supabase.from('wisata').select('slide_urls, marker_url, video_url, model_url');
    if (dbError) throw dbError;

    const usedPaths = new Set();
    const getPathFromUrl = (url) => {
      if (!url) return null;
      // Extracts path after '/wisata-media/'
      const parts = url.split("/wisata-media/");
      return parts.length > 1 ? parts[1].split('?')[0] : null;
    };

    wisata.forEach(item => {
      if (item.marker_url) { const p = getPathFromUrl(item.marker_url); if (p) usedPaths.add(p); }
      if (item.video_url) { const p = getPathFromUrl(item.video_url); if (p) usedPaths.add(p); }
      if (item.model_url) { const p = getPathFromUrl(item.model_url); if (p) usedPaths.add(p); }
      if (item.slide_urls) {
        item.slide_urls.split(',').forEach(u => {
          const p = getPathFromUrl(u.trim());
          if (p) usedPaths.add(p);
        });
      }
    });

    statusText.innerText = "Memindai storage bucket...";
    
    // 2. List all files in storage
    const folders = ['uploads', 'markers', 'models', 'videos'];
    let allFiles = [];

    for (const folder of folders) {
      statusText.innerText = `Memindai folder: ${folder}...`;
      const { data: files, error: stError } = await supabase.storage.from('wisata-media').list(folder, { limit: 1000 });
      if (stError) {
        console.warn(`Could not list folder ${folder}:`, stError);
        continue;
      }
      
      files.forEach(f => {
        if (f.name !== '.emptyKeep') {
          allFiles.push({
            name: f.name,
            path: `${folder}/${f.name}`,
            created_at: f.created_at
          });
        }
      });
    }

    // 3. Filter orphaned files
    const now = new Date();
    const orphanedFiles = allFiles.filter(f => {
      const isUsed = usedPaths.has(f.path);
      // Older than 1 hour (avoid deleting active uploads)
      const isOldEnough = (now - new Date(f.created_at)) > (60 * 60 * 1000);
      return !isUsed && isOldEnough;
    });

    if (orphanedFiles.length === 0) {
      statusText.innerText = "Selesai! Storage sudah bersih.";
      showToast("Tidak ada file sampah ditemukan.", "success");
      setTimeout(() => { progressContainer.style.display = "none"; btn.disabled = false; }, 3000);
      return;
    }

    // 4. Delete orphaned files
    statusText.innerText = `Menghapus ${orphanedFiles.length} file sampah...`;
    countText.innerText = `0/${orphanedFiles.length}`;
    
    let deletedCount = 0;
    const pathsToDelete = orphanedFiles.map(f => f.path);
    
    // Delete in batches
    for (let i = 0; i < pathsToDelete.length; i += 50) {
      const batch = pathsToDelete.slice(i, i + 50);
      const { error: delError } = await supabase.storage.from('wisata-media').remove(batch);
      
      if (!delError) {
        deletedCount += batch.length;
        const percent = Math.round((deletedCount / orphanedFiles.length) * 100);
        progressBar.style.width = `${percent}%`;
        countText.innerText = `${deletedCount}/${orphanedFiles.length}`;
      } else {
        console.error("Batch delete error:", delError);
      }
    }

    statusText.innerText = `Selesai! ${deletedCount} file dihapus.`;
    showToast(`Pembersihan berhasil: ${deletedCount} file dihapus.`, "success");
    setTimeout(() => { progressContainer.style.display = "none"; btn.disabled = false; }, 5000);

  } catch (err) {
    console.error("Cleanup error:", err);
    statusText.innerText = "Gagal memproses pembersihan.";
    showToast("Error cleanup: " + err.message, "error");
    btn.disabled = false;
  }
}

function setupSettingsListeners() {
    const btnCleanup = document.getElementById("btn-cleanup-storage");
    const modalCleanup = document.getElementById("modal-cleanup-confirm");
    const btnCleanupConfirm = document.getElementById("btn-cleanup-confirm");
    const btnCleanupCancel = document.getElementById("btn-cleanup-cancel");

    if (btnCleanup && modalCleanup) {
        btnCleanup.onclick = () => {
          modalCleanup.classList.add("active");
        };
    }

    if (btnCleanupConfirm) {
        btnCleanupConfirm.onclick = () => {
          if (modalCleanup) modalCleanup.classList.remove("active");
          cleanupOrphanedFiles();
        };
    }

    if (btnCleanupCancel) {
        btnCleanupCancel.onclick = () => {
          if (modalCleanup) modalCleanup.classList.remove("active");
        };
    }
}

// --- ADMIN CRUD (SUPERADMIN ONLY) ---
async function fetchAdmins() {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (!session) return;

  const isSuper = session.user.email === "jaswita.ar@gmail.com" || currentRole === "superadmin";
  
  if (isSuper) {
    if (navAdmins) navAdmins.style.display = "flex";
    if (navSettings) navSettings.style.display = "flex";
  } else {
    if (navAdmins) navAdmins.style.display = "none";
    if (navSettings) navSettings.style.display = "none";
    if (document.getElementById("section-admins").classList.contains("active")) {
      showSection("section-wisata");
    }
    return;
  }

  try {
    if (adminTableBody) {
      adminTableBody.innerHTML =
        '<tr><td colspan="5" style="text-align: center; padding: 2rem;"><div class="loading-spinner"></div></td></tr>';
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    adminData = data || [];
    renderAdmins();
  } catch (error) {
    console.error("Error fetching admins:", error);
    if (adminTableBody) {
      adminTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger);">Gagal memuat daftar admin: ${error.message}</td></tr>`;
    }
    showToast("Gagal memuat daftar admin: " + error.message, "error");
  }
}

function renderAdmins(filter = "") {
  if (!adminTableBody) return;

  const filteredData = adminData.filter((item) =>
    (item.email || "").toLowerCase().includes(filter.toLowerCase()) ||
    (item.username || "").toLowerCase().includes(filter.toLowerCase())
  );

  // Sorting: Superadmin (0) > Admin (1) > Member (2)
  const roleOrder = { superadmin: 0, admin: 1, member: 2 };
  filteredData.sort((a, b) => {
    const orderA = roleOrder[a.role] ?? 1; // Default to admin if role is missing
    const orderB = roleOrder[b.role] ?? 1;
    if (orderA !== orderB) return orderA - orderB;
    // Secondary sort by email if roles are the same
    return (a.email || "").localeCompare(b.email || "");
  });

  if (filteredData.length > 0) {
    adminTableBody.innerHTML = filteredData
      .map(
        (item) => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(233, 213, 255, 0.05); border: 1.5px solid var(--pastel-lavender); box-shadow: 0 0 10px rgba(233, 213, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--pastel-lavender); font-weight: 700; font-size: 0.9rem; text-transform: uppercase;">
              ${(item.username || "A").charAt(0)}
            </div>
            <span style="font-weight: 600; color: white">${item.username || "-"}</span>
          </div>
        </td>
        <td style="font-weight: 500">${item.email || "-"}</td>
        <td>
          <span class="badge role-${item.role || "admin"}">
            ${(item.role || "admin").toUpperCase()}
          </span>
        </td>
        <td style="color: var(--pastel-peach); font-family: var(--font-mono); font-size: 0.813rem;">
          ${new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn-edit-admin btn btn-ghost" data-id="${item.id}" data-email="${item.email || ""}" data-username="${item.username || ""}" data-role="${item.role || "admin"}" title="Ubah Profil">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            ${
              item.role !== "superadmin"
                ? `
              <button class="btn-delete-admin btn btn-ghost" data-id="${item.id}" style="color: var(--danger)" title="Hapus Akun">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            `
                : ""
            }
          </div>
        </td>
      </tr>
    `
      )
      .join("");

    document
      .querySelectorAll(".btn-edit-admin")
      .forEach(
        (b) =>
          (b.onclick = () =>
            editAdminItem(b.dataset.id, b.dataset.email, b.dataset.username, b.dataset.role))
      );
    document
      .querySelectorAll(".btn-delete-admin")
      .forEach((b) => (b.onclick = () => deleteAdminItem(b.dataset.id)));
  } else {
    adminTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-dim);">
      ${filter ? "Admin tidak ditemukan" : "Belum ada admin lain"}
    </td></tr>`;
  }
}

adminForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("f-admin-username").value;
  const email = document.getElementById("f-admin-email").value;
  const password = document.getElementById("f-admin-password").value;
  const role = document.getElementById("f-admin-role").value;

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.innerText = "Menyimpan...";
  btn.disabled = true;

  if (isAdminEditing) {
    // Update role
    const { error } = await supabase
      .from("profiles")
      .update({ role, username })
      .eq("id", editingAdminId);
    if (error) showToast(error.message, "error");
    else {
      showToast("Role berhasil diperbarui", "success");
      closeAdminModal();
      fetchAdmins();
    }
  } else {
    // Create new admin via aux client inside function
    const supabaseAux = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "aux_auth_token_" + Date.now(),
      },
    });
    const { data, error } = await supabaseAux.auth.signUp({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("rate limit")) {
        showToast("Batas pendaftaran tercapai. Silakan coba lagi dalam 1 jam (Limit Supabase Free).", "error");
      } else {
        showToast(error.message, "error");
      }
    } else {
      // Role will default to 'admin' from trigger.
      // We update it if the selected role is different from the default.
      if (data.user) {
        // Update both role and username
        setTimeout(async () => {
          await supabase
            .from("profiles")
            .update({ role, username, email }) // Ensure email is also in profiles if needed
            .eq("id", data.user.id);
          fetchAdmins();
        }, 1000);
      }
      showToast("Admin/Member berhasil ditambahkan", "success");
      closeAdminModal();
      fetchAdmins();
    }
  }
  btn.innerText = originalText;
  btn.disabled = false;
});

btnAddAdmin?.addEventListener("click", () => {
  isAdminEditing = false;
  editingAdminId = null;
  modalAdminTitle.innerText = "Tambah Admin Baru";
  adminPasswordGroup.style.display = "block";
  const passwordInput = document.getElementById("f-admin-password");
  if (passwordInput) passwordInput.required = true;
  document.getElementById("f-admin-email").disabled = false;
  adminForm.reset();
  modalAdmin.classList.add("active");
});

function editAdminItem(id, email, username, role) {
  isAdminEditing = true;
  editingAdminId = id;
  modalAdminTitle.innerText = "Ubah Profil Admin";
  document.getElementById("f-admin-username").value = username;
  document.getElementById("f-admin-email").value = email;
  document.getElementById("f-admin-email").disabled = true;
  document.getElementById("f-admin-role").value = role;
  adminPasswordGroup.style.display = "none";
  const passwordInput = document.getElementById("f-admin-password");
  if (passwordInput) passwordInput.required = false;
  modalAdmin.classList.add("active");
}

async function deleteAdminItem(id) {
  idToDelete = id;
  deleteType = "admin";

  if (hardDeleteOption) hardDeleteOption.style.display = "none";

  const title = document.getElementById("delete-modal-title");
  const desc = document.getElementById("delete-modal-desc");

  if (title) title.innerText = "Hapus Admin?";
  if (desc)
    desc.innerText =
      "Akses admin ini akan dicabut dan data profil akan dihapus secara permanen.";

  if (modalDelete) modalDelete.classList.add("active");
}

function closeAdminModal() {
  modalAdmin.classList.remove("active");
  adminForm.reset();
  isAdminEditing = false;
  editingAdminId = null;
}

btnCancelAdmin?.addEventListener("click", closeAdminModal);

// --- MEDIA UPLOAD ---
fileInput?.addEventListener("change", async (e) => {
  const files = e.target.files;
  if (!files.length) return;
  const btn = e.target.nextElementSibling;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Uploading...';
  btn.disabled = true;

  let urls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage
      .from("wisata-media")
      .upload(filePath, file);
    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("wisata-media").getPublicUrl(filePath);
      urls.push(publicUrl);
    }
  }

  if (urls.length > 0) {
    const existing = mediaUrlInput.value.trim();
    const newUrls = existing ? existing + "," + urls.join(",") : urls.join(",");
    mediaUrlInput.value = newUrls;
    updatePreview(newUrls);
    showToast("Slide gambar berhasil diupload", "success");
  } else {
    showToast("Gagal upload slide gambar", "error");
  }
  btn.innerHTML = originalHTML;
  btn.disabled = false;
});

markerFileInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await validateImageDimensions(file);
  const btn = e.target.nextElementSibling;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Uploading...';
  btn.disabled = true;

  const filePath = `markers/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase.storage
    .from("wisata-media")
    .upload(filePath, file);
  if (!error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("wisata-media").getPublicUrl(filePath);
    markerUrlInput.value = publicUrl;
    updateMarkerPreview(publicUrl);
    showToast("Marker berhasil diupload", "success");
  } else {
    showToast("Upload marker gagal: " + error.message, "error");
  }
  btn.innerHTML = originalHTML;
  btn.disabled = false;
});

const videoFileInput = document.getElementById("f-video-file");
const videoUrlInput = document.getElementById("f-video-url");

videoFileInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const MAX_SIZE = 60 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showToast("Ukuran video terlalu besar! Maksimal 60MB.", "error");
    e.target.value = "";
    return;
  }

  const btn = e.target.nextElementSibling;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Uploading...';
  btn.disabled = true;

  const filePath = `videos/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase.storage
    .from("wisata-media")
    .upload(filePath, file);
  if (!error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("wisata-media").getPublicUrl(filePath);
    videoUrlInput.value = publicUrl;
    showToast("Video berhasil diupload", "success");
  } else {
    showToast("Upload video gagal: " + error.message, "error");
  }
  btn.innerHTML = originalHTML;
  btn.disabled = false;
});

function fixStreamingUrl(url) {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/(.+?)\//);
    if (match && match[1]) {
      return `https://drive.google.com/uc?id=${match[1]}&export=media&confirm=t`;
    }
  }
  if (url.includes("dropbox.com")) {
    return url.replace("?dl=0", "?dl=1");
  }
  return url;
}

videoUrlInput?.addEventListener("input", (e) => {
  const originalUrl = e.target.value;
  const fixedUrl = fixStreamingUrl(originalUrl);
  if (fixedUrl !== originalUrl) {
    videoUrlInput.value = fixedUrl;
  }
});

async function editItem(id) {
  const { data, error } = await supabase
    .from("wisata")
    .select("*")
    .eq("id", id)
    .single();
  if (!error) {
    document.getElementById("f-id").value = data.id;
    document.getElementById("f-id").disabled = true;
    document.getElementById("f-nama").value = data.nama;
    document.getElementById("f-type").value = data.type;
    document.getElementById("f-deskripsi").value = data.deskripsi;
    document.getElementById("f-harga").value = data.harga === "Free" ? "Free" : formatRupiah(data.harga || "");
    document.getElementById("f-booking_url").value = data.booking_url || "";
    document.getElementById("f-marker-url").value = data.marker_url || "";
    document.getElementById("f-media-url").value = data.slide_urls || "";
    document.getElementById("f-video-url").value = data.video_url || "";
    
    // 3D Content Fields
    const contentType = data.main_content_type || 'image_slides';
    const radioToSelect = document.querySelector(`input[name="f-main-content-type"][value="${contentType}"]`);
    if (radioToSelect) radioToSelect.checked = true;

    document.getElementById("f-model-url").value = data.model_url || "";
    document.getElementById("f-model-scale").value = data.model_scale || 1.0;
    document.getElementById("f-model-rot-y").value = data.model_rot_y || 0;
    document.getElementById("f-model-pos-y").value = data.model_pos_y || 0;
    document.getElementById("f-model-pos-z").value = data.model_pos_z || 0.0192;

    updateContentModeVisibility();

    // Set dates
    const startDateInput = document.getElementById("f-start-date");
    const endDateInput = document.getElementById("f-end-date");
    startDateInput.value = data.start_date || "";
    endDateInput.value = data.end_date || "";

    // Update Previews
    updatePreview(data.slide_urls || "");
    updateMarkerPreview(data.marker_url || "");
    update3DPreview(data.model_url || "");

    // Toggle date visibility based on type
    const eventDateGroup = document.getElementById("event-date-group");
    if (data.type === 'event') {
        if (eventDateGroup) eventDateGroup.style.display = 'grid';
    } else {
        if (eventDateGroup) eventDateGroup.style.display = 'none';
    }

    updatePreview(data.slide_urls || "");
    updateMarkerPreview(data.marker_url || "");
    update3DPreview(data.model_url || "");

    isEditing = true;
    editingId = id;
    modal.classList.add("active");
    document.getElementById("modal-title").innerText = "Edit Lokasi";
  }
}

async function deleteItem(id) {
  idToDelete = id;
  deleteType = "wisata";

  if (hardDeleteOption) {
    hardDeleteOption.style.display = "flex";
    if (checkHardDelete) checkHardDelete.checked = false;
  }

  const title = document.getElementById("delete-modal-title");
  const desc = document.getElementById("delete-modal-desc");

  if (title) title.innerText = "Hapus Lokasi?";
  if (desc)
    desc.innerText =
      "Data lokasi ini akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan.";

  if (modalDelete) modalDelete.classList.add("active");
}

btnDeleteCancel?.addEventListener("click", () => {
  if (modalDelete) modalDelete.classList.remove("active");
  idToDelete = null;
  deleteType = null;
});

btnDeleteConfirm?.addEventListener("click", async () => {
  if (!idToDelete || !deleteType) return;

  try {
    const btn = btnDeleteConfirm;
    btn.disabled = true;
    btn.innerHTML =
      '<div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Menghapus...';

    // Handle hard delete (Storage cleanup)
    if (deleteType === "wisata" && checkHardDelete?.checked) {
      const { data: item } = await supabase
        .from("wisata")
        .select("slide_urls, marker_url, video_url, model_url")
        .eq("id", idToDelete)
        .single();

      if (item) {
        const filesToDelete = [];
        const getPathFromUrl = (url) => {
          if (!url) return null;
          try {
            // Extracts path after '/wisata-media/'
            const parts = url.split("/wisata-media/");
            return parts.length > 1 ? parts[1] : null;
          } catch (e) {
            return null;
          }
        };

        if (item.marker_url) {
          const path = getPathFromUrl(item.marker_url);
          if (path) filesToDelete.push(path);
        }
        if (item.video_url) {
          const path = getPathFromUrl(item.video_url);
          if (path) filesToDelete.push(path);
        }
        if (item.model_url) {
          const path = getPathFromUrl(item.model_url);
          if (path) filesToDelete.push(path);
        }
        if (item.slide_urls) {
          const urls = item.slide_urls.split(",").map((u) => u.trim());
          urls.forEach((u) => {
            const path = getPathFromUrl(u);
            if (path) filesToDelete.push(path);
          });
        }

        if (filesToDelete.length > 0) {
          await supabase.storage.from("wisata-media").remove(filesToDelete);
        }
      }
    }

    let error;
    if (deleteType === "wisata") {
      const res = await supabase.from("wisata").delete().eq("id", idToDelete);
      error = res.error;
    } else {
      // Menghapus user secara total dari auth.users dan profiles via SQL Function (RPC)
      const res = await supabase.rpc('delete_user_completely', { user_id: idToDelete });
      error = res.error;
    }

    if (!error) {
      showToast(
        deleteType === "wisata"
          ? "Lokasi berhasil dihapus permanen"
          : "Akses admin dicabut",
        "success",
      );
      if (deleteType === "wisata") fetchData();
      else fetchAdmins();
    } else {
      throw error;
    }
  } catch (error) {
    console.error("Delete error:", error);
    showToast("Gagal menghapus: " + error.message, "error");
  } finally {
    const btn = btnDeleteConfirm;
    btn.disabled = false;
    btn.innerText = "Hapus";
    if (modalDelete) modalDelete.classList.remove("active");
    idToDelete = null;
    deleteType = null;
  }
});

btnAdd?.addEventListener("click", () => {
  modal.classList.add("active");
  document.getElementById("modal-title").innerText = "Tambah Lokasi Baru";
});

function closeModal() {
  modal.classList.remove("active");
  form.reset();
  const eventDateGroup = document.getElementById("event-date-group");
  if (eventDateGroup) eventDateGroup.style.display = 'none';
  updatePreview("");
  updateMarkerPreview("");
  update3DPreview("");

  isEditing = false;
  editingId = null;
  document.getElementById("f-id").disabled = false;
  updateContentModeVisibility();
}

btnCancel?.addEventListener("click", closeModal);
// --- UTILITIES ---
// --- 3D CONTENT TOGGLE ---
function updateContentModeVisibility() {
  const selectedMode = document.querySelector('input[name="f-main-content-type"]:checked')?.value;
  if (selectedMode === '3d_model') {
    sectionSlides.style.display = 'none';
    section3D.style.display = 'block';
  } else {
    sectionSlides.style.display = 'block';
    section3D.style.display = 'none';
  }
}

// Event listeners for radio buttons
document.querySelectorAll('input[name="f-main-content-type"]').forEach(radio => {
  radio.addEventListener('change', updateContentModeVisibility);
});

// GLB Upload
modelFileInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const btn = e.target.nextElementSibling;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Uploading...';
  btn.disabled = true;

  const filePath = `models/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase.storage
    .from("wisata-media")
    .upload(filePath, file);
    
  if (!error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("wisata-media").getPublicUrl(filePath);
    modelUrlInput.value = publicUrl;
    update3DPreview(publicUrl);
    showToast("Model 3D (.glb) berhasil diupload", "success");

  } else {
    showToast("Gagal upload model 3D: " + error.message, "error");
  }
  btn.innerHTML = originalHTML;
  btn.disabled = false;
});

// Real-time 3D Preview Listeners
const transformInputs = ['f-model-scale', 'f-model-rot-y', 'f-model-pos-y', 'f-model-pos-z'];
transformInputs.forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    const mv = modelPreviewBox?.querySelector('model-viewer');
    if (mv) {
      const scale = document.getElementById('f-model-scale').value || "1.0";
      const rotY = document.getElementById('f-model-rot-y').value || "0";
      // We only map scale to model-viewer for visual feedback
      // Position is harder to map directly as it depends on the scene
      mv.setAttribute('scale', `${scale} ${scale} ${scale}`);
      mv.setAttribute('orientation', `0deg ${rotY}deg 0deg`);
    }
  });
});

function reset3DTransform() {
  document.getElementById('f-model-scale').value = 1.0;
  document.getElementById('f-model-rot-y').value = 0;
  document.getElementById('f-model-pos-y').value = 0;
  document.getElementById('f-model-pos-z').value = 0.0192;
  
  // Trigger update
  const mv = modelPreviewBox?.querySelector('model-viewer');
  if (mv) {
    mv.setAttribute('scale', "1 1 1");
    mv.setAttribute('orientation', "0deg 0deg 0deg");
  }
  showToast("Transformasi direset ke default", "info");
}

window.reset3DTransform = reset3DTransform; // Make it global for onclick

// --- HELPERS ---
function formatRupiah(angka, prefix) {
  if (angka === "0" || angka === 0 || angka === "Free") return "Free";
  if (!angka) return "Rp 0";
  const number_string = angka.toString().replace(/[^,\d]/g, "");
  const split = number_string.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
  return prefix == undefined ? "Rp " + rupiah : prefix + rupiah;
}

function parseRupiah(formatted) {
  if (!formatted) return 0;
  return parseInt(formatted.replace(/[^0-9]/g, "")) || 0;
}

// Auto-formatting for Harga input
hargaInput?.addEventListener("input", (e) => {
  const rawValue = e.target.value.replace(/[^0-9]/g, "");
  if (rawValue) {
    const formatted = parseInt(rawValue).toLocaleString("id-ID");
    e.target.value = formatted;
  }
});

const typeInput = document.getElementById("f-type");
typeInput?.addEventListener("change", (e) => {
  const eventDateGroup = document.getElementById("event-date-group");
  if (eventDateGroup) {
    if (e.target.value === "event") {
      eventDateGroup.style.display = "grid";
    } else {
      eventDateGroup.style.display = "none";
    }
  }
});

// Admin search listener
searchAdminsInput?.addEventListener("input", (e) => {
  renderAdmins(e.target.value);
});

supabase.auth.onAuthStateChange((_event, session) => {
  handleAuthState(session);
});

// Initial check
supabase.auth.getSession().then((res) => {
  handleAuthState(res.data?.session);
});

// --- CANVA MODAL LOGIC ---
const modalCanva = document.getElementById('modal-canva');
const btnEditCanva = document.getElementById('btn-edit-canva');
const canvaForm = document.getElementById('canva-form');

btnEditCanva?.addEventListener('click', () => {
    modalCanva.classList.add('active');
});

canvaForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newCanvaUrl = document.getElementById('f-canva-url').value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.innerText = "Saving...";

    const { error } = await supabase
        .from('app_settings')
        .update({ canva_template_url: newCanvaUrl })
        .eq('id', 'current_config');

    if (error) {
        showToast("Gagal menyimpan link: " + error.message, "error");
    } else {
        showToast("Link Canva berhasil diperbarui!", "success");
        modalCanva.classList.remove('active');
        fetchAppSettings(); // Refresh UI
    }
    btn.disabled = false;
    btn.innerText = "Simpan Link";
});


// --- ABOUT TABS LOGIC ---
const aboutTabs = document.querySelectorAll('.about-tab');
const aboutTabContents = document.querySelectorAll('.about-tab-content');

aboutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        
        // Update tabs active state
        aboutTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show/Hide contents
        aboutTabContents.forEach(content => {
            content.style.display = 'none';
            if (content.id === `tab-${target}`) {
                content.style.display = 'block';
            }
        });
    });
});


// --- TOOLTIP INTERACTION ---
document.addEventListener("click", (e) => {
  const infoContainer = e.target.closest(".info-icon-container");

  // Close all other active tooltips if any
  document.querySelectorAll(".info-icon-container.active").forEach((container) => {
    if (container !== infoContainer) {
      container.classList.remove("active");
    }
  });

  if (infoContainer) {
    infoContainer.classList.toggle("active");
  }
});

// --- MOBILE SIDEBAR TOGGLE ---
const mobileToggle = document.getElementById('mobile-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
  sidebar.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
}

mobileToggle?.addEventListener('click', toggleSidebar);
sidebarClose?.addEventListener('click', toggleSidebar);
sidebarOverlay?.addEventListener('click', toggleSidebar);


// Close sidebar when nav item is clicked (on mobile)
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    }
  });
});

// --- QR GENERATOR TOOL ---
const qrInput = document.getElementById('qr-input');
const qrResult = document.getElementById('qr-result');
const btnGenerateQr = document.getElementById('btn-generate-qr');
const btnDownloadQr = document.getElementById('btn-download-qr');

btnGenerateQr?.addEventListener('click', () => {
    const url = qrInput.value.trim();
    if (!url) {
        showToast('Masukkan URL terlebih dahulu', 'error');
        return;
    }
    
    // Using QR Server API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
    qrResult.src = qrUrl;
    showToast('QR Code diperbarui!', 'success');
});

btnDownloadQr?.addEventListener('click', async () => {
    const url = qrResult.src;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'jawita-ar-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Gagal mendownload QR', 'error');
    }
});
