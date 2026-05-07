using UnityEngine;
using Vuforia;
using TMPro;
using UnityEngine.UI;
using UnityEngine.Networking;
// using Siccity.GLTFUtility; // REMOVED: Incompatible with Draco compression and URP Android
// using GLTFast; (dipanggil langsung via namespace)
public class ARTargetHandler : MonoBehaviour
{
    private ObserverBehaviour mObserverBehaviour;

    [Header("Configuration")]
    public string markerId;
    public float trackingLossDelay = 0.5f; // Delay sebelum UI hilang saat tracking hilang (untuk handle blur)

    [Header("UI References")]
    public GameObject mainCanvas;
    public GameObject loadingPanel;
    public TextMeshProUGUI titleText;
    public TextMeshProUGUI descriptionText;
    public TextMeshProUGUI priceText;
    public TextMeshProUGUI typeText;
    public TextMeshProUGUI durationText; // Unified field for dates
    public Button bookingButton;
    public RawImage mediaDisplay;

    [Header("Description Settings")]
    [SerializeField] public RectTransform descriptionContainer;
    [SerializeField] public float maxDescriptionHeight = 250f;

    [Header("Carousel & Video")]
    public Button nextButton;
    public Button prevButton;
    public UnityEngine.Video.VideoPlayer videoPlayer;
    public RawImage videoDisplay; 
    public GameObject videoMedia; 

    [Header("Layout Settings")]
    public bool autoAdjustAspectRatio = true;
    public float borderRadius = 16f;
    public GameObject mediaLoadingIndicator;

    [Header("Carousel Dots")]
    public GameObject dotPrefab;
    public Transform dotContainer;
    public Color activeDotColor = Color.white;
    public Color inactiveDotColor = new Color(1, 1, 1, 0.5f);
    private System.Collections.Generic.List<UnityEngine.UI.Image> mDots = new System.Collections.Generic.List<UnityEngine.UI.Image>();

    [Header("3D Model Settings")]
    public GameObject slidesContainer; // Container for 2D UI elements
    public Transform modelContainer;   // Container for 3D model
    private GameObject mCurrentModel;
    private string mCurrentModelUrl;
    private ModelInteraction mInteraction;

    [Header("3D Auto-Normalize")]
    [Tooltip("Aktifkan agar ukuran model GLB diseragamkan otomatis, terlepas dari internal scale file-nya")]
    public bool autoNormalizeBounds = true;
    [Tooltip("Sisi terpanjang model akan di-scale ke ukuran ini (dalam Unity unit / meter)")]
    public float targetModelSize = 0.15f;

    private WisataData mData;
    private bool mIsInitialized = false;
    private string[] mImageUrls;
    private int mCurrentImageIndex = 0;
    
    // Robust Scan Logging
    private bool mIsTargetPresent = false;
    private float mLastScanTime = -100f;
    private const float SCAN_COOLDOWN = 10f; // Minimal 30 detik sebelum log lagi
    private Coroutine mLostCoroutine;

    private void Start()
    {
        // Auto-find containers if not manually assigned
        if (slidesContainer == null)
        {
            Transform sc = transform.Find("Slides_Container");
            if (sc) slidesContainer = sc.gameObject;
        }
        if (modelContainer == null)
        {
            modelContainer = transform.Find("3D_Model_Container");
        }

        if (modelContainer != null)
        {
            mInteraction = modelContainer.GetComponent<ModelInteraction>();
            if (mInteraction == null) mInteraction = modelContainer.gameObject.AddComponent<ModelInteraction>();
        }

        mObserverBehaviour = GetComponentInParent<ObserverBehaviour>();
        if (mObserverBehaviour)
        {
            mObserverBehaviour.OnTargetStatusChanged += OnTargetStatusChanged;
        }

        if (nextButton) nextButton.onClick.AddListener(ShowNextImage);
        if (prevButton) prevButton.onClick.AddListener(ShowPrevImage);

        // Apply Rounded Corners programmatically only to specific displays
        ApplyRoundedCorners(mediaDisplay != null ? mediaDisplay.gameObject : null);
        ApplyRoundedCorners(videoDisplay != null ? videoDisplay.gameObject : null);

        if (videoDisplay)
        {
            // Tambahkan komponen Button secara otomatis jika belum ada agar video bisa diklik
            Button videoBtn = videoDisplay.GetComponent<Button>();
            if (videoBtn == null)
            {
                videoBtn = videoDisplay.gameObject.AddComponent<Button>();
                videoBtn.transition = Selectable.Transition.None; // Hindari perubahan warna saat di-hover/klik
            }
            videoBtn.onClick.AddListener(ToggleVideoPlayPause);
            
            videoDisplay.gameObject.SetActive(false);
        }

        // Hide UI initially
        if (mainCanvas) mainCanvas.SetActive(false);
        if (loadingPanel) loadingPanel.SetActive(false);
        ToggleMediaLoadingIndicator(false);
    }

#if UNITY_EDITOR
    private void OnValidate()
    {
        // Update radius existing without adding new components
        UpdateRadius(mediaDisplay != null ? mediaDisplay.gameObject : null);
        UpdateRadius(videoDisplay != null ? videoDisplay.gameObject : null);
    }

