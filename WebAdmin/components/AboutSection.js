export const AboutSection = () => `
  <header class="header">
    <div class="title-section">
      <h1>About Platform</h1>
      <p>Pelajari lebih lanjut tentang ekosistem D'JawitaAR dan pengembangnya.</p>
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
          <h2 style="margin-bottom: 1.5rem; color: white; font-size: 2rem">D'JawitaAR Project</h2>
          <p style="color: var(--text-dim); line-height: 1.8; margin-bottom: 2.5rem; font-size: 1rem; text-align: justify;">
            D'JawitaAR adalah platform Augmented Reality (AR) modern yang dirancang untuk merevolusi pengalaman pariwisata. Dengan menggabungkan teknologi tracking marker yang presisi dan dashboard manajemen data yang intuitif, D'JawitaAR memungkinkan pengelola lokasi untuk memberikan informasi interaktif kepada user.
          </p>
          <p style="color: var(--primary); font-size: 0.9rem; font-weight: 500; padding: 1.25rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border-left: 4px solid var(--primary); margin-bottom: 2.5rem; display: flex; align-items: flex-start; gap: 12px; text-align: justify;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span>Aplikasi ini dikembangkan sebagai output program magang 2 semester Program Studi <b>Teknologi Rekayasa Multimedia</b>, <b>Fakultas Ilmu Terapan</b>, <b>Telkom University</b>.</span>
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
            <div style="background: rgba(255, 255, 255, 0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">
              <h4 style="color: var(--primary); margin-bottom: 0.5rem">AR Application</h4>
              <p style="font-size: 0.85rem; color: var(--text-dim); text-align: justify;">Dibuat dengan Unity & Vuforia untuk visualisasi 3D, video, dan navigasi yang mulus.</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">
              <h4 style="color: var(--primary); margin-bottom: 0.5rem">Admin Panel</h4>
              <p style="font-size: 0.85rem; color: var(--text-dim); text-align: justify;">Dashboard berbasis web dengan Supabase sebagai backend real-time untuk manajemen konten.</p>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center;">
          <div style="width: 100%; padding: 2rem; background: rgba(255, 255, 255, 0.02); border-radius: 20px; border: 1px solid var(--glass-border);">
            <h4 style="color: white; font-size: 0.9rem; margin-bottom: 1.5rem; text-align: center; letter-spacing: 1px; opacity: 0.8;">CORE CAPABILITIES</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--primary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                </div>
                <h5 style="color: white; font-size: 0.85rem; margin-bottom: 0.25rem;">Real-time Sync</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Data sinkron instan antara Web dan App.</p>
              </div>
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--primary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                </div>
                <h5 style="color: white; font-size: 0.85rem; margin-bottom: 0.25rem;">Precision AR</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Tracking marker cepat & akurat.</p>
              </div>
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--primary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <h5 style="color: white; font-size: 0.85rem; margin-bottom: 0.25rem;">Dynamic Info</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Update info tanpa update aplikasi.</p>
              </div>
              <div style="text-align: center">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--primary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                </div>
                <h5 style="color: white; font-size: 0.85rem; margin-bottom: 0.25rem;">Analytics</h5>
                <p style="font-size: 0.7rem; color: var(--text-dim)">Pantau statistik scan real-time.</p>
              </div>
            </div>

            <!-- Tech Stack Badges -->
            <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-main); margin-bottom: 1rem; opacity: 0.7; text-align: center;">Technology Stack</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <!-- AR Tech -->
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                  <span style="color: var(--pastel-peach); font-weight: 600; font-size: 0.85rem;">Unity 3D & Vuforia</span>
                  <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-dim); background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 8px;">v2022.3</span>
                </div>
                <!-- Web Tech -->
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                  <span style="color: var(--pastel-blue); font-weight: 600; font-size: 0.85rem;">Vite & Supabase</span>
                  <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-dim); background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 8px;">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Release Timeline -->
      <div style="margin-top: 4rem;">
        <h3 style="margin-bottom: 2rem; color: white; font-size: 1.5rem">Release Timeline</h3>
        <div style="position: relative; padding-left: 2rem;">
          <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background-color: var(--border-color);"></div>
          
          <div style="position: relative; margin-bottom: 2.5rem;">
            <div style="position: absolute; left: -2.35rem; top: 0.2rem; width: 14px; height: 14px; border-radius: 50%; background-color: var(--pastel-mint); box-shadow: 0 0 10px var(--pastel-mint);"></div>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; transition: all 0.3s ease;">
              <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--pastel-mint); margin-bottom: 0.5rem;">v1.2.0 - CURRENT</div>
              <h4 style="color: white; margin-bottom: 0.5rem; font-size: 1.1rem;">Matte Pastel Dark Implementation</h4>
              <p style="color: var(--text-dim); font-size: 0.85rem; line-height: 1.6;">Major UI/UX overhaul implementing premium charcoal matte backgrounds with pastel accents, holographic viewfinders, and spring animations.</p>
            </div>
          </div>
          
          <div style="position: relative; margin-bottom: 2.5rem;">
            <div style="position: absolute; left: -2.35rem; top: 0.2rem; width: 14px; height: 14px; border-radius: 50%; background-color: var(--pastel-lavender);"></div>
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem;">
              <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--pastel-lavender); margin-bottom: 0.5rem;">v1.1.0</div>
              <h4 style="color: white; margin-bottom: 0.5rem; font-size: 1.1rem;">Cyberpunk Neon Phase</h4>
              <p style="color: var(--text-dim); font-size: 0.85rem; line-height: 1.6;">Implemented initial dark mode with high contrast neon borders and real-time Supabase sync integration.</p>
            </div>
          </div>
          
        </div>
      </div>

      <!-- Section Footer -->
      <div style="margin-top: 5rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; color: var(--text-dim); font-size: 0.75rem;">
        <div>© 2026 D'JawitaAR Platform • Official Production</div>
        <div style="display: flex; gap: 1.5rem">
          <span>Jaswita Jabar</span>
          <span>Telkom University</span>
        </div>
      </div>
    </div>

    <div id="tab-developer" class="about-tab-content" style="padding: 2.5rem; display: none; animation: fadeIn 0.4s ease;">
      <div style="max-width: 800px; margin: 0 auto;">
        
        <!-- Profile Card: Mint -->
        <div style="background: var(--pastel-mint); border-radius: 32px; padding: 4rem 3rem; color: var(--text-dark); position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(187, 247, 208, 0.15);">
          
          <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; border: 6px solid rgba(255,255,255,0.4); overflow: hidden; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);">
              <img src="image/Imyusi.JPG" alt="Profile" style="width: 100%; height: 100%; object-fit: cover" />
            </div>
            
            <h2 style="margin-bottom: 0.5rem; color: var(--text-dark); font-size: 2.5rem; font-weight: 800; letter-spacing: -1px;">Muhamad Sidik</h2>
            <p style="color: rgba(0,0,0,0.6); margin-bottom: 2rem; font-weight: 700; letter-spacing: 1px; font-size: 0.9rem; text-transform: uppercase;">Creative Designer & Unity Developer</p>
            
            <p style="color: rgba(0,0,0,0.8); line-height: 1.8; margin-bottom: 2.5rem; max-width: 600px; font-size: 1.05rem;">
              To me, technology is not just about a functioning system, but about creating new experiences that people can truly feel. D'JawitaAR is one of my works that integrates my expertise in Fullstack Development and AR Interaction Design.
            </p>
            
            <div style="display: flex; justify-content: center; gap: 1.5rem">
              <a href="https://www.linkedin.com/in/muhamad-sidik-a6757b25b/" target="_blank" style="background: rgba(0,0,0,0.85); color: white; padding: 0.85rem 1.75rem; border-radius: 100px; text-decoration: none; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" onmouseover="this.style.transform='translateY(-4px)'; this.style.background='#0c0d0f'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.background='rgba(0,0,0,0.85)'; this.style.boxShadow='none';">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                LinkedIn
              </a>
              <a href="https://github.com/MyusiZ3" target="_blank" style="background: rgba(0,0,0,0.85); color: white; padding: 0.85rem 1.75rem; border-radius: 100px; text-decoration: none; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" onmouseover="this.style.transform='translateY(-4px)'; this.style.background='#0c0d0f'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.background='rgba(0,0,0,0.85)'; this.style.boxShadow='none';">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                GitHub
              </a>
              <a href="https://creative-portfolio-q6cryumhb-myusiz3s-projects.vercel.app/" target="_blank" style="background: rgba(0,0,0,0.85); color: white; padding: 0.85rem 1.75rem; border-radius: 100px; text-decoration: none; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" onmouseover="this.style.transform='translateY(-4px)'; this.style.background='#0c0d0f'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.background='rgba(0,0,0,0.85)'; this.style.boxShadow='none';">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
