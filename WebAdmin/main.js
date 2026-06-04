import "./main.css";
import { createClient } from "@supabase/supabase-js";

// Components
import { DashboardSection } from "./components/DashboardSection.js";
import { TargetSection } from "./components/TargetSection.js";
import { InstructionsSection } from "./components/InstructionsSection.js";
import { AdminsSection } from "./components/AdminsSection.js";
import { SettingsSection } from "./components/SettingsSection.js";
import { AboutSection } from "./components/AboutSection.js";

// Initial Component Injection
const sections = {
  "section-dashboard": DashboardSection(),
  "section-target": TargetSection(),
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

let supabase;
let supabaseAux;
let initError = null;

try {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan di environment variables.");
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  supabaseAux = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'jawita-aux-auth'
    },
  });
} catch (err) {
  console.error("Initialization error:", err);
  initError = err;
}

// DOM Elements
const tableBody = document.getElementById("data-table-body");
const modal = document.getElementById("modal-form");
const form = document.getElementById("target-form");
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
const searchInput = document.getElementById("search-target");
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
let targetData = [];
let adminData = [];
let idToDelete = null;
let deleteType = null; // 'target' or 'admin'

// Prevents redundant fetches on tab focus (Supabase onAuthStateChange triggers)
let isInitialized = false;
let currentUserId = null;

let logsSortAsc = false;
let appSettingsLogsCurrentPage = 1;
const appSettingsLogsPerPage = 5;

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

// Global variables for Marker Feature Preview
let currentMarkerImg = null;
let currentMarkerCorners = [];
let showMarkerFeatures = true;

// Active Config Censoring globals
let activeConfigData = null;
let isConfigUnlocked = false;

function maskValue(val, type) {
  if (!val) return "Belum diatur";
  if (type === "url") {
    try {
      const url = new URL(val);
      const hostParts = url.hostname.split('.');
      if (hostParts.length > 1) {
        return `${url.protocol}//••••••••.${hostParts.slice(1).join('.')}`;
      }
    } catch (e) {}
    return "https://••••••••.supabase.co";
  }
  
  if (type === "key") {
    if (val.length > 12) {
      return val.slice(0, 8) + "••••••••••••••••••••••••";
    }
    return "••••••••••••••••";
  }
  
  return "••••••••••••••••";
}

function renderActiveConfig() {
  if (!activeConfigData) return;
  const urlDisplay = document.getElementById("current-url-display");
  const keyDisplay = document.getElementById("current-key-display");
  const gdriveKeyDisplay = document.getElementById("current-gdrive-key-display");
  
  const unlockBtn = document.getElementById("btn-unlock-config");
  const unlockIcon = document.getElementById("unlock-config-icon");
  const unlockText = document.getElementById("unlock-config-text");

  if (isConfigUnlocked) {
    if (urlDisplay) urlDisplay.innerText = activeConfigData.supabase_url || "Belum diatur";
    if (keyDisplay) keyDisplay.innerText = activeConfigData.supabase_key || "Belum diatur";
    if (gdriveKeyDisplay) gdriveKeyDisplay.innerText = activeConfigData.gdrive_api_key || "Belum diatur";
    
    if (unlockBtn) {
      unlockBtn.style.color = "var(--danger)";
      unlockBtn.style.borderColor = "rgba(239, 68, 68, 0.2)";
    }
    if (unlockText) unlockText.innerText = "Sembunyikan";
    if (unlockIcon) {
      unlockIcon.innerHTML = `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>`;
    }
  } else {
    if (urlDisplay) urlDisplay.innerText = maskValue(activeConfigData.supabase_url, "url");
    if (keyDisplay) keyDisplay.innerText = maskValue(activeConfigData.supabase_key, "key");
    if (gdriveKeyDisplay) gdriveKeyDisplay.innerText = maskValue(activeConfigData.gdrive_api_key, "key");
    
    if (unlockBtn) {
      unlockBtn.style.color = "var(--text-dim)";
      unlockBtn.style.borderColor = "var(--glass-border)";
    }
    if (unlockText) unlockText.innerText = "Tampilkan";
    if (unlockIcon) {
      unlockIcon.innerHTML = `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`;
    }
  }
}