    private void UpdateRadius(GameObject obj)
    {
        if (obj == null) return;
        UIRoundedCorners rounded = obj.GetComponent<UIRoundedCorners>();
        if (rounded != null) rounded.radius = borderRadius;
    }
#endif

    private void ApplyRoundedCorners(GameObject obj)
    {
        if (obj == null) return;
        
        // Only apply if it has a Graphic component (Image/RawImage) to avoid white box issues
        if (obj.GetComponent<Graphic>() == null) return;

        UIRoundedCorners rounded = obj.GetComponent<UIRoundedCorners>();
        if (rounded == null)
        {
            rounded = obj.AddComponent<UIRoundedCorners>();
        }
        rounded.radius = borderRadius;
    }

    private void SetPivotTop(RectTransform rect)
    {
        if (rect == null) return;
        Vector2 size = rect.rect.size;
        Vector2 deltaPivot = rect.pivot - new Vector2(rect.pivot.x, 1f);
        Vector3 deltaPosition = new Vector3(deltaPivot.x * size.x * rect.localScale.x, deltaPivot.y * size.y * rect.localScale.y);
        rect.pivot = new Vector2(rect.pivot.x, 1f);
        rect.localPosition -= deltaPosition;
    }

    private void UpdateUI(WisataData data)
    {
        // Jangan matikan loadingPanel di sini jika kita tahu akan load 3D nanti
        if (mainCanvas) mainCanvas.SetActive(true);

        if (titleText) 
        {
            titleText.text = data.nama;
            // Gunakan coroutine agar marquee di-reset setelah canvas benar-benar aktif & layout terhitung
            StartCoroutine(ResetMarqueeWithDelay());
        }

        if (descriptionText) 
        {
            descriptionText.text = data.deskripsi;
            if (descriptionContainer)
            {
                // Beri sedikit delay agar TMPro bisa menghitung preferred height dengan benar
                StartCoroutine(UpdateDescriptionHeight());
            }
        }
        if (priceText)
        {
            if (string.IsNullOrEmpty(data.harga) || data.harga == "0" || data.harga.ToLower() == "free")
            {
                priceText.text = " Free";
            }
            else
            {
                // Format price with dots (id-ID culture) if it's a valid number
                if (long.TryParse(data.harga, out long priceVal))
                {
                    priceText.text = " Rp " + priceVal.ToString("N0", new System.Globalization.CultureInfo("id-ID"));
                }
                else
                {
                    // If it already contains "Rp" or other symbols, just show it
                    priceText.text = " " + data.harga;
                }
            }
        }

        // Logic for Duration (Combined Dates)
        if (durationText)
        {
            string start = data.start_date;
            string end = data.end_date;
            bool hasStart = !string.IsNullOrEmpty(start);
            bool hasEnd = !string.IsNullOrEmpty(end);

            if (hasStart || hasEnd)
            {
                durationText.transform.parent.gameObject.SetActive(true);
                durationText.text = FormatDateRange(start, end);
            }
            else
            {
                durationText.transform.parent.gameObject.SetActive(false);
            }
        }

        if (typeText) typeText.text = data.type?.ToUpper();

        // Hide video media container logic is handled below in AR Content Mode Logic


        if (bookingButton)
        {
            bookingButton.gameObject.SetActive(!string.IsNullOrEmpty(data.booking_url));
            bookingButton.onClick.RemoveAllListeners();
            bookingButton.onClick.AddListener(() => Application.OpenURL(data.booking_url));
        }

        // AR Content Mode Logic
        bool is3D = data.main_content_type == "3d_model";
        
        // Hide video media container if no video URL is provided OR if in 3D mode
        if (videoMedia) videoMedia.SetActive(!is3D && !string.IsNullOrEmpty(data.video_url));

        if (is3D)
        {
            if (slidesContainer) slidesContainer.SetActive(false);
            if (mediaDisplay) mediaDisplay.gameObject.SetActive(false);
            if (nextButton) nextButton.gameObject.SetActive(false);
            if (prevButton) prevButton.gameObject.SetActive(false);
            if (dotContainer) dotContainer.gameObject.SetActive(false);
            
            Load3DModel();
        }
        else
        {
            if (slidesContainer) slidesContainer.SetActive(true);
            if (modelContainer) modelContainer.gameObject.SetActive(false);
            if (dotContainer) dotContainer.gameObject.SetActive(true);
            ShowSlidesUI();
        }
    }

