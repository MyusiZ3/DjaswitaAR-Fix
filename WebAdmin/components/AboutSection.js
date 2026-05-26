export const AboutSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>About Platform</h1>
      <p>Pelajari lebih lanjut tentang ekosistem D'Jaswita AR dan pengembangnya.</p>
    </div>
  </header>

  <div class="content-card" style="padding: 0; overflow: hidden; border: none; background: rgba(255,255,255,0.01);">
    <div style="display: flex; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
      <button class="about-tab active" data-tab="platform">About Platform</button>
      <button class="about-tab" data-tab="developer">About Developer</button>
    </div>

    <!-- Tab Content: Platform -->
    <div id="tab-platform" class="about-tab-content" style="padding: 3rem 2.5rem; animation: fadeIn 0.4s ease; position: relative;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem">
        <div>
          <h2 style="margin-bottom: 1.5rem; color: var(--text-main); font-size: 2rem">D'Jaswita AR Project</h2>
          <p style="color: var(--text-dim); line-height: 1.8; margin-bottom: 2.5rem; font-size: 1rem; text-align: justify;">
            D'Jaswita AR adalah platform Augmented Reality (AR) modern yang dirancang untuk merevolusi penyampaian informasi interaktif dan visualisasi konten secara real-time. Dengan menggabungkan teknologi tracking marker yang presisi dan dashboard manajemen data yang intuitif, D'Jaswita AR memungkinkan administrator untuk menyajikan aset 3D, video, dan informasi dinamis secara instan kepada pengguna.
          </p>
          <p style="color: var(--pastel-blue); font-size: 0.9rem; font-weight: 500; padding: 1.25rem; background: rgba(191, 219, 254, 0.03); border-radius: 12px; border: 1px solid rgba(191, 219, 254, 0.1); border-left: 4px solid var(--pastel-blue); margin-bottom: 2.5rem; display: flex; align-items: flex-start; gap: 12px; text-align: justify;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span>Aplikasi ini dikembangkan sebagai proyek TA/PA sekaligus output program magang 2 semester Program Studi <b>Teknologi Rekayasa Multimedia</b>, <b>Fakultas Ilmu Terapan</b>, <b>Telkom University</b>.</span>
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
            <div style="background: rgba(255, 255, 255, 0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">
              <h4 style="color: var(--pastel-peach); margin-bottom: 0.5rem">AR Application</h4>
              <p style="font-size: 0.85rem; color: var(--text-dim); text-align: justify;">Dibuat dengan Unity & Vuforia untuk visualisasi 3D, video, dan navigasi yang mulus.</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">
              <h4 style="color: var(--pastel-lavender); margin-bottom: 0.5rem">Admin Panel</h4>
              <p style="font-size: 0.85rem; color: var(--text-dim); text-align: justify;">Dashboard berbasis web dengan Supabase sebagai backend real-time untuk manajemen konten.</p>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center;">
          <div style="width: 100%; padding: 2rem; background: rgba(255, 255, 255, 0.02); border-radius: 20px; border: 1px solid var(--glass-border);">
            <h4 style="color: var(--text-main); font-size: 0.9rem; margin-bottom: 1.5rem; text-align: center; letter-spacing: 1px; opacity: 0.8;">CORE CAPABILITIES</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--pastel-mint);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                </div>
                <h5 style="color: var(--text-main); font-size: 0.85rem; margin-bottom: 0.25rem;">Real-time Sync</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Data sinkron instan antara Web and App.</p>
              </div>
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--pastel-peach);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line><line x1="12" y1="12" x2="12" y2="12"></line></svg>
                </div>
                <h5 style="color: var(--text-main); font-size: 0.85rem; margin-bottom: 0.25rem;">Precision AR</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Tracking marker cepat & akurat.</p>
              </div>
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--pastel-lavender);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <h5 style="color: var(--text-main); font-size: 0.85rem; margin-bottom: 0.25rem;">Dynamic Info</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Update info tanpa update aplikasi.</p>
              </div>
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--pastel-blue);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                </div>
                <h5 style="color: var(--text-main); font-size: 0.85rem; margin-bottom: 0.25rem;">Analytics</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Pantau statistik scan real-time.</p>
              </div>
            </div>

            <!-- Tech Stack Badges (Moved Here) -->
            <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--pastel-mint); margin-bottom: 1rem; opacity: 0.7; text-align: center;">Technology Stack</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center;">
                <span style="background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; border: 1px solid var(--glass-border); color: white;">Unity 3D</span>
                <span style="background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; border: 1px solid var(--glass-border); color: white;">Vuforia AR</span>
                <span style="background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; border: 1px solid var(--glass-border); color: white;">Supabase</span>
                <span style="background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; border: 1px solid var(--glass-border); color: white;">Vite.js</span>
                <span style="background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; border: 1px solid var(--glass-border); color: white;">C#</span>
                <span style="background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; border: 1px solid var(--glass-border); color: white;">REST API</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Footer -->
      <div style="margin-top: 5rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; color: var(--text-dim); font-size: 0.75rem;">
        <div>© 2026 D'Jaswita AR Platform • Official Production</div>
        <div style="display: flex; gap: 1.5rem">
          <span>Jaswita Jabar</span>
          <span>Telkom University</span>
        </div>
      </div>
    </div>

    <!-- Tab Content: Developer -->
    <div id="tab-developer" class="about-tab-content" style="padding: 2.5rem; display: none; animation: fadeIn 0.4s ease;">
      <div style="max-width: 800px; margin: 0 auto; text-align: center">
        <div style="width: 150px; height: 150px; background: var(--primary-glow); border-radius: 50%; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; border: 4px solid var(--glass-border); overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <img src="image/Imyusi.JPG" alt="Profile" style="width: 100%; height: 100%; object-fit: cover" />
        </div>
        <h2 style="margin-bottom: 0.5rem; color: var(--text-main); display: flex; align-items: center; justify-content: center; gap: 10px;">
          Muhamad Sidik
          <span style="font-size: 0.75rem; font-weight: 700; background: rgba(253, 186, 116, 0.15); color: var(--pastel-peach); padding: 4px 10px; border-radius: 100px; border: 1px solid rgba(253, 186, 116, 0.3); text-transform: uppercase; letter-spacing: 1px; line-height: 1;">Arch</span>
        </h2>
        <p style="color: var(--pastel-mint); margin-bottom: 1.5rem; font-weight: 600;">Creative Designer & Unity Developer</p>
        <p style="color: var(--text-dim); line-height: 1.8; margin-bottom: 2.5rem;">
          To me, technology is not just about a functioning system, but about creating new experiences that people can truly feel. D'Jaswita AR is one of my works that integrates my expertise in Fullstack Development and AR Interaction Design.
        </p>
        <div style="display: flex; justify-content: center; gap: 1.5rem">
          <a href="https://www.linkedin.com/in/muhamad-sidik-a6757b25b/" target="_blank" class="btn btn-ghost" style="padding: 0 1.5rem; text-decoration: none; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            LinkedIn
          </a>
          <a href="https://github.com/MyusiZ3" target="_blank" class="btn btn-ghost" style="padding: 0 1.5rem; text-decoration: none; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            GitHub
          </a>
          <a href="https://creative-portfolio-q6cryumhb-myusiz3s-projects.vercel.app/" target="_blank" class="btn btn-ghost" style="padding: 0 1.5rem; text-decoration: none; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            Portfolio
          </a>
        </div>
      </div>
    </div>
  </div>
`;