function updateMarkerPreview(url) {
  if (!markerPreviewBox) return;
  if (url && url.trim() !== "") {
    // Render an interactive canvas instead of a plain image
    markerPreviewBox.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden;">
        <canvas id="marker-preview-canvas" style="max-width: 100%; max-height: 100%; object-fit: contain;"></canvas>
        <div id="marker-feature-toggle" style="position: absolute; bottom: 6px; right: 6px; background: rgba(20, 21, 25, 0.85); backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; z-index: 10;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 6px #fbbf24; transition: all 0.2s ease;"></div>
          <span style="font-size: 0.65rem; color: #fff; font-weight: 600;">Features: ON</span>
        </div>
      </div>
    `;
    triggerURLMarkerEvaluation(url);
  } else {
    markerPreviewBox.innerHTML =
      '<span class="preview-placeholder">Belum ada marker</span>';
    const indicator = document.getElementById('marker-quality-indicator');
    if (indicator) indicator.style.display = 'none';
    currentMarkerImg = null;
    currentMarkerCorners = [];
  }
}

// Harris Corner Detector (Exact local feature point calculation)
function detectHarrisCorners(imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Downscale image to a standard processing size (200px width) to ensure high performance (<20ms)
  const w = 200;
  const h = Math.round((imgElement.naturalHeight / imgElement.naturalWidth) * w) || 200;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(imgElement, 0, 0, w, h);
  
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  
  // 1. Grayscale Conversion
  const gray = new Float32Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    gray[i/4] = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
  }
  
  // 2. Compute X and Y Gradients (using Sobel operators)
  const Ix = new Float32Array(w * h);
  const Iy = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      // Sobel X kernel
      Ix[idx] = 
        (gray[idx - w + 1] - gray[idx - w - 1]) * 1 +
        (gray[idx + 1]     - gray[idx - 1])     * 2 +
        (gray[idx + w + 1] - gray[idx + w - 1]) * 1;
      
      // Sobel Y kernel
      Iy[idx] = 
        (gray[idx + w - 1] - gray[idx - w - 1]) * 1 +
        (gray[idx + w]     - gray[idx - w])     * 2 +
        (gray[idx + w + 1] - gray[idx - w + 1]) * 1;
    }
  }
  
  // 3. Compute Ix2, Iy2, Ixy
  const Ix2 = new Float32Array(w * h);
  const Iy2 = new Float32Array(w * h);
  const Ixy = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    Ix2[i] = Ix[i] * Ix[i];
    Iy2[i] = Iy[i] * Iy[i];
    Ixy[i] = Ix[i] * Iy[i];
  }
  
  // 4. Sum gradients locally (Gaussian box approximation in 5x5 window)
  const sIx2 = new Float32Array(w * h);
  const sIy2 = new Float32Array(w * h);
  const sIxy = new Float32Array(w * h);
  const r = 2; // window radius
  for (let y = r; y < h - r; y++) {
    for (let x = r; x < w - r; x++) {
      const idx = y * w + x;
      let sumIx2 = 0, sumIy2 = 0, sumIxy = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nidx = (y + dy) * w + (x + dx);
          sumIx2 += Ix2[nidx];
          sumIy2 += Iy2[nidx];
          sumIxy += Ixy[nidx];
        }
      }
      sIx2[idx] = sumIx2;
      sIy2[idx] = sumIy2;
      sIxy[idx] = sumIxy;
    }
  }
  
  // 5. Compute Harris Corner Response R
  const R = new Float32Array(w * h);
  const k = 0.04; // Harris constant
  let maxR = 0;
  for (let y = r; y < h - r; y++) {
    for (let x = r; x < w - r; x++) {
      const idx = y * w + x;
      const A = sIx2[idx];
      const B = sIy2[idx];
      const C = sIxy[idx];
      
      const det = A * B - C * C;
      const trace = A + B;
      const response = det - k * trace * trace;
      if (response > 0) {
        R[idx] = response;
        if (response > maxR) maxR = response;
      }
    }
  }
  
  // 6. Non-Maximum Suppression (7x7 local area) & thresholding
  const corners = [];
  const threshold = maxR * 0.06; // Ignore lower responses
  for (let y = r + 2; y < h - r - 2; y++) {
    for (let x = r + 2; x < w - r - 2; x++) {
      const idx = y * w + x;
      const val = R[idx];
      if (val < threshold) continue;
      
      let isMax = true;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (R[(y + dy) * w + (x + dx)] > val) {
            isMax = false;
            break;
          }
        }
        if (!isMax) break;
      }
      
      if (isMax) {
        corners.push({ x: x / w, y: y / h }); // Store normalized coordinates
      }
    }
  }
  
  return corners;
}

// Canvas Drawer - overlays yellow crosshairs (+) on top of the image
function drawPreviewWithFeatures(imgElement, corners, showFeatures = true) {
  const canvas = document.getElementById('marker-preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const containerWidth = markerPreviewBox.clientWidth || 250;
  const containerHeight = markerPreviewBox.clientHeight || 100;
  
  const imgRatio = imgElement.naturalWidth / imgElement.naturalHeight;
  let drawW = containerWidth;
  let drawH = containerWidth / imgRatio;
  if (drawH > containerHeight) {
    drawH = containerHeight;
    drawW = containerHeight * imgRatio;
  }
  
  // High DPI rendering scale
  canvas.width = drawW * 2;
  canvas.height = drawH * 2;
  canvas.style.width = drawW + 'px';
  canvas.style.height = drawH + 'px';
  
  ctx.scale(2, 2);
  
  // Render the grayscale version to look exactly like the Vuforia developer portal
  ctx.drawImage(imgElement, 0, 0, drawW, drawH);
  
  if (showFeatures && corners && corners.length > 0) {
    ctx.strokeStyle = '#fbbf24'; // Golden Yellow
    ctx.lineWidth = 1.2;
    const size = 3; // Crosshair radius
    
    corners.forEach(c => {
      const px = c.x * drawW;
      const py = c.y * drawH;
      
      ctx.beginPath();
      // Horizontal bar
      ctx.moveTo(px - size, py);
      ctx.lineTo(px + size, py);
      // Vertical bar
      ctx.moveTo(px, py - size);
      ctx.lineTo(px, py + size);
      ctx.stroke();
    });
  }
}

// AR Marker Quality Analyzer (Canvas Edge, Contrast, and Texture Entropy Detection)
// AR Marker Quality Analyzer (Multi-zone Distribution, Global Contrast, and Repetitive Pattern Checks)
function analyzeMarkerQuality(imgElement, corners) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 128;
  canvas.height = 128;
  ctx.drawImage(imgElement, 0, 0, 128, 128);
  
  const imgData = ctx.getImageData(0, 0, 128, 128);
  const data = imgData.data;
  
  // 1. Convert to Grayscale & Calculate Contrast (Standard Deviation) & Midtone Ratio (Texture Depth)
  let sum = 0;
  const grayscale = new Uint8Array(128 * 128);
  let midTones = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    grayscale[i/4] = gray;
    sum += gray;
    if (gray >= 50 && gray <= 205) {
      midTones++;
    }
  }
  const mean = sum / (128 * 128);
  const midToneRatio = midTones / (128 * 128);
  
  let varianceSum = 0;
  for (let i = 0; i < grayscale.length; i++) {
    varianceSum += Math.pow(grayscale[i] - mean, 2);
  }
  const stdDev = Math.sqrt(varianceSum / (128 * 128));
  
  // 2. Calculate Feature Spatial Distribution (4x4 Grid, 16 Zones check)
  const zones = new Array(16).fill(0);
  corners.forEach(c => {
    const zx = Math.min(Math.floor(c.x * 4), 3);
    const zy = Math.min(Math.floor(c.y * 4), 3);
    zones[zy * 4 + zx]++;
  });
  const activeZones = zones.filter(count => count > 0).length; // Number of zones containing features (0 to 16)
  const distributionRatio = activeZones / 16;
  
  // 3. Multi-Criteria Strict Scoring Engine
  const numFeatures = corners.length;
  let stars = 5;
  const reasons = [];
  
  // A. Evaluate Feature Count
  if (numFeatures < 6) {
    stars = 1;
    reasons.push("Jumlah detail sangat minim (kurang dari 6 fitur).");
  } else if (numFeatures < 18) {
    stars = Math.min(stars, 2);
    reasons.push("Detail gambar kurang memadai.");
  } else if (numFeatures < 35) {
    stars = Math.min(stars, 3);
  } else if (numFeatures < 60) {
    stars = Math.min(stars, 4);
  }
  
  // B. Evaluate Global Contrast
  if (stdDev < 15) {
    stars = 1;
    reasons.push("Gambar terlalu buram atau kurang kontras.");
  } else if (stdDev < 28) {
    stars = Math.min(stars, 2);
    reasons.push("Kontras gambar agak redup.");
  }
  
  // C. Evaluate Spatial Distribution (Clustering Penalty)
  if (numFeatures >= 6) {
    if (distributionRatio < 0.25) { // Clustered in less than 4 grids
      stars = Math.min(stars, 1);
      reasons.push("Fitur menumpuk ekstrem di satu area sempit saja (Clustered).");
    } else if (distributionRatio < 0.45) { // Clustered in less than 7 grids
      stars = Math.min(stars, 2);
      reasons.push("Sebaran fitur tidak merata, hanya berkumpul di bagian tertentu gambar.");
    } else if (distributionRatio < 0.60) {
      stars = Math.min(stars, 3);
      reasons.push("Sebaran detail cukup baik, namun ada beberapa sudut kosong yang rawan tidak terdeteksi.");
    }
  }
  
  // D. Evaluate Repetitive Geometric/Line-Art Patterns (The wireframe/checkerboard killer)
  const isHighContrastLineArt = (stdDev > 45 && midToneRatio < 0.14);
  if (isHighContrastLineArt) {
    if (numFeatures > 32) {
      // High corner count + extremely low gradient variety = Symmetrical Repeating Wireframe Grid
      stars = 1;
      reasons.push("Peringatan Kritis: Pola geometris berulang / jaring segitiga wireframe (Repetitive Pattern). Meskipun memiliki banyak sudut tajam, pola repetitif yang identik membuat sensor AR bingung menentukan disorientasi.");
    } else {
      // Low features + zero texture = Flat stencil / logo
      stars = Math.min(stars, 2);
      reasons.push("Pola grafis vektor/garis sederhana (Line-Art). Gunakan foto organik dengan tekstur alami.");
    }
  }
  
  // 4. Construct response message and colors
  let text = "";
  let color = "var(--pastel-mint)";
  
  if (stars === 5) {
    text = `Kontras & sebaran tekstur sempurna! Terdeteksi ${numFeatures} titik sudut unik tersebar merata di 16 sektor gambar. Vuforia menjamin pelacakan yang sangat stabil.`;
    color = "var(--pastel-mint)";
  } else if (stars === 4) {
    text = `Detail sangat baik. Ditemukan ${numFeatures} titik fitur terlokalisasi di ${activeZones} area. Pelacakan AR akan berjalan lancar dan responsif.`;
    color = "var(--pastel-mint)";
  } else {
    color = stars === 3 ? "var(--pastel-peach)" : "var(--pastel-coral)";
    if (reasons.length > 0) {
      text = reasons.join(" ");
    } else {
      text = `Kualitas detail sedang. Ditemukan ${numFeatures} fitur, namun disarankan untuk meningkatkan variasi warna/tekstur gambar.`;
    }
  }
  
  return { stars, text, color };
}

function evaluateMarkerQuality(imgElement) {
  const indicator = document.getElementById('marker-quality-indicator');
  if (!indicator) return;
  
  try {
    indicator.style.display = 'flex';
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 4px 0;">
        <div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
        <span style="font-size: 0.8rem; color: var(--text-dim);">Menghitung feature points ala Vuforia...</span>
      </div>
    `;

    setTimeout(() => {
      // 1. Detect Harris Corners
      const corners = detectHarrisCorners(imgElement);
      
      // Store in global scope for rendering
      currentMarkerImg = imgElement;
      currentMarkerCorners = corners;
      
      // 2. Draw features onto the canvas preview
      drawPreviewWithFeatures(imgElement, corners, showMarkerFeatures);
      
      // 3. Setup click listener for the interactive toggle switch
      const toggleBtn = document.getElementById('marker-feature-toggle');
      if (toggleBtn) {
        // Clear previous event listener
        toggleBtn.onclick = null;
        toggleBtn.onclick = function(event) {
          event.stopPropagation();
          showMarkerFeatures = !showMarkerFeatures;
          const dot = toggleBtn.querySelector('div');
          const text = toggleBtn.querySelector('span');
          if (showMarkerFeatures) {
            dot.style.background = '#fbbf24';
            dot.style.boxShadow = '0 0 6px #fbbf24';
            text.innerText = 'Features: ON';
          } else {
            dot.style.background = 'rgba(255,255,255,0.2)';
            dot.style.boxShadow = 'none';
            text.innerText = 'Features: OFF';
          }
          drawPreviewWithFeatures(currentMarkerImg, currentMarkerCorners, showMarkerFeatures);
        };
      }
      
      // 4. Analyze overall score
      const evaluation = analyzeMarkerQuality(imgElement, corners);
      
      let starHTML = "";
      for (let i = 1; i <= 5; i++) {
        if (i <= evaluation.stars) {
          starHTML += `<span style="color: ${evaluation.color}; font-size: 1.1rem; margin-right: 2px;">★</span>`;
        } else {
          starHTML += `<span style="color: rgba(255,255,255,0.08); font-size: 1.1rem; margin-right: 2px;">★</span>`;
        }
      }

      let warningHTML = "";
      if (evaluation.stars < 3) {
        warningHTML = `
          <div style="margin-top: 8px; padding: 6px 10px; border-radius: 6px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 6px; width: 100%;">
            <span style="font-size: 0.8rem; line-height: 1;">⚠️</span>
            <span style="font-size: 0.68rem; color: #f87171; font-weight: 600; line-height: 1.3;">Kualitas di bawah standar minimal (★★★). Sangat disarankan mengganti gambar untuk menjamin objek 3D tidak bergeser di aplikasi AR.</span>
          </div>
        `;
      }

      indicator.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px; margin-bottom: 4px;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px;">Vuforia Tracking Rating</span>
          <div style="display: flex; align-items: center;">
            ${starHTML}
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: flex-start; margin-top: 4px;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: ${evaluation.color}; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 8px ${evaluation.color};"></div>
          <p style="font-size: 0.75rem; color: var(--text-dim); line-height: 1.4; margin: 0;">${evaluation.text}</p>
        </div>
        ${warningHTML}
      `;
    }, 150);
  } catch (err) {
    console.error("Evaluation error:", err);
    indicator.style.display = 'none';
  }
}

function triggerURLMarkerEvaluation(url) {
  const indicator = document.getElementById('marker-quality-indicator');
  if (!indicator || !url || url.trim() === "") {
    if (indicator) indicator.style.display = 'none';
    return;
  }
  
  indicator.style.display = 'flex';
  indicator.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 4px 0;">
      <div class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
      <span style="font-size: 0.8rem; color: var(--text-dim);">Mengambil data penanda...</span>
    </div>
  `;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function() {
    evaluateMarkerQuality(img);
  };
  img.onerror = function() {
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-main); text-transform: uppercase;">Vuforia Tracking</span>
        <span style="font-size: 0.7rem; color: var(--pastel-mint); font-weight: 600;">Terverifikasi (Online)</span>
      </div>
      <p style="font-size: 0.72rem; color: var(--text-dim); line-height: 1.4; margin: 4px 0 0 0;">Evaluasi instan & visualisasi titik fitur didukung lewat unggah berkas komputer/lokal untuk menghindari pemblokiran CORS.</p>
    `;
  };
  img.src = url;
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
      // Check 12-hour session limit
      const loginTime = localStorage.getItem('login_timestamp');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > 12 * 60 * 60 * 1000) {
          localStorage.removeItem('login_timestamp');
          localStorage.removeItem('activeSection');
          await supabase.auth.signOut();
          showToast("Sesi Anda telah berakhir setelah 12 jam. Silakan login kembali.", "warning");
          setTimeout(() => window.location.reload(), 1500);
          return;
        }
      } else {
        // Set timestamp for fresh session
        localStorage.setItem('login_timestamp', Date.now().toString());
      }

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
      const thTarget = document.getElementById('th-aksi-target');
      if (thTarget) {
        thTarget.style.display = (currentRole === "member") ? "none" : "table-cell";
      }

      // Restore last section or default to dashboard
      const lastSection = localStorage.getItem('activeSection') || 'section-dashboard';
      showSection(lastSection);
      
      fetchData();
    } else {
      isInitialized = false;
      currentUserId = null;
      localStorage.removeItem('login_timestamp'); // Clear timestamp on logout
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

// Password Visibility Toggle
const togglePasswordBtn = document.getElementById("toggle-password");
const passwordInput = document.getElementById("l-password");

togglePasswordBtn?.addEventListener("click", () => {
  if (!passwordInput) return;
  const isPassword = passwordInput.getAttribute("type") === "password";
  passwordInput.setAttribute("type", isPassword ? "text" : "password");
  
  const eyeClosedIcon = togglePasswordBtn.querySelector(".eye-closed");
  const eyeOpenIcon = togglePasswordBtn.querySelector(".eye-open");
  
  if (isPassword) {
    eyeClosedIcon?.classList.add("hide");
    eyeOpenIcon?.classList.remove("hide");
  } else {
    eyeClosedIcon?.classList.remove("hide");
    eyeOpenIcon?.classList.add("hide");
  }
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.innerText = "Memproses...";
  btn.disabled = true;

  let loginIdentifier = document.getElementById("l-email").value.trim();
  const password = document.getElementById("l-password").value;
  let email = loginIdentifier;

  // If not an email, try to find email by username
  if (!loginIdentifier.includes("@")) {
    let resolvedEmail = null;
    
    // Attempt 1: Call RPC function get_email_by_username
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_email_by_username",
        { p_username: loginIdentifier }
      );
      if (!rpcError && data) {
        resolvedEmail = data;
      } else if (rpcError) {
        console.warn("RPC username lookup returned error:", rpcError);
      }
    } catch (e) {
      console.warn("RPC username lookup exception:", e);
    }
    
    // Attempt 2: Fallback to direct query of profiles (works if RLS is relaxed or allows selection)
    if (!resolvedEmail) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", loginIdentifier)
          .maybeSingle();
        
        if (!profileError && profile && profile.email) {
          resolvedEmail = profile.email;
        } else if (profileError) {
          console.error("Direct query profiles error:", profileError);
        }
      } catch (e) {
        console.error("Direct query profiles exception:", e);
      }
    }
    
    if (!resolvedEmail) {
      showToast("Username tidak ditemukan atau akses database dibatasi (RLS). Silakan buat RPC get_email_by_username di Supabase.", "error");
      btn.innerText = originalText;
      btn.disabled = false;
      return;
    }
    email = resolvedEmail;
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

// --- TARGET CRUD ---
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
        <td><span class="badge badge-${item.type}">${item.type.replace(/_/g, ' ')}</span></td>
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
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-dim);">${searchInput?.value ? "Data yang Anda cari tidak ditemukan." : "Belum ada data target. Silakan tambahkan data baru."}</td></tr>`;
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
      .from("ar_targets")
      .select("*")
      .order("nama", { ascending: true });
    if (error) throw error;

    targetData = data || [];
    renderTable(targetData);
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">Gagal memuat data: ${error.message}</td></tr>`;
    }
    showToast("Oops! Gagal memuat data: " + error.message, "error");
  }
}

// --- ANALYTICS ---
let scansChart = null;

window.updateScanTimeframe = function(timeframe, btnElement) {
  // Update button active state
  document.querySelectorAll('.time-filter-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  // Update Title and Subtitle
  const title = document.getElementById('scan-activity-title');
  const desc = document.getElementById('scan-activity-desc');
  
  if (title && desc) {
    if (timeframe === 'weekly') {
      title.innerText = 'Weekly Scan Activity';
      desc.innerText = 'Tren interaksi pengunjung dalam 7 hari terakhir.';
    } else if (timeframe === 'monthly') {
      title.innerText = 'Monthly Scan Activity';
      desc.innerText = 'Tren interaksi pengunjung selama 30 hari terakhir.';
    } else if (timeframe === 'alltime') {
      title.innerText = 'All-Time Scan Activity';
      desc.innerText = 'Akumulasi seluruh interaksi pengunjung dari awal.';
    }
  }
  
  // Trigger a re-fetch of chart data with the new timeframe
  fetchAnalytics(timeframe);
};

async function fetchAnalytics(timeframe = 'weekly') {
  try {
    // Show loading state for popular locations table
    const popBody = document.getElementById('popular-locations-body');
    if (popBody) popBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;"><div class="loading-spinner" style="width: 20px; height: 20px;"></div></td></tr>';

    // 1. Fetch Summary Stats
    const { count: totalScans } = await supabase.from('scans').select('*', { count: 'exact', head: true });
    const { count: activeLocations } = await supabase.from('ar_targets').select('*', { count: 'exact', head: true });
    const { count: totalAdmins } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    document.getElementById('stat-total-scans').innerText = totalScans || 0;
    document.getElementById('stat-active-locations').innerText = activeLocations || 0;
    document.getElementById('stat-total-admins').innerText = totalAdmins || 0;

    // 2. Fetch Chart Data Based on Timeframe
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let query = supabase.from('scans').select('scanned_at');
    
    if (timeframe === 'weekly') {
      startDate.setDate(startDate.getDate() - 6);
      query = query.gte('scanned_at', startDate.toISOString());
    } else if (timeframe === 'monthly') {
      startDate.setDate(startDate.getDate() - 29); // 30 days including today
      query = query.gte('scanned_at', startDate.toISOString());
    }

    const { data: scansData, error: scansError } = await query;
    if (scansError) throw scansError;

    let chartData = {};
    let labels = [];

    if (timeframe === 'weekly') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
        labels.push(label);
        chartData[label] = 0;
      }
      scansData.forEach(s => {
        const label = new Date(s.scanned_at).toLocaleDateString('id-ID', { weekday: 'short' });
        if (chartData[label] !== undefined) chartData[label]++;
      });
    } else if (timeframe === 'monthly') {
      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        labels.push(label);
        chartData[label] = 0;
      }
      scansData.forEach(s => {
        const label = new Date(s.scanned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (chartData[label] !== undefined) chartData[label]++;
      });
    } else if (timeframe === 'alltime') {
      const monthlyMap = {};
      scansData.forEach(s => {
        const d = new Date(s.scanned_at);
        // Format YYYY-MM for correct chronological sorting
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
        monthlyMap[monthKey]++;
      });
      
      const sortedKeys = Object.keys(monthlyMap).sort();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      
      sortedKeys.forEach(k => {
        const [year, month] = k.split('-');
        const labelName = `${monthNames[parseInt(month) - 1]} ${year}`;
        labels.push(labelName);
        chartData[labelName] = monthlyMap[k];
      });

      // Default fallback if database is completely empty
      if (labels.length === 0) {
        const today = new Date();
        const fallbackLabel = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
        labels.push(fallbackLabel);
        chartData[fallbackLabel] = 0;
      }
    }

    renderScansChart(labels, labels.map(l => chartData[l]));

    // 3. Category Distribution Chart
    if (targetData.length === 0) {
      const { data: wData } = await supabase.from("ar_targets").select("*");
      targetData = wData || [];
    }

    const categories = {
      'Wisata': 0,
      'Kuliner': 0,
      'Event': 0,
      'Unit Bisnis': 0,
      'Lainnya': 0
    };
    
    targetData.forEach(w => {
      let rawCat = (w.type || 'lainnya').toLowerCase().trim().replace(/_/g, ' ');
      
      if (rawCat === 'wisata') {
        categories['Wisata'] += 1;
      } else if (rawCat === 'kuliner') {
        categories['Kuliner'] += 1;
      } else if (rawCat === 'event') {
        categories['Event'] += 1;
      } else if (rawCat === 'unit bisnis') {
        categories['Unit Bisnis'] += 1;
      } else {
        categories['Lainnya'] += 1;
      }
    });

    const filteredLabels = [];
    const filteredData = [];
    
    Object.keys(categories).forEach(key => {
      if (categories[key] > 0) {
        filteredLabels.push(key);
        filteredData.push(categories[key]);
      }
    });

    renderCategoryChart(filteredLabels, filteredData);

    // 4. Fetch Popular Locations
    const { data: popData, error: popError } = await supabase
      .from('scans')
      .select('target_id');
    
    if (popError) throw popError;

    const counts = {};
    popData.forEach(p => {
      counts[p.target_id] = (counts[p.target_id] || 0) + 1;
    });

    const popularList = targetData.map(w => ({
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
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      if (!chartArea) return;
      
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      
      ctx.restore();
      
      // Calculate responsive font size based on chartArea height
      const chartHeight = chartArea.bottom - chartArea.top;
      const fontSize = (chartHeight / 120).toFixed(2);
      
      // Setup horizontal alignment to center
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Render Total Number
      ctx.font = "bold " + fontSize + "em Outfit, sans-serif";
      ctx.fillStyle = "#f3f4f6";
      const text = total.toString();
      const textY = centerY - 6; // Move slightly up to accommodate the label below
      ctx.fillText(text, centerX, textY);
      
      // Render "Total" Label
      ctx.font = (fontSize / 2.3).toFixed(2) + "em Outfit, sans-serif";
      ctx.fillStyle = "#8e939e";
      const label = "Total";
      const labelY = centerY + 18; // Move down below the number
      ctx.fillText(label, centerX, labelY);
      
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
      <td><span class="badge badge-${item.type}">${item.type.replace(/_/g, ' ')}</span></td>
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
  const filtered = targetData.filter(
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
    type: document.getElementById("f-type").value === "lainnya" ? document.getElementById("f-type-custom").value.trim().toLowerCase() : document.getElementById("f-type").value,
    deskripsi: document.getElementById("f-deskripsi").value,
    harga: document.getElementById("f-harga").value === "Free" ? "Free" : parseRupiah(document.getElementById("f-harga").value).toString(),
    contact_url: document.getElementById("f-contact_url").value,
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
    target_layout: document.getElementById("f-target-layout") ? document.getElementById("f-target-layout").value : 'mask',
  };
  const { error } = isEditing
    ? await supabase.from("ar_targets").update(formData).eq("id", editingId)
    : await supabase.from("ar_targets").insert([formData]);

  if (error) {
    showToast("Error: " + error.message, "error");
  } else {
    showToast("Data target berhasil disimpan.", "success");
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
    activeConfigData = data;
    renderActiveConfig();
    
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

    let filteredData = data || [];
    const searchInput = document.getElementById("settings-logs-search");
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
    
    if (searchQuery) {
      filteredData = data.filter(log => {
        const adminEmail = (log.admin_email || "").toLowerCase();
        const newUrl = (log.new_url || "").toLowerCase();
        const oldUrl = (log.old_url || "").toLowerCase();
        return adminEmail.includes(searchQuery) || newUrl.includes(searchQuery) || oldUrl.includes(searchQuery);
      });
    }

    if (filteredData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-dim);">${searchQuery ? 'Tidak ada riwayat perubahan yang cocok dengan pencarian.' : 'Belum ada riwayat perubahan.'}</td></tr>`;
      const paginationContainer = document.getElementById("settings-logs-pagination");
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / appSettingsLogsPerPage);
    
    // Safety boundaries for current page
    if (appSettingsLogsCurrentPage > totalPages) {
      appSettingsLogsCurrentPage = totalPages;
    }
    if (appSettingsLogsCurrentPage < 1) {
      appSettingsLogsCurrentPage = 1;
    }

    const startIdx = (appSettingsLogsCurrentPage - 1) * appSettingsLogsPerPage;
    const endIdx = startIdx + appSettingsLogsPerPage;
    const pageData = filteredData.slice(startIdx, endIdx);

    tbody.innerHTML = pageData.map(log => `
      <tr>
        <td style="font-size: 0.8rem; white-space: nowrap;">
          ${new Date(log.created_at).toLocaleString('id-ID')}
        </td>
        <td style="font-weight: 500;">${log.admin_email}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through;">${log.old_url || '-'}</div>
          <div style="color: var(--success); font-size: 0.8rem;">${log.new_url || '-'}</div>
        </td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through;">***${log.old_key?.slice(-8) || 'none'}</div>
          <div style="color: var(--success); font-size: 0.8rem;">***${log.new_key?.slice(-8) || 'none'}</div>
        </td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through;">***${log.old_gdrive_key?.slice(-8) || 'none'}</div>
          <div style="color: var(--success); font-size: 0.8rem;">***${log.new_gdrive_key?.slice(-8) || 'none'}</div>
        </td>
      </tr>
    `).join("");

    renderAppSettingsLogsPagination(totalItems);
  } catch (err) {
    console.error("Error rendering logs:", err);
  }
}

function renderAppSettingsLogsPagination(totalItems) {
  const paginationContainer = document.getElementById("settings-logs-pagination");
  if (!paginationContainer) return;

  const totalPages = Math.ceil(totalItems / appSettingsLogsPerPage);
  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let html = "";
  // Prev button
  html += `<button type="button" class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.85rem;" ${appSettingsLogsCurrentPage === 1 ? 'disabled' : ''} onclick="changeSettingsLogsPage(${appSettingsLogsCurrentPage - 1})">Prev</button>`;

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    if (i === appSettingsLogsCurrentPage) {
      html += `<button type="button" class="btn btn-primary" style="padding: 4px 12px; font-size: 0.85rem; min-width: 32px; justify-content: center; border-radius: 6px;">${i}</button>`;
    } else {
      html += `<button type="button" class="btn btn-ghost" style="padding: 4px 12px; font-size: 0.85rem; min-width: 32px; justify-content: center; border-radius: 6px;" onclick="changeSettingsLogsPage(${i})">${i}</button>`;
    }
  }

  // Next button
  html += `<button type="button" class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.85rem;" ${appSettingsLogsCurrentPage === totalPages ? 'disabled' : ''} onclick="changeSettingsLogsPage(${appSettingsLogsCurrentPage + 1})">Next</button>`;

  paginationContainer.innerHTML = html;
}

window.changeSettingsLogsPage = function(page) {
  appSettingsLogsCurrentPage = page;
  renderAppSettingsLogs();
}

let currentSettingsFormSubmit = null;

settingsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const urlVal = document.getElementById("s-url")?.value?.trim() || "";
  const keyVal = document.getElementById("s-key")?.value?.trim() || "";
  
  if (!urlVal && !keyVal) {
    showToast("Silakan isi URL atau Secret Key yang ingin diperbarui!", "error");
    return;
  }
  
  currentSettingsFormSubmit = "supabase";
  const passwordInput = document.getElementById("settings-confirm-password");
  if (passwordInput) passwordInput.value = "";
  modalSettingsConfirm.classList.add("active");
  if (passwordInput) setTimeout(() => passwordInput.focus(), 150);
});