    private void Load3DModel()
    {
        if (modelContainer == null) return;

        if (string.IsNullOrEmpty(mData.model_url))
        {
            modelContainer.gameObject.SetActive(false);
            if (loadingPanel) loadingPanel.SetActive(false);
            Debug.LogWarning("[ARTargetHandler] Model URL is empty for " + mData.nama);
            return;
        }

        // Tampilkan loading panel di awal proses 3D
        if (loadingPanel) 
        {
            loadingPanel.SetActive(true);
            Debug.Log("[ARTargetHandler] Activating Loading Panel for 3D model");
        }
        
        // mainCanvas jangan dimatikan agar Title & Deskripsi tetap nampil duluan
        if (mainCanvas) mainCanvas.SetActive(true);

        modelContainer.gameObject.SetActive(true);

        // Apply Position & Rotation from Database
        modelContainer.localPosition = new Vector3(0, mData.model_pos_y, mData.model_pos_z);
        modelContainer.localRotation = Quaternion.Euler(0, mData.model_rot_y, 0);

        if (!autoNormalizeBounds)
        {
            float scale = mData.model_scale > 0 ? mData.model_scale : 0.11885f;
            modelContainer.localScale = Vector3.one * scale;
        }
        else
        {
            modelContainer.localScale = Vector3.one;
        }

        bool urlChanged = mCurrentModelUrl != mData.model_url;

        if (urlChanged)
        {
            mCurrentModelUrl = mData.model_url;

            // Hapus model lama jika ada
            if (mCurrentModel != null)
            {
                Destroy(mCurrentModel);
                mCurrentModel = null;
            }

            // Tampilkan loading panel saat download & spawn model baru
            if (loadingPanel) loadingPanel.SetActive(true);

            // 1. Cek Cache
            if (AssetCacheManager.IsCached(mData.model_url))
            {
                string localPath = AssetCacheManager.GetLocalPath(mData.model_url);
                Debug.Log($"[ARTargetHandler] Loading 3D model from CACHE using GLTFast: {localPath}");
                
                LoadModelWithGLTFast(localPath);
            }
            else
            {
                // 2. Download dan Simpan ke Cache
                StartCoroutine(DownloadAndCacheModel(mData.model_url));
            }
        }
        else
        {
            // Jika URL sama dan model sudah ada, langsung jalankan normalisasi
            if (autoNormalizeBounds)
            {
                StartCoroutine(NormalizeBoundsAfterLoad(false));
            }
            else
            {
                if (loadingPanel) loadingPanel.SetActive(false);
                if (mIsTargetPresent && mainCanvas) mainCanvas.SetActive(true);
            }
        }
    }

    private void LoadModelWithGLTFast(string localPath)
    {
        // Gunakan komponen bawaan GltfAsset dari GLTFast
        GameObject gltfObj = new GameObject("GLTFast_Model");
        gltfObj.transform.SetParent(modelContainer, false);
        // Penting: Biarkan localRotation apa adanya agar konversi koordinat bawaan GLTFast bekerja!
        gltfObj.transform.localPosition = Vector3.zero;

        var gltfAsset = gltfObj.AddComponent<GLTFast.GltfAsset>();
        gltfAsset.Url = "file://" + localPath;
        
        mCurrentModel = gltfObj;

        // Berhubung GltfAsset melakukan loading secara internal, kita gunakan polling normalisasi
        // yang sudah diset ke waitForNewLoad = true agar menunggu sampai renderers terbuat.
        if (autoNormalizeBounds)
        {
            StartCoroutine(NormalizeBoundsAfterLoad(true));
        }
        else
        {
            StartCoroutine(HideLoadingAfterSpawn());
        }
    }

    private System.Collections.IEnumerator DownloadAndCacheModel(string url)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                AssetCacheManager.SaveAsset(url, request.downloadHandler.data);
                string localPath = AssetCacheManager.GetLocalPath(url);
                
                Debug.Log("[ARTargetHandler] Download Finished. Loading with GLTFast from: " + localPath);
                LoadModelWithGLTFast(localPath);
            }
            else
            {
                Debug.LogError("[ARTargetHandler] Failed to download model: " + request.error);
                if (loadingPanel) loadingPanel.SetActive(false);
            }
        }
    }

    /// <summary>
    /// Fallback coroutine: sembunyikan loading panel setelah model selesai di-spawn
    /// (digunakan ketika autoNormalizeBounds = false)
    /// </summary>
    private System.Collections.IEnumerator HideLoadingAfterSpawn()
    {
        float timeout = 10f;
        float elapsed = 0f;
        while (elapsed < timeout)
        {
            yield return new WaitForSeconds(0.1f);
            elapsed += 0.1f;
            Renderer[] renderers = modelContainer.GetComponentsInChildren<Renderer>();
            if (renderers.Length > 0) break;
        }
        if (loadingPanel) loadingPanel.SetActive(false);
        // Pastikan marker masih ada sebelum nyalain UI
        if (mIsTargetPresent && mainCanvas) mainCanvas.SetActive(true);
    }

    /// <summary>
    /// Menunggu model GLB selesai di-load, lalu mengukur bounding box-nya
    /// dan mengatur scale container agar sisi terpanjang = targetModelSize.
    /// Ini membuat semua model terlihat dengan ukuran yang konsisten
    /// terlepas dari internal scale file GLB-nya.
    /// </summary>
    private System.Collections.IEnumerator NormalizeBoundsAfterLoad(bool waitForNewLoad)
    {
        // Jika URL baru, tunggu beberapa frame untuk GltfAsset selesai spawn
        if (waitForNewLoad)
        {
            float timeout = 15f; // Naikkan sedikit ke 15 detik untuk model besar
            float elapsed = 0f;
            while (elapsed < timeout)
            {
                if (!mIsTargetPresent)
                {
                    if (loadingPanel) loadingPanel.SetActive(false);
                    yield break;
                }

                yield return new WaitForSeconds(0.1f);
                elapsed += 0.1f;

                Renderer[] renderers = modelContainer.GetComponentsInChildren<Renderer>(true);
                if (renderers.Length > 0) 
                {
                    Debug.Log($"[ARTargetHandler] Model spawned after {elapsed:F1}s. Waiting 1.5s for full hierarchy...");
                    yield return new WaitForSeconds(1.5f);
                    break;
                }
            }
        }
        else
        {
            yield return null;
            yield return null;
        }

        // Guard: cek sekali lagi setelah loop selesai
        if (!mIsTargetPresent)
        {
            if (loadingPanel) loadingPanel.SetActive(false);
            yield break;
        }

        Renderer[] allRenderers = modelContainer.GetComponentsInChildren<Renderer>(true);
        if (allRenderers.Length == 0)
        {
            string localPath = AssetCacheManager.GetLocalPath(mData.model_url);
            long fileSize = 0;
            if (System.IO.File.Exists(localPath)) fileSize = new System.IO.FileInfo(localPath).Length;
            float fileSizeMB = fileSize / 1024f / 1024f;

            Debug.LogError($"[ARTargetHandler] ERROR: Tidak ada Renderer ditemukan di model '{mData.nama}' setelah loading selesai. Ini biasanya masalah Shader yang tidak ikut ter-build di Android.");
            
            if (descriptionText) 
            {
                descriptionText.text = $"<color=red>ERROR: Model 3D '{mData.nama}' berhasil didownload ({fileSizeMB:F2} MB) tapi GAGAL DI-RENDER (0 Renderers).</color>\nPath: {localPath}\nBiasanya karena Shader tidak disupport atau file korup.";
            }

            float fallback = mData.model_scale > 0 ? mData.model_scale : 1.0f;
            modelContainer.localScale = Vector3.one * fallback;
            if (loadingPanel) loadingPanel.SetActive(false);
            if (mIsTargetPresent && mainCanvas) mainCanvas.SetActive(true);
            yield break;
        }

        modelContainer.localScale = Vector3.one;
        yield return null;

        Bounds combinedBounds = allRenderers[0].bounds;
        foreach (Renderer r in allRenderers)
        {
            combinedBounds.Encapsulate(r.bounds);
        }

        float maxAxis = Mathf.Max(combinedBounds.size.x, combinedBounds.size.y, combinedBounds.size.z);
        if (maxAxis <= 0f)
        {
            Debug.LogWarning($"[ARTargetHandler] Bounds model nol, pakai scale manual.");
            float fallback = mData.model_scale > 0 ? mData.model_scale : 1.0f;
            modelContainer.localScale = Vector3.one * fallback;
            if (loadingPanel) loadingPanel.SetActive(false);
            if (mIsTargetPresent && mainCanvas) mainCanvas.SetActive(true);
            yield break;
        }

        float normalizedScale = targetModelSize / maxAxis;
        float userMultiplier = mData.model_scale > 0 ? mData.model_scale : 1.0f;
        float finalScale = normalizedScale * userMultiplier;

        modelContainer.localScale = Vector3.one * finalScale;

        Debug.Log($"[ARTargetHandler] Auto-normalize: bounds={maxAxis:F4}, normalized={normalizedScale:F4}, multiplier={userMultiplier:F4}, final={finalScale:F4}");

        // Hanya tampilkan UI jika marker masih terdeteksi
        if (loadingPanel) loadingPanel.SetActive(false);
        if (mIsTargetPresent && mainCanvas) 
        {
            mainCanvas.SetActive(true);
            // Refresh marquee after canvas is active with delay to ensure proper width calculation
            StartCoroutine(ResetMarqueeWithDelay());
        }

        // Simpan state awal model untuk fungsi reset saat marker lost
        if (mInteraction != null)
        {
            mInteraction.SaveInitialState();
        }
    }

    private string FormatDateRange(string startStr, string endStr)
    {
        System.DateTime start, end;
        bool hasStart = System.DateTime.TryParse(startStr, out start);
        bool hasEnd = System.DateTime.TryParse(endStr, out end);

        if (hasStart && hasEnd)
        {
            // Same year? 12 Jan - 2 Feb 2026
            if (start.Year == end.Year)
            {
                return $"{start.ToString("d MMM", new System.Globalization.CultureInfo("id-ID"))} - {end.ToString("d MMM yyyy", new System.Globalization.CultureInfo("id-ID"))}";
            }
            // Different year? 12 Feb 2026 - 13 Mar 2027
            else
            {
                return $"{start.ToString("d MMM yyyy", new System.Globalization.CultureInfo("id-ID"))} - {end.ToString("d MMM yyyy", new System.Globalization.CultureInfo("id-ID"))}";
            }
        }
        else if (hasStart) return start.ToString("d MMM yyyy", new System.Globalization.CultureInfo("id-ID"));
        else if (hasEnd) return end.ToString("d MMM yyyy", new System.Globalization.CultureInfo("id-ID"));

        return "";
    }
    private System.Collections.IEnumerator ResetMarqueeWithDelay()
    {
        // Tunggu hingga akhir frame agar canvas aktif dan layout group selesai menghitung lebar
        yield return new WaitForEndOfFrame();
        if (titleText)
        {
            var marquee = titleText.GetComponent<UIMarqueeText>();
            if (marquee) marquee.ResetMarquee();
        }
    }

    private System.Collections.IEnumerator UpdateDescriptionHeight()
    {
        // Sangat penting: Tunggu akhir frame agar layout engine Unity sudah menghitung posisi & ukuran dasar
        yield return new WaitForEndOfFrame();
        
        if (descriptionContainer && descriptionText)
        {
            // 1. Paksa layout parent (Slides Container) untuk update agar kita dapat lebar container yang akurat
            if (descriptionContainer.parent is RectTransform parentRT)
            {
                LayoutRebuilder.ForceRebuildLayoutImmediate(parentRT);
            }

            RectTransform textRect = descriptionText.rectTransform;
            float targetWidth = descriptionContainer.rect.width;
            
            // Jika lebar masih 0 (biasanya saat pertama kali aktif), gunakan fallback atau tunggu lagi
            if (targetWidth <= 10f) targetWidth = 350f; 

            // Atur padding internal (User mau mepet bawah dikurangi, jadi kita tambah buffer)
            float horizontalPadding = 30f; 
            float bottomBuffer = 8f; // Memberi ruang di bawah teks agar tidak mepet ke border container

            // Set lebar teks agar TMPro tahu batas word wrap
            textRect.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, targetWidth - horizontalPadding);
            descriptionText.ForceMeshUpdate();
            
            // Hitung tinggi yang dibutuhkan berdasarkan teks dan lebar yang sudah ditentukan
            Vector2 preferredSize = descriptionText.GetPreferredValues(descriptionText.text, targetWidth - horizontalPadding, 0);
            
            float preferredHeight = preferredSize.y + bottomBuffer; 
            float finalHeight = Mathf.Min(preferredHeight, maxDescriptionHeight);
            
            // 2. Set Tinggi Container
            descriptionContainer.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, finalHeight);
            
            // 3. Pastikan pivot tetap di atas agar layout group menumpuk dari atas ke bawah
            descriptionContainer.pivot = new Vector2(descriptionContainer.pivot.x, 1f);
            
            // 4. Paksa Rebuild Layout berjenjang agar Gap antar elemen (Title & Desc) mengecil/hilang
            LayoutRebuilder.ForceRebuildLayoutImmediate(descriptionContainer);
            
            if (descriptionContainer.parent is RectTransform pr)
            {
                // Ini akan menghilangkan 'gap' ekstra jika Vertical Layout Group punya spacing
                LayoutRebuilder.ForceRebuildLayoutImmediate(pr);
            }
        }
    }

    public void Initialize(WisataData data)
    {
        mData = data;
        mIsInitialized = true;
        markerId = data.id;
        
        // Reset data lama
        mImageUrls = null;
        mCurrentImageIndex = 0;

        // Parse multiple images
        if (!string.IsNullOrEmpty(data.slide_urls))
        {
            mImageUrls = data.slide_urls.Split(new char[] { ',' }, System.StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < mImageUrls.Length; i++) mImageUrls[i] = mImageUrls[i].Trim();
        }

        if (mainCanvas) mainCanvas.SetActive(false);
        if (loadingPanel) loadingPanel.SetActive(false);
        if (nextButton) nextButton.gameObject.SetActive(false);
        if (prevButton) prevButton.gameObject.SetActive(false);
    }

    private void OnTargetStatusChanged(ObserverBehaviour behaviour, TargetStatus status)
    {
        // Jika status adalah TRACKED (kamera melihat marker dengan jelas)
        if (status.Status == Status.TRACKED)
        {
            // Hentikan coroutine penghilangan jika sedang berjalan
            if (mLostCoroutine != null)
            {
                StopCoroutine(mLostCoroutine);
                mLostCoroutine = null;
            }

            if (!mIsTargetPresent)
            {
                mIsTargetPresent = true;
                if (DynamicMarkerManager.Instance) DynamicMarkerManager.Instance.MarkerTracked();
                
                if (mIsInitialized) 
                {
                    UpdateUI(mData);
                    if (Time.time - mLastScanTime > SCAN_COOLDOWN)
                    {
                        mLastScanTime = Time.time;
                        if (gameObject.activeInHierarchy)
                            StartCoroutine(APIManager.Instance.LogScan(mData.id));
                    }
                }
                else 
                {
                    if (gameObject.activeInHierarchy)
                        StartCoroutine(FetchData());
                }
            }
            
            HandleVideoPlayback(status);
        }
        else 
        {
            // Status selain TRACKED (Bisa EXTENDED_TRACKED, LIMITED, atau NO_POSE)
            // Jika sebelumnya terdeteksi, kita beri delay sebelum benar-benar dihilangkan
            if (mIsTargetPresent && mLostCoroutine == null)
            {
                if (gameObject.activeInHierarchy)
                {
                    mLostCoroutine = StartCoroutine(DelayedHide());
                }
                else
                {
                    // Jika objek sudah tidak aktif, langsung jalankan cleanup tanpa coroutine
                    mIsTargetPresent = false;
                    if (DynamicMarkerManager.Instance) DynamicMarkerManager.Instance.MarkerLost();
                    ImmediateHide();
                }
            }
        }
    }

    private System.Collections.IEnumerator DelayedHide()
    {
        yield return new WaitForSeconds(trackingLossDelay);
        
        mIsTargetPresent = false;
        if (DynamicMarkerManager.Instance) DynamicMarkerManager.Instance.MarkerLost();
        
        ImmediateHide();
    }

    private void ImmediateHide()
    {
        // Sembunyikan semua UI & Model
        if (mainCanvas) mainCanvas.SetActive(false);
        if (loadingPanel) loadingPanel.SetActive(false);
        if (modelContainer) modelContainer.gameObject.SetActive(false);
        
        // Bersihkan tekstur agar tidak nyangkut memori/cache yang sudah di-destroy
        if (mediaDisplay) mediaDisplay.texture = null;

        // Matikan container video
        if (videoMedia) videoMedia.SetActive(false);
        
        if (videoPlayer) 
        {
            videoPlayer.Stop();
        }
        
        // Reset interaksi model (kembali ke posisi/skala awal)
        if (mInteraction != null)
        {
            mInteraction.ResetState();
        }

        mLostCoroutine = null;
    }

    private void HandleVideoPlayback(TargetStatus status)
    {
        if (mData == null) return;
        bool hasVideo = !string.IsNullOrEmpty(mData.video_url);
        
        if (videoPlayer && hasVideo)
        {
            if (videoMedia) videoMedia.SetActive(true);
            
            // Cek apakah URL video sudah diset atau berbeda
            if (videoPlayer.url != mData.video_url && !videoPlayer.url.Contains(AssetCacheManager.GetLocalPath(mData.video_url) ?? "INVALID_PATH"))
            {
                // 1. Cek Cache Video
                if (AssetCacheManager.IsCached(mData.video_url))
                {
                    string localPath = AssetCacheManager.GetLocalPath(mData.video_url);
                    PrepareVideo(localPath);
                    Debug.Log("[ARTargetHandler] Playing Video from CACHE: " + localPath);
                }
                else
                {
                    // 2. Streaming langsung (Sambil simpan di background untuk scan berikutnya?)
                    // Untuk video besar, kita streaming dulu agar user tidak nunggu download.
                    // Tapi scan berikutnya akan tetap download jika kita tidak simpan.
                    // Kita akan simpan video hanya jika ukurannya masuk akal atau user scan sampai habis?
                    // Untuk saat ini, kita biarkan streaming untuk video agar tidak lag di awal.
                    PrepareVideo(mData.video_url);
                    
                    // Option: Download di background agar scan berikutnya cepat
                    StartCoroutine(DownloadVideoToCache(mData.video_url));
                }
            }
            else
            {
                if (videoDisplay) videoDisplay.gameObject.SetActive(true);
                if (!videoPlayer.isPlaying) videoPlayer.Play();
            }
        }
    }

    private void PrepareVideo(string url)
    {
        videoPlayer.url = url;
        videoPlayer.isLooping = true;
        
        // Unsubscribe to avoid memory leaks and duplicate calls
        videoPlayer.prepareCompleted -= OnVideoPrepared;
        videoPlayer.errorReceived -= OnVideoError;
        
        videoPlayer.prepareCompleted += OnVideoPrepared;
        videoPlayer.errorReceived += OnVideoError;
        
        ToggleMediaLoadingIndicator(true);
        videoPlayer.Prepare();
    }

    private void OnVideoPrepared(UnityEngine.Video.VideoPlayer vp)
    {
        ToggleMediaLoadingIndicator(false);
        if (videoDisplay) videoDisplay.gameObject.SetActive(true);
        AdjustAspectRatio(videoDisplay, (float)vp.width / vp.height, false);
        vp.Play();
    }

    private void OnVideoError(UnityEngine.Video.VideoPlayer source, string message)
    {
        Debug.LogError("[ARTargetHandler] VideoPlayer Error: " + message);
        ToggleMediaLoadingIndicator(false);
        if (videoDisplay) videoDisplay.gameObject.SetActive(false);
    }

    private System.Collections.IEnumerator DownloadVideoToCache(string url)
    {
        // Jangan download ulang jika sedang dalam proses atau sudah ada
        if (AssetCacheManager.IsCached(url)) yield break;

        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            // Kita gunakan low priority untuk download video di background
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                AssetCacheManager.SaveAsset(url, request.downloadHandler.data);
                Debug.Log("[ARTargetHandler] Video cached in background for next scan.");
            }
        }
    }

    // Fallback if data not initialized (rare case)
    private System.Collections.IEnumerator FetchData()
    {
        if (string.IsNullOrEmpty(markerId)) yield break;
        if (loadingPanel) loadingPanel.SetActive(true);

        yield return APIManager.Instance.GetWisataById(markerId, 
            (data) => {
                Initialize(data);
                UpdateUI(data);
                StartCoroutine(APIManager.Instance.LogScan(data.id));
            },
            (error) => {
                Debug.LogError("Error fetching data: " + error);
                if (loadingPanel) loadingPanel.SetActive(false);
                if (mainCanvas) mainCanvas.SetActive(false);
            }
        );
    }

    private void ShowSlidesUI()
    {
        if (mData == null) return;
        // Jangan matikan loadingPanel di sini karena DownloadImage akan menanganinya
        // if (loadingPanel) loadingPanel.SetActive(false); 

        // Setup Dots
        if (dotContainer != null && dotPrefab != null)
        {
            // Clear existing dots
            foreach (Transform child in dotContainer) Destroy(child.gameObject);
            mDots.Clear();

            if (mImageUrls != null && mImageUrls.Length > 1)
            {
                for (int i = 0; i < mImageUrls.Length; i++)
                {
                    GameObject dot = Instantiate(dotPrefab, dotContainer);
                    UnityEngine.UI.Image dotImage = dot.GetComponent<UnityEngine.UI.Image>();
                    if (dotImage) mDots.Add(dotImage);
                }
            }
        }

        bool hasMultipleImages = mImageUrls != null && mImageUrls.Length > 1;
        
        if (mediaDisplay) mediaDisplay.gameObject.SetActive(true);
        if (nextButton) nextButton.gameObject.SetActive(hasMultipleImages);
        if (prevButton) prevButton.gameObject.SetActive(hasMultipleImages);
        
        ShowImage(mCurrentImageIndex);
    }

    private void ShowNextImage()
    {
        if (mImageUrls == null || mImageUrls.Length <= 1) return;
        mCurrentImageIndex = (mCurrentImageIndex + 1) % mImageUrls.Length;
        ShowImage(mCurrentImageIndex);
    }

    private void ShowPrevImage()
    {
        if (mImageUrls == null || mImageUrls.Length <= 1) return;
        mCurrentImageIndex--;
        if (mCurrentImageIndex < 0) mCurrentImageIndex = mImageUrls.Length - 1;
        ShowImage(mCurrentImageIndex);
    }

    public void ToggleVideoPlayPause()
    {
        if (videoPlayer != null && videoPlayer.isPrepared)
        {
            if (videoPlayer.isPlaying)
                videoPlayer.Pause();
            else
                videoPlayer.Play();
        }
    }

    private void ShowImage(int index)
    {
        if (mImageUrls != null && index < mImageUrls.Length)
        {
            // Update Dots
            for (int i = 0; i < mDots.Count; i++)
            {
                if (mDots[i]) mDots[i].color = (i == index) ? activeDotColor : inactiveDotColor;
            }

            StartCoroutine(DownloadImage(mImageUrls[index]));
        }
    }

    private void ToggleMediaLoadingIndicator(bool active)
    {
        if (mediaLoadingIndicator == null) return;
        mediaLoadingIndicator.SetActive(active);
    }

    private System.Collections.IEnumerator DownloadImage(string url)
    {
        if (loadingPanel) loadingPanel.SetActive(true);
        ToggleMediaLoadingIndicator(true);

        // 1. Cek apakah gambar sudah ada di Cache (RAM atau Disk)
        if (AssetCacheManager.IsCached(url) || AssetCacheManager.IsTextureInMemory(url))
        {
            Texture2D cachedTexture = AssetCacheManager.GetTexture(url);
            if (mediaDisplay && cachedTexture != null)
            {
                mediaDisplay.texture = cachedTexture;
                AdjustAspectRatio(mediaDisplay, (float)cachedTexture.width / cachedTexture.height, true);
            }
            ToggleMediaLoadingIndicator(false);
            if (loadingPanel) loadingPanel.SetActive(false);
            yield break;
        }

        // 2. Jika tidak ada di cache, download data mentah
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();
            
            ToggleMediaLoadingIndicator(false);
            // loadingPanel akan dimatikan setelah tekstur diterapkan di bawah atau di blok error

            if (request.result == UnityWebRequest.Result.Success)
            {
                byte[] data = request.downloadHandler.data;
                AssetCacheManager.SaveImage(url, data);
                Texture2D texture = AssetCacheManager.GetTexture(url);

                if (mediaDisplay && texture != null)
                {
                    mediaDisplay.texture = texture;
                    AdjustAspectRatio(mediaDisplay, (float)texture.width / texture.height, true);
                }
            }
            else
            {
                Debug.LogWarning("[ARTargetHandler] Failed to download image: " + request.error);
            }

            if (loadingPanel) loadingPanel.SetActive(false);
        }
    }

    private void AdjustAspectRatio(RawImage img, float ratio, bool useEnvelope = false)
    {
        if (!img || !autoAdjustAspectRatio) return;
        
        // Hapus Fitter otomatis agar tidak konflik
        AspectRatioFitter fitter = img.GetComponent<AspectRatioFitter>();
        if (fitter) Destroy(fitter); 

        RectTransform rect = img.GetComponent<RectTransform>();
        RectTransform parentRect = img.transform.parent.GetComponent<RectTransform>();
        
        if (parentRect == null) return;

        // Jika mode Envelope (Slides), paksa posisi di tengah agar masking rapi
        if (useEnvelope)
        {
            rect.anchorMin = new Vector2(0.5f, 0.5f);
            rect.anchorMax = new Vector2(0.5f, 0.5f);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = Vector2.zero;
        }

        // Pastikan sumbu Z adalah 0 agar tidak hilang/transparan saat di-mask
        Vector3 pos = rect.anchoredPosition3D;
        pos.z = 0;
        rect.anchoredPosition3D = pos;

        rect.localRotation = Quaternion.identity;
        rect.localScale = Vector3.one;

        float parentWidth = parentRect.rect.width;
        float parentHeight = parentRect.rect.height;
        float parentRatio = parentWidth / parentHeight;

        float newWidth, newHeight;
        if (useEnvelope)
        {
            // MODE ENVELOPE (Nge-fill/Crop)
            if (ratio > parentRatio)
            {
                newWidth = parentHeight * ratio;
                newHeight = parentHeight;
            }
            else
            {
                newWidth = parentWidth;
                newHeight = parentWidth / ratio;
            }
        }
        else
        {
            // MODE FIT (Proporsional/Tidak terpotong)
            if (ratio > parentRatio)
            {
                newWidth = parentWidth;
                newHeight = parentWidth / ratio;
            }
            else
            {
                newWidth = parentHeight * ratio;
                newHeight = parentHeight;
            }
        }

        // Gunakan SetSizeWithCurrentAnchors untuk mempertahankan letak UI (Anchor/Pivot) custom dari user
        rect.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, newWidth);
        rect.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, newHeight);
    }
}