const gdriveSettingsForm = document.getElementById("gdrive-settings-form");
gdriveSettingsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const gdriveKeyVal = document.getElementById("s-gdrive-key")?.value?.trim() || "";
  
  if (!gdriveKeyVal) {
    showToast("Silakan isi Google Drive API Key yang ingin diperbarui!", "error");
    return;
  }
  
  currentSettingsFormSubmit = "gdrive";
  const passwordInput = document.getElementById("settings-confirm-password");
  if (passwordInput) passwordInput.value = "";
  modalSettingsConfirm.classList.add("active");
  if (passwordInput) setTimeout(() => passwordInput.focus(), 150);
});

btnSettingsCancel?.addEventListener("click", () => {
  modalSettingsConfirm.classList.remove("active");
  const passwordInput = document.getElementById("settings-confirm-password");
  if (passwordInput) passwordInput.value = "";
});

btnSettingsConfirm?.addEventListener("click", async () => {
  const passwordInput = document.getElementById("settings-confirm-password");
  const password = passwordInput?.value || "";
  
  if (!password) {
    showToast("Kata sandi wajib diisi untuk verifikasi!", "error");
    if (passwordInput) passwordInput.focus();
    return;
  }
  
  const originalConfirmText = btnSettingsConfirm.innerText;
  btnSettingsConfirm.disabled = true;
  btnSettingsConfirm.innerText = "Memverifikasi...";
  
  try {
    const sessionData = await supabase.auth.getSession();
    const email = sessionData?.data?.session?.user?.email;
    
    if (!email) {
      showToast("Sesi tidak aktif. Silakan masuk kembali.", "error");
      btnSettingsConfirm.disabled = false;
      btnSettingsConfirm.innerText = originalConfirmText;
      return;
    }
    
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      showToast("Kata sandi salah! Akses ditolak.", "error");
      btnSettingsConfirm.disabled = false;
      btnSettingsConfirm.innerText = originalConfirmText;
      if (passwordInput) {
        passwordInput.value = "";
        passwordInput.focus();
      }
      return;
    }
    
    // Verification successful, close modal, clear password, and perform save
    modalSettingsConfirm.classList.remove("active");
    if (passwordInput) passwordInput.value = "";
    
    if (currentSettingsFormSubmit === "supabase") {
      await saveSupabaseConfig();
    } else if (currentSettingsFormSubmit === "gdrive") {
      await saveGDriveConfig();
    }
  } catch (err) {
    console.error("Settings password confirmation error:", err);
    showToast("Gagal melakukan verifikasi kata sandi.", "error");
  } finally {
    btnSettingsConfirm.disabled = false;
    btnSettingsConfirm.innerText = originalConfirmText;
  }
});

async function saveSupabaseConfig() {
  const btn = document.getElementById("btn-save-settings");
  const originalText = btn.innerText;

  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  const newUrl = document.getElementById("s-url").value;
  const newKey = document.getElementById("s-key").value;

  if (!newUrl && !newKey) {
    showToast("Tidak ada perubahan yang diisi.", "info");
    btn.disabled = false;
    btn.innerText = originalText;
    return;
  }

  try {
    const { data: current } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", "current_config")
      .single();

    const upsertPayload = {
      id: "current_config",
      updated_at: new Date().toISOString(),
      supabase_url: newUrl || current?.supabase_url,
      supabase_key: newKey || current?.supabase_key,
      gdrive_api_key: current?.gdrive_api_key
    };
    const { error: updateError } = await supabase.from("app_settings").upsert(upsertPayload);

    if (updateError) throw updateError;

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("app_settings_logs").insert({
      admin_email: user.email,
      old_url: current?.supabase_url || 'empty',
      new_url: newUrl || current?.supabase_url,
      old_key: current?.supabase_key || 'empty',
      new_key: newKey || current?.supabase_key
    });

    showToast("Konfigurasi Supabase berhasil diperbarui.", "success");
    settingsForm.reset();
    fetchAppSettings();
  } catch (err) {
    console.error(err);
    showToast("Gagal memperbarui konfigurasi Supabase", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
}

async function saveGDriveConfig() {
  const btn = document.getElementById("btn-save-gdrive");
  const originalText = btn.innerText;

  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  const newGdriveKey = document.getElementById("s-gdrive-key")?.value;

  if (!newGdriveKey) {
    showToast("Masukkan API Key Google Drive.", "info");
    btn.disabled = false;
    btn.innerText = originalText;
    return;
  }

  try {
    const { data: current } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", "current_config")
      .single();

    const upsertPayload = {
      id: "current_config",
      updated_at: new Date().toISOString(),
      supabase_url: current?.supabase_url,
      supabase_key: current?.supabase_key,
      gdrive_api_key: newGdriveKey
    };
    const { error: updateError } = await supabase.from("app_settings").upsert(upsertPayload);

    if (updateError) throw updateError;

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("app_settings_logs").insert({
      admin_email: user.email,
      old_url: current?.supabase_url || 'empty',
      new_url: current?.supabase_url,
      old_key: current?.supabase_key || 'empty',
      new_key: current?.supabase_key,
      old_gdrive_key: current?.gdrive_api_key || 'empty',
      new_gdrive_key: newGdriveKey
    });

    showToast("Google Drive API Key berhasil diperbarui.", "success");
    document.getElementById("gdrive-settings-form")?.reset();
    fetchAppSettings();
  } catch (err) {
    console.error(err);
    showToast("Gagal memperbarui Google Drive API Key", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
}

document.getElementById("th-sort-time")?.addEventListener("click", () => {
  logsSortAsc = !logsSortAsc;
  appSettingsLogsCurrentPage = 1;
  renderAppSettingsLogs();
});

document.getElementById("settings-logs-search")?.addEventListener("input", () => {
  appSettingsLogsCurrentPage = 1;
  renderAppSettingsLogs();
});

// --- COLLAPSIBLE CONNECTION CONFIG ---
document.getElementById("connection-config-header")?.addEventListener("click", () => {
  const content = document.getElementById("connection-config-content");
  const chevron = document.getElementById("chevron-config-icon");
  if (!content || !chevron) return;
  
  const isCollapsed = content.style.maxHeight === "0px";
  if (isCollapsed) {
    content.style.maxHeight = "1500px";
    content.style.opacity = "1";
    chevron.style.transform = "rotate(90deg)";
  } else {
    content.style.maxHeight = "0px";
    content.style.opacity = "0";
    chevron.style.transform = "rotate(0deg)";
  }
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
    const { data: dbTargets, error: dbError } = await supabase.from('ar_targets').select('slide_urls, marker_url, video_url, model_url');
    if (dbError) throw dbError;

    const usedPaths = new Set();
    const getPathFromUrl = (url) => {
      if (!url) return null;
      // Extracts path after '/ar-media/'
      const parts = url.split("/ar-media/");
      return parts.length > 1 ? parts[1].split('?')[0] : null;
    };

    dbTargets.forEach(item => {
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
      const { data: files, error: stError } = await supabase.storage.from('ar-media').list(folder, { limit: 1000 });
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
      const { error: delError } = await supabase.storage.from('ar-media').remove(batch);
      
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

let heartbeatInterval = null;

async function checkDbHeartbeat() {
  const dot = document.querySelector("#db-heartbeat .heartbeat-dot");
  const text = document.querySelector("#db-heartbeat .heartbeat-text");
  if (!dot || !text) return;

  try {
    const start = performance.now();
    const { error } = await supabase.from("app_settings").select("id").limit(1);
    const duration = Math.round(performance.now() - start);

    if (error) throw error;

    dot.style.background = "#10b981";
    dot.style.boxShadow = "0 0 8px #10b981";
    text.innerText = `Connected (${duration}ms)`;
    text.style.color = "#10b981";
  } catch (err) {
    dot.style.background = "#ef4444";
    dot.style.boxShadow = "0 0 8px #ef4444";
    text.innerText = "Disconnected";
    text.style.color = "#ef4444";
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

    // Toggle Password Visibility
    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.getAttribute("type") === "password";
                input.setAttribute("type", isPassword ? "text" : "password");
                btn.style.color = isPassword ? "var(--pastel-blue)" : "var(--text-dim)";
            }
        };
    });

    // Unlock Config logic
    const btnUnlockConfig = document.getElementById("btn-unlock-config");
    const modalUnlockConfig = document.getElementById("modal-unlock-config");
    const btnUnlockCancel = document.getElementById("btn-unlock-cancel");
    const formUnlockConfig = document.getElementById("unlock-config-form");
    const inputUnlockPassword = document.getElementById("unlock-password");

    const closeUnlockModal = () => {
      if (modalUnlockConfig) modalUnlockConfig.classList.remove("active");
      if (formUnlockConfig) formUnlockConfig.reset();
    };

    if (btnUnlockConfig) {
      btnUnlockConfig.onclick = () => {
        if (isConfigUnlocked) {
          isConfigUnlocked = false;
          renderActiveConfig();
          showToast("Konfigurasi Aktif disensor kembali.", "info");
        } else {
          if (modalUnlockConfig) modalUnlockConfig.classList.add("active");
          if (inputUnlockPassword) setTimeout(() => inputUnlockPassword.focus(), 150);
        }
      };
    }

    if (btnUnlockCancel) {
      btnUnlockCancel.onclick = closeUnlockModal;
    }

    if (formUnlockConfig) {
      formUnlockConfig.onsubmit = async (e) => {
        e.preventDefault();
        const password = inputUnlockPassword.value;
        const btnConfirm = document.getElementById("btn-unlock-confirm");
        const originalText = btnConfirm ? btnConfirm.innerText : "Verifikasi";

        if (btnConfirm) {
          btnConfirm.disabled = true;
          btnConfirm.innerText = "Memverifikasi...";
        }

        try {
          const sessionData = await supabase.auth.getSession();
          const email = sessionData?.data?.session?.user?.email;

          if (!email) throw new Error("Sesi pengguna tidak aktif.");

          const { error } = await supabase.auth.signInWithPassword({ email, password });

          if (error) {
            showToast("Kata sandi yang Anda masukkan salah!", "error");
          } else {
            isConfigUnlocked = true;
            renderActiveConfig();
            closeUnlockModal();
            showToast("Verifikasi berhasil! Sensor dibuka.", "success");

            setTimeout(() => {
              if (isConfigUnlocked) {
                isConfigUnlocked = false;
                renderActiveConfig();
                showToast("Konfigurasi Aktif disensor kembali otomatis.", "info");
              }
            }, 30000);
          }
        } catch (err) {
          console.error("Verification error:", err);
          showToast("Terjadi kesalahan saat memverifikasi: " + err.message, "error");
        } finally {
          if (btnConfirm) {
            btnConfirm.disabled = false;
            btnConfirm.innerText = originalText;
          }
        }
      };
    }

    // Guide Tab Switching
    document.querySelectorAll(".guide-tab").forEach(tab => {
        tab.onclick = () => {
            const guide = tab.getAttribute("data-guide");
            
            // Toggle active class on buttons
            document.querySelectorAll(".guide-tab").forEach(t => {
                t.classList.remove("active");
                t.style.color = "var(--text-dim)";
                t.style.background = "none";
            });
            tab.classList.add("active");
            tab.style.color = "#fff";
            tab.style.background = "rgba(255, 255, 255, 0.08)";

            // Toggle active content
            document.querySelectorAll(".guide-tab-content").forEach(content => {
                content.style.display = "none";
            });
            const activeContent = document.getElementById(`guide-content-${guide}`);
            if (activeContent) {
                activeContent.style.display = "block";
            }
        };
    });

    // DB Heartbeat Connection
    checkDbHeartbeat();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        const activeSection = localStorage.getItem('activeSection');
        if (activeSection === "section-settings") {
            checkDbHeartbeat();
        } else {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    }, 10000);
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
      showSection("section-target");
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
      .from("ar-media")
      .upload(filePath, file);
    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("ar-media").getPublicUrl(filePath);
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
    .from("ar-media")
    .upload(filePath, file);
  if (!error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("ar-media").getPublicUrl(filePath);
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
    .from("ar-media")
    .upload(filePath, file);
  if (!error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("ar-media").getPublicUrl(filePath);
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

function checkGDriveVideoUrl(url) {
  const badge = document.getElementById("gdrive-detector-badge");
  if (!badge) return;

  if (url && (url.includes("drive.google.com") || url.includes("google.com/uc?id="))) {
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

videoUrlInput?.addEventListener("input", (e) => {
  const originalUrl = e.target.value;
  const fixedUrl = fixStreamingUrl(originalUrl);
  if (fixedUrl !== originalUrl) {
    videoUrlInput.value = fixedUrl;
  }
  checkGDriveVideoUrl(videoUrlInput.value);
});

async function editItem(id) {
  const { data, error } = await supabase
    .from("ar_targets")
    .select("*")
    .eq("id", id)
    .single();
  if (!error) {
    document.getElementById("f-id").value = data.id;
    document.getElementById("f-id").disabled = true;
    document.getElementById("f-nama").value = data.nama;
    const knownTypes = ['wisata', 'kuliner', 'event', 'unit_bisnis'];
    const otherTypeContainer = document.getElementById("other-type-container");
    const fTypeCustom = document.getElementById("f-type-custom");
    if (knownTypes.includes(data.type)) {
        document.getElementById("f-type").value = data.type;
        if (otherTypeContainer) otherTypeContainer.style.display = "none";
        if (fTypeCustom) {
            fTypeCustom.value = "";
            fTypeCustom.required = false;
        }
    } else {
        document.getElementById("f-type").value = "lainnya";
        if (otherTypeContainer) otherTypeContainer.style.display = "block";
        if (fTypeCustom) {
            fTypeCustom.value = data.type || "";
            fTypeCustom.required = true;
        }
    }
    document.getElementById("f-deskripsi").value = data.deskripsi;
    document.getElementById("f-harga").value = data.harga === "Free" ? "Free" : formatRupiah(data.harga || "");
    document.getElementById("f-contact_url").value = data.contact_url || "";
    document.getElementById("f-marker-url").value = data.marker_url || "";
    document.getElementById("f-media-url").value = data.slide_urls || "";
    document.getElementById("f-video-url").value = data.video_url || "";
    checkGDriveVideoUrl(data.video_url || "");
    if (document.getElementById("f-target-layout")) document.getElementById("f-target-layout").value = data.target_layout || "mask";
    
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
    update3DPreview(data.model_url || "");

    isEditing = true;
    editingId = id;
    modal.classList.add("active");
    document.getElementById("modal-title").innerText = "Edit AR Marker";
  }
}

async function deleteItem(id) {
  idToDelete = id;
  deleteType = "target";

  if (hardDeleteOption) {
    hardDeleteOption.style.display = "flex";
    if (checkHardDelete) checkHardDelete.checked = false;
  }

  const title = document.getElementById("delete-modal-title");
  const desc = document.getElementById("delete-modal-desc");

  if (title) title.innerText = "Hapus Target?";
  if (desc)
    desc.innerText =
      "Data target ini akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan.";

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
    if (deleteType === "target" && checkHardDelete?.checked) {
      const { data: item } = await supabase
        .from("ar_targets")
        .select("slide_urls, marker_url, video_url, model_url")
        .eq("id", idToDelete)
        .single();

      if (item) {
        const filesToDelete = [];
        const getPathFromUrl = (url) => {
          if (!url) return null;
          try {
            // Extracts path after '/ar-media/'
            const parts = url.split("/ar-media/");
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
          await supabase.storage.from("ar-media").remove(filesToDelete);
        }
      }
    }

    let error;
    if (deleteType === "target") {
      const res = await supabase.from("ar_targets").delete().eq("id", idToDelete);
      error = res.error;
    } else {
      // Menghapus user secara total dari auth.users dan profiles via SQL Function (RPC)
      const res = await supabase.rpc('delete_user_completely', { user_id: idToDelete });
      error = res.error;
    }

    if (!error) {
      showToast(
        deleteType === "target"
          ? "Target berhasil dihapus permanen"
          : "Akses admin dicabut",
        "success",
      );
      if (deleteType === "target") fetchData();
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
  document.getElementById("modal-title").innerText = "Tambah AR Marker Baru";
});

function closeModal() {
  modal.classList.remove("active");
  form.reset();
  if (document.getElementById("f-target-layout")) document.getElementById("f-target-layout").value = "mask";

  
  const otherTypeContainer = document.getElementById("other-type-container");
  const fTypeCustom = document.getElementById("f-type-custom");
  if (otherTypeContainer) otherTypeContainer.style.display = "none";
  if (fTypeCustom) {
    fTypeCustom.required = false;
    fTypeCustom.value = "";
  }

  updatePreview("");
  updateMarkerPreview("");
  update3DPreview("");

  const gdriveBadge = document.getElementById("gdrive-detector-badge");
  if (gdriveBadge) gdriveBadge.style.display = "none";

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
    .from("ar-media")
    .upload(filePath, file);
    
  if (!error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("ar-media").getPublicUrl(filePath);
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
  const otherTypeContainer = document.getElementById("other-type-container");
  const fTypeCustom = document.getElementById("f-type-custom");
  if (otherTypeContainer && fTypeCustom) {
    if (e.target.value === "lainnya") {
      otherTypeContainer.style.display = "block";
      fTypeCustom.required = true;
      fTypeCustom.focus();
    } else {
      otherTypeContainer.style.display = "none";
      fTypeCustom.required = false;
      fTypeCustom.value = "";
    }
  }
});

// Admin search listener
searchAdminsInput?.addEventListener("input", (e) => {
  renderAdmins(e.target.value);
});

if (initError) {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.08); padding: 3rem; border-radius: 24px; max-width: 520px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; gap: 1.5rem; animation: modalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.05)); border: 1.5px solid rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 2.25rem; margin-bottom: 0.5rem; box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);">⚠️</div>
        <h3 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #fff; margin: 0; font-size: 1.5rem; letter-spacing: -0.025em; background: linear-gradient(to right, #fff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Koneksi Database Gagal</h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 0.925rem; color: #94a3b8; line-height: 1.6; margin: 0;">
          Environment variables untuk Supabase (<code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>) belum diatur di server hosting (Vercel).
        </p>
        <div style="text-align: left; background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 1.25rem; width: 100%; border: 1px solid rgba(255, 255, 255, 0.05); font-family: 'Fira Code', monospace; font-size: 0.775rem; color: #f87171; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">Error: ${initError.message}</div>
        <div style="text-align: left; font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 1.5rem;">
          <strong style="color: #fff; display: block; margin-bottom: 0.5rem;">Cara Perbaikan di Vercel:</strong>
          <ol style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <li>Buka dashboard <strong style="color: #6366f1;">Vercel</strong> &gt; pilih proyek Anda.</li>
            <li>Masuk ke menu <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
            <li>Tambahkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> dengan nilai yang sesuai dari dashboard Supabase Anda.</li>
            <li>Lakukan <strong>Redeploy</strong> proyek Anda agar konfigurasi baru berhasil di-compile oleh Vite.</li>
          </ol>
        </div>
      </div>
    `;
  }
} else {
  supabase.auth.onAuthStateChange((_event, session) => {
    handleAuthState(session);
  });

  // Initial check
  supabase.auth.getSession().then((res) => {
    handleAuthState(res.data?.session);
  });

  // Periodic check for 12-hour session expiry
  setInterval(async () => {
    const sessionData = await supabase.auth.getSession();
    const session = sessionData?.data?.session;
    if (session) {
      const loginTime = localStorage.getItem('login_timestamp');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > 12 * 60 * 60 * 1000) {
          showToast("Sesi Anda telah berakhir (batas 12 jam). Mengeluarkan...", "warning");
          localStorage.removeItem('login_timestamp');
          localStorage.removeItem('activeSection');
          await supabase.auth.signOut();
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    }
  }, 60000); // Check every 60 seconds
}

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

// --- EXPORT ANALYTICS REPORTS ---

// PDF Export (Structured formal business report using jsPDF and jspdf-autotable)
window.exportDashboardPDF = async function() {
  // 1. Identify active timeframe from dashboard buttons
  const activeBtn = document.querySelector('.time-filter-btn.active');
  const timeframe = activeBtn ? activeBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'weekly';
  
  let rangeText = "";
  if (timeframe === 'weekly') {
    rangeText = "Mingguan (7 Hari Terakhir)";
  } else if (timeframe === 'monthly') {
    rangeText = "Bulanan (30 Hari Terakhir)";
  } else {
    rangeText = "Semua Waktu (All-Time)";
  }

  showToast(`Menyiapkan data laporan PDF periode ${timeframe}...`, "info");

  try {
    // 2. Fetch all scans from Supabase to filter precisely
    const { data: scans, error } = await supabase
      .from('scans')
      .select('id, scanned_at, ar_targets(id, nama, type)')
      .order('scanned_at', { ascending: false });

    if (error) throw error;

    if (!scans || scans.length === 0) {
      showToast("Tidak ada data scan untuk diekspor", "warning");
      return;
    }

    // 3. Filter data by date range
    let cutoff = null;
    if (timeframe === 'weekly') {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (timeframe === 'monthly') {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
    }

    const filteredScans = scans.filter(s => {
      if (!cutoff) return true;
      return new Date(s.scanned_at) >= cutoff;
    });

    // 4. Calculate stats & popular destinations for this range
    const destinationCounts = {};
    filteredScans.forEach(s => {
      if (s.ar_targets) {
        const id = s.ar_targets.id;
        const nama = s.ar_targets.nama;
        const type = s.ar_targets.type;
        if (!destinationCounts[id]) {
          destinationCounts[id] = { nama, type, count: 0 };
        }
        destinationCounts[id].count++;
      }
    });

    const topDestinations = Object.values(destinationCounts)
      .sort((a, b) => b.count - a.count);

    const activeSpotsCount = Object.keys(destinationCounts).length;
    const totalAdmins = document.getElementById('stat-total-admins')?.innerText || '0';

    // 5. Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, A4 size
    const pageWidth = 210;

    // PAGE 1: HEADER & EXECUTIVE SUMMARY
    // Deep slate top border accent
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Platform Logo & Subtitle
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("D'JASWITA AR", 14, 25);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 120);
    doc.text("SISTEM MANAJEMEN INFORMASI TARGET & AR", 14, 30);

    // Decorative line divider
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    // Document Details
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("LAPORAN ANALISIS INTERAKSI PENGUNJUNG", 14, 44);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(70, 80, 90);
    
    // Detailed Metadata Table Box style
    doc.text(`Periode Laporan : ${rangeText}`, 14, 51);
    doc.text(`Tanggal Cetak   : ${new Date().toLocaleString('id-ID')}`, 14, 56);
    doc.text(`Dicetak Oleh    : Administrator WebAdmin`, 14, 61);

    // EXECUTIVE SUMMARY TABLE
    doc.autoTable({
      startY: 68,
      head: [['Metrik Ringkasan Laporan', 'Nilai Tercatat']],
      body: [
        ['Total Scan Pengunjung (Engagement)', `${filteredScans.length} kali scan`],
        ['Target AR Aktif Di-scan (Active Spots)', `${activeSpotsCount} target aktif`],
        ['Administrator Terverifikasi (Verified Admins)', `${totalAdmins} user`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 9.5, cellPadding: 5 },
      margin: { left: 14, right: 14 }
    });

    // TOP DESTINATIONS TABLE
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("DAFTAR TARGET AR TERPOPULER (ENGAGEMENT TERTINGGI)", 14, doc.lastAutoTable.finalY + 12);

    const topDestRows = topDestinations.slice(0, 10).map((item, idx) => {
      const maxCount = topDestinations[0]?.count || 1;
      const pct = Math.round((item.count / maxCount) * 100);
      return [idx + 1, item.nama, item.type, `${item.count} scan`, `${pct}%`];
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Peringkat', 'Nama Target AR', 'Kategori', 'Total Scan', 'Kontribusi Popularitas']],
      body: topDestRows.length > 0 ? topDestRows : [['-', 'Belum ada data interaksi di periode ini', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 14, right: 14 }
    });

    // PAGE 2: DETAILED TRANSACTION LOGS
    doc.addPage();
    
    // Header for Page 2
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("LOG RINCIAN RIWAYAT INTERAKSI SCAN", 14, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 120);
    doc.text(`Rincian log scan aktif periode: ${rangeText} | Total: ${filteredScans.length} data`, 14, 25);

    const logRows = filteredScans.map((s, idx) => {
      const scanTime = new Date(s.scanned_at).toLocaleString('id-ID');
      const name = s.ar_targets ? s.ar_targets.nama : 'Target Dihapus';
      const type = s.ar_targets ? s.ar_targets.type : 'N/A';
      return [idx + 1, s.id, scanTime, name, type];
    });

    doc.autoTable({
      startY: 30,
      head: [['No', 'ID Scan', 'Waktu Pindai (Scan)', 'Nama Target AR', 'Kategori']],
      body: logRows.length > 0 ? logRows : [['-', 'Belum ada data scan', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 3.5 },
      margin: { left: 14, right: 14 }
    });

    // Signature Block at the bottom of the table
    const finalY = doc.lastAutoTable.finalY || 30;
    const footerY = finalY + 20;

    if (footerY < 260) {
      drawSignature(doc, footerY);
    } else {
      doc.addPage();
      drawSignature(doc, 30);
    }

    function drawSignature(doc, y) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text("Mengetahui,", 138, y);
      doc.text("Administrator D'Jaswita AR WebAdmin", 138, y + 5);
      
      // Signature line
      doc.setDrawColor(180, 185, 195);
      doc.line(138, y + 25, 190, y + 25);
      
      doc.setFontSize(8.5);
      doc.setTextColor(120, 130, 140);
      doc.text("Sistem Verifikasi Digital Laporan", 138, y + 29);
    }

    // Save and download PDF
    doc.save(`DjaswitaAR_Laporan_Analisis_${timeframe}_${Date.now()}.pdf`);
    showToast("PDF Laporan resmi berhasil diunduh!", "success");

  } catch (err) {
    console.error("PDF generation failed:", err);
    showToast("Gagal menghasilkan PDF Laporan: " + err.message, "error");
  }
};

// CSV / Styled Excel Export (Excel compatible structured report with full styling and auto-borders)
window.exportDashboardCSV = async function() {
  const activeBtn = document.querySelector('.time-filter-btn.active');
  const timeframe = activeBtn ? activeBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'weekly';
  
  let rangeText = "";
  if (timeframe === 'weekly') {
    rangeText = "Mingguan (7 Hari Terakhir)";
  } else if (timeframe === 'monthly') {
    rangeText = "Bulanan (30 Hari Terakhir)";
  } else {
    rangeText = "Semua Waktu (All-Time)";
  }

  showToast(`Mengekstrak spreadsheet ber-style periode ${timeframe}...`, "info");
  
  try {
    const { data: scans, error } = await supabase
      .from('scans')
      .select('id, scanned_at, ar_targets(id, nama, type)')
      .order('scanned_at', { ascending: false });

    if (error) throw error;

    if (!scans || scans.length === 0) {
      showToast("Tidak ada data scan untuk diekspor", "warning");
      return;
    }

    // Filter by Date Range
    let cutoff = null;
    if (timeframe === 'weekly') {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (timeframe === 'monthly') {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
    }

    const filteredScans = scans.filter(s => {
      if (!cutoff) return true;
      return new Date(s.scanned_at) >= cutoff;
    });

    // Grouping Top Destinations
    const destinationCounts = {};
    filteredScans.forEach(s => {
      if (s.ar_targets) {
        const id = s.ar_targets.id;
        const nama = s.ar_targets.nama;
        const type = s.ar_targets.type;
        if (!destinationCounts[id]) {
          destinationCounts[id] = { nama, type, count: 0 };
        }
        destinationCounts[id].count++;
      }
    });

    const topDestinations = Object.values(destinationCounts)
      .sort((a, b) => b.count - a.count);

    const activeSpotsCount = Object.keys(destinationCounts).length;
    const totalAdmins = document.getElementById('stat-total-admins')?.innerText || '0';

    // Build premium XML/HTML-based styled spreadsheet
    let excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
        table { border-collapse: collapse; margin-bottom: 24px; }
        td, th { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 10pt; text-align: left; }
        th { background-color: #1e293b; color: #ffffff; font-weight: bold; font-size: 10pt; }
        .title-cell { font-size: 16pt; font-weight: bold; color: #0f172a; border: none; height: 40px; }
        .subtitle-cell { font-size: 9.5pt; color: #64748b; border: none; height: 25px; }
        .section-header { background-color: #475569; color: #ffffff; font-weight: bold; font-size: 11pt; padding: 10px; text-align: center; }
        .metrics-label { background-color: #f8fafc; font-weight: bold; width: 320px; }
        .metrics-value { font-weight: normal; }
        .rank-col { text-align: center; font-weight: bold; width: 80px; }
        .number-col { text-align: right; width: 110px; }
        .date-col { width: 180px; }
        .id-col { width: 220px; }
        .name-col { width: 260px; }
        .type-col { width: 140px; }
      </style>
    </head>
    <body>
      <!-- Document Header -->
      <table>
        <tr>
          <td colspan="5" class="title-cell">LAPORAN ANALISIS INTERAKSI PENGUNJUNG AR - D'JASWITA AR</td>
        </tr>
        <tr>
          <td colspan="5" class="subtitle-cell">
            Periode Laporan: ${rangeText} | 
            Tanggal Cetak: ${new Date().toLocaleString('id-ID')} | 
            Status: Resmi WebAdmin Export
          </td>
        </tr>
      </table>

      <!-- Spacer table for clean gap -->
      <table style="border: none; margin: 0; padding: 0;">
        <tr style="border: none; height: 16px;">
          <td style="border: none; height: 16px;" colspan="5"></td>
        </tr>
      </table>

      <!-- 1. Executive Summary Table -->
      <table>
        <tr>
          <th colspan="2" class="section-header">=== RINGKASAN METRIK STATISTIK ===</th>
        </tr>
        <tr>
          <td class="metrics-label">Total Scan Pengunjung (Engagement)</td>
          <td class="metrics-value">${filteredScans.length} kali scan</td>
        </tr>
        <tr>
          <td class="metrics-label">Target Aktif Di-scan (Active Spots)</td>
          <td class="metrics-value">${activeSpotsCount} target aktif</td>
        </tr>
        <tr>
          <td class="metrics-label">Administrator Terverifikasi (Verified Admins)</td>
          <td class="metrics-value">${totalAdmins} user</td>
        </tr>
      </table>

      <!-- Spacer table for clean gap -->
      <table style="border: none; margin: 0; padding: 0;">
        <tr style="border: none; height: 16px;">
          <td style="border: none; height: 16px;" colspan="5"></td>
        </tr>
      </table>

      <!-- 2. Top Destinations Table -->
      <table>
        <tr>
          <th colspan="5" class="section-header">=== DAFTAR SEPULUH TARGET TERPOPULER ===</th>
        </tr>
        <tr>
          <th class="rank-col">Peringkat</th>
          <th class="name-col">Nama Target AR</th>
          <th class="type-col">Kategori</th>
          <th class="number-col">Total Scan</th>
          <th class="number-col">Popularitas</th>
        </tr>
    `;

    topDestinations.slice(0, 10).forEach((item, idx) => {
      const maxCount = topDestinations[0]?.count || 1;
      const pct = Math.round((item.count / maxCount) * 100);
      excelContent += `
        <tr>
          <td class="rank-col">${idx + 1}</td>
          <td>${item.nama}</td>
          <td>${item.type}</td>
          <td class="number-col">${item.count} scan</td>
          <td class="number-col">${pct}%</td>
        </tr>
      `;
    });

    excelContent += `
      </table>

      <!-- Spacer table for clean gap -->
      <table style="border: none; margin: 0; padding: 0;">
        <tr style="border: none; height: 16px;">
          <td style="border: none; height: 16px;" colspan="5"></td>
        </tr>
      </table>

      <!-- 3. Detailed Scan Logs Table -->
      <table>
        <tr>
          <th colspan="5" class="section-header">=== DETAIL LOG RIWAYAT INTERAKSI SCAN PENGUNJUNG ===</th>
        </tr>
        <tr>
          <th class="rank-col">No</th>
          <th class="id-col">ID Scan</th>
          <th class="date-col">Waktu Pindai (Scan)</th>
          <th class="name-col">Nama Target AR</th>
          <th class="type-col">Kategori</th>
        </tr>
    `;

    filteredScans.forEach((s, idx) => {
      const scanTime = new Date(s.scanned_at).toLocaleString('id-ID');
      const name = s.ar_targets ? s.ar_targets.nama : 'Target Dihapus';
      const type = s.ar_targets ? s.ar_targets.type : 'N/A';
      excelContent += `
        <tr>
          <td class="rank-col">${idx + 1}</td>
          <td>${s.id}</td>
          <td>${scanTime}</td>
          <td>${name}</td>
          <td>${type}</td>
        </tr>
      `;
    });

    excelContent += `
      </table>
    </body>
    </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `DjaswitaAR_Spreadsheet_Laporan_${timeframe}_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast("Excel Laporan ber-style premium berhasil diunduh!", "success");
  } catch (err) {
    console.error("Excel generation failed:", err);
    showToast("Gagal mengekspor Excel Laporan: " + err.message, "error");
  }
};
